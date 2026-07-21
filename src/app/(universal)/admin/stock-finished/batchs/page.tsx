import ProductionBatchTable from "./ProductionBatchTable";
import { getProductionBatchesPagination } from "@/app/(universal)/action/production/batch/getProductionBatchesPagination";

type Props = {
  searchParams: Promise<{
    lastDocId?: string;
    firstDocId?: string;
    direction?: "next" | "prev";
    date?: string;
  }>;
};

export default async function Page({
  searchParams,
}: Props) {
  const params = await searchParams;

  const res =
    await getProductionBatchesPagination({
      lastDocId: params.lastDocId,
      firstDocId: params.firstDocId,
      direction: params.direction,
      date: params.date,
    });

  if (!res.success) {
    return <div>Error loading batches</div>;
  }

  console.log("batch data---------------------------", res.data)

  return (
    <div className="p-6">
      <ProductionBatchTable
  batches={res.data}
  hasNext={res.hasNext}
  hasPrev={res.hasPrev}
  firstDocId={res.firstDocId}
  lastDocId={res.lastDocId}
  selectedDate={params.date ?? ""}
/>
    </div>
  );
}