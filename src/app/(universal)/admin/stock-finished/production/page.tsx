
import { fetchProducts } from "@/app/(universal)/action/products/dbOperation";
import ProductionForm from "../components/ProductionForm";

export default async function Page() {
  const products = await fetchProducts();

  return (
    <ProductionForm
      products={products}
    />
  );
}