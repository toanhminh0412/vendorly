import React from 'react';
import { render, screen } from '@testing-library/react';
import HomePage from '../page';
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

beforeEach(() => {
  jest.clearAllMocks();
  mockUseRouter.mockReturnValue({ push: mockPush } as unknown as ReturnType<typeof useRouter>);
});

test('shows loading spinner when loading', () => {
  mockUseAuth.mockReturnValue({
    user: null,
    isAuthenticated: false,
    isLoading: true,
    login: jest.fn(),
    register: jest.fn(),
    logout: jest.fn(),
    refreshAuth: jest.fn(),
  });

  render(<HomePage />);
  
  expect(screen.getByTestId('icon-spinner')).toBeInTheDocument();
  expect(screen.queryByText('Welcome to Vendorly')).not.toBeInTheDocument();
});

test('redirects to dashboard when authenticated', () => {
  mockUseAuth.mockReturnValue({
    user: { id: 1, email: 'user@example.com', first_name: 'John', last_name: 'Doe', is_email_verified: true },
    isAuthenticated: true,
    isLoading: false,
    login: jest.fn(),
    register: jest.fn(),
    logout: jest.fn(),
    refreshAuth: jest.fn(),
  });

  render(<HomePage />);
  
  expect(mockPush).toHaveBeenCalledWith('/dashboard');
});

test('shows homepage content when not authenticated', () => {
  mockUseAuth.mockReturnValue({
    user: null,
    isAuthenticated: false,
    isLoading: false,
    login: jest.fn(),
    register: jest.fn(),
    logout: jest.fn(),
    refreshAuth: jest.fn(),
  });

  render(<HomePage />);
  
  expect(screen.getByText('Welcome to Vendorly')).toBeInTheDocument();
  expect(screen.getByText('Get Started - It\'s Free')).toBeInTheDocument();
  expect(screen.getByText('Sign In to Your Account')).toBeInTheDocument();
  expect(screen.getByText('Why Choose Vendorly?')).toBeInTheDocument();
});

test('returns null when authenticated to allow redirect', () => {
  mockUseAuth.mockReturnValue({
    user: { id: 1, email: 'user@example.com', first_name: 'John', last_name: 'Doe', is_email_verified: true },
    isAuthenticated: true,
    isLoading: false,
    login: jest.fn(),
    register: jest.fn(),
    logout: jest.fn(),
    refreshAuth: jest.fn(),
  });

  const { container } = render(<HomePage />);
  
  expect(container.firstChild).toBeNull();
});

test('does not redirect when still loading', () => {
  mockUseAuth.mockReturnValue({
    user: null,
    isAuthenticated: true,
    isLoading: true,
    login: jest.fn(),
    register: jest.fn(),
    logout: jest.fn(),
    refreshAuth: jest.fn(),
  });

  render(<HomePage />);
  
  expect(mockPush).not.toHaveBeenCalled();
}); 