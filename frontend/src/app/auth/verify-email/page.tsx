'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { authAPI } from '@/lib/api';
import { FontAwesomeIcon } from '@/lib/fontawesome';

export default function VerifyEmailPage() {
  const [status, setStatus] = useState<'loading' | 'success' | 'error' | 'expired'>('loading');
  const [message, setMessage] = useState('');
  const [email, setEmail] = useState('');
  const [isResending, setIsResending] = useState(false);

  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const token = searchParams.get('token');
    
    if (!token) {
      setStatus('error');
      setMessage('Invalid verification link. No token provided.');
      return;
    }

    const verifyEmail = async () => {
      try {
        await authAPI.verifyEmail(token);
        setStatus('success');
        setMessage('Your email has been successfully verified!');
      } catch (error: any) {
        if (error.response?.data?.error?.includes('expired')) {
          setStatus('expired');
          setMessage('Your verification link has expired.');
        } else {
          setStatus('error');
          setMessage(error.response?.data?.error || 'Verification failed. Please try again.');
        }
      }
    };

    verifyEmail();
  }, [searchParams]);

  const handleResendVerification = async () => {
    if (!email) {
      alert('Please enter your email address');
      return;
    }

    setIsResending(true);
    try {
      await authAPI.resendVerification(email);
      alert('Verification email sent successfully! Please check your inbox.');
    } catch (error: any) {
      alert(error.response?.data?.error || 'Failed to resend verification email');
    } finally {
      setIsResending(false);
    }
  };

  const renderContent = () => {
    switch (status) {
      case 'loading':
        return (
          <div className="text-center">
            <FontAwesomeIcon icon="spinner" className="text-4xl text-primary animate-spin mb-4" />
            <h2 className="text-2xl font-bold mb-4">Verifying Your Email</h2>
            <p className="text-base-content/70">Please wait while we verify your email address...</p>
          </div>
        );

      case 'success':
        return (
          <div className="text-center">
            <div className="text-success mb-4">
              <FontAwesomeIcon icon="check-circle" className="text-6xl mx-auto" />
            </div>
            <h2 className="text-2xl font-bold text-success mb-4">Email Verified!</h2>
            <p className="text-base-content/70 mb-6">{message}</p>
            <Link href="/auth/login" className="btn btn-primary">
              Continue to Login
            </Link>
          </div>
        );

      case 'expired':
        return (
          <div className="text-center">
            <div className="text-warning mb-4">
              <FontAwesomeIcon icon="exclamation-circle" className="text-6xl mx-auto" />
            </div>
            <h2 className="text-2xl font-bold text-warning mb-4">Link Expired</h2>
            <p className="text-base-content/70 mb-6">{message}</p>
            
            <div className="space-y-4">
              <div className="form-control">
                <input
                  type="email"
                  placeholder="Enter your email to resend verification"
                  className="input input-bordered w-full"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <button
                onClick={handleResendVerification}
                className={`btn btn-primary w-full ${isResending ? 'loading' : ''}`}
                disabled={isResending}
              >
                {isResending ? (
                  <>
                    <FontAwesomeIcon icon="spinner" className="animate-spin mr-2" />
                    Sending...
                  </>
                ) : (
                  'Resend Verification Email'
                )}
              </button>
              <Link href="/auth/login" className="btn btn-ghost w-full">
                Back to Login
              </Link>
            </div>
          </div>
        );

      case 'error':
        return (
          <div className="text-center">
            <div className="text-error mb-4">
              <FontAwesomeIcon icon="times-circle" className="text-6xl mx-auto" />
            </div>
            <h2 className="text-2xl font-bold text-error mb-4">Verification Failed</h2>
            <p className="text-base-content/70 mb-6">{message}</p>
            
            <div className="space-y-4">
              <div className="form-control">
                <input
                  type="email"
                  placeholder="Enter your email to resend verification"
                  className="input input-bordered w-full"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <button
                onClick={handleResendVerification}
                className={`btn btn-primary w-full ${isResending ? 'loading' : ''}`}
                disabled={isResending}
              >
                {isResending ? (
                  <>
                    <FontAwesomeIcon icon="spinner" className="animate-spin mr-2" />
                    Sending...
                  </>
                ) : (
                  'Resend Verification Email'
                )}
              </button>
              <Link href="/auth/register" className="btn btn-ghost w-full">
                Back to Registration
              </Link>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 to-secondary/10 p-4">
      <div className="card w-full max-w-md bg-base-100 shadow-xl">
        <div className="card-body">
          {renderContent()}
        </div>
      </div>
    </div>
  );
} 