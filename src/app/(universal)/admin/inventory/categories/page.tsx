import Link from "next/link";

import {
  Plus,
  ArrowLeft,
  Tags,
} from "lucide-react";
import { fetchInventoryCategories } from "../../../action/inventoryCategory/fetchInventoryCategories";
import ListView from "./components/ListView";





export default async function Page() {
  const categories =
    await fetchInventoryCategories();

  return (
    <div className="min-h-screen bg-[#f8fafc]">
      {/* HEADER */}
      <div className="sticky top-0 z-10 bg-[#f8fafc]/90 backdrop-blur border-b border-gray-100">
        <div className="px-4 md:px-6 py-4">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="h-11 w-11 rounded-2xl bg-violet-100 flex items-center justify-center">
                <Tags
                  size={22}
                  className="text-violet-600"
                />
              </div>

              <div>
                <h1 className="text-2xl font-bold text-gray-800">
                  Inventory Categories
                </h1>

                <p className="text-sm text-gray-500">
                  Manage inventory item
                  categories
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Link
                href="/admin/inventory"
              >
                <button className="h-11 px-4 rounded-xl border border-gray-200 bg-white flex items-center gap-2 hover:bg-gray-50 transition">
                  <ArrowLeft
                    size={18}
                  />
                  Inventory
                </button>
              </Link>

              <Link
                href="/admin/inventory/categories/new"
              >
                <button className="btn-save-4 flex items-center gap-2">
                  <Plus
                    size={18}
                  />
                  Create Category
                </button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* CONTENT */}
      <div className="p-4 md:p-6">
        <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
          <ListView
            categories={
              categories
            }
          />
        </div>
      </div>
    </div>
  );
}