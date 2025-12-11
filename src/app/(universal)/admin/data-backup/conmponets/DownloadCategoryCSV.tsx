'use client';

import { useState } from 'react';
import { exportToCSV } from '@/lib/backups/exportToCSV';
import { fetchCategories } from '@/app/(universal)/action/category/dbOperations';

export default function DownloadCategoryCSV() {
  const [loading, setLoading] = useState(false);

  const handleDownload = async () => {
    setLoading(true);
    try {
      const categories = await fetchCategories();

      const data = categories.map((cat) => ({
        id: cat.id,
        name: cat.name,
        desc: cat.desc,
        productDesc: cat.productDesc || '',
        slug: cat.slug || '',
        image: cat.image || '',
        isFeatured: cat.isFeatured ?? false,
        sortOrder: cat.sortOrder ?? 0,
        disablePickupDiscount: cat.disablePickupDiscount ?? false,

          // NEW FIELDS
        // taxRate: cat.taxRate,                  // ⬅️ new
        // taxType: cat.taxType,                  // ⬅️ new
      }));

      exportToCSV(data, 'categories');
    } catch (error) {
      console.error('CSV export failed:', error);
    }
    setLoading(false);
  };

  return (
    <button
      onClick={handleDownload}
      disabled={loading}
      className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
    >
      {loading ? 'Downloading...' : 'Download Category CSV'}
    </button>
  );
}
