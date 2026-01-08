'use client';

import { useState } from 'react';
import Papa from 'papaparse';
import { uploadCategoryFromCSV } from '@/app/(universal)/action/category/dbOperations';

export default function UploadCategoryCSV() {
  const [loading, setLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setSelectedFile(file || null);
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setLoading(true);

    Papa.parse(selectedFile, {
      header: true,
      skipEmptyLines: true,
      complete: async (result) => {
        try {
          const parsed = result.data as any[];
    
          await uploadCategoryFromCSV(parsed);
          alert('Categories uploaded successfully!');
        } catch (err) {
          console.error('Upload failed', err);
          alert('Upload failed');
        } finally {
          setLoading(false);
        }
      },
    });
  };

  return (
    <div className="space-y-2">
      <h2 className="text-md font-medium text-gray-700">Upload Category CSV</h2>

      <div className="flex items-center gap-3">
        <input
          type="file"
          accept=".csv"
          onChange={handleFileChange}
          disabled={loading}
          className="border border-gray-300 text-sm rounded px-3 py-2 w-full sm:w-auto"
        />
        <button
          onClick={handleUpload}
          disabled={loading || !selectedFile}
          className={`bg-green-600 hover:bg-green-700 text-white text-sm font-medium px-4 py-2 rounded ${
            loading || !selectedFile ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        >
          {loading ? 'Uploading...' : 'Upload'}
        </button>
      </div>
    </div>
  );
}
