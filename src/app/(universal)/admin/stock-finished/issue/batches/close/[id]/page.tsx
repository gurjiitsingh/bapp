 
import { fetchProductsStock } from "@/app/(universal)/action/products/fetchProductsStock";
import ProductionForm from "./ProductionForm";

export default async function Page({ params }: any) {
  const { id } = await params;

  const products = await fetchProductsStock();

  return (
    <ProductionForm
      products={products}
      batchId={id} // ✅ pass batch id
    />
  );
}