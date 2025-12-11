
'use client';

import { useState } from 'react';
import { collection, getDocs, doc, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebaseConfig';
import { ProductType } from "@/lib/types/productType";

export default function CopyProductsWithStatus() {
  const [status, setStatus] = useState<'idle' | 'copying' | 'done' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const copyProducts = async () => {
    try {
      setStatus('copying');
      setMessage('Fetching original products...');

      const result = await getDocs(collection(db, 'product'));
      const copiedCount = result.size;

      setMessage(`Found ${copiedCount} products. Copying...`);

      for (const docSnap of result.docs) {
        const oldData = docSnap.data() as Omit<ProductType, 'id'>;
        const docId = docSnap.id;

        const newProduct: Omit<ProductType, 'id'> = {
          ...oldData,
          status: 'published', // override/add
        };

        const newDocRef = doc(db, 'products', docId);
        await setDoc(newDocRef, newProduct);
      }

      setStatus('done');
      setMessage(`✅ Successfully copied ${copiedCount} products to "products" collection with status: 'published'.`);
    } catch (err: any) {
      setStatus('error');
      setMessage('❌ Error copying products: ' + err.message);
    }
  };

  return (
    <div className="p-6 max-w-xl mx-auto bg-white shadow rounded">
      <h2 className="text-xl font-bold mb-4">Copy Products to "products"</h2>
      <p className="mb-4 text-gray-600">
        This will copy all documents from <code>product</code> to <code>products</code> and keep the same <strong>document ID</strong>, while setting <code>status</code> to <code>'published'</code>.
      </p>
      <button
        onClick={copyProducts}
        disabled={status === 'copying'}
        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded disabled:opacity-50"
      >
        {status === 'copying' ? 'Copying...' : 'Start Copying'}
      </button>
      {message && <p className="mt-4 text-sm">{message}</p>}
    </div>
  );
}
