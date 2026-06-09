// app/admin/stock-finished/adjust-Item/page.tsx




import { fetchCustomer } from "@/app/(universal)/action/stock-finished/inventorySupplier/fetchCustomer";
import ItemSaleForm from "../../components/ItemSaleForm";

import { fetchProducts } from "@/app/(universal)/action/products/dbOperation";



export default async function Page() {
  // INVENTORY ITEMS
  const products =
    await fetchProducts();

  // WHOLESALE CUSTOMERS
  const customers =
    await fetchCustomer();

  return (
    <ItemSaleForm
      products={
        products
      }
      customers={customers}
    />
  );
}