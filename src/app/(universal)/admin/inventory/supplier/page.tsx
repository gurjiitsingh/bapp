import Link from "next/link";

import { Button } from "@/components/ui/button";

import { adminDb } from "@/lib/firebaseAdmin";

import ListView from "./components/ListView";
import { fetchSuppliers } from "@/app/(universal)/action/inventorySupplier/fetchSuppliers";




export default async function Page() {
  const suppliers =
    await fetchSuppliers();

  return (
     <div className="min-h-screen bg-[#f8fafc]">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            Suppliers
          </h1>

          <p className="text-sm text-gray-500 mt-1">
            Manage inventory
            suppliers and
            vendor information
          </p>
        </div>

        <Link href="/admin/inventory/supplier/new">
          <Button className="btn-save-4">
          +  Add Supplier
          </Button>
        </Link>
      </div>

      {/* Content */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <ListView
          suppliers={
            suppliers
          }
        />
      </div>
    </div>
  );
}