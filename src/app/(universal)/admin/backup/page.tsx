// app/backup/page.tsx

import { downloadProductsJSON, uploadProductsJSON } from "../../action/backup/serverActions";


export default function BackupPage() {
  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold">Product Backup & Restore</h1>


<a
  href="/api/backup/products/download"
  className="px-4 py-2 bg-black text-white rounded-lg inline-block"
>
  Download JSON
</a>

      {/* Export Section */}
      
      {/* Import Section */}
      <form action={uploadProductsJSON} className="space-y-3">
        <div className="border p-4 rounded-xl space-y-3">
          <h2 className="text-lg font-semibold">Restore Backup</h2>
          <p className="text-sm text-gray-500">
            Upload JSON file to restore products
          </p>

          <input
            type="file"
            name="file"
            accept="application/json"
            required
            className="block"
          />

          <button
            type="submit"
            className="px-4 py-2 bg-green-600 text-white rounded-lg"
          >
            Upload & Restore
          </button>
        </div>
      </form>
    </div>
  );
}
