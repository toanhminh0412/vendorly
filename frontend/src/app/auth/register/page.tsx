'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { FontAwesomeIcon } from '@/lib/fontawesome';

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    password_confirm: '',
    first_name: '',
    last_name: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<any>({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [success, setSuccess] = useState(false);

  const { register } = useAuth();
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    // Clear specific field error when user starts typing
    if (errors[e.target.name]) {
      setErrors({
        ...errors,
        [e.target.name]: undefined,
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrors({});

    try {
      await register(formData);
      setSuccess(true);
    } catch (err: any) {
      setErrors(err.response?.data || { non_field_errors: ['Registration failed. Please try again.'] });
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
              <FontAwesomeIcon icon="check-circle" className="text-6xl mx-auto" />
            </div>
            <h2 className="text-2xl font-bold text-success mb-4">Registration Successful!</h2>
            <p className="text-base-content/70 mb-6">
              We've sent a verification email to <strong>{formData.email}</strong>. 
              Please check your inbox and click the verification link to activate your account.
            </p>
            <div className="space-y-3">
              <Link href="/auth/login" className="btn btn-primary w-full">
                Go to Login
              </Link>
              <button 
                onClick={() => setSuccess(false)} 
                className="btn btn-ghost w-full"
              >
                Register Another Account
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
            <h1 className="text-3xl font-bold text-primary">Create Account</h1>
            <p className="text-base-content/70 mt-2">Join Vendorly today</p>
          </div>

          {/* General Error Alert */}
          {errors.non_field_errors && (
            <div className="alert alert-error mb-4">
              <FontAwesomeIcon icon="times-circle" className="text-xl" />
              <span>{errors.non_field_errors[0]}</span>
            </div>
          )}

          {/* Registration Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name Fields */}
            <div className="grid grid-cols-2 gap-3">
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-medium">First Name</span>
                </label>
                <input
                  type="text"
                  name="first_name"
                  placeholder="First name"
                  className={`input input-bordered w-full ${errors.first_name ? 'input-error' : ''}`}
                  value={formData.first_name}
                  onChange={handleChange}
                />
                {errors.first_name && (
                  <label className="label">
                    <span className="label-text-alt text-error">{errors.first_name[0]}</span>
                  </label>
                )}
              </div>
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-medium">Last Name</span>
                </label>
                <input
                  type="text"
                  name="last_name"
                  placeholder="Last name"
                  className={`input input-bordered w-full ${errors.last_name ? 'input-error' : ''}`}
                  value={formData.last_name}
                  onChange={handleChange}
                />
                {errors.last_name && (
                  <label className="label">
                    <span className="label-text-alt text-error">{errors.last_name[0]}</span>
                  </label>
                )}
              </div>
            </div>

            {/* Email Field */}
            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium">Email *</span>
              </label>
              <input
                type="email"
                name="email"
                placeholder="Enter your email"
                className={`input input-bordered w-full ${errors.email ? 'input-error' : ''}`}
                value={formData.email}
                onChange={handleChange}
                required
              />
              {errors.email && (
                <label className="label">
                  <span className="label-text-alt text-error">{errors.email[0]}</span>
                </label>
              )}
            </div>

            {/* Password Field */}
            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium">Password *</span>
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  placeholder="Create a password"
                  className={`input input-bordered w-full pr-12 ${errors.password ? 'input-error' : ''}`}
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
              {errors.password && (
                <label className="label">
                  <span className="label-text-alt text-error">{errors.password[0]}</span>
                </label>
              )}
            </div>

            {/* Confirm Password Field */}
            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium">Confirm Password *</span>
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  name="password_confirm"
                  placeholder="Confirm your password"
                  className={`input input-bordered w-full pr-12 ${errors.password_confirm ? 'input-error' : ''}`}
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
              {errors.password_confirm && (
                <label className="label">
                  <span className="label-text-alt text-error">{errors.password_confirm[0]}</span>
                </label>
              )}
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
                  Creating Account...
                </>
              ) : (
                'Create Account'
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="divider">OR</div>

          {/* Login Link */}
          <div className="text-center">
            <p className="text-base-content/70">
              Already have an account?{' '}
              <Link href="/auth/login" className="link link-primary font-medium">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
} 