import { getInventoryTransactionsSelected } from "@/app/(universal)/action/inventory/getInventoryTransactionsSelected";

import InventoryTransactionTable from "../components/InventoryTransactionTable";

export default async function Page() {
  const result =
    await getInventoryTransactionsSelected();
    

  return (
    <div className="p-4 md:p-6">
      {/* HEADER */}

      <div className="mb-6">
        <h1 className="text-3xl font-bold">
          Inventory Transactions
        </h1>

        <p className="text-sm text-muted-foreground">
          Complete inventory stock history
        </p>
      </div>

      {/* TABLE */}

      <InventoryTransactionTable
        initialTransactions={result.data}
      />
    </div>
  );
}