'use client';

import { useState } from 'react';
import Link from 'next/link';
import { authAPI } from '@/lib/api';
import { FontAwesomeIcon } from '@/lib/fontawesome';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      await authAPI.forgotPassword(email);
      setSuccess(true);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to send reset email. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 to-secondary/10 p-4">
        <div className="card w-full max-w-md bg-base-100 shadow-xl">
          <div className="card-body text-center">
            <div className="text-success mb-4">
              <FontAwesomeIcon icon="envelope" className="text-6xl mx-auto" />
            </div>
            <h2 className="text-2xl font-bold text-success mb-4">Email Sent!</h2>
            <p className="text-base-content/70 mb-6">
              We've sent a password reset link to <strong>{email}</strong>. 
              Please check your inbox and follow the instructions to reset your password.
            </p>
            <div className="space-y-3">
              <Link href="/auth/login" className="btn btn-primary w-full">
                Back to Login
              </Link>
              <button 
                onClick={() => {
                  setSuccess(false);
                  setEmail('');
                }} 
                className="btn btn-ghost w-full"
              >
                Send Another Reset Email
              </button>
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
            <h1 className="text-3xl font-bold text-primary">Forgot Password?</h1>
            <p className="text-base-content/70 mt-2">
              No worries! Enter your email and we'll send you a reset link.
            </p>
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
            {/* Email Field */}
            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium">Email Address</span>
              </label>
              <input
                type="email"
                placeholder="Enter your email address"
                className="input input-bordered w-full"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <label className="label">
                <span className="label-text-alt text-base-content/60">
                  We'll send a password reset link to this email
                </span>
              </label>
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
                  Sending...
                </>
              ) : (
                'Send Reset Link'
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="divider">OR</div>

          {/* Back to Login */}
          <div className="text-center">
            <p className="text-base-content/70">
              Remember your password?{' '}
              <Link href="/auth/login" className="link link-primary font-medium">
                Back to Login
              </Link>
            </p>
          </div>

          {/* Additional Help */}
          <div className="mt-6 p-4 bg-base-200 rounded-lg">
            <h3 className="font-medium text-sm mb-2">Need help?</h3>
            <ul className="text-xs text-base-content/70 space-y-1">
              <li>• Check your spam/junk folder if you don't see the email</li>
              <li>• Make sure you entered the correct email address</li>
              <li>• The reset link will expire in 1 hour for security</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
} 