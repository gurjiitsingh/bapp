 
import { fetchProductsStock } from "@/app/(universal)/action/products/fetchProductsStock";
import CostEstimate from "./EstimateCost";

export default async function Page() {
  const products = await fetchProductsStock();

  return <CostEstimate products={products} />;
}