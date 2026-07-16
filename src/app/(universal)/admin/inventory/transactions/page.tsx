import { getInventoryTransactions } from "@/app/(universal)/action/inventory/getInventoryTransactions";

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
    await getInventoryTransactions({
      page: currentPage,
    });

    // console.log("result-------------", result)

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
        transactions={result.data}
        currentPage={currentPage}
        hasMore={result.hasMore}
      />

    </div>
  );
}