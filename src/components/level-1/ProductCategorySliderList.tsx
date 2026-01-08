"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";

type ProductType = {
  id: string;
  name: string;
  price: number;
  discountPrice?: number;
  productDesc?: string;
  productCat: string;
  image?: string;
};

export default function ProductCategorySliderList() {
  const [groupedProducts, setGroupedProducts] = useState<Record<string, ProductType[]>>({});

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch("/api/products", { cache: "no-store" });
        if (!res.ok) throw new Error("Failed to fetch products");
        const products: ProductType[] = await res.json();

        const grouped = products.reduce((acc, product) => {
          const cat = product.productCat || "Uncategorized";
          if (!acc[cat]) acc[cat] = [];
          acc[cat].push(product);
          return acc;
        }, {} as Record<string, ProductType[]>);

        setGroupedProducts(grouped);
      } catch (err) {
        console.error("Error loading products:", err);
      }
    };

    fetchProducts();
  }, []);

  return (
    <section className="bg-[#fff8f4] py-8 px-4 md:px-8">
      {Object.entries(groupedProducts).map(([category, products]) => (
        <CategorySection key={category} category={category} products={products} />
      ))}
    </section>
  );
}

function CategorySection({
  category,
  products,
}: {
  category: string;
  products: ProductType[];
}) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (dir: "left" | "right") => {
    if (!scrollRef.current) return;
    const scrollAmount = dir === "left" ? -300 : 300;
    scrollRef.current.scrollBy({ left: scrollAmount, behavior: "smooth" });
  };

  return (
    <div id={category} className="mb-12 scroll-mt-24 relative">
      {/* Category Header */}
      <div className="flex items-center gap-3 mb-4">
        <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-200 flex-shrink-0">
          {products[0]?.image && (
            <Image
              src={products[0].image}
              alt={category}
              width={48}
              height={48}
              className="w-full h-full object-cover"
            />
          )}
        </div>
        <div>
          <h2 className="text-xl font-bold uppercase text-[#d24a0f]">{category}</h2>
          <p className="text-sm text-gray-500">
            Alle {category} werden frisch serviert
          </p>
        </div>
      </div>

      {/* Left/Right Scroll Buttons */}
      <button
        onClick={() => scroll("left")}
        className="hidden md:flex absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white shadow-lg w-10 h-10 rounded-full items-center justify-center hover:bg-[#d24a0f] hover:text-white transition"
      >
        <ChevronLeft />
      </button>

      <button
        onClick={() => scroll("right")}
        className="hidden md:flex absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white shadow-lg w-10 h-10 rounded-full items-center justify-center hover:bg-[#d24a0f] hover:text-white transition"
      >
        <ChevronRight />
      </button>

      {/* Product Slider */}
      <div
        ref={scrollRef}
        className="flex gap-4 overflow-x-auto pb-2 hide-scrollbar scroll-smooth"
      >
        {products.map((product) => (
          <div
            key={product.id}
            className="min-w-[230px] bg-white rounded-2xl shadow-md hover:shadow-lg transition flex-shrink-0 p-4"
          >
            {/* Image */}
            <div className="w-full h-32 rounded-xl overflow-hidden bg-gray-100 mb-3">
              {product.image ? (
                <Image
                  src={product.image}
                  alt={product.name}
                  width={200}
                  height={200}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gray-200" />
              )}
            </div>

            {/* Info */}
            <h3 className="font-semibold text-gray-800 truncate">{product.name}</h3>
            <p className="text-sm text-gray-500 truncate">
              {product.productDesc || "Leckeres Gericht"}
            </p>
            <p className="mt-2 font-semibold text-[#d24a0f]">
              {product.discountPrice ? (
                <>
                  <span className="line-through text-gray-400 mr-1">
                    {product.price}€
                  </span>
                  {product.discountPrice}€
                </>
              ) : (
                `${product.price}€`
              )}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}


