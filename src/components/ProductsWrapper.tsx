import { fetchProducts } from "@/app/(universal)/action/products/dbOperation";
import Products from "@/components/level-1/Products";

export default async function ProductsWrapper() {
  const products = await fetchProducts();

  return <Products initialProducts={products} />;
}