import { getVehicles } from "@/app/(universal)/action/distribution/getVehicles";
import { getStockLocationsAll } from "@/app/(universal)/action/distribution/getStockLocationsAll";
import LoadVehicleFormOeprator from "./OperatorLoad";

export const dynamic = "force-dynamic";

export default async function Page() {
  const [vehicles, factoryStock] = await Promise.all([
    getVehicles(),
    getStockLocationsAll({
      locationType: "STORE",
      locationRef: "MAIN",
    }),
  ]);
 
  return (
    <LoadVehicleFormOeprator
      vehicles={vehicles}
      factoryStock={factoryStock}
    />
  );
}