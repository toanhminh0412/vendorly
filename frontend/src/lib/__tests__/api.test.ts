import { authAPI } from "@/lib/api";

const userData = {
  email: "user@example.org",
  password: "secretpassword",
  password_confirm: "secretpassword",
  first_name: "Test",
  last_name: "User"
}

test("Register user", async () => {
  const res = await authAPI.register(userData);
  expect(res).toEqual({
    message: 'User registered successfully. Please check your email to verify your account.',
    user_id: 1,
    email_sent: true
  })
})

test("Login user", async () => {
  const loginData = {
    email: "user@example.com",
    password: "password"
  };
  
  const res = await authAPI.login(loginData);
  expect(res).toEqual({
    access_token: 'mock_access_token',
    refresh_token: 'mock_refresh_token',
    user: {
      id: 1,
      email: 'user@example.com',
      username: 'user',
      first_name: 'First',
      last_name: 'Last',
      is_email_verified: true,
      created_at: '2024-01-01T00:00:00Z',
    }
  })
})

test("Logout user", async () => {
  const res = await authAPI.logout('valid_refresh_token');
  expect(res).toEqual({
    message: 'Logged out successfully'
  })
})

test("Verify email", async () => {
  const res = await authAPI.verifyEmail('valid_token');
  expect(res).toEqual({
    message: 'Email verified successfully'
  })
})

test("Resend verification", async () => {
  const res = await authAPI.resendVerification('user@example.com');
  expect(res).toEqual({
    message: 'Verification email sent successfully'
  })
})

test("Forgot password", async () => {
  const res = await authAPI.forgotPassword('user@example.com');
  expect(res).toEqual({
    message: 'Password reset email sent successfully'
  })
})

test("Reset password", async () => {
  const resetData = {
    token: 'valid_token',
    password: 'newpassword',
    password_confirm: 'newpassword'
  };
  
  const res = await authAPI.resetPassword(resetData);
  expect(res).toEqual({
    message: 'Password reset successfully'
  })
})

test("Get profile", async () => {
  const res = await authAPI.getProfile();
  expect(res).toEqual({
    id: 1,
    email: 'user@example.com',
    username: 'user',
    first_name: 'First',
    last_name: 'Last',
    is_email_verified: true,
    created_at: '2024-01-01T00:00:00Z',
  })
})

test("Update profile", async () => {
  const updateData = {
    first_name: 'Updated',
    last_name: 'Name'
  };
  
  const res = await authAPI.updateProfile(updateData);
  expect(res).toEqual({
    id: 1,
    email: 'user@example.com',
    username: 'user',
    first_name: 'Updated',
    last_name: 'Name',
    is_email_verified: true,
    created_at: '2024-01-01T00:00:00Z',
  })
})