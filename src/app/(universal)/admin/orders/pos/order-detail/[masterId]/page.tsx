import { fetchOrderProductsByOrderMasterId } from "@/app/(universal)/action/orders/items/fetchOrderProductsByOrderMasterId";
import React from "react";
import ProductList from "./ProductList";
import BackButton from "@/components/buttons/BackButton";

 

 

interface PageProps {
  params: Promise<{
    masterId: string;
  }>;
}

export default async function OrderDetailPage({
  params,
}: PageProps) {
  const { masterId } = await params;

  if (!masterId) {
    return (
      <div className="p-6">
        <div className="rounded-xl border border-red-200 bg-red-50 p-5">
          <h2 className="text-lg font-semibold text-red-700">
            Invalid Order
          </h2>

          <p className="mt-1 text-sm text-red-600">
            Order master ID is missing.
          </p>
        </div>
      </div>
    );
  }

  const result =
    await fetchOrderProductsByOrderMasterId(
      masterId
    );

  if (!result.success) {
    return (
      <div className="p-6">
        <div className="rounded-xl border border-red-200 bg-red-50 p-5">
          <h2 className="text-lg font-semibold text-red-700">
            Failed to load order
          </h2>

          <p className="mt-2 text-sm text-red-600">
            {result.error}
          </p>

          <div className="mt-3 rounded-lg bg-white p-3">
            <span className="text-xs font-semibold text-slate-500">
              Order ID
            </span>

            <div className="mt-1 break-all font-mono text-xs text-slate-700">
              {masterId}
            </div>
          </div>
        </div>
      </div>
    );
  }

  const products = result.products ?? [];
  console.log("product-------------------------",products)

  return (
    <main className="min-h-screen bg-slate-50 mt-2 mx-2">
      <div className="">
        
        {/* PAGE HEADER */}
        <div className="mb-5">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold tracking-tight text-slate-900">
                  POS Order
                </h1>

                <span className="rounded-full bg-indigo-50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-indigo-600">
                  POS
                </span>
              </div>

              <p className="mt-1 text-sm text-slate-500">
                Order products and pricing details
              </p>
            </div>

                    <div className="rounded-lg border border-slate-200 bg-white px-3 py-2 shadow-sm">
                         <div className="flex item-center gap-3">
                           <div className="mb-4">
                             <BackButton />
                           </div>
                           <div>
                             <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                               Order ID
                             </div>
           
                             <div className="mt-0.5 max-w-[280px] truncate font-mono text-xs font-medium text-slate-700">
                               {masterId}
                             </div>
                           </div>
                         </div>
                       </div>
          </div>
        </div>

        {/* PRODUCTS */}
        {products.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center shadow-sm">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100 text-xl">
              📦
            </div>

            <h2 className="mt-4 text-base font-semibold text-slate-800">
              No products found
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              No products are associated with this POS order.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
            
            {/* TABLE HEADER */}
            <div className="min-w-[850px] border-b border-slate-200 bg-slate-50 px-4 py-3">
              <div className="grid grid-cols-[minmax(280px,1fr)_70px_110px_120px_110px_130px] gap-4">
                
                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                  Product
                </div>

                <div className="text-right text-[10px] font-bold uppercase tracking-wider text-slate-500">
                  Qty
                </div>

                <div className="text-right text-[10px] font-bold uppercase tracking-wider text-slate-500">
                  Price
                </div>

                <div className="text-right text-[10px] font-bold uppercase tracking-wider text-slate-500">
                  Subtotal
                </div>

                <div className="text-right text-[10px] font-bold uppercase tracking-wider text-slate-500">
                  Tax
                </div>

                <div className="text-right text-[10px] font-bold uppercase tracking-wider text-slate-500">
                  Total
                </div>

              </div>
            </div>

            {/* PRODUCT ROWS */}
            <div>
              {products.map((item) => (
                <ProductList
                  key={item.id}
                  item={item}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}