import { Suspense } from "react";

import ListView from "./components/ListView";

import Link from "next/link";

import { Plus, Package2, ArrowLeft } from "lucide-react";
import { fetchInventoryItems } from "../../action/inventory/dbOperation";



export default async function Page() {
  const inventoryItems =
    await fetchInventoryItems();

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
                    Inventory Management
                  </h1>

                  <p className="text-sm text-gray-500">
                    Manage stock items and raw materials
                  </p>
                </div>
              </div>

             <div className="flex items-center gap-3">
              <Link href="/admin/inventory">
    <button className="h-11 w-fit px-2 rounded-xl border border-gray-200 bg-white flex items-center justify-center hover:bg-gray-50 transition">
      <ArrowLeft size={18} />
      Inventory View
    </button>
  </Link>
  <Link href="/admin/inventory/dashboard">
    <button className="h-11 w-fit px-2 rounded-xl border border-gray-200 bg-white flex items-center justify-center hover:bg-gray-50 transition">
      <ArrowLeft size={18} />
      Inventory Dashboard
    </button>
  </Link>

  <Link href="/admin/inventory/new">
    <button className="btn-save-4 flex items-center gap-2">
      <Plus size={18} />
      Create Inventory
    </button>
  </Link>
</div>
            </div>
          </div>
        </div>

        {/* CONTENT */}
        <div className="p-4 md:p-6">
          <ListView
            inventoryItems={inventoryItems}
          />
        </div>
      </div>
    </Suspense>
  );
}





// "use client";

// import { Suspense } from "react";



// import Link from "next/link";

// import { Plus, Package2 } from "lucide-react";
// import ListView from "./components/ListView";

// export default function Page() {
//   return (
//     <Suspense>
//       <div className="min-h-screen bg-[#f8fafc]">
//         {/* TOP HEADER */}
//         <div className="sticky top-0 z-10 bg-[#f8fafc]/90 backdrop-blur border-b border-gray-100">
//           <div className="px-4 md:px-6 py-4">
//             <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
//               {/* LEFT */}
//               <div>
//                 <div className="flex items-center gap-3">
//                   <div className="h-11 w-11 rounded-2xl bg-rose-100 flex items-center justify-center">
//                     <Package2
//                       size={22}
//                       className="text-rose-600"
//                     />
//                   </div>

//                   <div>
//                     <h1 className="text-2xl font-bold text-gray-800 tracking-tight">
//                       Inventory Management
//                     </h1>

//                     <p className="text-sm text-gray-500 mt-1">
//                       Manage stock items, raw materials
//                       and inventory
//                     </p>
//                   </div>
//                 </div>
//               </div>

//               {/* RIGHT */}
//               <div className="flex items-center gap-3">
//                 <Link href="/admin/inventory/form">
//                   <button className="btn-save-4 flex items-center gap-2">
//                     <Plus size={18} />

//                     <span>Create Inventory</span>
//                   </button>
//                 </Link>
//               </div>
//             </div>
//           </div>
//         </div>

//         {/* CONTENT */}
//         <div className="p-4 md:p-6">
//           <ListView />
//         </div>
//       </div>
//     </Suspense>
//   );
// }

