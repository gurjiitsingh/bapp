import { fetchProductById } from "@/app/(universal)/action/products/dbOperation";
import { notFound } from "next/navigation";
import ProductOptionsEditor from "./ProductOptionsEditor";
 

type PageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function ProductOptionsPage({
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
      <ProductOptionsEditor
        productId={product.id}
       
        initialOptions={product.options ?? []}
      />
    </div>
  );
}