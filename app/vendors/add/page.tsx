'use client'

import { useState, useTransition } from 'react';
import { createVendor } from '@/actions/vendor-actions';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function AddVendorPage() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string>('');

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');

    const formData = new FormData(event.currentTarget);
    const name = formData.get('name') as string;
    const joinedDate = formData.get('joinedDate') as string;

    if (!name || !joinedDate) {
      setError('Please fill in all fields');
      return;
    }

    startTransition(async () => {
      const result = await createVendor(name, joinedDate);
      
      if (result.success) {
        // Redirect back to the dashboard on success
        router.push('/'); 
      } else {
        setError(result.error || 'Something went wrong');
      }
    });
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
        <h1 className="text-2xl font-bold mb-6 text-gray-800">Add New Vendor</h1>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Vendor Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Vendor Name
            </label>
            <input 
              name="name"
              type="text" 
              placeholder="e.g. Mama Chinedu"
              className="w-full border rounded-md p-2 focus:ring-2 focus:ring-blue-500 outline-none"
              required 
            />
          </div>

          {/* Join Date - Controls the Black Boxes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Joined Date
            </label>
            <p className="text-xs text-gray-500 mb-2">
              (Dates before this will be blacked out in the grid)
            </p>
            <input 
              name="joinedDate"
              type="date" 
              defaultValue={new Date().toISOString().split('T')[0]} // Default to today
              className="w-full border rounded-md p-2 focus:ring-2 focus:ring-blue-500 outline-none"
              required 
            />
          </div>

          {/* Error Message */}
          {error && (
            <div className="text-red-500 text-sm bg-red-50 p-2 rounded">
              {error}
            </div>
          )}

          {/* Buttons */}
          <div className="flex gap-3 pt-4">
            <Link 
              href="/" 
              className="w-1/2 flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={isPending}
              className="w-1/2 flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isPending ? 'Saving...' : 'Add Vendor'}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}