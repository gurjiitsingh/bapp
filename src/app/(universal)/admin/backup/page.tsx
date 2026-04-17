// app/backup/page.tsx

import { uploadCategoriesJSON, uploadProductsJSON } from "../../action/backup/serverActions";

export default function BackupPage() {
  return (
    <div className="p-6 max-w-4xl mx-auto space-y-8">
      <h1 className="text-3xl font-bold">Backup & Restore</h1>

      {/* DOWNLOAD SECTION */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <a
          href="/api/backup/products/download"
          className="flex flex-col items-center justify-center border rounded-xl p-6 hover:shadow-md transition"
        >
          <span className="text-lg font-semibold">Download Products</span>
          <span className="text-sm text-gray-500">Export all products as JSON</span>
        </a>

        <a
          href="/api/backup/categories/download"
          className="flex flex-col items-center justify-center border rounded-xl p-6 hover:shadow-md transition"
        >
          <span className="text-lg font-semibold">Download Categories</span>
          <span className="text-sm text-gray-500">Export all categories as JSON</span>
        </a>
      </div>

      {/* RESTORE PRODUCTS */}
      <form action={uploadProductsJSON}>
        <div className="border rounded-xl p-6 space-y-4">
          <h2 className="text-xl font-semibold">Restore Products</h2>
          <p className="text-sm text-gray-500">
            Upload a JSON file to restore product data
          </p>

          <input
            type="file"
            name="file"
            accept="application/json"
            required
            className="block w-full border rounded-md p-2"
          />

          <button
            type="submit"
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
          >
            Upload & Restore Products
          </button>
        </div>
      </form>

      {/* RESTORE CATEGORIES */}
      <form action={uploadCategoriesJSON}>
        <div className="border rounded-xl p-6 space-y-4">
          <h2 className="text-xl font-semibold">Restore Categories</h2>
          <p className="text-sm text-gray-500">
            Upload a JSON file to restore category data
          </p>

          <input
            type="file"
            name="file"
            accept="application/json"
            required
            className="block w-full border rounded-md p-2"
          />

          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            Upload Categories
          </button>
        </div>
      </form>

      {/* WARNING */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 text-sm text-yellow-800">
        ⚠️ Uploading backup files may overwrite existing data. Make sure to keep a backup before restoring.
      </div>
    </div>
  );
}