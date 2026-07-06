import { getVehicles } from "@/app/(universal)/action/distribution/getVehicles";
import { getStockLocationsAll } from "@/app/(universal)/action/distribution/getStockLocationsAll";
import LoadVehicleFormOperator from "./OperatorLoad";

export default async function Page() {
  const [vehicles, factoryStock] = await Promise.all([
    getVehicles(),
    getStockLocationsAll({
      locationType: "FACTORY",
      locationRef: "MAIN",
    }),
  ]);

  return (
    <LoadVehicleFormOperator
      vehicles={vehicles}
      factoryStock={factoryStock}
    />
  );
}