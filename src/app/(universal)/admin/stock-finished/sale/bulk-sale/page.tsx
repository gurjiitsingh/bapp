import { getVehicles } from "@/app/(universal)/action/distribution/getVehicles";
import { getStockLocationsAll } from "@/app/(universal)/action/distribution/getStockLocationsAll";
 import { fetchProductsStock } from "@/app/(universal)/action/products/fetchProductsStock";
 
import { fetchCustomer } from "@/app/(universal)/action/stock-finished/customer/fetchCustomer";
import BulkSaleForm from "./bulksale";

export default async function Page() {
  const [vehicles, factoryStock] = await Promise.all([
    getVehicles(),
    getStockLocationsAll({
      locationType: "STORE",
      locationRef: "MAIN",
    }),
  ]);
  const productStock =
    await fetchProductsStock();
   const customers =
      await fetchCustomer();

      console.log("products-------------------", productStock)
 
  return (
    <BulkSaleForm
      vehicles={vehicles}
      productStock={productStock}
      customers ={customers}
    />
  );
}