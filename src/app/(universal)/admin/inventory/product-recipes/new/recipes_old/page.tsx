"use server"

// app/admin/product-recipes/page.tsx


import FormView from "../../components/FormView";

 
import { fetchInventoryItems } from "@/app/(universal)/action/inventory/dbOperation";

import { fetchProductRecipes } from "@/app/(universal)/action/productRecipes/dbOperations";
import { fetchProductsStock } from "@/app/(universal)/action/products/fetchProductsStock";

export default async function Page() {
 
  const [
    products,
    inventoryItems,
    recipes,
  ] = await Promise.all([
    fetchProductsStock(),
    fetchInventoryItems(),
    fetchProductRecipes(),
  ]);

  

  return (
    <FormView
      products={products}
      inventoryItems={inventoryItems}
      recipes={recipes}
    />
  );
}