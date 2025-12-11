'use client';

import Link from 'next/link';

export default function ReservationSuccessPage() {
  return (
    <div className="relative container mx-auto py-5 p-1">
      <div className="min-h-screen flex flex-col items-center justify-center  px-6 text-center">
        <div className="p-8 max-w-xl w-full rounded-xl border border-[#6366F1] bg-transparent">
          <div className="text-5xl mb-4 text-[#6366F1]">✅</div>
          <h1 className="text-3xl font-bold text-[#6366F1] mb-2">
            Reservation Confirmed!
          </h1>
          <p className="text-gray-700 text-lg mb-4">
            Thank you for your reservation.
          </p>
          <Link
            href="/"
            className="inline-block mt-6 bg-[#6366F1] hover:bg-[#4F46E5] text-white font-semibold px-6 py-3 rounded-lg shadow transition"
          >
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
