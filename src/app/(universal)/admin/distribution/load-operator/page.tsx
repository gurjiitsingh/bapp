import { getVehicles } from "@/app/(universal)/action/distribution/getVehicles";
 
import { getStockLocationsAll } from "@/app/(universal)/action/distribution/getStockLocationsAll";

import LoadVehicleFormOperator from "./OperatorLoad";
import { getRoutes } from "@/app/(universal)/action/distribution/sale-route/getRoutes";

export default async function Page() {

  const [
    vehicles,
    routes,
    factoryStock,
  ] = await Promise.all([

    getVehicles(),

    getRoutes(),

    getStockLocationsAll({
      locationType: "STORE",
      locationRef: "MAIN",
    }),

  ]);

  return (
    <LoadVehicleFormOperator
      vehicles={vehicles}
      routes={routes}
      factoryStock={factoryStock}
    />
  );
}