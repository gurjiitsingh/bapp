
import { fetchProductsStock } from "@/app/(universal)/action/products/fetchProductsStock";
import { getExpenseMasterAll } from "@/app/(universal)/action/otherExpenses/getExpenseMasterAll";

import FormView from "./FormView";

export const dynamic = "force-dynamic";

export default async function OtherExpensesPage() {

  const [products, expenseResult] = await Promise.all([
    fetchProductsStock(),
    getExpenseMasterAll(),
  ]);

  const expenseMaster = expenseResult.success
    ? expenseResult.data
    : [];

    console.log("expenseMaster------------------", expenseMaster)

  return (
    <FormView
      expenseMaster={expenseMaster}
      products={products}
    />
  );
}
