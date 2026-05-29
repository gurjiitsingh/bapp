// app/admin/product-recipes/page.tsx

import React from "react";



import { fetchProducts } from "@/app/(universal)/action/products/dbOperation";


import FormView from "../components/FormView";
import { fetchInventoryItems } from "@/app/(universal)/action/inventory/dbOperation";
// conversion/recipe name, qty, created modified by, Action(convert, edit, delete)
export default async function Page() {
  const [products, inventoryItems] =
    await Promise.all([
      fetchProducts(),
      fetchInventoryItems(),
    ]);

  // ONLY PARENT PRODUCTS
  const filteredProducts = products.filter(
    (product) => product.type === "parent"
  );

  return (
    <FormView
      products={filteredProducts}
      inventoryItems={inventoryItems}
    />
  );
}