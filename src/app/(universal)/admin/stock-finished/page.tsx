import { Suspense } from "react";

import ListView from "./components/ListView";

import Link from "next/link";

import { Plus, Package2, ArrowLeft } from "lucide-react"; 
 
 
import { fetchCategories } from "../../action/category/dbOperations";
import { fetchFinishedProducts } from "../../action/stock-finished/finshed-products/fetchFinishedProduct";


export default async function Page() {
  const products =
    await fetchFinishedProducts();

  const categories =
    await fetchCategories();

  return (
    <Suspense>
      <div className="min-h-screen bg-[#f8fafc]">
        {/* HEADER */}
        <div className="sticky top-0 z-10 bg-[#f8fafc]/90 backdrop-blur border-b border-gray-100">
          <div className="px-4 md:px-6 py-4">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="h-11 w-11 rounded-2xl bg-rose-100 flex items-center justify-center">
                  <Package2
                    size={22}
                    className="text-rose-600"
                  />
                </div>

                <div>
                  <h1 className="text-2xl font-bold text-gray-800">
                    Prodcut Stock Management
                  </h1>

                  <p className="text-sm text-gray-500">
                    Manage finished items stock
                   </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                

                {/* <Link href="/admin/stock-finished/new">
                  <button className="btn-save-4 flex items-center gap-2">
                    <Plus size={18} />
                    Create Inventory
                  </button>
                </Link> */}
              </div>
            </div>
          </div>
        </div>

        {/* CONTENT */}
        <div className="p-4 md:p-6">
          <ListView
            products={products}
           

          />
        </div>
      </div>
    </Suspense>
  );
}


