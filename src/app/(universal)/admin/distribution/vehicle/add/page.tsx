
import { getStockLocationsAll } from "@/app/(universal)/action/distribution/getStockLocationsAll";
import LoadVehicleForm from "./VehicleForm";
import VehicleForm from "./VehicleForm";
import { fetchDrivers } from "@/app/(universal)/action/distribution/fetchDrivers";

export default async function Page() {

  

const drivers = await fetchDrivers();

  return (
    <VehicleForm
    drivers = {drivers}
    />
  );
}