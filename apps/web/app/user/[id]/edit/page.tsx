'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import type { UpdateUser } from '@repo/schemas';
import { userApi } from '../../api';

export default function EditUserPage() {
  const params = useParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<UpdateUser>({
    id: '',
    name: '',
    email: '',
    age: 18,
    role: 'user',
  });

  const userId = params.id as string;

  useEffect(() => {
    const fetchUser = async () => {
      try {
        setLoading(true);
        const data = await userApi.getUser(userId);
        setFormData({
          id: data.id,
          name: data.name,
          email: data.email,
          age: data.age,
          role: data.role,
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch user');
      } finally {
        setLoading(false);
      }
    };

    void fetchUser();
  }, [userId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setSubmitting(true);
      setError(null);
      await userApi.updateUser(formData);
      router.push(`/user/${userId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update user');
    } finally {
      setSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'age' ? parseInt(value, 10) : value,
    }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl">Loading user...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <button
        onClick={() => router.push(`/user/${userId}`)}
        className="mb-6 px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
      >
        ← Back to User Details
      </button>

      <div className="border rounded-lg p-8 shadow-md max-w-2xl">
        <h1 className="text-3xl font-bold mb-6">Edit User</h1>

        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label
              htmlFor="id"
              className="block text-sm font-semibold text-gray-700 mb-2"
            >
              ID
            </label>
            <input
              type="text"
              id="id"
              name="id"
              value={formData.id}
              disabled
              className="w-full px-4 py-2 border border-gray-300 rounded bg-gray-100 cursor-not-allowed"
            />
          </div>

          <div>
            <label
              htmlFor="name"
              className="block text-sm font-semibold text-gray-700 mb-2"
            >
              Name *
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              minLength={1}
              maxLength={100}
              className="w-full px-4 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter name"
            />
          </div>

          <div>
            <label
              htmlFor="email"
              className="block text-sm font-semibold text-gray-700 mb-2"
            >
              Email *
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter email"
            />
          </div>

          <div>
            <label
              htmlFor="age"
              className="block text-sm font-semibold text-gray-700 mb-2"
            >
              Age *
            </label>
            <input
              type="number"
              id="age"
              name="age"
              value={formData.age}
              onChange={handleChange}
              required
              min={1}
              max={100}
              className="w-full px-4 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter age"
            />
          </div>

          <div>
            <label
              htmlFor="role"
              className="block text-sm font-semibold text-gray-700 mb-2"
            >
              Role *
            </label>
            <select
              id="role"
              name="role"
              value={formData.role}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="user">User</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          <div className="flex gap-4">
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 px-6 py-3 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {submitting ? 'Updating...' : 'Update User'}
            </button>
            <button
              type="button"
              onClick={() => router.push(`/user/${userId}`)}
              className="px-6 py-3 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
