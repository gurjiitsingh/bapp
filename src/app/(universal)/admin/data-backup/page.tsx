'use client';

import DownloadCategoryCSV from './components/DownloadCategoryCSV';
import DownloadProductCSV from './components/DownloadProductCSV';
import UploadCategoryCSV from './components/UploadCategoryCSV';
import UploadProductCSV from './components/UploadProductFromCSV';

import { uploadCategoriesJSON, uploadProductsJSON } from "../../action/backup/serverActions";

export default function DataBackupPage() {
  return (
    <div className="p-6 space-y-12 max-w-5xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-800">📦 Data Backup & Restore</h1>


        {/* ================= JSON SECTION ================= */}
      <section className="bg-white shadow-md rounded-xl p-6 space-y-6">
        <h2 className="text-2xl font-semibold text-gray-700">🧾 JSON Backup (Recommended)</h2>

        {/* Download JSON */}
        <div>
          <h3 className="text-lg font-medium text-gray-600 mb-3">⬇️ Download JSON</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <a
              href="/api/backup/products/download"
              className="border rounded-lg p-4 text-center hover:shadow transition"
            >
              <p className="font-medium">Products JSON</p>
              <p className="text-xs text-gray-500">Full structured backup</p>
            </a>

            <a
              href="/api/backup/categories/download"
              className="border rounded-lg p-4 text-center hover:shadow transition"
            >
              <p className="font-medium">Categories JSON</p>
              <p className="text-xs text-gray-500">Full structured backup</p>
            </a>
          </div>
        </div>

        {/* Upload JSON */}
        <div>
          <h3 className="text-lg font-medium text-gray-600 mb-3">⬆️ Upload JSON</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">

            {/* Product JSON Upload */}
            <form action={uploadProductsJSON} className="border rounded-lg p-4 space-y-3">
              <p className="font-medium">Products</p>
              <input
                type="file"
                name="file"
                accept="application/json"
                required
                className="block w-full border rounded-md p-2"
              />
              <button
                type="submit"
                className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
              >
                Upload Products
              </button>
            </form>

            {/* Category JSON Upload */}
            <form action={uploadCategoriesJSON} className="border rounded-lg p-4 space-y-3">
              <p className="font-medium">Categories</p>
              <input
                type="file"
                name="file"
                accept="application/json"
                required
                className="block w-full border rounded-md p-2"
              />
              <button
                type="submit"
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
              >
                Upload Categories
              </button>
            </form>

          </div>
        </div>
      </section>
       {/* WARNING */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 text-sm text-yellow-800">
        ⚠️ JSON is recommended for full backup & restore. Uploading files may overwrite existing data. Always keep a backup before restoring.
      </div>

      {/* ================= CSV SECTION ================= */}
      <section className="bg-white shadow-md rounded-xl p-6 space-y-6">
        <h2 className="text-2xl font-semibold text-gray-700">📄 CSV Backup</h2>

        {/* Download CSV */}
        <div>
          <h3 className="text-lg font-medium text-gray-600 mb-3">⬇️ Download CSV</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-2">
              <p className="text-sm text-gray-500">Products</p>
              <DownloadProductCSV />
            </div>
            <div className="space-y-2">
              <p className="text-sm text-gray-500">Categories</p>
              <DownloadCategoryCSV />
            </div>
          </div>
        </div>

        {/* Upload CSV */}
        <div>
          <h3 className="text-lg font-medium text-gray-600 mb-3">⬆️ Upload CSV</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-2">
              <p className="text-sm text-gray-500">Products</p>
              <UploadProductCSV />
            </div>
            <div className="space-y-2">
              <p className="text-sm text-gray-500">Categories</p>
              <UploadCategoryCSV />
            </div>
          </div>
        </div>
      </section>

    

     
    </div>
  );
}