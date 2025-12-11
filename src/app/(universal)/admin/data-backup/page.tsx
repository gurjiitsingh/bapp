'use client';

import DownloadCategoryCSV from './conmponets/DownloadCategoryCSV';
import DownloadProductCSV from './conmponets/DownloadProductCSV';
import UploadCategoryCSV from './conmponets/UploadCategoryCSV';
import UploadProductCSV from './conmponets/UploadProductFromCSV';

export default function DataBackupPage() {
  return (
    <div className="p-6 space-y-10">
      <h1 className="text-2xl font-bold text-gray-800">📦 Data Backup & Restore</h1>

      {/* Download Section */}
      <section className="bg-white shadow-md rounded-lg p-6">
        <h2 className="text-xl font-semibold text-gray-700 mb-4">⬇️ Download</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="space-y-3">
            <h3 className="text-md font-medium text-gray-600">Products</h3>
            <DownloadProductCSV />
          </div>
          <div className="space-y-3">
            <h3 className="text-md font-medium text-gray-600">Categories</h3>
            <DownloadCategoryCSV />
          </div>
        </div>
      </section>

      {/* Upload Section */}
      <section className="bg-white shadow-md rounded-lg p-6">
        <h2 className="text-xl font-semibold text-gray-700 mb-4">⬆️ Upload</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="space-y-3">
            <h3 className="text-md font-medium text-gray-600">Products</h3>
            <UploadProductCSV />
          </div>
          <div className="space-y-3">
            <h3 className="text-md font-medium text-gray-600">Categories</h3>
            <UploadCategoryCSV />
          </div>
        </div>
      </section>
    </div>
  );
}
