import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { useSearchParams } from 'next/navigation';
import ResetPasswordPage from '../page';
import * as api from '@/lib/api';

// Mock dependencies
jest.mock('next/navigation');
jest.mock('@/lib/api', () => ({
  authAPI: {
    resetPassword: jest.fn(),
  },
}));
jest.mock('@/lib/fontawesome', () => ({
  FontAwesomeIcon: ({ icon, className }: { icon: string; className?: string }) => (
    <span data-testid={`icon-${icon}`} className={className}>
      {icon}
    </span>
  ),
}));

const mockUseSearchParams = useSearchParams as jest.MockedFunction<typeof useSearchParams>;
const mockAuthAPI = api.authAPI as jest.Mocked<typeof api.authAPI>;

beforeEach(() => {
  jest.clearAllMocks();
  mockUseSearchParams.mockReturnValue({
    get: jest.fn((key: string) => {
      if (key === 'token') return 'valid-token';
      return null;
    })
  } as unknown as ReturnType<typeof useSearchParams>);
});

test('renders reset password form', () => {
  render(<ResetPasswordPage />);
  
  expect(screen.getByRole('heading', { name: 'Reset Password' })).toBeInTheDocument();
  expect(screen.getByPlaceholderText('Enter your new password')).toBeInTheDocument();
  expect(screen.getByPlaceholderText('Confirm your new password')).toBeInTheDocument();
  expect(screen.getByRole('button', { name: /reset password/i })).toBeInTheDocument();
});

test('handles successful password reset', async () => {
  mockAuthAPI.resetPassword.mockResolvedValue({ message: 'Password reset successfully' });

  render(<ResetPasswordPage />);
  
  fireEvent.change(screen.getByPlaceholderText('Enter your new password'), {
    target: { value: 'newpassword123' }
  });
  fireEvent.change(screen.getByPlaceholderText('Confirm your new password'), {
    target: { value: 'newpassword123' }
  });
  
  fireEvent.click(screen.getByRole('button', { name: /reset password/i }));
  
  await waitFor(() => {
    expect(mockAuthAPI.resetPassword).toHaveBeenCalledWith({
      token: 'valid-token',
      password: 'newpassword123',
      password_confirm: 'newpassword123',
    });
    expect(screen.getByText('Password Reset Successful!')).toBeInTheDocument();
  });
});

test('shows error for mismatched passwords', async () => {
  render(<ResetPasswordPage />);
  
  fireEvent.change(screen.getByPlaceholderText('Enter your new password'), {
    target: { value: 'password123' }
  });
  fireEvent.change(screen.getByPlaceholderText('Confirm your new password'), {
    target: { value: 'different123' }
  });
  
  fireEvent.click(screen.getByRole('button', { name: /reset password/i }));
  
  await waitFor(() => {
    expect(screen.getByText("Passwords don't match")).toBeInTheDocument();
  });
});

test('displays error on failed password reset', async () => {
  mockAuthAPI.resetPassword.mockRejectedValue({
    response: {
      data: {
        error: 'Password reset token has expired'
      }
    }
  });

  render(<ResetPasswordPage />);
  
  fireEvent.change(screen.getByPlaceholderText('Enter your new password'), {
    target: { value: 'newpassword123' }
  });
  fireEvent.change(screen.getByPlaceholderText('Confirm your new password'), {
    target: { value: 'newpassword123' }
  });
  
  fireEvent.click(screen.getByRole('button', { name: /reset password/i }));
  
  await waitFor(() => {
    expect(screen.getByText('Password reset token has expired')).toBeInTheDocument();
  });
});

test('shows error for invalid token', () => {
  mockUseSearchParams.mockReturnValue({
    get: jest.fn(() => null)
  } as unknown as ReturnType<typeof useSearchParams>);

  render(<ResetPasswordPage />);
  
  expect(screen.getByText('Invalid Reset Link')).toBeInTheDocument();
  expect(screen.getByText('Invalid reset link. No token provided.')).toBeInTheDocument();
}); 