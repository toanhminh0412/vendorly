from django.test import TestCase
from django.contrib.auth import get_user_model
from django.core.exceptions import ValidationError

from authentication.serializers import (
    UserRegistrationSerializer,
    UserLoginSerializer,
    EmailVerificationSerializer,
    PasswordResetRequestSerializer,
    PasswordResetConfirmSerializer,
    UserProfileSerializer
)

User = get_user_model()


class UserRegistrationSerializerTest(TestCase):
    """Test cases for UserRegistrationSerializer."""

    def setUp(self):
        self.valid_data = {
            'email': 'test@example.com',
            'password': 'testpass123',
            'password_confirm': 'testpass123',
            'first_name': 'Test',
            'last_name': 'User'
        }

    def test_valid_registration_data(self):
        """Test serializer with valid registration data."""
        serializer = UserRegistrationSerializer(data=self.valid_data)
        self.assertTrue(serializer.is_valid())

    def test_password_mismatch(self):
        """Test validation when passwords don't match."""
        data = self.valid_data.copy()
        data['password_confirm'] = 'differentpass'
        
        serializer = UserRegistrationSerializer(data=data)
        self.assertFalse(serializer.is_valid())
        self.assertIn('non_field_errors', serializer.errors)

    def test_create_user(self):
        """Test user creation through serializer."""
        serializer = UserRegistrationSerializer(data=self.valid_data)
        self.assertTrue(serializer.is_valid())
        
        user = serializer.save()
        self.assertEqual(user.email, self.valid_data['email'])
        self.assertTrue(user.check_password(self.valid_data['password']))
        self.assertEqual(user.first_name, self.valid_data['first_name'])
        self.assertEqual(user.last_name, self.valid_data['last_name'])

    def test_invalid_email(self):
        """Test serializer with invalid email."""
        data = self.valid_data.copy()
        data['email'] = 'invalid-email'
        
        serializer = UserRegistrationSerializer(data=data)
        self.assertFalse(serializer.is_valid())
        self.assertIn('email', serializer.errors)

    def test_missing_required_fields(self):
        """Test serializer with missing required fields."""
        data = {'email': 'test@example.com'}
        
        serializer = UserRegistrationSerializer(data=data)
        self.assertFalse(serializer.is_valid())
        self.assertIn('password', serializer.errors)
        self.assertIn('password_confirm', serializer.errors)

    def test_weak_password(self):
        """Test serializer with weak password."""
        data = self.valid_data.copy()
        data['password'] = '123'
        data['password_confirm'] = '123'
        
        serializer = UserRegistrationSerializer(data=data)
        self.assertFalse(serializer.is_valid())


class UserLoginSerializerTest(TestCase):
    """Test cases for UserLoginSerializer."""

    def setUp(self):
        self.user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='testpass123'
        )

    def test_valid_login_credentials(self):
        """Test serializer with valid login credentials."""
        data = {
            'email': 'test@example.com',
            'password': 'testpass123'
        }
        
        serializer = UserLoginSerializer(data=data)
        self.assertTrue(serializer.is_valid())
        self.assertEqual(serializer.validated_data['user'], self.user)

    def test_invalid_credentials(self):
        """Test serializer with invalid credentials."""
        data = {
            'email': 'test@example.com',
            'password': 'wrongpassword'
        }
        
        serializer = UserLoginSerializer(data=data)
        self.assertFalse(serializer.is_valid())
        self.assertIn('non_field_errors', serializer.errors)

    def test_nonexistent_user(self):
        """Test serializer with non-existent user."""
        data = {
            'email': 'nonexistent@example.com',
            'password': 'testpass123'
        }
        
        serializer = UserLoginSerializer(data=data)
        self.assertFalse(serializer.is_valid())
        self.assertIn('non_field_errors', serializer.errors)

    def test_inactive_user(self):
        """Test login with inactive user."""
        self.user.is_active = False
        self.user.save()
        
        data = {
            'email': 'test@example.com',
            'password': 'testpass123'
        }
        
        serializer = UserLoginSerializer(data=data)
        self.assertFalse(serializer.is_valid())
        self.assertIn('non_field_errors', serializer.errors)

    def test_missing_email(self):
        """Test serializer with missing email."""
        data = {'password': 'testpass123'}
        
        serializer = UserLoginSerializer(data=data)
        self.assertFalse(serializer.is_valid())
        self.assertIn('email', serializer.errors)

    def test_missing_password(self):
        """Test serializer with missing password."""
        data = {'email': 'test@example.com'}
        
        serializer = UserLoginSerializer(data=data)
        self.assertFalse(serializer.is_valid())
        self.assertIn('password', serializer.errors)


class EmailVerificationSerializerTest(TestCase):
    """Test cases for EmailVerificationSerializer."""

    def test_valid_token(self):
        """Test serializer with valid UUID token."""
        import uuid
        data = {'token': str(uuid.uuid4())}
        
        serializer = EmailVerificationSerializer(data=data)
        self.assertTrue(serializer.is_valid())

    def test_invalid_token(self):
        """Test serializer with invalid token."""
        data = {'token': 'invalid-token'}
        
        serializer = EmailVerificationSerializer(data=data)
        self.assertFalse(serializer.is_valid())
        self.assertIn('token', serializer.errors)

    def test_missing_token(self):
        """Test serializer with missing token."""
        data = {}
        
        serializer = EmailVerificationSerializer(data=data)
        self.assertFalse(serializer.is_valid())
        self.assertIn('token', serializer.errors)


