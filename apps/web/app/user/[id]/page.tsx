'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import type { User } from '@repo/schemas';
import { userApi } from '../api';

export default function UserDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const userId = params.id as string;

  useEffect(() => {
    const fetchUser = async () => {
      try {
        setLoading(true);
        const data = await userApi.getUser(userId);
        setUser(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch user');
      } finally {
        setLoading(false);
      }
    };

    void fetchUser();
  }, [userId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl">Loading user...</div>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <div className="text-xl text-red-500">Error: {error || 'User not found'}</div>
        <button
          onClick={() => router.push('/user')}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Back to Users
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <button
        onClick={() => router.push('/user')}
        className="mb-6 px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
      >
        ← Back to Users
      </button>

      <div className="border rounded-lg p-8 shadow-md max-w-2xl">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">User Details</h1>
          <button
            onClick={() => router.push(`/user/${userId}/edit`)}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Edit User
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-sm font-semibold text-gray-600">ID</label>
            <p className="text-lg">{user.id}</p>
          </div>

          <div>
            <label className="text-sm font-semibold text-gray-600">Name</label>
            <p className="text-lg">{user.name}</p>
          </div>

          <div>
            <label className="text-sm font-semibold text-gray-600">Email</label>
            <p className="text-lg">{user.email}</p>
          </div>

          <div>
            <label className="text-sm font-semibold text-gray-600">Age</label>
            <p className="text-lg">{user.age}</p>
          </div>

          <div>
            <label className="text-sm font-semibold text-gray-600">Role</label>
            <p className="text-lg capitalize">{user.role}</p>
          </div>

          <div>
            <label className="text-sm font-semibold text-gray-600">Created At</label>
            <p className="text-lg">{new Date(user.createdAt).toLocaleString()}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
