import ProductionEstimateForm from "../components/ProductionEstimateForm";
import { fetchProductsStock } from "@/app/(universal)/action/products/productsStock";

export default async function Page() {
  const products = await fetchProductsStock();

  return (
    <ProductionEstimateForm
      products={products}
    />
  );
}