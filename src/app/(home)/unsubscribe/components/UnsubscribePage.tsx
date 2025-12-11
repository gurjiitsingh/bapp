'use client';

import { unsbscribeUser } from '@/app/(universal)/action/user/dbOperation';
import { useSearchParams, useRouter } from 'next/navigation';
import { useState } from 'react';


export default function UnsubscribePage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const email = searchParams.get('email');

  const [unsubscribed, setUnsubscribed] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleUnsubscribe = async () => {
    if (!email) return;
    setLoading(true);
    const success = await unsbscribeUser(email);
    setUnsubscribed(success);
    setLoading(false);

    if (!success) {
      alert("There was an error. Please try again later.");
    }
  };

  const handleStay = () => {
    alert('Awesome! You’ll continue to receive exclusive offers. 🎉');
    router.push('/');
  };

  if (!email) {
    return (
        <div className="relative container mx-auto py-5 p-1">
      <div className="container mx-auto py-5 p-1">
        <div className="max-w-xl mx-auto mt-20 text-center">
          <h1 className="text-2xl font-bold mb-4">Invalid Link</h1>
          <p className="text-gray-600">No email address provided. Please use a valid unsubscribe link.</p>
        </div>
      </div>
      </div>
    );
  }

  if (unsubscribed) {
    return (
        <div className="relative container mx-auto py-5 p-1">
      <div className="container mx-auto py-5 p-1">
        <div className="max-w-xl mx-auto mt-20 text-center">
          <h1 className="text-2xl font-bold mb-4">You’ve been unsubscribed</h1>
          <p className="text-gray-600 mb-4">We’re sad to see you go. 😢</p>
          <p className="text-sm text-gray-500">
            If this was a mistake, contact us at{' '}
            <a href="mailto:info@masala-gf.de" className="underline">
              info@masala-gf.de
            </a>.
          </p>
        </div>
      </div>
      </div>
    );
  }

  return (
      <div className="relative container mx-auto py-5 p-1">
    <div className="container mx-auto py-5 p-1">
      <div className="max-w-xl mx-auto mt-20 p-6 text-center border rounded-lg shadow-sm bg-white">
        <h1 className="text-2xl font-bold mb-4 text-red-600">Wait! Before You Go...</h1>
        <p className="text-gray-700 mb-6">Are you sure you want to unsubscribe from Masala Taste Of India?</p>

        <div className="bg-yellow-100 p-4 rounded-md mb-6">
          <p className="text-yellow-800 font-semibold text-lg">🎁 Here’s a special offer just for you:</p>
          <p className="text-lg font-bold text-yellow-900 mt-2">STAY10</p>
          <p className="text-sm text-gray-600">
            Use this 10&euro; OFF code on your next order within 3 days.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={handleStay}
            className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700"
          >
            Stay Subscribed
          </button>
          <button
            onClick={handleUnsubscribe}
            disabled={loading}
            className="bg-gray-300 text-gray-800 px-6 py-2 rounded hover:bg-gray-400 disabled:opacity-50"
          >
            {loading ? 'Unsubscribing...' : 'Unsubscribe'}
          </button>
        </div>

        <p className="text-xs text-gray-400 mt-6">Email: {email}</p>
      </div>
    </div>
    </div>
  );
}
