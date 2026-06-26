


import { getfinishedStockTransactions } from "@/app/(universal)/action/stock-finished/finishedStockTransactions";
import InventoryTransactionTable from "../components/InventoryTransactionTable";

type Props = {
  searchParams: Promise<{
    page?: string;
  }>;
};

export default async function Page({
  searchParams,
}: Props) {

  const params =
    await searchParams;

  // ✅ convert properly
  const currentPage =
    Number(params.page || "1");

  const result =
    await getfinishedStockTransactions({
      page: currentPage,
    });

  return (
    <div className="p-4 md:p-6">

      {/* HEADER */}

     <h1 className="text-3xl font-bold">
  Product Transactions
</h1>

<p className="text-sm text-muted-foreground">
  Complete transaction history for finished products.
</p>

      {/* TABLE */}

      <InventoryTransactionTable
        transactions={result.data}
        currentPage={currentPage}
        hasMore={result.hasMore}
      />

    </div>
  );
}