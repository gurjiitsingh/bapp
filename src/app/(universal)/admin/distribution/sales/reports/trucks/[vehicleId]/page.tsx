
import { getTruckSaleReport } from '@/app/(universal)/action/distribution/getTruckSaleReport';
import TruckSaleReportTable from './TruckSaleReportTable';

type Props = {
  params: Promise<{ vehicleId: string }>;
};

export default async function Page({
  params,
}: Props) {
  const { vehicleId } = await params;

  // Load all sales for this vehicle/location
  const rows =
    await getTruckSaleReport({
      locationCode: vehicleId,
    });

  const vehicleName =
    rows[0]?.vehicleName || vehicleId;

  return (
    <TruckSaleReportTable
      vehicleId={vehicleId}
      vehicleName={vehicleName}
      initialRows={rows}
    />
  );
}