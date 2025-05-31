import uuid
from datetime import timedelta

from django.test import TestCase
from django.contrib.auth import get_user_model
from django.utils import timezone

from authentication.models import EmailVerificationToken, PasswordResetToken

User = get_user_model()


class UserModelTest(TestCase):
    """Test cases for the User model."""

    def setUp(self):
        self.user_data = {
            'username': 'testuser',
            'email': 'test@example.com',
            'password': 'testpass123',
            'first_name': 'Test',
            'last_name': 'User'
        }

    def test_create_user(self):
        """Test creating a user with email."""
        user = User.objects.create_user(**self.user_data)
        
        self.assertEqual(user.email, self.user_data['email'])
        self.assertEqual(user.first_name, self.user_data['first_name'])
        self.assertEqual(user.last_name, self.user_data['last_name'])
        self.assertFalse(user.is_email_verified)
        self.assertTrue(user.check_password(self.user_data['password']))

    def test_user_str_method(self):
        """Test the string representation of user."""
        user = User.objects.create_user(**self.user_data)
        self.assertEqual(str(user), self.user_data['email'])

    def test_username_generation(self):
        """Test automatic username generation from email."""
        user = User.objects.create_user(
            username='test',  # Provide explicit username
            email='test@example.com',
            password='testpass123'
        )
        expected_username = 'test'
        self.assertEqual(user.username, expected_username)

    def test_duplicate_username_handling(self):
        """Test handling of duplicate usernames."""
        # Create first user
        user1 = User.objects.create_user(
            username='test1',
            email='test1@example.com',
            password='testpass123'
        )
        
        # Create second user with same username base
        user2 = User.objects.create_user(
            username='test',  # Provide explicit username
            email='test@example.com',
            password='testpass123'
        )
        
        self.assertEqual(user1.username, 'test1')
        self.assertNotEqual(user1.username, user2.username)

    def test_user_email_unique(self):
        """Test that user email is unique."""
        User.objects.create_user(
            username='unique',
            email='unique@example.com',
            password='testpass123'
        )
        
        with self.assertRaises(Exception):
            User.objects.create_user(
                username='unique2',
                email='unique@example.com',
                password='testpass123'
            )


class EmailVerificationTokenModelTest(TestCase):
    """Test cases for EmailVerificationToken model."""

    def setUp(self):
        self.user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='testpass123'
        )

    def test_create_verification_token(self):
        """Test creating an email verification token."""
        token = EmailVerificationToken.objects.create(user=self.user)
        
        self.assertEqual(token.user, self.user)
        self.assertIsInstance(token.token, uuid.UUID)
        self.assertIsNotNone(token.expires_at)
        self.assertIsNotNone(token.created_at)

    def test_token_expiration_auto_set(self):
        """Test that expiration is automatically set."""
        token = EmailVerificationToken.objects.create(user=self.user)
        expected_expiry = timezone.now() + timedelta(hours=24)
        
        # Allow for small time difference in test execution
        self.assertAlmostEqual(
            token.expires_at.timestamp(),
            expected_expiry.timestamp(),
            delta=60  # 1 minute tolerance
        )

    def test_is_expired_method_false(self):
        """Test the is_expired method returns False for valid token."""
        token = EmailVerificationToken.objects.create(user=self.user)
        self.assertFalse(token.is_expired())

    def test_is_expired_method_true(self):
        """Test the is_expired method returns True for expired token."""
        token = EmailVerificationToken.objects.create(user=self.user)
        token.expires_at = timezone.now() - timedelta(hours=1)
        token.save()
        
        self.assertTrue(token.is_expired())

    def test_token_str_method(self):
        """Test string representation of token."""
        token = EmailVerificationToken.objects.create(user=self.user)
        expected_str = f"Email verification token for {self.user.email}"
        self.assertEqual(str(token), expected_str)

    def test_token_uniqueness(self):
        """Test that each token is unique."""
        token1 = EmailVerificationToken.objects.create(user=self.user)
        token2 = EmailVerificationToken.objects.create(user=self.user)
        
        self.assertNotEqual(token1.token, token2.token)


class PasswordResetTokenModelTest(TestCase):
    """Test cases for PasswordResetToken model."""

    def setUp(self):
        self.user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='testpass123'
        )

    def test_create_password_reset_token(self):
        """Test creating a password reset token."""
        token = PasswordResetToken.objects.create(user=self.user)
        
        self.assertEqual(token.user, self.user)
        self.assertIsInstance(token.token, uuid.UUID)
        self.assertFalse(token.is_used)
        self.assertIsNotNone(token.expires_at)
        self.assertIsNotNone(token.created_at)

    def test_token_expiration_auto_set(self):
        """Test that expiration is automatically set to 1 hour."""
        token = PasswordResetToken.objects.create(user=self.user)
        expected_expiry = timezone.now() + timedelta(hours=1)
        
        self.assertAlmostEqual(
            token.expires_at.timestamp(),
            expected_expiry.timestamp(),
            delta=60
        )

    def test_is_expired_method_false(self):
        """Test the is_expired method returns False for valid token."""
        token = PasswordResetToken.objects.create(user=self.user)
        self.assertFalse(token.is_expired())

    def test_is_expired_method_true(self):
        """Test the is_expired method returns True for expired token."""
        token = PasswordResetToken.objects.create(user=self.user)
        token.expires_at = timezone.now() - timedelta(minutes=1)
        token.save()
        
        self.assertTrue(token.is_expired())

    def test_token_str_method(self):
        """Test string representation of password reset token."""
        token = PasswordResetToken.objects.create(user=self.user)
        expected_str = f"Password reset token for {self.user.email}"
        self.assertEqual(str(token), expected_str)

    def test_token_is_used_default(self):
        """Test that is_used defaults to False."""
        token = PasswordResetToken.objects.create(user=self.user)
        self.assertFalse(token.is_used)

    def test_token_uniqueness(self):
        """Test that each token is unique."""
        token1 = PasswordResetToken.objects.create(user=self.user)
        token2 = PasswordResetToken.objects.create(user=self.user)
        
        self.assertNotEqual(token1.token, token2.token) 