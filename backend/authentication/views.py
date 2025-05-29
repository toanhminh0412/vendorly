from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import get_user_model

from .models import EmailVerificationToken, PasswordResetToken
from .serializers import (
    UserRegistrationSerializer,
    UserLoginSerializer,
    EmailVerificationSerializer,
    PasswordResetRequestSerializer,
    PasswordResetConfirmSerializer,
    UserProfileSerializer
)
from .utils import send_verification_email, send_password_reset_email

User = get_user_model()


@api_view(['POST'])
@permission_classes([AllowAny])
def register(request):
    """User registration endpoint"""
    serializer = UserRegistrationSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.save()

        # Create email verification token
        verification_token = EmailVerificationToken.objects.create(user=user)

        # Send verification email synchronously
        # Use first_name if available, otherwise use the auto-generated username
        display_name = user.first_name or user.email.split('@')[0]
        email_sent = send_verification_email(
            user.email,
            str(verification_token.token),
            display_name
        )

        response_message = 'User registered successfully.'
        if email_sent:
            response_message += ' Please check your email to verify your account.'
        else:
            response_message += (
                ' However, there was an issue sending the verification email. '
                'You can request a new one later.'
            )

        return Response({
            'message': response_message,
            'user_id': user.id,
            'email_sent': email_sent
        }, status=status.HTTP_201_CREATED)

    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([AllowAny])
def login(request):
    """User login endpoint"""
    serializer = UserLoginSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.validated_data['user']

        # Generate JWT tokens
        refresh = RefreshToken.for_user(user)
        access_token = refresh.access_token

        return Response({
            'access_token': str(access_token),
            'refresh_token': str(refresh),
            'user': UserProfileSerializer(user).data
        }, status=status.HTTP_200_OK)

    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([AllowAny])
def verify_email(request):
    """Email verification endpoint"""
    serializer = EmailVerificationSerializer(data=request.data)
    if serializer.is_valid():
        token = serializer.validated_data['token']

        try:
            verification_token = EmailVerificationToken.objects.get(token=token)

            if verification_token.is_expired():
                return Response({
                    'error': 'Verification token has expired'
                }, status=status.HTTP_400_BAD_REQUEST)

            # Verify the user's email
            user = verification_token.user
            user.is_email_verified = True
            user.save()

            # Delete the verification token
            verification_token.delete()

            return Response({
                'message': 'Email verified successfully'
            }, status=status.HTTP_200_OK)

        except EmailVerificationToken.DoesNotExist:
            return Response({
                'error': 'Invalid verification token'
            }, status=status.HTTP_400_BAD_REQUEST)

    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([AllowAny])
def resend_verification_email(request):
    """Resend email verification"""
    email = request.data.get('email')
    if not email:
        return Response({
            'error': 'Email is required'
        }, status=status.HTTP_400_BAD_REQUEST)

    try:
        user = User.objects.get(email=email)

        if user.is_email_verified:
            return Response({
                'message': 'Email is already verified'
            }, status=status.HTTP_200_OK)

        # Delete existing verification tokens
        EmailVerificationToken.objects.filter(user=user).delete()

        # Create new verification token
        verification_token = EmailVerificationToken.objects.create(user=user)

        # Send verification email synchronously
        display_name = user.first_name or user.email.split('@')[0]
        email_sent = send_verification_email(
            user.email,
            str(verification_token.token),
            display_name
        )

        if email_sent:
            return Response({
                'message': 'Verification email sent successfully'
            }, status=status.HTTP_200_OK)

        return Response({
            'error': 'Failed to send verification email. Please try again later.'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    except User.DoesNotExist:
        return Response({
            'error': 'User with this email does not exist'
        }, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([AllowAny])
def forgot_password(request):
    """Request password reset"""
    serializer = PasswordResetRequestSerializer(data=request.data)
    if serializer.is_valid():
        email = serializer.validated_data['email']
        user = User.objects.get(email=email)

        # Delete existing password reset tokens
        PasswordResetToken.objects.filter(user=user).delete()

        # Create new password reset token
        reset_token = PasswordResetToken.objects.create(user=user)

        # Send password reset email synchronously
        display_name = user.first_name or user.email.split('@')[0]
        email_sent = send_password_reset_email(
            user.email,
            str(reset_token.token),
            display_name
        )

        if email_sent:
            return Response({
                'message': 'Password reset email sent successfully'
            }, status=status.HTTP_200_OK)

        return Response({
            'error': 'Failed to send password reset email. Please try again later.'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([AllowAny])
def reset_password(request):
    """Reset password with token"""
    serializer = PasswordResetConfirmSerializer(data=request.data)
    if serializer.is_valid():
        token = serializer.validated_data['token']
        password = serializer.validated_data['password']

        try:
            reset_token = PasswordResetToken.objects.get(token=token, is_used=False)

            if reset_token.is_expired():
                return Response({
                    'error': 'Password reset token has expired'
                }, status=status.HTTP_400_BAD_REQUEST)

            # Reset the password
            user = reset_token.user
            user.set_password(password)
            user.save()

            # Mark token as used
            reset_token.is_used = True
            reset_token.save()

            return Response({
                'message': 'Password reset successfully'
            }, status=status.HTTP_200_OK)

        except PasswordResetToken.DoesNotExist:
            return Response({
                'error': 'Invalid or expired password reset token'
            }, status=status.HTTP_400_BAD_REQUEST)

    error_string = "; ".join(
        f"{field}: {', '.join(errors)}" for field, errors in serializer.errors.items()
    )
    return Response(
        {'error': error_string},
        status=status.HTTP_400_BAD_REQUEST
    )


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def profile(request):
    """Get user profile"""
    serializer = UserProfileSerializer(request.user)
    return Response(serializer.data, status=status.HTTP_200_OK)


@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def update_profile(request):
    """Update user profile"""
    serializer = UserProfileSerializer(request.user, data=request.data, partial=True)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=status.HTTP_200_OK)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def logout(request):
    """Logout user by blacklisting refresh token"""
    try:
        refresh_token = request.data.get('refresh_token')
        if refresh_token:
            token = RefreshToken(refresh_token)
            token.blacklist()
        return Response({
            'message': 'Logged out successfully'
        }, status=status.HTTP_200_OK)
    except Exception:
        return Response({
            'error': 'Invalid token'
        }, status=status.HTTP_400_BAD_REQUEST)
