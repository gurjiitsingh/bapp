 
import { fetchProductsStock } from "@/app/(universal)/action/products/fetchProductsStock";
import ManualProductionForm from "./ManualProductionForm";

export default async function Page({ params }: any) {
  const { id } = await params;

  const products = await fetchProductsStock();

  return (
    <ManualProductionForm
      products={products}
      batchId={id} // ✅ pass batch id
    />
  );
}