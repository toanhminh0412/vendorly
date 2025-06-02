import { http, HttpResponse } from 'msw'

const mockUser = {
  id: 1,
  email: 'user@example.com',
  username: 'user',
  first_name: 'First',
  last_name: 'Last',
  is_email_verified: true,
  created_at: '2024-01-01T00:00:00Z',
};

const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:8000';

export const handlers = [
  // Register
  http.post(`${API_BASE_URL}/auth/register/`, async ({ request, response }) => {
    const body = await request.json();
    if (!body.email || !body.password || !body.password_confirm) {
      return HttpResponse.json({
        email: body.email ? undefined : ['This field is required.'],
        password: body.password ? undefined : ['This field is required.'],
        password_confirm: body.password_confirm ? undefined : ['This field is required.'],
      }, { status: 400 });
    }
    return HttpResponse.json({
      message: 'User registered successfully. Please check your email to verify your account.',
      user_id: 1,
      email_sent: true
    }, { status: 201 });
  }),

  // Login
  http.post(`${API_BASE_URL}/auth/login/`, async ({ request }) => {
    const body = await request.json();
    if (body.email === 'fail@example.com') {
      return HttpResponse.json({
        non_field_errors: ['Invalid credentials']
      }, { status: 400 });
    }
    return HttpResponse.json({
      access_token: 'mock_access_token',
      refresh_token: 'mock_refresh_token',
      user: mockUser
    });
  }),

  // Verify Email
  http.post(`${API_BASE_URL}/auth/verify-email/`, async ({ request }) => {
    const body = await request.json();
    if (body.token === 'expired') {
      return HttpResponse.json({ error: 'Verification token has expired' }, { status: 400 });
    }
    if (body.token === 'invalid') {
      return HttpResponse.json({ error: 'Invalid verification token' }, { status: 400 });
    }
    return HttpResponse.json({ message: 'Email verified successfully' });
  }),

  // Resend Verification
  http.post(`${API_BASE_URL}/auth/resend-verification/`, async ({ request }) => {
    const body = await request.json();
    if (!body.email) {
      return HttpResponse.json({ error: 'Email is required' }, { status: 400 });
    }
    if (body.email === 'already@verified.com') {
      return HttpResponse.json({ message: 'Email is already verified' });
    }
    if (body.email === 'notfound@example.com') {
      return HttpResponse.json({ error: 'User with this email does not exist' }, { status: 400 });
    }
    return HttpResponse.json({ message: 'Verification email sent successfully' });
  }),

  // Forgot Password
  http.post(`${API_BASE_URL}/auth/forgot-password/`, async ({ request }) => {
    const body = await request.json();
    if (body.email === 'notfound@example.com') {
      return HttpResponse.json({ email: ['No user found with this email address'] }, { status: 400 });
    }
    if (body.email === 'fail@example.com') {
      return HttpResponse.json({ error: 'Failed to send password reset email. Please try again later.' }, { status: 500 });
    }
    return HttpResponse.json({ message: 'Password reset email sent successfully' });
  }),

  // Reset Password
  http.post(`${API_BASE_URL}/auth/reset-password/`, async ({ request }) => {
    const body = await request.json();
    if (body.token === 'expired') {
      return HttpResponse.json({ error: 'Password reset token has expired' }, { status: 400 });
    }
    if (body.token === 'invalid') {
      return HttpResponse.json({ error: 'Invalid or expired password reset token' }, { status: 400 });
    }
    if (body.password !== body.password_confirm) {
      return HttpResponse.json({ error: "password: Passwords don't match" }, { status: 400 });
    }
    return HttpResponse.json({ message: 'Password reset successfully' });
  }),

  // Get Profile
  http.get(`${API_BASE_URL}/auth/profile/`, () => {
    return HttpResponse.json(mockUser);
  }),

  // Update Profile
  http.put(`${API_BASE_URL}/auth/profile/update/`, async ({ request }) => {
    const body = await request.json();
    // Simulate validation error
    if (body.first_name === '') {
      return HttpResponse.json({ first_name: ['This field may not be blank.'] }, { status: 400 });
    }
    return HttpResponse.json({ ...mockUser, ...body });
  }),

  // Logout
  http.post(`${API_BASE_URL}/auth/logout/`, async ({ request }) => {
    const body = await request.json();
    if (body.refresh_token === 'invalid') {
      return HttpResponse.json({ error: 'Invalid token' }, { status: 400 });
    }
    return HttpResponse.json({ message: 'Logged out successfully' });
  }),

  // Token Refresh (SimpleJWT)
  http.post(`${API_BASE_URL}/token/refresh/`, async ({ request }) => {
    const body = await request.json();
    if (body.refresh === 'expired') {
      return HttpResponse.json({ detail: 'Token is invalid or expired', code: 'token_not_valid' }, { status: 401 });
    }
    return HttpResponse.json({ access: 'new_access_token' });
  }),
];