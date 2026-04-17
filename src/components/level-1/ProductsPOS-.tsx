"use client";

import { useEffect, useState, useMemo } from "react";
import { UseSiteContext } from "@/SiteContext/SiteContext";
import dynamic from "next/dynamic";
import { ProductType } from "@/lib/types/productType";
import { addOnType } from "@/lib/types/addOnType";
//import ProdcutCardHorizontical19 from "../custom/cus-componets/ProductCard-h19"

// export type ProductType = {
//   id: string;
//   name: string;
//   price: number;
//   image?: string;
//   categoryId: string;
//   sortOrder?: number;
//   [key: string]: any;
// };
export default function Products() {
  const { productCategoryIdG, settings, setAllProduct, productToSearchQuery } =
    UseSiteContext();

  const [products, setProducts] = useState<ProductType[]>([]);
  const [allProducts, setAllProductsLocal] = useState<ProductType[]>([]);
  const [addOns, setAddOns] = useState<addOnType[]>([]);
  const [categoryId, setCategoryId] = useState("");

  const cardType = process.env.NEXT_PUBLIC_PRODUCT_CARD_TYPE;

  //  DYNAMIC IMPORT — SAFE, NO RERENDER LOOP

  const Card = useMemo(() => {
    switch (cardType) {
      case "1":
        return dynamic(() => import("../level-2/ProductCard-h1"));
         case "11":
        return dynamic(() => import("../level-2/ProductCard-h1_1"));
          case "16":
        return dynamic(() => import("../level-2/ProductCardPOS-h1_6"));
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

  //  Set initial category (runs only when settings OR global id changes)


useEffect(() => {
  if (!settings?.display_category && !productCategoryIdG) return;

  const fallback = settings.display_category ?? "";

  setCategoryId(String(productCategoryIdG || fallback));
}, [settings, productCategoryIdG]);

  //  Fetch ONCE (no remount loop now)
  useEffect(() => {
    let isMounted = true;

    async function load() {
      try {
        const res = await fetch("/api/products");
        //  const data = await res.json();
        const data: ProductType[] = await res.json(); //  define type here
        console.log("Fetched products ");

        const published = data.filter(
          (p: ProductType) => p.publishStatus === "published"
        );

        const sorted = published.sort(
          (a: ProductType, b: ProductType) =>
            (a.sortOrder ?? 0) - (b.sortOrder ?? 0)
        );

        if (!isMounted) return;

        setAllProductsLocal(sorted);
        setAllProduct(sorted); //  context update (won’t remount now)
        // setAddOns(data);

        setProducts(
          categoryId
            ? sorted.filter((p) => p.categoryId === categoryId)
            : sorted
        );
      } catch (err) {
        console.error("Error loading products:", err);
      }
    }

    load();

    return () => {
      isMounted = false;
    };
  }, []); //  runs ONCE ONLY

  //  Category filter
  useEffect(() => {
    if (!categoryId) {
      setProducts(allProducts);
      return;
    }
    setProducts(allProducts.filter((p) => p.categoryId === categoryId));
  }, [categoryId, allProducts]);

  //  Search filter
  useEffect(() => {
    if (!productToSearchQuery) {
      setProducts(allProducts);
      return;
    }

    setProducts(
      allProducts.filter((p) =>
        p.name.toLowerCase().includes(productToSearchQuery.toLowerCase())
      )
    );
  }, [productToSearchQuery]);

  //  Layout logic (unchanged)
  let containerClass = "";
  switch (cardType) {
    case "1":
      containerClass = "flex flex-col justify-between md:flex-row md:flex-wrap gap-3 md:gap-5 ";
      break;
    case "11":
      containerClass = "flex flex-col justify-between md:flex-row md:flex-wrap gap-2 md:gap-2";
      break;
    case "12":
      containerClass = "flex flex-col justify-between md:flex-row md:flex-wrap gap-3 md:gap-5";
      break;
    case "2":
    case "3":
      containerClass =
        "flex flex-col md:flex-row justify-between md:flex-wrap gap-3 md:gap-5 justify-center";
      break;
    case "4":
      containerClass = "grid grid-cols-2 justify-between sm:grid-cols-4 lg:grid-cols-6 gap-3";
      break;
    case "5":
      containerClass = "grid grid-cols-2 justify-between sm:grid-cols-3 lg:grid-cols-4 gap-3";
      break;
    case "6":
      containerClass = "flex flex-col justify-between md:flex-row md:flex-wrap gap-3 md:gap-5";
      break;
    case "7":
      containerClass = "grid grid-cols-2 justify-between sm:grid-cols-4 lg:grid-cols-6 gap-3";
      break;
        case "16":
      containerClass = "flex flex-col justify-between md:flex-row md:flex-wrap gap-1 md:gap-1";
      break;
    default:
      containerClass = "flex flex-col justify-between md:flex-row md:flex-wrap gap-3 md:gap-5";
  }

  return (
    <div  className="max-full mx-auto my-1">
      <div className="px-1">
        <div className={containerClass}>
          {products.map((product, i) => (
            <Card
              key={product.id ?? `${product.name}-${i}`}
              product={product}
              allAddOns={addOns}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
