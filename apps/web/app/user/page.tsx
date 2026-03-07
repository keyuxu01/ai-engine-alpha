'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import type { User } from '@repo/schemas';
import { userApi } from './api';

export default function UserPage() {
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        const data = await userApi.getUserList();
        setUsers(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch users');
      } finally {
        setLoading(false);
      }
    };

    void fetchUsers();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl">Loading users...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl text-red-500">Error: {error}</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">User Management</h1>
        <button
          onClick={() => router.push('/user/create')}
          className="px-6 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          + Create User
        </button>
      </div>
      
      <div className="grid gap-4">
        {users.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No users found
          </div>
        ) : (
          users.map((user) => (
            <div
              key={user.id}
              className="border rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => router.push(`/user/${user.id}`)}
            >
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-xl font-semibold mb-2">{user.name}</h2>
                  <p className="text-gray-600 mb-1">Email: {user.email}</p>
                  <p className="text-gray-600 mb-1">Age: {user.age}</p>
                  <p className="text-gray-600 mb-1">
                    Role: <span className="capitalize">{user.role}</span>
                  </p>
                </div>
                <div className="text-sm text-gray-500">
                  ID: {user.id}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
