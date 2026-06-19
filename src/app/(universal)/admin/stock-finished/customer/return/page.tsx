// app/admin/stock-finished/adjust-Item/page.tsx




import { fetchCustomer } from "@/app/(universal)/action/stock-finished/inventorySupplier/fetchCustomer";
import ItemSaleForm from "../../components/ItemSaleForm";


import { fetchFinishedProducts } from "@/app/(universal)/action/stock-finished/finshed-products/fetchFinishedProduct";
import ItemReturnForm from "../../components/ItemReturnForm";



export default async function Page() {
  // INVENTORY ITEMS
  const products =
    await fetchFinishedProducts();

  // WHOLESALE CUSTOMERS
  const customers =
    await fetchCustomer();

  return (
    <ItemReturnForm
      products={
        products
      }
      customers={customers}
    />
  );
}