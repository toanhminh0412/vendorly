import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ForgotPasswordPage from '../page';
import * as api from '@/lib/api';

// Mock dependencies
jest.mock('@/lib/api', () => ({
  authAPI: {
    forgotPassword: jest.fn(),
  },
}));
jest.mock('@/lib/fontawesome', () => ({
  FontAwesomeIcon: ({ icon, className }: { icon: string; className?: string }) => (
    <span data-testid={`icon-${icon}`} className={className}>
      {icon}
    </span>
  ),
}));

const mockAuthAPI = api.authAPI as jest.Mocked<typeof api.authAPI>;

beforeEach(() => {
  jest.clearAllMocks();
});

test('renders forgot password form', () => {
  render(<ForgotPasswordPage />);
  
  expect(screen.getByText('Forgot Password?')).toBeInTheDocument();
  expect(screen.getByPlaceholderText('Enter your email address')).toBeInTheDocument();
  expect(screen.getByText('Send Reset Link')).toBeInTheDocument();
});

test('handles successful password reset request', async () => {
  mockAuthAPI.forgotPassword.mockResolvedValue({ message: 'Password reset email sent successfully' });

  render(<ForgotPasswordPage />);
  
  fireEvent.change(screen.getByPlaceholderText('Enter your email address'), {
    target: { value: 'user@example.com' }
  });
  
  fireEvent.click(screen.getByRole('button', { name: /send reset link/i }));
  
  await waitFor(() => {
    expect(mockAuthAPI.forgotPassword).toHaveBeenCalledWith('user@example.com');
    expect(screen.getByText('Email Sent!')).toBeInTheDocument();
    expect(screen.getByText('user@example.com')).toBeInTheDocument();
  });
});

test('displays error on failed password reset request', async () => {
  mockAuthAPI.forgotPassword.mockRejectedValue({
    response: {
      data: {
        error: 'No user found with this email address'
      }
    }
  });

  render(<ForgotPasswordPage />);
  
  fireEvent.change(screen.getByPlaceholderText('Enter your email address'), {
    target: { value: 'nonexistent@example.com' }
  });
  
  fireEvent.click(screen.getByRole('button', { name: /send reset link/i }));
  
  await waitFor(() => {
    expect(screen.getByText('No user found with this email address')).toBeInTheDocument();
  });
});

test('handles back button after success', async () => {
  mockAuthAPI.forgotPassword.mockResolvedValue({ message: 'Password reset email sent successfully' });

  render(<ForgotPasswordPage />);
  
  fireEvent.change(screen.getByPlaceholderText('Enter your email address'), {
    target: { value: 'user@example.com' }
  });
  
  fireEvent.click(screen.getByRole('button', { name: /send reset link/i }));
  
  await waitFor(() => {
    expect(screen.getByText('Email Sent!')).toBeInTheDocument();
  });

  // Click the "Send Another Reset Email" button to go back
  fireEvent.click(screen.getByText('Send Another Reset Email'));
  
  expect(screen.getByText('Forgot Password?')).toBeInTheDocument();
  expect(screen.getByPlaceholderText('Enter your email address')).toHaveValue('');
});

test('shows loading state during submission', async () => {
  mockAuthAPI.forgotPassword.mockImplementation(() => new Promise(() => {})); // Never resolves

  render(<ForgotPasswordPage />);
  
  fireEvent.change(screen.getByPlaceholderText('Enter your email address'), {
    target: { value: 'user@example.com' }
  });
  
  fireEvent.click(screen.getByRole('button', { name: /send reset link/i }));
  
  expect(screen.getByTestId('icon-spinner')).toBeInTheDocument();
  expect(screen.getByText('Sending...')).toBeInTheDocument();
}); 