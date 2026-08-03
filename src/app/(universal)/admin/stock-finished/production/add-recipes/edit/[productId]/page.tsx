"use server";
console.log("SERVER PAGE");
import { fetchInventoryItems } from "@/app/(universal)/action/inventory/dbOperation";
import { fetchProductRecipes } from "@/app/(universal)/action/productRecipes/dbOperations";
import { fetchProductsStock } from "@/app/(universal)/action/products/fetchProductsStock";
import FormViewEdit from "../../components/FormViewEdit";

export default async function Page({
  params,
}: {
  params: Promise<{ productId: string }>;
}) {
  const { productId } = await params;

  console.log("SERVER PAGE");
  console.log("productId:", productId);

  const [productStock, inventoryItems, recipes] =
    await Promise.all([
      fetchProductsStock(),
      fetchInventoryItems(),
      fetchProductRecipes(),
    ]);

  return (
    <FormViewEdit
      products={productStock}
      inventoryItems={inventoryItems}
      recipes={recipes}
      initialProductId={productId}
    />
  );
}