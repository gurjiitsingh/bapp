
import { fetchProductById } from "@/app/(universal)/action/products/dbOperation";
import { notFound } from "next/navigation";
import ProductImagesForm from "./ProductImagesForm";

 

type PageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function ProductImagesPage({
  params,
}: PageProps) {
  const { id } = await params;

  if (!id) {
    notFound();
  }

  const product = await fetchProductById(id);

  if (!product) {
    notFound();
  }

  return (
    <div className="p-6">
      <ProductImagesForm
        productId={product.id}
        productName={product.name}
      />
    </div>
  );
}
 
