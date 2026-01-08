'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

const coupons = [
  { code: 'GOAD05', discount: 5, min: 20 },
  { code: 'GOAD10', discount: 10, min: 40 },
  { code: 'GOAD15', discount: 15, min: 60 },
];

export default function GoogleAddEnglishPage() {
  const router = useRouter();

  useEffect(() => {
    const bestCoupon = coupons[coupons.length - 1];
    localStorage.setItem('autoCoupon', JSON.stringify(bestCoupon));
  }, []);

  const handleShop = () => {
    router.push('/');
  };

  const handleBack = () => {
    router.push('/googleaddlanding');
  };

  return (
    <div className="relative container mx-auto py-5 p-1">
      <div className="min-h-[80vh] flex flex-col items-center justify-center bg-gradient-to-br from-green-50 to-yellow-100 px-4 text-center rounded-xl shadow-sm">
        <h1 className="text-4xl font-extrabold text-green-800 mb-3 drop-shadow">
          🎉 Welcome to Masala!
        </h1>
        <p className="text-lg text-gray-700 mb-8 max-w-xl">
          As a Google visitor, you get exclusive discounts up to <span className="text-green-700 font-semibold">15€</span> on your order!
        </p>

        <div className="flex flex-col md:flex-row gap-6 mb-12 w-full max-w-5xl px-4">
          {coupons.map((c) => (
            <div
              key={c.code}
              className="flex-1 bg-white border-l-[10px] border-green-500 shadow-lg rounded-xl px-6 py-6 transform transition hover:scale-105"
            >
              <h2 className="text-2xl font-bold text-green-700 mb-2 tracking-wider">{c.code}</h2>
              <p className="text-gray-600 text-md mb-1">
                <strong>{c.discount}€</strong> OFF
              </p>
              <p className="text-sm text-gray-500">
                Minimum Order: <strong>{c.min}€</strong>
              </p>
            </div>
          ))}
        </div>

        <div className="flex gap-4">
          <button
            onClick={handleShop}
            className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-2xl text-lg font-semibold shadow-md transition"
          >
            Start Shopping 🍛
          </button>
          <button
            onClick={handleBack}
            className="border border-green-700 text-green-700 px-6 py-3 rounded-2xl text-md font-medium shadow-sm hover:bg-green-100 transition"
          >
            Zurück zur deutschen Seite 🇩🇪
          </button>
        </div>
      </div>
    </div>
  );
}
