import { getStockMovements } from "@/app/(universal)/action/distribution/getStockMovements";
import StockMovementTable from "./StockMovementTable";
 

export default async function Page() {
  const movements = await getStockMovements();

 

  return (
    <StockMovementTable
      movements={movements}
    />
  );
}