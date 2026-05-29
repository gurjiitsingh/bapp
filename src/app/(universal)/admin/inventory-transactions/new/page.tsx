


   import { fetchInventoryItems } from "@/app/(universal)/action/inventory/dbOperation";
import FormView from "../components/FormView";



export default async function Page() {
  const inventoryItems =
    await fetchInventoryItems();

  return (
    <FormView
      inventoryItems={inventoryItems}
    />
  );
}

