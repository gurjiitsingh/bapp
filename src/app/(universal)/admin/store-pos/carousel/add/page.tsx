
import { fetchProductById } from "@/app/(universal)/action/products/dbOperation";
import { notFound } from "next/navigation";
 
import CarouselImagesForm from "./CarouselImagesForm";

 

type PageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function ProductImagesPage() {
  

 

  return (
    <div className="p-6">
      <CarouselImagesForm
        
      />
    </div>
  );
}
 
