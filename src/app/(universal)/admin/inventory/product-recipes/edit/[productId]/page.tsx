// app/admin/product-recipes/edit/recipes/page.tsx


import { fetchProducts } from "@/app/(universal)/action/products/dbOperation";

import { fetchInventoryItems } from "@/app/(universal)/action/inventory/dbOperation";

import { fetchProductRecipes } from "@/app/(universal)/action/productRecipes/dbOperations";
import FormViewEdit from "../../components/FormViewEdit";



export default async function Page({
  params,
}: {
  params: Promise<{ productId: string }>;
}) {
  const { productId } = await params;


  console.log("")

  if (!productId) {
  return (
    <div className="p-10 text-center text-gray-500">
      Invalid Product ID
    </div>
  );
}

  const [products, inventoryItems, recipes] =
    await Promise.all([
      fetchProducts(),
      fetchInventoryItems(),
      fetchProductRecipes(),
    ]);

//   const filteredProducts = products.filter(
//     (product) => product.type === "parent"
//   );

  return (
    <FormViewEdit
      products={ products}
      inventoryItems={inventoryItems}
      recipes={recipes}
      initialProductId={productId}
    />
  );
}