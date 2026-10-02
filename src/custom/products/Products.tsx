"use client";

import { useEffect, useState, useMemo } from "react";
import { UseSiteContext } from "@/SiteContext/SiteContext";
import dynamic from "next/dynamic";
import { ProductType } from "@/lib/types/productType";
import { addOnType } from "@/lib/types/addOnType";
import ProductCardHorizontical from "./ProductCard-h1_1_1";
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
export default function Products({ initialProducts }: { initialProducts: ProductType[] }) {
  const { productCategoryIdG, settings, setAllProduct, productToSearchQuery } =
    UseSiteContext();


  const [products, setProducts] = useState<ProductType[]>([]);
const [variant, setVariant] = useState<ProductType[]>([]);
const [allProducts, setAllProductsLocal] = useState<ProductType[]>(initialProducts || []);
  const [addOns, setAddOns] = useState<addOnType[]>([]);
  const [categoryId, setCategoryId] = useState("");

  const [modifierGroups, setModifierGroups] = useState<any[]>([]);
const [productModifiers, setProductModifiers] = useState<any[]>([]);



  const cardType = process.env.NEXT_PUBLIC_PRODUCT_CARD_TYPE;

 

  //  Set initial category (runs only when settings OR global id changes)

  useEffect(() => {
    if (!settings?.display_category && !productCategoryIdG) return;

    const fallback = settings.display_category ?? "";

    setCategoryId(String(productCategoryIdG || fallback));
  }, [settings, productCategoryIdG]);

  //  Fetch ONCE (no remount loop now)
useEffect(() => {
  if (!initialProducts?.length) return;

  const published = initialProducts.filter(
    (p) => p.publishStatus === "published"
  );

  const sorted = [...published].sort(
    (a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0)
  );

  const parents = sorted.filter((p) => p.type === "parent");
  const variants = sorted.filter((p) => p.type === "variant");

  setAllProductsLocal(parents);
  setAllProduct(parents);
  setVariant(variants);

  // ✅ IMPORTANT: set default products immediately
setProducts(
  categoryId
    ? parents.filter((p) => p.categoryId === categoryId)
    : parents
);

}, [initialProducts]);



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


useEffect(() => {
  const timer = setTimeout(async () => {
    try {
      console.log("🚀 Fetching modifiers...");

      const [groupsRes, mappingRes] = await Promise.all([
        fetch("/api/modifier-groups"),
        fetch("/api/product-modifiers"),
      ]);

   if (!groupsRes.ok || !mappingRes.ok) {
  throw new Error("API error");
}

const groupsData = await groupsRes.json();
const mappingData = await mappingRes.json();

      setModifierGroups(groupsData);
      setProductModifiers(mappingData);

      // ✅ JUST LOG (important step)
      // console.log("✅ modifierGroups:", groupsData);
      // console.log("✅ productModifiers:", mappingData);

    } catch (err) {
      console.error("❌ Error fetching modifiers", err);
    }
  }, 1200);

  return () => clearTimeout(timer);
}, []);
  //  Layout logic (unchanged)
  let containerClass = "";
  switch (cardType) {
    case "1":
      containerClass =
        "flex flex-col justify-between md:flex-row md:flex-wrap gap-3 md:gap-5 ";
      break;
    case "11":
      containerClass =
        "flex flex-col justify-between md:flex-row md:flex-wrap gap-2 md:gap-2";
      break;
    case "12":
      containerClass =
        "flex flex-col justify-between md:flex-row md:flex-wrap gap-3 md:gap-5";
      break;
    case "2":
    case "3":
      containerClass =
        "flex flex-col md:flex-row justify-between md:flex-wrap gap-3 md:gap-5 justify-center";
      break;
    case "4":
      containerClass =
        "grid grid-cols-2 justify-between sm:grid-cols-4 lg:grid-cols-6 gap-3";
      break;
    case "5":
      containerClass =
        "grid grid-cols-2 justify-between sm:grid-cols-3 lg:grid-cols-4 gap-3";
      break;
    case "6":
      containerClass =
        "flex flex-col justify-between md:flex-row md:flex-wrap gap-3 md:gap-5";
      break;
    case "7":
      containerClass =
        "grid grid-cols-2 justify-between sm:grid-cols-4 lg:grid-cols-6 gap-3";
      break;
    case "16":
      containerClass =
        "flex flex-col justify-between md:flex-row md:flex-wrap gap-1 md:gap-1";
      break;
    default:
      containerClass =
        "flex flex-col justify-between md:flex-row md:flex-wrap gap-3 md:gap-5";
  }

  return (
    <div className="max-w-7xl mx-auto my-6">
      <div className="px-4 sm:px-6 lg:px-12">
        <div className={containerClass}>
          {products.map((product, i) => (
            <ProductCardHorizontical
              key={product.id ?? `${product.name}-${i}`}
             product={product}
  variants={variant}
  allAddOns={addOns}
  modifierGroups={modifierGroups}
  productModifiers={productModifiers}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
