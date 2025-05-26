'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

export default function DashboardPage() {
  const { user, isLoading, isAuthenticated, logout } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/auth/login');
    }
  }, [isLoading, isAuthenticated, router]);

  const handleLogout = async () => {
    await logout();
    router.push('/auth/login');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="loading loading-spinner loading-lg text-primary"></div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return null; // Will redirect to login
  }

  // Get display name for user
  const getDisplayName = () => {
    if (user.first_name && user.last_name) {
      return `${user.first_name} ${user.last_name}`;
    } else if (user.first_name) {
      return user.first_name;
    } else {
      return user.email.split('@')[0];
    }
  };

  const getInitials = () => {
    if (user.first_name) {
      return user.first_name[0].toUpperCase();
    } else {
      return user.email[0].toUpperCase();
    }
  };

  return (
    <div className="min-h-screen bg-base-200">
      {/* Navbar */}
      <div className="navbar bg-base-100 shadow-lg">
        <div className="navbar-start">
          <h1 className="text-xl font-bold text-primary">Vendorly Dashboard</h1>
        </div>
        <div className="navbar-end">
          <div className="dropdown dropdown-end">
            <div tabIndex={0} role="button" className="btn btn-ghost btn-circle avatar">
              <div className="w-10 rounded-full bg-primary text-primary-content flex items-center justify-center">
                {getInitials()}
              </div>
            </div>
            <ul tabIndex={0} className="menu menu-sm dropdown-content mt-3 z-[1] p-2 shadow bg-base-100 rounded-box w-52">
              <li>
                <a className="justify-between">
                  Profile
                  <span className="badge">New</span>
                </a>
              </li>
              <li><a>Settings</a></li>
              <li><button onClick={handleLogout}>Logout</button></li>
            </ul>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="hero bg-gradient-to-r from-primary to-secondary text-primary-content rounded-lg mb-8">
          <div className="hero-content text-center">
            <div className="max-w-md">
              <h1 className="mb-5 text-5xl font-bold">
                Welcome, {getDisplayName()}!
              </h1>
              <p className="mb-5">
                You have successfully logged into your Vendorly dashboard. 
                Your email verification status: {user.is_email_verified ? '✅ Verified' : '❌ Not Verified'}
              </p>
              {!user.is_email_verified && (
                <button className="btn btn-accent">
                  Verify Email
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="stats shadow w-full mb-8">
          <div className="stat">
            <div className="stat-figure text-primary">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="inline-block w-8 h-8 stroke-current">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path>
              </svg>
            </div>
            <div className="stat-title">Total Likes</div>
            <div className="stat-value text-primary">25.6K</div>
            <div className="stat-desc">21% more than last month</div>
          </div>

          <div className="stat">
            <div className="stat-figure text-secondary">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="inline-block w-8 h-8 stroke-current">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
              </svg>
            </div>
            <div className="stat-title">Page Views</div>
            <div className="stat-value text-secondary">2.6M</div>
            <div className="stat-desc">21% more than last month</div>
          </div>

          <div className="stat">
            <div className="stat-figure text-secondary">
              <div className="avatar online">
                <div className="w-16 rounded-full">
                  <div className="w-16 h-16 bg-primary text-primary-content rounded-full flex items-center justify-center text-2xl font-bold">
                    {getInitials()}
                  </div>
                </div>
              </div>
            </div>
            <div className="stat-value">86%</div>
            <div className="stat-title">Tasks done</div>
            <div className="stat-desc text-secondary">31 tasks remaining</div>
          </div>
        </div>

        {/* User Info Card */}
        <div className="card bg-base-100 shadow-xl">
          <div className="card-body">
            <h2 className="card-title">User Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="label">
                  <span className="label-text font-medium">Email</span>
                </label>
                <div className="flex items-center gap-2">
                  <span>{user.email}</span>
                  {user.is_email_verified ? (
                    <div className="badge badge-success">Verified</div>
                  ) : (
                    <div className="badge badge-warning">Unverified</div>
                  )}
                </div>
              </div>
              <div>
                <label className="label">
                  <span className="label-text font-medium">Username</span>
                </label>
                <span className="text-sm text-base-content/70">{user.username} (auto-generated)</span>
              </div>
              <div>
                <label className="label">
                  <span className="label-text font-medium">First Name</span>
                </label>
                <span>{user.first_name || 'Not provided'}</span>
              </div>
              <div>
                <label className="label">
                  <span className="label-text font-medium">Last Name</span>
                </label>
                <span>{user.last_name || 'Not provided'}</span>
              </div>
              <div>
                <label className="label">
                  <span className="label-text font-medium">Member Since</span>
                </label>
                <span>{new Date(user.created_at).toLocaleDateString()}</span>
              </div>
            </div>
            <div className="card-actions justify-end mt-4">
              <button className="btn btn-primary">Edit Profile</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 