import { getInventoryTransactions } from "@/app/(universal)/action/inventory/getInventoryTransactions";
import InventoryTransactionTable from "../components/InventoryTransactionTable";



export default async function Page() {
  const result =
    await getInventoryTransactions();

  return (
    <div className="p-4 md:p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">
          Inventory Transactions
        </h1>

        <p className="text-sm text-muted-foreground">
          Complete inventory stock history
        </p>
      </div>

      <InventoryTransactionTable
        transactions={result.data}
      />
    </div>
  );
}