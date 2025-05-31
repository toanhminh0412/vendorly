'use client';

import { useAuth } from '@/contexts/AuthContext';
import { FontAwesomeIcon } from '@/lib/fontawesome';

export default function DashboardPage() {
  const { user } = useAuth();

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <FontAwesomeIcon icon="spinner" className="text-4xl text-primary animate-spin mb-4" />
          <p className="text-base-content/70">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-base-200">
      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-base-content">
            Welcome back, {user.first_name || user.email}!
          </h1>
          <p className="text-base-content/70 mt-2">
            Here&apos;s your dashboard overview
          </p>
        </div>

        {/* Dashboard Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Profile Card */}
          <div className="card bg-base-100 shadow-xl">
            <div className="card-body">
              <h2 className="card-title">
                <FontAwesomeIcon icon="user" className="text-primary" />
                Profile
              </h2>
              <p>Manage your account settings and personal information</p>
              <div className="card-actions justify-end">
                <button className="btn btn-primary btn-sm">View Profile</button>
              </div>
            </div>
          </div>

          {/* Orders Card */}
          <div className="card bg-base-100 shadow-xl">
            <div className="card-body">
              <h2 className="card-title">
                <FontAwesomeIcon icon="shopping-bag" className="text-success" />
                Orders
              </h2>
              <p>Track your orders and purchase history</p>
              <div className="card-actions justify-end">
                <button className="btn btn-success btn-sm">View Orders</button>
              </div>
            </div>
          </div>

          {/* Shop Card */}
          <div className="card bg-base-100 shadow-xl">
            <div className="card-body">
              <h2 className="card-title">
                <FontAwesomeIcon icon="store" className="text-warning" />
                My Shop
              </h2>
              <p>Manage your shop and products</p>
              <div className="card-actions justify-end">
                <button className="btn btn-warning btn-sm">Manage Shop</button>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="mt-8">
          <h2 className="text-2xl font-bold mb-4">Recent Activity</h2>
          <div className="card bg-base-100 shadow-xl">
            <div className="card-body">
              <div className="text-center py-8">
                <FontAwesomeIcon icon="clock" className="text-4xl text-base-content/30 mb-4" />
                <p className="text-base-content/70">No recent activity to show</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 