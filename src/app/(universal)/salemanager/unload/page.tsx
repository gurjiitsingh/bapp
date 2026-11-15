import { getVehicles } from "@/app/(universal)/action/distribution/getVehicles";
import { getStockLocationsAll } from "@/app/(universal)/action/distribution/getStockLocationsAll";
 
import LoadVehicleFormOeprator from "../OperatorLoad";
import { getRoutes } from "../../action/distribution/sale-route/getRoutes";
import UnloadVehicleFormOperator from "./UnloadVehicleFormOperator";

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
    <UnloadVehicleFormOperator
      vehicles={vehicles}
      factoryStock={factoryStock}
       routes={routes}
    />
  );
}