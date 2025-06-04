import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import RegisterPage from '../page';
import { useAuth } from '@/contexts/AuthContext';

// Mock dependencies
jest.mock('@/contexts/AuthContext');
jest.mock('@/lib/fontawesome', () => ({
  FontAwesomeIcon: ({ icon, className }: { icon: string; className?: string }) => (
    <span data-testid={`icon-${icon}`} className={className}>
      {icon}
    </span>
  ),
}));

const mockUseAuth = useAuth as jest.MockedFunction<typeof useAuth>;

const mockRegister = jest.fn();

beforeEach(() => {
  jest.clearAllMocks();
  mockUseAuth.mockReturnValue({
    user: null,
    isAuthenticated: false,
    isLoading: false,
    login: jest.fn(),
    register: mockRegister,
    logout: jest.fn(),
    refreshAuth: jest.fn(),
  });
});

test('renders registration form', () => {
  render(<RegisterPage />);
  
  expect(screen.getByRole('heading', { name: 'Create Account' })).toBeInTheDocument();
  expect(screen.getByPlaceholderText('First name')).toBeInTheDocument();
  expect(screen.getByPlaceholderText('Last name')).toBeInTheDocument();
  expect(screen.getByPlaceholderText('Enter your email')).toBeInTheDocument();
  expect(screen.getByPlaceholderText('Create a password')).toBeInTheDocument();
  expect(screen.getByPlaceholderText('Confirm your password')).toBeInTheDocument();
  expect(screen.getByRole('button', { name: /create account/i })).toBeInTheDocument();
});

test('handles successful registration', async () => {
  mockRegister.mockResolvedValue(undefined);

  render(<RegisterPage />);
  
  fireEvent.change(screen.getByPlaceholderText('Enter your email'), {
    target: { value: 'user@example.com' }
  });
  fireEvent.change(screen.getByPlaceholderText('Create a password'), {
    target: { value: 'password123' }
  });
  fireEvent.change(screen.getByPlaceholderText('Confirm your password'), {
    target: { value: 'password123' }
  });
  
  fireEvent.click(screen.getByRole('button', { name: /create account/i }));
  
  await waitFor(() => {
    expect(mockRegister).toHaveBeenCalled();
    expect(screen.getByText('Registration Successful!')).toBeInTheDocument();
    expect(screen.getByText('user@example.com')).toBeInTheDocument();
  });
});

test('displays error on failed registration', async () => {
  mockRegister.mockRejectedValue({
    response: {
      data: {
        email: ['This email is already in use.']
      }
    }
  });

  render(<RegisterPage />);
  
  fireEvent.change(screen.getByPlaceholderText('Enter your email'), {
    target: { value: 'user@example.com' }
  });
  fireEvent.change(screen.getByPlaceholderText('Create a password'), {
    target: { value: 'password123' }
  });
  fireEvent.change(screen.getByPlaceholderText('Confirm your password'), {
    target: { value: 'password123' }
  });
  
  fireEvent.click(screen.getByRole('button', { name: /create account/i }));
  
  await waitFor(() => {
    expect(screen.getByText('This email is already in use.')).toBeInTheDocument();
  });
});

test('toggles password visibility', () => {
  render(<RegisterPage />);
  
  const passwordInput = screen.getByPlaceholderText('Create a password');
  const toggleButtons = screen.getAllByTestId('icon-eye');
  
  expect(passwordInput).toHaveAttribute('type', 'password');
  
  fireEvent.click(toggleButtons[0]);
  expect(passwordInput).toHaveAttribute('type', 'text');
}); 