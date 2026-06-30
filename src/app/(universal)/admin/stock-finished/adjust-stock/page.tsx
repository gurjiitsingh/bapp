// app/admin/stock-finished/adjust-stock/page.tsx



import { fetchProductsStock } from "@/app/(universal)/action/products/productsStock";
import StockAdjustmentForm from "../components/StockAdjustmentForm";


export default async function Page() {

  // SERVER FETCH
  const products =
    await fetchProductsStock();

  

  return (
    <StockAdjustmentForm
      products={products}
    />
  );
}