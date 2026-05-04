"use client";

import { useState } from "react";
import { updateOutletLogo } from "@/app/(universal)/action/outlet/dbOperation";

export default function OutletLogoUpload({ outletId }: { outletId: string }) {
  const [loading, setLoading] = useState(false);

  async function handleUpload(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const formData = new FormData(e.currentTarget);
    formData.append("outletId", outletId);

    setLoading(true);

    const res = await updateOutletLogo(formData);

    setLoading(false);

    if (res?.success) {
      alert("Logo updated");
    } else {
      alert(JSON.stringify(res?.errors));
    }
  }

  if (!outletId) return null;

  return (
    <form onSubmit={handleUpload} className="space-y-3 border p-4 rounded-xl">
      <h2 className="font-semibold">Upload Logo</h2>

      <input type="file" name="image" accept="image/*" />

      <button
        type="submit"
        disabled={loading}
        className="bg-black text-white px-4 py-2 rounded"
      >
        {loading ? "Uploading..." : "Upload Logo"}
      </button>
    </form>
  );
}