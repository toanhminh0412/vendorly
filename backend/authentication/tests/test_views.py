import uuid
from datetime import timedelta
from unittest.mock import patch

from django.contrib.auth import get_user_model
from django.utils import timezone
from django.urls import reverse

from rest_framework.test import APITestCase
from rest_framework import status
from rest_framework_simplejwt.tokens import RefreshToken

from authentication.models import EmailVerificationToken, PasswordResetToken

User = get_user_model()


class AuthenticationViewsTest(APITestCase):
    """Test cases for authentication views."""

    def setUp(self):
        self.user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='testpass123',
            first_name='Test',
            last_name='User'
        )
        self.register_url = reverse('authentication:register')
        self.login_url = reverse('authentication:login')
        self.verify_email_url = reverse('authentication:verify_email')
        self.profile_url = reverse('authentication:profile')

    @patch('authentication.views.send_verification_email')
    def test_user_registration_success(self, mock_send_email):
        """Test successful user registration."""
        mock_send_email.return_value = True
        
        data = {
            'email': 'newuser@example.com',
            'password': 'newpass123',
            'password_confirm': 'newpass123',
            'first_name': 'New',
            'last_name': 'User'
        }
        
        response = self.client.post(self.register_url, data)
        
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertIn('message', response.data)
        self.assertIn('user_id', response.data)
        self.assertTrue(User.objects.filter(email='newuser@example.com').exists())

    def test_user_registration_invalid_data(self):
        """Test user registration with invalid data."""
        data = {
            'email': 'invalid-email',
            'password': 'short',
            'password_confirm': 'different'
        }
        
        response = self.client.post(self.register_url, data)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_user_registration_password_mismatch(self):
        """Test user registration with password mismatch."""
        data = {
            'email': 'test@example.com',
            'password': 'testpass123',
            'password_confirm': 'differentpass',
            'first_name': 'Test',
            'last_name': 'User'
        }
        
        response = self.client.post(self.register_url, data)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_user_login_success(self):
        """Test successful user login."""
        data = {
            'email': 'test@example.com',
            'password': 'testpass123'
        }
        
        response = self.client.post(self.login_url, data)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('access_token', response.data)
        self.assertIn('refresh_token', response.data)
        self.assertIn('user', response.data)

    def test_user_login_invalid_credentials(self):
        """Test user login with invalid credentials."""
        data = {
            'email': 'test@example.com',
            'password': 'wrongpassword'
        }
        
        response = self.client.post(self.login_url, data)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_user_login_nonexistent_user(self):
        """Test user login with non-existent user."""
        data = {
            'email': 'nonexistent@example.com',
            'password': 'testpass123'
        }
        
        response = self.client.post(self.login_url, data)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_email_verification_success(self):
        """Test successful email verification."""
        # Create verification token
        token = EmailVerificationToken.objects.create(user=self.user)
        
        data = {'token': str(token.token)}
        response = self.client.post(self.verify_email_url, data)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('message', response.data)
        
        # Check user is verified
        self.user.refresh_from_db()
        self.assertTrue(self.user.is_email_verified)

    def test_email_verification_expired_token(self):
        """Test email verification with expired token."""
        token = EmailVerificationToken.objects.create(user=self.user)
        token.expires_at = timezone.now() - timedelta(hours=1)
        token.save()
        
        data = {'token': str(token.token)}
        response = self.client.post(self.verify_email_url, data)
        
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('error', response.data)

    def test_email_verification_invalid_token(self):
        """Test email verification with invalid token."""
        data = {'token': str(uuid.uuid4())}
        response = self.client.post(self.verify_email_url, data)
        
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_email_verification_invalid_uuid(self):
        """Test email verification with invalid UUID format."""
        data = {'token': 'invalid-token'}
        response = self.client.post(self.verify_email_url, data)
        
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_profile_view_authenticated(self):
        """Test profile view with authenticated user."""
        # Authenticate user
        refresh = RefreshToken.for_user(self.user)
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {refresh.access_token}')
        
        response = self.client.get(self.profile_url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['email'], self.user.email)

    def test_profile_view_unauthenticated(self):
        """Test profile view without authentication."""
        response = self.client.get(self.profile_url)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    @patch('authentication.views.send_verification_email')
    def test_resend_verification_email_success(self, mock_send_email):
        """Test resending verification email."""
        mock_send_email.return_value = True
        
        url = reverse('authentication:resend_verification')
        data = {'email': self.user.email}
        
        response = self.client.post(url, data)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        mock_send_email.assert_called_once()

    @patch('authentication.views.send_verification_email')
    def test_resend_verification_email_already_verified(self, mock_send_email):
        """Test resending verification email for already verified user."""
        self.user.is_email_verified = True
        self.user.save()
        
        url = reverse('authentication:resend_verification')
        data = {'email': self.user.email}
        
        response = self.client.post(url, data)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('already verified', response.data['message'])
        mock_send_email.assert_not_called()

    def test_resend_verification_email_nonexistent_user(self):
        """Test resending verification email for non-existent user."""
        url = reverse('authentication:resend_verification')
        data = {'email': 'nonexistent@example.com'}
        
        response = self.client.post(url, data)
        
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_resend_verification_email_missing_email(self):
        """Test resending verification email without email."""
        url = reverse('authentication:resend_verification')
        data = {}
        
        response = self.client.post(url, data)
        
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    @patch('authentication.views.send_password_reset_email')
    def test_forgot_password_success(self, mock_send_email):
        """Test forgot password functionality."""
        mock_send_email.return_value = True
        
        url = reverse('authentication:forgot_password')
        data = {'email': self.user.email}
        
        response = self.client.post(url, data)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        mock_send_email.assert_called_once()

    def test_forgot_password_nonexistent_user(self):
        """Test forgot password with non-existent user."""
        url = reverse('authentication:forgot_password')
        data = {'email': 'nonexistent@example.com'}
        
        response = self.client.post(url, data)
        
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    @patch('authentication.views.send_password_reset_email')
    def test_forgot_password_email_send_failure(self, mock_send_email):
        """Test forgot password when email sending fails."""
        mock_send_email.return_value = False
        
        url = reverse('authentication:forgot_password')
        data = {'email': self.user.email}
        
        response = self.client.post(url, data)
        
        self.assertEqual(response.status_code, status.HTTP_500_INTERNAL_SERVER_ERROR)

    def test_reset_password_success(self):
        """Test successful password reset."""
        # Create reset token
        reset_token = PasswordResetToken.objects.create(user=self.user)
        
        url = reverse('authentication:reset_password')
        data = {
            'token': str(reset_token.token),
            'password': 'newpassword123',
            'password_confirm': 'newpassword123'
        }
        
        response = self.client.post(url, data)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        # Check password was changed
        self.user.refresh_from_db()
        self.assertTrue(self.user.check_password('newpassword123'))
        
        # Check token is marked as used
        reset_token.refresh_from_db()
        self.assertTrue(reset_token.is_used)

    def test_reset_password_expired_token(self):
        """Test password reset with expired token."""
        reset_token = PasswordResetToken.objects.create(user=self.user)
        reset_token.expires_at = timezone.now() - timedelta(minutes=1)
        reset_token.save()
        
        url = reverse('authentication:reset_password')
        data = {
            'token': str(reset_token.token),
            'password': 'newpassword123',
            'password_confirm': 'newpassword123'
        }
        
        response = self.client.post(url, data)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_reset_password_used_token(self):
        """Test password reset with already used token."""
        reset_token = PasswordResetToken.objects.create(user=self.user)
        reset_token.is_used = True
        reset_token.save()
        
        url = reverse('authentication:reset_password')
        data = {
            'token': str(reset_token.token),
            'password': 'newpassword123',
            'password_confirm': 'newpassword123'
        }
        
        response = self.client.post(url, data)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_reset_password_invalid_token(self):
        """Test password reset with invalid token."""
        url = reverse('authentication:reset_password')
        data = {
            'token': str(uuid.uuid4()),
            'password': 'newpassword123',
            'password_confirm': 'newpassword123'
        }
        
        response = self.client.post(url, data)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_reset_password_password_mismatch(self):
        """Test password reset with password mismatch."""
        reset_token = PasswordResetToken.objects.create(user=self.user)
        
        url = reverse('authentication:reset_password')
        data = {
            'token': str(reset_token.token),
            'password': 'newpassword123',
            'password_confirm': 'differentpassword'
        }
        
        response = self.client.post(url, data)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_logout_success(self):
        """Test successful logout."""
        # Authenticate user
        refresh = RefreshToken.for_user(self.user)
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {refresh.access_token}')
        
        url = reverse('authentication:logout')
        data = {'refresh_token': str(refresh)}
        
        response = self.client.post(url, data)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_logout_without_token(self):
        """Test logout without refresh token."""
        # Authenticate user
        refresh = RefreshToken.for_user(self.user)
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {refresh.access_token}')
        
        url = reverse('authentication:logout')
        data = {}
        
        response = self.client.post(url, data)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_logout_invalid_token(self):
        """Test logout with invalid refresh token."""
        # Authenticate user
        refresh = RefreshToken.for_user(self.user)
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {refresh.access_token}')
        
        url = reverse('authentication:logout')
        data = {'refresh_token': 'invalid-token'}
        
        response = self.client.post(url, data)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_logout_unauthenticated(self):
        """Test logout without authentication."""
        url = reverse('authentication:logout')
        data = {}
        
        response = self.client.post(url, data)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_update_profile_success(self):
        """Test profile update."""
        # Authenticate user
        refresh = RefreshToken.for_user(self.user)
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {refresh.access_token}')
        
        url = reverse('authentication:update_profile')
        data = {
            'first_name': 'Updated',
            'last_name': 'Name'
        }
        
        response = self.client.put(url, data)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.user.refresh_from_db()
        self.assertEqual(self.user.first_name, 'Updated')
        self.assertEqual(self.user.last_name, 'Name')

    def test_update_profile_unauthenticated(self):
        """Test profile update without authentication."""
        url = reverse('authentication:update_profile')
        data = {
            'first_name': 'Updated',
            'last_name': 'Name'
        }
        
        response = self.client.put(url, data)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_update_profile_partial(self):
        """Test partial profile update."""
        # Authenticate user
        refresh = RefreshToken.for_user(self.user)
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {refresh.access_token}')
        
        url = reverse('authentication:update_profile')
        data = {'first_name': 'Updated'}
        
        response = self.client.put(url, data)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.user.refresh_from_db()
        self.assertEqual(self.user.first_name, 'Updated')
        self.assertEqual(self.user.last_name, 'User')  # Should remain unchanged 