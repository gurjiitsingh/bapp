import { fetchSimpleInventoryItems } from "@/app/(universal)/action/inventory/fetch/fetchSimpleInventoryItems";
import SimpleInventoryTable from "./SimpleInventoryTable";

 
export default async function Page() {
  const items = await fetchSimpleInventoryItems();

  return (
    <div className="p-6">
      <h1 className="text-xl font-semibold mb-4">
        Inventory Overview
      </h1>

      <SimpleInventoryTable items={items} />
    </div>
  );
}