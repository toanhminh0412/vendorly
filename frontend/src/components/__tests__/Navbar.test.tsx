import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import Navbar from '../Navbar';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter, usePathname } from 'next/navigation';

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
const mockUsePathname = usePathname as jest.MockedFunction<typeof usePathname>;

const mockPush = jest.fn();

beforeEach(() => {
  jest.clearAllMocks();
  mockUseRouter.mockReturnValue({ push: mockPush } as unknown as ReturnType<typeof useRouter>);
  mockUsePathname.mockReturnValue('/');
});

test('hides navbar on auth pages', () => {
  mockUsePathname.mockReturnValue('/auth/login');
  mockUseAuth.mockReturnValue({
    user: null,
    isAuthenticated: false,
    isLoading: false,
    login: jest.fn(),
    register: jest.fn(),
    logout: jest.fn(),
    refreshAuth: jest.fn(),
  });

  const { container } = render(<Navbar />);
  expect(container.firstChild).toBeNull();
});

test('shows login/register when not authenticated', () => {
  mockUseAuth.mockReturnValue({
    user: null,
    isAuthenticated: false,
    isLoading: false,
    login: jest.fn(),
    register: jest.fn(),
    logout: jest.fn(),
    refreshAuth: jest.fn(),
  });

  render(<Navbar />);
  
  // There are multiple Login elements (mobile + desktop)
  expect(screen.getAllByText('Login')).toHaveLength(2);
  expect(screen.getByText('Sign Up')).toBeInTheDocument();
  expect(screen.getByText('Vendorly')).toBeInTheDocument();
});

test('shows user menu when authenticated', () => {
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

  render(<Navbar />);
  
  expect(screen.getByText('J')).toBeInTheDocument(); // User initials
  expect(screen.queryByText('Login')).not.toBeInTheDocument();
  expect(screen.queryByText('Sign Up')).not.toBeInTheDocument();
});

test('displays correct user initials and name', () => {
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

  render(<Navbar />);
  
  // Click user menu to see dropdown
  fireEvent.click(screen.getByText('J'));
  
  expect(screen.getByText('John Doe')).toBeInTheDocument();
});

test('handles logout correctly', async () => {
  const mockLogout = jest.fn().mockResolvedValue(undefined);
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
    logout: mockLogout,
    refreshAuth: jest.fn(),
  });

  render(<Navbar />);
  
  // Click user menu to open dropdown
  fireEvent.click(screen.getByText('J'));
  
  // Click logout button
  const logoutButton = screen.getByText('Logout');
  await fireEvent.click(logoutButton);
  
  // Wait for async logout to complete
  await screen.findByText('J'); // Wait for re-render
  
  expect(mockLogout).toHaveBeenCalled();
  expect(mockPush).toHaveBeenCalledWith('/');
});

test('displays email initial when no first name', () => {
  const mockUser = {
    id: 1,
    email: 'user@example.com',
    first_name: '',
    last_name: '',
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

  render(<Navbar />);
  
  expect(screen.getByText('U')).toBeInTheDocument(); // Email initial
}); 