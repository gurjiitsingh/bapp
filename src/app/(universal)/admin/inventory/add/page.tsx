
import { fetchSuppliers } from "@/app/(universal)/action/inventorySupplier/fetchSuppliers";
import { fetchInventoryCategories } from "../../../action/inventoryCategory/fetchInventoryCategories";
import NewInventoryForm from "./components/NewInventoryForm";

import { getUnitConversions } from "@/app/(universal)/action/inventory/init/unit-conversion/getUnitConversions";

export default async function Page() {
  const unitConversions = await getUnitConversions();
  const categories =
    await fetchInventoryCategories();
    const suppliers = await fetchSuppliers();

  return (
    <NewInventoryForm 
      categories={categories}
      suppliers={suppliers}
      unitConversions={unitConversions}
    />
  );
}