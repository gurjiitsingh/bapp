import { getVehicles } from "@/app/(universal)/action/distribution/getVehicles";
import { getStockLocationsAll } from "@/app/(universal)/action/distribution/getStockLocationsAll";
import TruckDeliverySale from "./TruckDeliverySale";
 
import { fetchCustomer } from "@/app/(universal)/action/stock-finished/customer/fetchCustomer";

export default async function Page() {
  const [vehicles, factoryStock] = await Promise.all([
    getVehicles(),
    getStockLocationsAll({
      locationType: "FACTORY",
      locationRef: "MAIN",
    }),
  ]);

   const customers =
      await fetchCustomer();

  return (
    <TruckDeliverySale
      vehicles={vehicles}
      factoryStock={factoryStock}
      customers ={customers}
    />
  );
}