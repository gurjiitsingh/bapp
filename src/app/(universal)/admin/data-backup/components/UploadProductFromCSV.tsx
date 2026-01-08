'use client';

import { useState } from 'react';
import Papa from 'papaparse';
import { uploadProductFromCSV } from '@/app/(universal)/action/products/dbOperation';


export default function UploadCategoryCSV() {
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    setSelectedFile(file || null);
    setMessage('');
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setUploading(true);
    setMessage('');

    Papa.parse(selectedFile, {
      header: true,
      skipEmptyLines: true,
      complete: async (result) => {
        try {
          const rows = result.data as any[];

          for (const row of rows) {
            await uploadProductFromCSV(row);
          }

          setMessage(` Uploaded ${rows.length} categories successfully.`);
        } catch (err) {
          console.error(err);
          setMessage('❌ Upload failed. Check console for details.');
        } finally {
          setUploading(false);
        }
      },
      error: (error) => {
        console.error(error);
        setMessage('❌ Error reading CSV file.');
        setUploading(false);
      },
    });
  };

  return (
    <div className="space-y-2">
      <h2 className="text-md font-medium text-gray-700">Upload Products CSV</h2>

      <div className="flex items-center gap-3">
        <input
          type="file"
          accept=".csv"
          onChange={handleFileChange}
          className="border border-gray-300 text-sm rounded px-3 py-2 w-full sm:w-auto"
        />
        <button
          onClick={handleUpload}
          disabled={uploading || !selectedFile}
          className={`bg-green-600 hover:bg-green-700 text-white text-sm font-medium px-4 py-2 rounded ${
            uploading || !selectedFile ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        >
          {uploading ? 'Uploading...' : 'Upload'}
        </button>
      </div>

      {message && <p className="text-sm">{message}</p>}
    </div>
  );
}
