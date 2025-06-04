import React, { act } from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { AuthProvider, useAuth } from '../AuthContext';
import { authAPI } from '@/lib/api';
import Cookies from 'js-cookie';

// Mock dependencies
jest.mock('js-cookie', () => ({
  get: jest.fn(),
  set: jest.fn(),
  remove: jest.fn(),
}));

jest.mock('@/lib/api');

const mockCookies = Cookies as unknown as {
  get: jest.MockedFunction<typeof Cookies.get>;
  set: jest.MockedFunction<typeof Cookies.set>;
  remove: jest.MockedFunction<typeof Cookies.remove>;
};
const mockAuthAPI = authAPI as jest.Mocked<typeof authAPI>;

// Test component to access auth context
function TestComponent() {
  const { user, isLoading, isAuthenticated, login, logout } = useAuth();
  
  return (
    <div>
      <div data-testid="loading">{isLoading.toString()}</div>
      <div data-testid="authenticated">{isAuthenticated.toString()}</div>
      <div data-testid="user">{user?.email || 'null'}</div>
      <button onClick={() => login('test@example.com', 'password')}>
        Login
      </button>
      <button onClick={logout}>Logout</button>
    </div>
  );
}

beforeEach(() => {
  jest.clearAllMocks();
});

test('useAuth throws error when used outside AuthProvider', () => {
  // Suppress console.error for this test
  const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
  
  expect(() => {
    render(<TestComponent />);
  }).toThrow('useAuth must be used within an AuthProvider');
  
  consoleSpy.mockRestore();
});

test('AuthProvider initializes with no user when no token', async () => {
  mockCookies.get.mockReturnValue(undefined);
  
  render(
    <AuthProvider>
      <TestComponent />
    </AuthProvider>
  );
  
  await waitFor(() => {
    expect(screen.getByTestId('loading')).toHaveTextContent('false');
  });
  
  expect(screen.getByTestId('authenticated')).toHaveTextContent('false');
  expect(screen.getByTestId('user')).toHaveTextContent('null');
});

test('AuthProvider loads user when valid token exists', async () => {
  const mockUser = {
    id: 1,
    email: 'user@example.com',
    first_name: 'Test',
    last_name: 'User',
    is_email_verified: true
  };
  
  mockCookies.get.mockReturnValue('valid_token');
  mockAuthAPI.getProfile.mockResolvedValue(mockUser);
  
  render(
    <AuthProvider>
      <TestComponent />
    </AuthProvider>
  );
  
  await waitFor(() => {
    expect(screen.getByTestId('loading')).toHaveTextContent('false');
  });
  
  expect(screen.getByTestId('authenticated')).toHaveTextContent('true');
  expect(screen.getByTestId('user')).toHaveTextContent('user@example.com');
});

test('login sets user and tokens', async () => {
  const mockLoginResponse = {
    access_token: 'access_token',
    refresh_token: 'refresh_token',
    user: {
      id: 1,
      email: 'test@example.com',
      first_name: 'Test',
      last_name: 'User',
      is_email_verified: true
    }
  };
  
  mockCookies.get.mockReturnValue(undefined);
  mockAuthAPI.login.mockResolvedValue(mockLoginResponse);
  
  render(
    <AuthProvider>
      <TestComponent />
    </AuthProvider>
  );
  
  await waitFor(() => {
    expect(screen.getByTestId('loading')).toHaveTextContent('false');
  });
  
  await act(async () => {
    screen.getByText('Login').click();
  });
  
  expect(mockAuthAPI.login).toHaveBeenCalledWith({
    email: 'test@example.com',
    password: 'password'
  });
  
  expect(mockCookies.set).toHaveBeenCalledWith('access_token', 'access_token', { expires: 1 });
  expect(mockCookies.set).toHaveBeenCalledWith('refresh_token', 'refresh_token', { expires: 7 });
  
  expect(screen.getByTestId('authenticated')).toHaveTextContent('true');
  expect(screen.getByTestId('user')).toHaveTextContent('test@example.com');
});

test('logout clears user and tokens', async () => {
  const mockUser = {
    id: 1,
    email: 'user@example.com',
    first_name: 'Test',
    last_name: 'User',
    is_email_verified: true
  };
  
  mockCookies.get.mockReturnValue('valid_token');
  mockAuthAPI.getProfile.mockResolvedValue(mockUser);
  mockAuthAPI.logout.mockResolvedValue({ message: 'Logged out successfully' });
  
  render(
    <AuthProvider>
      <TestComponent />
    </AuthProvider>
  );
  
  await waitFor(() => {
    expect(screen.getByTestId('authenticated')).toHaveTextContent('true');
  });
  
  await act(async () => {
    screen.getByText('Logout').click();
  });
  
  expect(mockCookies.remove).toHaveBeenCalledWith('access_token');
  expect(mockCookies.remove).toHaveBeenCalledWith('refresh_token');
  
  expect(screen.getByTestId('authenticated')).toHaveTextContent('false');
  expect(screen.getByTestId('user')).toHaveTextContent('null');
}); 