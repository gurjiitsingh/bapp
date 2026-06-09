// app/admin/stock-finished/adjust-stock/page.tsx



import StockAdjustmentForm from "../components/StockAdjustmentForm";
import { fetchProducts } from "@/app/(universal)/action/products/dbOperation";

export default async function Page() {

  // SERVER FETCH
  const products =
    await fetchProducts();

  

  return (
    <StockAdjustmentForm
      products={products}
    />
  );
}