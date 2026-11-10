import { getVehicles } from "@/app/(universal)/action/distribution/getVehicles";
import { getStockLocationsAll } from "@/app/(universal)/action/distribution/getStockLocationsAll";
 
import LoadVehicleFormOeprator from "./OperatorLoad";
import { getRoutes } from "../action/distribution/sale-route/getRoutes";

export const dynamic = "force-dynamic";

export default async function Page() {
  const [vehicles, factoryStock, routes] = await Promise.all([
    getVehicles(),

    getStockLocationsAll({
      locationType: "STORE",
      locationRef: "MAIN",
    }),

    getRoutes(),
  ]);

  return (
    <LoadVehicleFormOeprator
      vehicles={vehicles}
      factoryStock={factoryStock}
      routes={routes}
    />
  );
}