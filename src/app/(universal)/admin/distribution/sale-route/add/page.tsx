import RouteForm from "./RouteForm";

import { fetchSaleMan } from "@/app/(universal)/action/distribution/saleman/fetchSaleMan";
import { getVehicles } from "@/app/(universal)/action/distribution/getVehicles";

export default async function Page() {
  const salesman = await fetchSaleMan();

  const vehicles = await getVehicles();

  return (
    <RouteForm
      salesman={salesman}
      vehicles={vehicles}
    />
  );
}