import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { useSearchParams } from 'next/navigation';
import VerifyEmailPage from '../page';
import * as api from '@/lib/api';

// Mock dependencies
jest.mock('next/navigation');
jest.mock('@/lib/api', () => ({
  authAPI: {
    verifyEmail: jest.fn(),
    resendVerification: jest.fn(),
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
  // Mock searchParams.get
  mockUseSearchParams.mockReturnValue({
    get: jest.fn((key: string) => {
      if (key === 'token') return 'valid-token';
      return null;
    })
  } as unknown as ReturnType<typeof useSearchParams>);
});

test('shows loading state initially', () => {
  mockAuthAPI.verifyEmail.mockImplementation(() => new Promise(() => {})); // Never resolves

  render(<VerifyEmailPage />);
  
  expect(screen.getByTestId('icon-spinner')).toBeInTheDocument();
  expect(screen.getByText('Verifying Your Email')).toBeInTheDocument();
});

test('shows success state on successful verification', async () => {
  mockAuthAPI.verifyEmail.mockResolvedValue({ message: 'Email verified successfully' });

  render(<VerifyEmailPage />);
  
  await waitFor(() => {
    expect(screen.getByText('Email Verified!')).toBeInTheDocument();
    expect(screen.getByText('Continue to Login')).toBeInTheDocument();
  });
});

test('shows error state on verification failure', async () => {
  mockAuthAPI.verifyEmail.mockRejectedValue({
    response: {
      data: {
        error: 'Invalid verification token'
      }
    }
  });

  render(<VerifyEmailPage />);
  
  await waitFor(() => {
    expect(screen.getByText('Verification Failed')).toBeInTheDocument();
    expect(screen.getByText('Invalid verification token')).toBeInTheDocument();
    expect(screen.getByText('Resend Verification Email')).toBeInTheDocument();
  });
});

test('shows expired state on expired token', async () => {
  mockAuthAPI.verifyEmail.mockRejectedValue({
    response: {
      data: {
        error: 'Verification token has expired'
      }
    }
  });

  render(<VerifyEmailPage />);
  
  await waitFor(() => {
    expect(screen.getByText('Link Expired')).toBeInTheDocument();
    expect(screen.getByText('Your verification link has expired.')).toBeInTheDocument();
  });
});

test('handles resend verification', async () => {
  mockAuthAPI.verifyEmail.mockRejectedValue({
    response: {
      data: {
        error: 'Invalid verification token'
      }
    }
  });
  mockAuthAPI.resendVerification.mockResolvedValue({ message: 'Verification email sent successfully!' });

  // Mock alert
  const mockAlert = jest.spyOn(window, 'alert').mockImplementation(() => {});

  render(<VerifyEmailPage />);
  
  await waitFor(() => {
    expect(screen.getByText('Verification Failed')).toBeInTheDocument();
  });

  // Enter email and resend
  const emailInput = screen.getByPlaceholderText('Enter your email to resend verification');
  fireEvent.change(emailInput, { target: { value: 'user@example.com' } });
  
  const resendButton = screen.getByText('Resend Verification Email');
  fireEvent.click(resendButton);

  await waitFor(() => {
    expect(mockAuthAPI.resendVerification).toHaveBeenCalledWith('user@example.com');
    expect(mockAlert).toHaveBeenCalledWith('Verification email sent successfully! Please check your inbox.');
  });

  mockAlert.mockRestore();
}); 