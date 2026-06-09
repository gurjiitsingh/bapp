// app/admin/stock-finished/adjust-Item/page.tsx




import { fetchCustomer } from "@/app/(universal)/action/stock-finished/inventorySupplier/fetchCustomer";
import ItemSaleForm from "../../components/ItemSaleForm";


import { fetchFinishedProducts } from "@/app/(universal)/action/stock-finished/finshed-products/fetchFinishedProduct";



export default async function Page() {
  // INVENTORY ITEMS
  const products =
    await fetchFinishedProducts();

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