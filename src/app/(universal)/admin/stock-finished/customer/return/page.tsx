// app/admin/stock-finished/adjust-Item/page.tsx




import { fetchCustomer } from "@/app/(universal)/action/stock-finished/inventorySupplier/fetchCustomer";
import ItemSaleForm from "../../components/ItemSaleForm";


 
import ItemReturnForm from "../../components/ItemReturnForm";
import { fetchProductsStock } from "@/app/(universal)/action/products/fetchProductsStock";



export default async function Page() {
  // INVENTORY ITEMS
  const products =
    await fetchProductsStock();

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