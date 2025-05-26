from django.core.mail import send_mail
from django.conf import settings
from django.template.loader import render_to_string
from django.utils.html import strip_tags
import logging

logger = logging.getLogger(__name__)


def send_verification_email(user_email, verification_token, user_name):
    """Send email verification email synchronously"""
    try:
        subject = 'Verify your email address - Vendorly'
        
        # Create the verification URL
        verification_url = f"http://localhost:3000/auth/verify-email?token={verification_token}"
        
        # Render HTML email template
        html_message = render_to_string('authentication/verification_email.html', {
            'user_name': user_name,
            'verification_url': verification_url,
        })
        
        # Create plain text version
        plain_message = strip_tags(html_message)
        
        send_mail(
            subject=subject,
            message=plain_message,
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[user_email],
            html_message=html_message,
            fail_silently=False,
        )
        
        logger.info(f"Verification email sent successfully to {user_email}")
        return True
        
    except Exception as e:
        logger.error(f"Failed to send verification email to {user_email}: {str(e)}")
        return False


def send_password_reset_email(user_email, reset_token, user_name):
    """Send password reset email synchronously"""
    try:
        subject = 'Reset your password - Vendorly'
        
        # Create the reset URL
        reset_url = f"http://localhost:3000/auth/reset-password?token={reset_token}"
        
        # Render HTML email template
        html_message = render_to_string('authentication/password_reset_email.html', {
            'user_name': user_name,
            'reset_url': reset_url,
        })
        
        # Create plain text version
        plain_message = strip_tags(html_message)
        
        send_mail(
            subject=subject,
            message=plain_message,
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[user_email],
            html_message=html_message,
            fail_silently=False,
        )
        
        logger.info(f"Password reset email sent successfully to {user_email}")
        return True
        
    except Exception as e:
        logger.error(f"Failed to send password reset email to {user_email}: {str(e)}")
        return False 