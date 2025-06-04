from django.contrib import admin
from .models import User, EmailVerificationToken, PasswordResetToken

# Register your models here.
admin.site.register(User)
admin.site.register(EmailVerificationToken)
admin.site.register(PasswordResetToken)
