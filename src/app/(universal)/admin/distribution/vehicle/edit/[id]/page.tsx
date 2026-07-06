 
import { fetchDrivers } from "@/app/(universal)/action/distribution/fetchDrivers";

 
import { getStockLocationById } from "@/app/(universal)/action/distribution/getStockLocationsById";
import VehicleEditForm from "./VehicleForm";

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>; 
}) {
  
  const { id } = await params;
 
  const location = await getStockLocationById(id);

  const drivers = await fetchDrivers();

  return (
    <VehicleEditForm 
      location={location!}
      drivers={drivers}
    />
  );
}