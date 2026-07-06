
import { getStockLocationsAll } from "@/app/(universal)/action/distribution/getStockLocationsAll";
import LoadVehicleForm from "./LoadVehicleForm";
import { getVehicles } from "@/app/(universal)/action/distribution/getVehicles";

export default async function Page() {
  const stock = await getStockLocationsAll({
    locationType: "FACTORY",
    locationRef: "MAIN",
  });
  const vehicles = await getVehicles()

  return (
    <LoadVehicleForm
     factoryStock={stock}
     vehicles = { vehicles }
    />
  );
}