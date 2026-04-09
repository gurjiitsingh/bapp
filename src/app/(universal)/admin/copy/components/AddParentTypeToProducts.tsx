'use client';

import { useState } from 'react';
import { collection, getDocs, doc, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebaseConfig';
import { ProductType } from "@/lib/types/productType";

export default function AddParentTypeToProducts() {
  const [status, setStatus] = useState<'idle' | 'updating' | 'done' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const updateProducts = async () => {
    try {
      setStatus('updating');
      setMessage('Fetching products...');

      const snapshot = await getDocs(collection(db, 'products'));
      const total = snapshot.size;

      setMessage(`Found ${total} products. Updating...`);

      let updatedCount = 0;

      for (const docSnap of snapshot.docs) {
        const data = docSnap.data() as ProductType;

        // ✅ Only update if missing (safer)
        if (!data.type) {
          const ref = doc(db, 'products', docSnap.id);

          await setDoc(
            ref,
            { type: 'parent' },
            { merge: true } // 🔥 IMPORTANT
          );

          updatedCount++;
        }
      }

      setStatus('done');
      setMessage(`✅ Updated ${updatedCount} products (added type='parent')`);

    } catch (err: any) {
      setStatus('error');
      setMessage('❌ Error: ' + err.message);
    }
  };

  return (
    <div className="p-6 max-w-xl mx-auto bg-white shadow rounded">
      <h2 className="text-xl font-bold mb-4">Add type='parent' to Products</h2>

      <p className="mb-4 text-gray-600">
        This will update all products and add <code>type = 'parent'</code> only if it does not already exist.
      </p>

      <button
        onClick={updateProducts}
        disabled={status === 'updating'}
        className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded disabled:opacity-50"
      >
        {status === 'updating' ? 'Updating...' : 'Run Script'}
      </button>

      {message && <p className="mt-4 text-sm">{message}</p>}
    </div>
  );
}