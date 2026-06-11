// app/admin/product-recipes/page.tsx

import React from "react";

import FormView from "../../components/FormView";

import { fetchProducts } from "@/app/(universal)/action/products/dbOperation";

import { fetchInventoryItems } from "@/app/(universal)/action/inventory/dbOperation";

import { fetchProductRecipes } from "@/app/(universal)/action/productRecipes/dbOperations";

export default async function Page() {
  const [
    products,
    inventoryItems,
    recipes,
  ] = await Promise.all([
    fetchProducts(),
    fetchInventoryItems(),
    fetchProductRecipes(),
  ]);

  const filteredProducts = products.filter(
    (product) => product.type === "parent"
  );

  return (
    <FormView
      products={filteredProducts}
      inventoryItems={inventoryItems}
      recipes={recipes}
    />
  );
}