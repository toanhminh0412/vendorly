'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { FontAwesomeIcon } from '@/lib/fontawesome';

export default function HomePage() {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.push('/dashboard');
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <FontAwesomeIcon icon="spinner" className="text-4xl text-primary animate-spin" />
      </div>
    );
  }

  if (isAuthenticated) {
    return null; // Will redirect to dashboard
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 to-secondary/10">
      {/* Hero Section */}
      <div className="hero min-h-screen">
        <div className="hero-content text-center">
          <div className="max-w-md">
            <h1 className="mb-5 text-5xl font-bold text-primary">
              Welcome to Vendorly
            </h1>
            <p className="mb-5 text-lg text-base-content/80">
              Your ultimate platform for vendor management and business growth. 
              Join thousands of vendors who trust Vendorly to manage their business operations.
            </p>
            <div className="space-y-4">
              <Link href="/auth/register" className="btn btn-primary btn-lg w-full">
                Get Started - It's Free
              </Link>
              <Link href="/auth/login" className="btn btn-outline btn-lg w-full">
                Sign In to Your Account
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-16 bg-base-100">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Why Choose Vendorly?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="card bg-base-100 shadow-xl">
              <div className="card-body text-center">
                <div className="text-primary mb-4">
                  <FontAwesomeIcon icon="code-branch" className="text-5xl mx-auto" />
                </div>
                <h3 className="card-title justify-center">Open Source</h3>
                <p>The software is open source and free to use.</p>
              </div>
            </div>

            <div className="card bg-base-100 shadow-xl">
              <div className="card-body text-center">
                <div className="text-primary mb-4">
                  <FontAwesomeIcon icon="sliders" className="text-5xl mx-auto" />
                </div>
                <h3 className="card-title justify-center">Customizable</h3>
                <p>Customize the software however you want.</p>
              </div>
            </div>

            <div className="card bg-base-100 shadow-xl">
              <div className="card-body text-center">
                <div className="text-primary mb-4">
                  <FontAwesomeIcon icon="hand-pointer" className="text-5xl mx-auto" />
                </div>
                <h3 className="card-title justify-center">Easy to Use</h3>
                <p>Intuitive interface designed for vendors of all technical skill levels.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-16 bg-primary text-primary-content">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Get Started?</h2>
          <p className="text-xl mb-8">Join Vendorly today and take your business to the next level.</p>
          <Link href="/auth/register" className="btn btn-accent btn-lg">
            <FontAwesomeIcon icon="rocket" className="mr-2" />
            Create Your Free Account
          </Link>
        </div>
      </div>
    </div>
  );
}
