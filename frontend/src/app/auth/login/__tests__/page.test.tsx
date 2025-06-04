import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import LoginPage from '../page';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';

// Mock dependencies
jest.mock('@/contexts/AuthContext');
jest.mock('next/navigation');
jest.mock('@/lib/fontawesome', () => ({
  FontAwesomeIcon: ({ icon, className }: { icon: string; className?: string }) => (
    <span data-testid={`icon-${icon}`} className={className}>
      {icon}
    </span>
  ),
}));

const mockUseAuth = useAuth as jest.MockedFunction<typeof useAuth>;
const mockUseRouter = useRouter as jest.MockedFunction<typeof useRouter>;

const mockPush = jest.fn();
const mockLogin = jest.fn();

beforeEach(() => {
  jest.clearAllMocks();
  mockUseRouter.mockReturnValue({ push: mockPush } as unknown as ReturnType<typeof useRouter>);
  mockUseAuth.mockReturnValue({
    user: null,
    isAuthenticated: false,
    isLoading: false,
    login: mockLogin,
    register: jest.fn(),
    logout: jest.fn(),
    refreshAuth: jest.fn(),
  });
});

test('renders login form', () => {
  render(<LoginPage />);
  
  expect(screen.getByText('Welcome Back')).toBeInTheDocument();
  expect(screen.getByPlaceholderText('Enter your email')).toBeInTheDocument();
  expect(screen.getByPlaceholderText('Enter your password')).toBeInTheDocument();
  expect(screen.getByText('Sign In')).toBeInTheDocument();
});

test('handles successful login', async () => {
  mockLogin.mockResolvedValue(undefined);

  render(<LoginPage />);
  
  fireEvent.change(screen.getByPlaceholderText('Enter your email'), {
    target: { value: 'user@example.com' }
  });
  fireEvent.change(screen.getByPlaceholderText('Enter your password'), {
    target: { value: 'password123' }
  });
  
  fireEvent.click(screen.getByText('Sign In'));
  
  await waitFor(() => {
    expect(mockLogin).toHaveBeenCalledWith('user@example.com', 'password123');
    expect(mockPush).toHaveBeenCalledWith('/dashboard');
  });
});

test('displays error on failed login', async () => {
  mockLogin.mockRejectedValue({
    response: {
      data: {
        non_field_errors: ['Invalid credentials']
      }
    }
  });

  render(<LoginPage />);
  
  fireEvent.change(screen.getByPlaceholderText('Enter your email'), {
    target: { value: 'user@example.com' }
  });
  fireEvent.change(screen.getByPlaceholderText('Enter your password'), {
    target: { value: 'wrongpassword' }
  });
  
  fireEvent.click(screen.getByText('Sign In'));
  
  await waitFor(() => {
    expect(screen.getByText('Invalid credentials')).toBeInTheDocument();
  });
});

test('toggles password visibility', () => {
  render(<LoginPage />);
  
  const passwordInput = screen.getByPlaceholderText('Enter your password');
  const toggleButton = screen.getByTestId('icon-eye');
  
  expect(passwordInput).toHaveAttribute('type', 'password');
  
  fireEvent.click(toggleButton);
  expect(passwordInput).toHaveAttribute('type', 'text');
}); 