import { auth } from "@/auth";


import { fetchCustomer } from "@/app/(universal)/action/stock-finished/inventorySupplier/fetchCustomer";
import { fetchProductsStock } from "@/app/(universal)/action/products/fetchProductsStock";


import DriverDashboard from "./DriverDashboard";
 

export default async function DriverPage() {
  const session = await auth();

  const [products, customers] = await Promise.all([
    fetchProductsStock(),
    fetchCustomer(),
  ]);

    console.log("sessin--------------",session)

  return (
     <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <DriverDashboard
        userName={session?.user?.name || "Driver"}
        products={products}
        customers={customers}
      />
    </div>
  );
}