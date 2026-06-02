// app/admin/product-recipes/edit/recipes/page.tsx

import React from "react";

import FormView from "../../components/FormView";

import { fetchProducts } from "@/app/(universal)/action/products/dbOperation";

import { fetchInventoryItems } from "@/app/(universal)/action/inventory/dbOperation";

import { fetchProductRecipes } from "@/app/(universal)/action/productRecipes/dbOperations";
import FormViewEdit from "../../components/FormViewEdit";



export default async function Page({
  searchParams,
}: {
  searchParams: { productId?: string };
}) {
  const productId = searchParams?.productId || null;

  const [products, inventoryItems, recipes] =
    await Promise.all([
      fetchProducts(),
      fetchInventoryItems(),
      fetchProductRecipes(),
    ]);

  const filteredProducts = products.filter(
    (product) => product.type === "parent"
  );

  return (
    <FormViewEdit
      products={filteredProducts}
      inventoryItems={inventoryItems}
      recipes={recipes}
      initialProductId={productId}
    />
  );
}