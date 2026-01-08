'use client';

import { useState } from 'react';
import { exportToCSV } from '@/lib/backups/exportToCSV';
import { fetchProducts } from '@/app/(universal)/action/products/dbOperation';

export default function DownloadProductCSV() {
  const [loading, setLoading] = useState(false);

  const handleDownload = async () => {
    setLoading(true);
    try {
      const products = await fetchProducts();

      const data = products.map((p) => ({
        id: p.id,
        name: p.name,
        price: p.price,
        stockQty: p.stockQty,                 // ⬅️ new
        discountPrice: p.discountPrice,
        categoryId: p.categoryId,
        productCat: p.productCat,
        baseProductId: p.baseProductId,
        productDesc: p.productDesc,
        sortOrder: p.sortOrder,
        image: p.image,
        isFeatured: p.isFeatured,
        purchaseSession: p.purchaseSession,
        quantity: p.quantity,
        flavors: p.flavors,
        publishStatus: p.publishStatus,

        // NEW FIELDS
        taxRate: p.taxRate,                  // ⬅️ new
        taxType: p.taxType,                  // ⬅️ new
      }));

      exportToCSV(data, 'products');
    } catch (error) {
      console.error('CSV export failed:', error);
    }
    setLoading(false);
  };

  return (
    <button
      onClick={handleDownload}
      disabled={loading}
      className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
    >
      {loading ? 'Downloading...' : 'Download Product CSV'}
    </button>
  );
}