class PasswordResetRequestSerializerTest(TestCase):
    """Test cases for PasswordResetRequestSerializer."""

    def setUp(self):
        self.user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='testpass123'
        )

    def test_valid_email(self):
        """Test serializer with valid email."""
        data = {'email': 'test@example.com'}
        serializer = PasswordResetRequestSerializer(data=data)
        self.assertTrue(serializer.is_valid())

    def test_nonexistent_email(self):
        """Test serializer with non-existent email."""
        data = {'email': 'nonexistent@example.com'}
        serializer = PasswordResetRequestSerializer(data=data)
        self.assertFalse(serializer.is_valid())
        self.assertIn('email', serializer.errors)

    def test_invalid_email_format(self):
        """Test serializer with invalid email format."""
        data = {'email': 'invalid-email'}
        serializer = PasswordResetRequestSerializer(data=data)
        self.assertFalse(serializer.is_valid())
        self.assertIn('email', serializer.errors)

    def test_missing_email(self):
        """Test serializer with missing email."""
        data = {}
        serializer = PasswordResetRequestSerializer(data=data)
        self.assertFalse(serializer.is_valid())
        self.assertIn('email', serializer.errors)


class PasswordResetConfirmSerializerTest(TestCase):
    """Test cases for PasswordResetConfirmSerializer."""

    def test_valid_data(self):
        """Test serializer with valid password reset data."""
        import uuid
        data = {
            'token': str(uuid.uuid4()),
            'password': 'newpassword123',
            'password_confirm': 'newpassword123'
        }
        
        serializer = PasswordResetConfirmSerializer(data=data)
        self.assertTrue(serializer.is_valid())

    def test_password_mismatch(self):
        """Test serializer with mismatched passwords."""
        import uuid
        data = {
            'token': str(uuid.uuid4()),
            'password': 'newpassword123',
            'password_confirm': 'differentpassword'
        }
        
        serializer = PasswordResetConfirmSerializer(data=data)
        self.assertFalse(serializer.is_valid())
        self.assertIn('non_field_errors', serializer.errors)

    def test_invalid_token(self):
        """Test serializer with invalid token."""
        data = {
            'token': 'invalid-token',
            'password': 'newpassword123',
            'password_confirm': 'newpassword123'
        }
        
        serializer = PasswordResetConfirmSerializer(data=data)
        self.assertFalse(serializer.is_valid())
        self.assertIn('token', serializer.errors)

    def test_weak_password(self):
        """Test serializer with weak password."""
        import uuid
        data = {
            'token': str(uuid.uuid4()),
            'password': '123',
            'password_confirm': '123'
        }
        
        serializer = PasswordResetConfirmSerializer(data=data)
        self.assertFalse(serializer.is_valid())

    def test_missing_fields(self):
        """Test serializer with missing required fields."""
        data = {}
        
        serializer = PasswordResetConfirmSerializer(data=data)
        self.assertFalse(serializer.is_valid())
        self.assertIn('token', serializer.errors)
        self.assertIn('password', serializer.errors)
        self.assertIn('password_confirm', serializer.errors)


class UserProfileSerializerTest(TestCase):
    """Test cases for UserProfileSerializer."""

    def setUp(self):
        self.user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='testpass123',
            first_name='Test',
            last_name='User'
        )

    def test_serialize_user_profile(self):
        """Test serializing user profile data."""
        serializer = UserProfileSerializer(self.user)
        data = serializer.data
        
        self.assertEqual(data['email'], self.user.email)
        self.assertEqual(data['first_name'], self.user.first_name)
        self.assertEqual(data['last_name'], self.user.last_name)
        self.assertEqual(data['username'], self.user.username)
        self.assertIn('id', data)
        self.assertIn('is_email_verified', data)
        self.assertIn('created_at', data)

    def test_update_user_profile(self):
        """Test updating user profile through serializer."""
        data = {
            'first_name': 'Updated',
            'last_name': 'Name'
        }
        
        serializer = UserProfileSerializer(self.user, data=data, partial=True)
        self.assertTrue(serializer.is_valid())
        
        updated_user = serializer.save()
        self.assertEqual(updated_user.first_name, 'Updated')
        self.assertEqual(updated_user.last_name, 'Name')

    def test_read_only_fields(self):
        """Test that read-only fields cannot be updated."""
        data = {
            'email': 'newemail@example.com',
            'username': 'newusername',
            'is_email_verified': True
        }
        
        serializer = UserProfileSerializer(self.user, data=data, partial=True)
        self.assertTrue(serializer.is_valid())
        
        updated_user = serializer.save()
        # These fields should not change
        self.assertEqual(updated_user.email, self.user.email)
        self.assertEqual(updated_user.username, self.user.username)
        self.assertEqual(updated_user.is_email_verified, self.user.is_email_verified) 