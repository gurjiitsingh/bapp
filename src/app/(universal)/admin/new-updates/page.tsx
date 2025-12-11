"use client";

export default function UpdateCategoriesPage() {
  const handleClick = async () => {
    await fetch("/api/admin/update-categories", { method: "POST" });
    alert("Update triggered!");
  };

  return (
    <button onClick={handleClick} className="bg-emerald-600 text-white px-4 py-2 rounded-lg">
      Add Categories name to products
    </button>
  );
}






// import { updateAllProductsWithCategoryName } from "@/app/(universal)/action/dbUpdates/dbOperation";

// export default async function Page() {
//   const result = await updateAllProductsWithCategoryName();
//   return (
//     <div className="p-8">
//       <h1 className="text-xl font-semibold mb-2">Update All Products</h1>
//       <p>{result.message}</p>
//     </div>
//   );
// }