 
import { fetchProductsStock } from "@/app/(universal)/action/products/fetchProductsStock";
import ProductionEstimateForm from "./ProductionEstimateForm";

type PageProps = {
  searchParams: Promise<{
    productId?: string;
    currentStock?: string;
    consumptionUnit?: string;
  }>;
};

export default async function Page({
  searchParams,
}: PageProps) {
  const products = await fetchProductsStock();

  const params = await searchParams;

  return (
    <ProductionEstimateForm
      products={products}
      productId={params.productId}
      currentStock={
        params.currentStock
          ? Number(params.currentStock)
          : undefined
      }
      consumptionUnit={params.consumptionUnit}
    />
  );
}