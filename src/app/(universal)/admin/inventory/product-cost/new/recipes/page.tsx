// app/admin/product-recipes/page.tsx

import FormView from "./FormView";

import { fetchInventoryItems } from "@/app/(universal)/action/inventory/dbOperation";

import { fetchProductRecipes } from "@/app/(universal)/action/productRecipes/dbOperations";

 

import { fetchProductsStock } from "@/app/(universal)/action/products/fetchProductsStock";

import { getExpenseMasterAll } from "@/app/(universal)/action/otherExpenses/getExpenseMasterAll";
import { fetchProductExpense } from "@/app/(universal)/action/otherExpenses/fetchProductExpenseRecipes";
 

export default async function Page() {
  const [
    products,
    inventoryItems,
    recipes,
    expenseResult,
    productExpenseRecipes,
  ] = await Promise.all([
    fetchProductsStock(),
    fetchInventoryItems(),
    fetchProductRecipes(),
    getExpenseMasterAll(),
    fetchProductExpense(),
  ]);

  const expenseMaster = expenseResult.success
    ? expenseResult.data
    : [];

  return (
    <FormView
      products={products}
      inventoryItems={inventoryItems}
      recipes={recipes}
      expenseMaster={expenseMaster}
      productExpenseRecipes={productExpenseRecipes}
    />
  );
}