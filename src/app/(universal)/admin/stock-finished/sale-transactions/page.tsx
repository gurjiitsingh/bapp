
import { getSaleTransactions } from "@/app/(universal)/action/stock-finished/salteTransactions";
import InventoryTransactionTable from "./InventoryTransactionTable";
import Link from "next/link";
 

 

type Props = {
  searchParams: Promise<{
    page?: string;
  }>;
};

export default async function Page({
  searchParams,
}: Props) {
  const params = await searchParams;

  const currentPage = Math.max(
    1,
    Number(params.page || "1") || 1
  );

  const result = await getSaleTransactions({
    page: currentPage,
  });

  return (
    <div className="p-4 md:p-6">
      <div className="flex justify-between">
        <div>
      <h1 className="text-3xl font-bold">
        Product Sales
      </h1>

      <p className="text-sm text-muted-foreground">
        Sales history, production cost and profit/loss.
      </p></div>

      <Link href={"/admin/stock-finished/transactions"}>All Transactions</Link>
</div>
      <InventoryTransactionTable
        transactions={result.data}
        currentPage={currentPage}
        hasMore={result.hasMore}
      />
    </div>
  );
}
