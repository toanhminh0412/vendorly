'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { authAPI } from '@/lib/api';
import { FontAwesomeIcon } from '@/lib/fontawesome';

export default function ResetPasswordPage() {
  const [formData, setFormData] = useState({
    password: '',
    password_confirm: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [token, setToken] = useState<string | null>(null);

  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const resetToken = searchParams.get('token');
    if (!resetToken) {
      setError('Invalid reset link. No token provided.');
      return;
    }
    setToken(resetToken);
  }, [searchParams]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setError(''); // Clear error when user starts typing
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!token) {
      setError('Invalid reset token');
      return;
    }

    if (formData.password !== formData.password_confirm) {
      setError("Passwords don't match");
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      await authAPI.resetPassword({
        token,
        password: formData.password,
        password_confirm: formData.password_confirm,
      });
      setSuccess(true);
    } catch (err: any) {
      console.log(err);
      setError(err.response?.data?.error || 'Failed to reset password. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!token && !error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 to-secondary/10 p-4">
        <div className="card w-full max-w-md bg-base-100 shadow-xl">
          <div className="card-body text-center">
            <FontAwesomeIcon icon="spinner" className="text-4xl text-primary animate-spin mb-4" />
            <h2 className="text-2xl font-bold mb-4">Loading...</h2>
            <p className="text-base-content/70">Please wait while we verify your reset link...</p>
          </div>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 to-secondary/10 p-4">
        <div className="card w-full max-w-md bg-base-100 shadow-xl">
          <div className="card-body text-center">
            <div className="text-success mb-4">
              <FontAwesomeIcon icon="check-circle" className="text-6xl mx-auto" />
            </div>
            <h2 className="text-2xl font-bold text-success mb-4">Password Reset Successful!</h2>
            <p className="text-base-content/70 mb-6">
              Your password has been successfully reset. You can now log in with your new password.
            </p>
            <Link href="/auth/login" className="btn btn-primary w-full">
              Continue to Login
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (error && !token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 to-secondary/10 p-4">
        <div className="card w-full max-w-md bg-base-100 shadow-xl">
          <div className="card-body text-center">
            <div className="text-error mb-4">
              <FontAwesomeIcon icon="times-circle" className="text-6xl mx-auto" />
            </div>
            <h2 className="text-2xl font-bold text-error mb-4">Invalid Reset Link</h2>
            <p className="text-base-content/70 mb-6">{error}</p>
            <div className="space-y-3">
              <Link href="/auth/forgot-password" className="btn btn-primary w-full">
                Request New Reset Link
              </Link>
              <Link href="/auth/login" className="btn btn-ghost w-full">
                Back to Login
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 to-secondary/10 p-4">
      <div className="card w-full max-w-md bg-base-100 shadow-xl">
        <div className="card-body">
          {/* Header */}
          <div className="text-center mb-6">
            <h1 className="text-3xl font-bold text-primary">Reset Password</h1>
            <p className="text-base-content/70 mt-2">Enter your new password below</p>
          </div>

          {/* Error Alert */}
          {error && (
            <div className="alert alert-error mb-4">
              <FontAwesomeIcon icon="times-circle" className="text-xl" />
              <span>{error}</span>
            </div>
          )}

          {/* Reset Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Password Field */}
            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium">New Password</span>
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  placeholder="Enter your new password"
                  className="input input-bordered w-full pr-12"
                  value={formData.password}
                  onChange={handleChange}
                  required
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  <FontAwesomeIcon 
                    icon={showPassword ? "eye-slash" : "eye"} 
                    className="text-base-content/50" 
                  />
                </button>
              </div>
            </div>

            {/* Confirm Password Field */}
            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium">Confirm New Password</span>
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  name="password_confirm"
                  placeholder="Confirm your new password"
                  className="input input-bordered w-full pr-12"
                  value={formData.password_confirm}
                  onChange={handleChange}
                  required
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  <FontAwesomeIcon 
                    icon={showConfirmPassword ? "eye-slash" : "eye"} 
                    className="text-base-content/50" 
                  />
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className={`btn btn-primary w-full ${isLoading ? 'loading' : ''}`}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <FontAwesomeIcon icon="spinner" className="animate-spin mr-2" />
                  Resetting Password...
                </>
              ) : (
                'Reset Password'
              )}
            </button>
          </form>

          {/* Password Requirements */}
          <div className="mt-6 p-4 bg-base-200 rounded-lg">
            <h3 className="font-medium text-sm mb-2">Password Requirements:</h3>
            <ul className="text-xs text-base-content/70 space-y-1">
              <li>• At least 8 characters long</li>
              <li>• Contains both letters and numbers</li>
              <li>• Not too similar to your personal information</li>
              <li>• Not a commonly used password</li>
            </ul>
          </div>

          {/* Back to Login */}
          <div className="text-center mt-4">
            <Link href="/auth/login" className="link link-primary text-sm">
              Back to Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
} 