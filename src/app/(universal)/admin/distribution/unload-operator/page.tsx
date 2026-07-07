import { getVehicles } from "@/app/(universal)/action/distribution/getVehicles";
import { getStockLocationsAll } from "@/app/(universal)/action/distribution/getStockLocationsAll";
import UnloadVehicleFormOperator from "./UnloadVehicleFormOperator";

export default async function Page() {
  const [vehicles, factoryStock] = await Promise.all([
    getVehicles(),
    getStockLocationsAll({
      locationType: "STORE",
      locationRef: "MAIN",
    }),
  ]);
// console.log("factoryStock----------------",factoryStock)
// console.log("vehicles----------------",vehicles)
  return (
    <UnloadVehicleFormOperator
      vehicles={vehicles}
      factoryStock={factoryStock}
    />
  );
}