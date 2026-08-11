import { getVehicles } from "@/app/(universal)/action/distribution/getVehicles";
import { getStockLocationsAll } from "@/app/(universal)/action/distribution/getStockLocationsAll";
 
 
import { fetchCustomer } from "@/app/(universal)/action/stock-finished/customer/fetchCustomer";
import TruckStockReturn from "./TruckDeliveryReturn";
 

export default async function Page() {
  const [vehicles, factoryStock] = await Promise.all([
    getVehicles(),
    getStockLocationsAll({
      locationType: "STORE",
      locationRef: "MAIN",
    }),
  ]);

   const customers =
      await fetchCustomer();
 
  return (
    <TruckStockReturn
      vehicles={vehicles}
      factoryStock={factoryStock}
      customers ={customers}
    />
  );
}