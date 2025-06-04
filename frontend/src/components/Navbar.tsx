'use client';

import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { FontAwesomeIcon } from '@/lib/fontawesome';

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  // Hide navbar on auth pages for better UX
  const isAuthPage = pathname?.startsWith('/auth/');
  if (isAuthPage) {
    return null;
  }

  const handleLogout = async () => {
    await logout();
    router.push('/');
  };

  const getInitials = () => {
    if (user?.first_name) {
      return user.first_name[0].toUpperCase();
    } else if (user?.email) {
      return user.email[0].toUpperCase();
    }
    return 'U';
  };

  const getDisplayName = () => {
    if (user?.first_name && user?.last_name) {
      return `${user.first_name} ${user.last_name}`;
    } else if (user?.first_name) {
      return user.first_name;
    } else if (user?.email) {
      return user.email.split('@')[0];
    }
    return 'User';
  };

  return (
    <div className="navbar bg-base-100 shadow-lg sticky top-0 z-50">
      <div className="navbar-start">
        <div className="dropdown">
          <div tabIndex={0} role="button" className="btn btn-ghost lg:hidden">
            <FontAwesomeIcon icon="bars" className="h-5 w-5" />
          </div>
          <ul
            tabIndex={0}
            className="menu menu-sm dropdown-content bg-base-100 rounded-box z-[1] mt-3 w-52 p-2 shadow"
          >
            <li><Link href="/">Home</Link></li>
            {isAuthenticated ? (
              <>
                <li><Link href="/dashboard">Dashboard</Link></li>
                <li><a>Features</a></li>
                <li><a>About</a></li>
              </>
            ) : (
              <>
                <li><Link href="/auth/login">Login</Link></li>
                <li><Link href="/auth/register">Register</Link></li>
              </>
            )}
          </ul>
        </div>
        <Link href="/" className="btn btn-ghost text-xl font-bold text-primary">
          <FontAwesomeIcon icon="code-branch" className="mr-2" />
          Vendorly
        </Link>
      </div>

      <div className="navbar-center hidden lg:flex">
        <ul className="menu menu-horizontal px-1">
          <li><Link href="/">Home</Link></li>
          {isAuthenticated ? (
            <>
              <li><Link href="/dashboard">Dashboard</Link></li>
              <li><a>Features</a></li>
              <li><a>About</a></li>
            </>
          ) : (
            <>
              <li><a>Features</a></li>
              <li><a>About</a></li>
              <li><a>Contact</a></li>
            </>
          )}
        </ul>
      </div>

      <div className="navbar-end">
        {isAuthenticated ? (
          <div className="dropdown dropdown-end">
            <div tabIndex={0} role="button" className="btn btn-primary btn-circle">
                {getInitials()}
            </div>
            <ul
              tabIndex={0}
              className="menu menu-sm dropdown-content bg-base-100 rounded-box z-[1] mt-3 w-52 p-2 shadow"
            >
              <li className="menu-title">
                <span>{getDisplayName()}</span>
              </li>
              <li>
                <Link href="/dashboard">
                  <FontAwesomeIcon icon="tachometer-alt" className="mr-2" />
                  Dashboard
                </Link>
              </li>
              <li>
                <Link href="/profile">
                  <FontAwesomeIcon icon="user" className="mr-2" />
                  Profile
                </Link>
              </li>
              <li>
                <Link href="/settings">
                  <FontAwesomeIcon icon="cog" className="mr-2" />
                  Settings
                </Link>
              </li>
              <div className="divider my-1"></div>
              <li>
                <button onClick={handleLogout} className="text-error">
                  <FontAwesomeIcon icon="sign-out-alt" className="mr-2" />
                  Logout
                </button>
              </li>
            </ul>
          </div>
        ) : (
          <div className="space-x-2">
            <Link href="/auth/login" className="btn btn-ghost">
              Login
            </Link>
            <Link href="/auth/register" className="btn btn-primary">
              Sign Up
            </Link>
          </div>
        )}
      </div>
    </div>
  );
} 