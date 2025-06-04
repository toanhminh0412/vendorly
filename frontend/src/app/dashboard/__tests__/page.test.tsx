import React from 'react';
import { render, screen } from '@testing-library/react';
import DashboardPage from '../page';
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

beforeEach(() => {
  jest.clearAllMocks();
});

test('shows loading when no user', () => {
  mockUseAuth.mockReturnValue({
    user: null,
    isAuthenticated: false,
    isLoading: false,
    login: jest.fn(),
    register: jest.fn(),
    logout: jest.fn(),
    refreshAuth: jest.fn(),
  });

  render(<DashboardPage />);
  
  expect(screen.getByTestId('icon-spinner')).toBeInTheDocument();
  expect(screen.getByText('Loading...')).toBeInTheDocument();
});

test('shows dashboard with user first name', () => {
  const mockUser = {
    id: 1,
    email: 'user@example.com',
    first_name: 'John',
    last_name: 'Doe',
    is_email_verified: true,
  };

  mockUseAuth.mockReturnValue({
    user: mockUser,
    isAuthenticated: true,
    isLoading: false,
    login: jest.fn(),
    register: jest.fn(),
    logout: jest.fn(),
    refreshAuth: jest.fn(),
  });

  render(<DashboardPage />);
  
  expect(screen.getByText('Welcome back, John!')).toBeInTheDocument();
  expect(screen.getByText('Profile')).toBeInTheDocument();
  expect(screen.getByText('Orders')).toBeInTheDocument();
  expect(screen.getByText('My Shop')).toBeInTheDocument();
});

test('shows dashboard with email when no first name', () => {
  const mockUser = {
    id: 1,
    email: 'user@example.com',
    first_name: '',
    last_name: 'Doe',
    is_email_verified: true,
  };

  mockUseAuth.mockReturnValue({
    user: mockUser,
    isAuthenticated: true,
    isLoading: false,
    login: jest.fn(),
    register: jest.fn(),
    logout: jest.fn(),
    refreshAuth: jest.fn(),
  });

  render(<DashboardPage />);
  
  expect(screen.getByText('Welcome back, user@example.com!')).toBeInTheDocument();
}); 