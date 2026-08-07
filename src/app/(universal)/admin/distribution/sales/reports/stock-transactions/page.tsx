import { getSaleMovements } from "@/app/(universal)/action/distribution/sale/getSaleMovements";
import StockMovementReportTable from "./StockMovementReportTable";


export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{
    locationCode?: string;
    customerId?: string;
    movementType?: string;
    from?: string;
    to?: string;
  }>;
}) {
  const params = await searchParams;

  const rows = await getSaleMovements({
    locationCode: params.locationCode,
    customerId: params.customerId,
    movementType: params.movementType,
    from: params.from ? new Date(params.from) : undefined,
    to: params.to ? new Date(params.to) : undefined,
  });

  return (
  <StockMovementReportTable
    initialRows={rows}
  />
);
}