"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import dynamic from "next/dynamic";
import { addOnType } from "@/lib/types/addOnType";
import { ProductType } from "@/lib/types/productType";



export default function ProductMenuList() {
  const [groupedProducts, setGroupedProducts] = useState<
    Record<string, ProductType[]>
  >({});
const [addOns, setAddOns] = useState<addOnType[]>([]);
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch("/api/products", { cache: "no-store" });
        if (!res.ok) throw new Error("Failed to fetch products");
        const products: ProductType[] = await res.json();

        // Group by productCat
        const grouped = products.reduce((acc, product) => {
          const category = product.productCat || "Uncategorized";
          if (!acc[category]) acc[category] = [];
          acc[category].push(product);
          return acc;
        }, {} as Record<string, ProductType[]>);

        setGroupedProducts(grouped);
      } catch (err) {
        console.error("Error loading products:", err);
      }
    };

    fetchProducts();
  }, []);

  const scrollToCategory = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      const yOffset = -140; // Adjust offset to account for sticky bar height
      const y = el.getBoundingClientRect().top + window.scrollY + yOffset;

      window.scrollTo({ top: y, behavior: "smooth" });
    }
  };

const cardType = process.env.NEXT_PUBLIC_MENU_CARD_TYPE;

   const Card = useMemo(() => {
      switch (cardType) {
        case "1":
          return dynamic(() => import("../level-2/ProductCard-h1"));
           case "11":
          return dynamic(() => import("../level-2/ProductCard-h1_1"));
        case "13":
          return dynamic(() => import("../level-2/ProductCard-h1_3"));
  
        case "14":
          return dynamic(() => import("../level-2/ProductMenuCard-h1_4"));
        case "15":
          return dynamic(() => import("../level-2/ProductMenuCard-h1_5"));
        case "12":
          return dynamic(
            () => import("@/custom/cus-components/ProductCard-custom")
          );
        case "19":
          return dynamic(() => import("../level-2/ProductCard-h12"));
        case "2":
          return dynamic(() => import("../level-2/ProductCard-v2"));
        case "3":
          return dynamic(() => import("../level-2/ProductCard-v3"));
        case "4":
          return dynamic(() => import("../level-2/ProductCard-v4"));
        case "5":
          return dynamic(() => import("../level-2/ProductCard-v5"));
        case "6":
          return dynamic(() => import("../level-2/ProductCard-h6"));
        case "7":
          return dynamic(() => import("../level-2/ProductCard-v7"));
        default:
          return dynamic(() => import("../level-2/ProductCard-h1"));
      }
    }, [cardType]);


    //  Layout logic (unchanged)
  let containerClass = "";
  switch (cardType) {
    case "1":
      containerClass = "flex flex-col md:flex-row md:flex-wrap gap-3 md:gap-5 ";
      break;
    case "11":
      containerClass = "flex flex-col md:flex-row md:flex-wrap gap-2 md:gap-2";
      break;
    case "12":
      containerClass = "flex flex-col md:flex-row md:flex-wrap gap-3 md:gap-5";
      break;
    case "2":
    case "3":
      containerClass =
        "flex flex-col md:flex-row md:flex-wrap gap-3 md:gap-5 justify-center";
      break;
    case "4":
      containerClass = "grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3";
      break;
    case "5":
      containerClass = "grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3";
      break;
    case "6":
      containerClass = "flex flex-col md:flex-row md:flex-wrap gap-3 md:gap-5";
      break;
    case "7":
      containerClass = "grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3";
      break;
    default:
      containerClass = "flex flex-col md:flex-row md:flex-wrap gap-3 md:gap-5";
  }


  return (
    <section className="bg-white py-6  ">
      {/* Sticky Category Bar */}
      <div className="sticky top-13 z-50 bg-white border-b border-gray-200 shadow-sm overflow-x-auto">
        <div className="flex gap-4 px-4 py-3 max-w-6xl mx-auto whitespace-nowrap">
          {Object.keys(groupedProducts).map((category) => (
            <button
              key={category}
              onClick={() => scrollToCategory(category)}
              className="px-4 py-2 rounded-full bg-gray-100 hover:bg-[#d24a0f] hover:text-white transition text-sm font-medium"
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      {/* Products Section */}
      <div className="max-w-6xl mx-auto space-y-10 mt-8">
        {Object.entries(groupedProducts).map(([category, products]) => (
          <div key={category} id={category} className="scroll-mt-24">
            {/* Category Title */}
            <h2 className="text-xl font-semibold text-gray-800 mb-3 flex items-center gap-2">
              {category}
              <span className="text-lg">🥗</span>
            </h2>

            {/* Product Grid */}
           <div id="bf" className="max-w-6xl mx-auto my-6">
      <div className="px-2">
        <div className={containerClass}>
              {products.map((product, i) => (
            <Card
              key={product.id ?? `${product.name}-${i}`}
              product={product}
              allAddOns={addOns}
            />
          ))}
            </div>
  </div>  </div>



          </div>
        ))}
      </div>
    </section>
  );
}

// old code

  // <div
  //                 key={product.id}
  //                 className="bg-white flex items-center gap-4 rounded-2xl shadow-sm hover:shadow-md transition p-3"
  //               >
  //                 {/* Product Image */}
  //                 <div className="w-20 h-20 flex-shrink-0 rounded-xl overflow-hidden bg-gray-100">
  //                   {product.image ? (
  //                     <Image
  //                       src={product.image}
  //                       alt={product.name}
  //                       width={80}
  //                       height={80}
  //                       className="w-full h-full object-cover"
  //                     />
  //                   ) : (
  //                     <div className="w-full h-full bg-gray-200" />
  //                   )}
  //                 </div>

  //                 {/* Product Info */}
  //                 <div className="flex-1">
  //                   <h3 className="font-semibold text-gray-900 ">
  //                     {product.name}
  //                   </h3>
  //                   <p className="text-sm text-gray-500 ">
  //                     {product.productDesc || "Delicious dish"}
  //                   </p>
  //                   <p className="mt-1 text-sm font-semibold text-[#d24a0f]">
  //                     {product.discountPrice ? (
  //                       <>
  //                         <span className="line-through text-gray-400 mr-1">
  //                           {product.price}€
  //                         </span>
  //                         {product.discountPrice}€
  //                       </>
  //                     ) : (
  //                       `${product.price}€`
  //                     )}
  //                   </p>
  //                 </div>

                 
  //                 <button className="w-8 h-8 flex items-center justify-center border border-gray-300 rounded-full hover:bg-[#d24a0f] hover:text-white transition">
  //                   +
  //                 </button>
  //               </div>