"use client";

import { useEffect, useRef, useState } from "react";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import { UseSiteContext } from "@/SiteContext/SiteContext";
import { Lato, Poppins } from "next/font/google";

//  Category type definition
export type CategoryType = {
  id: string;
  name: string;
  desc?: string;
  productDesc?: string;
  slug?: string;
  image?: string;
  isFeatured?: boolean | string;
  sortOrder?: number;
  disablePickupDiscount?: boolean;
};

const lato = Lato({
  subsets: ["latin"],
  weight: ["400", "700"],
});

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
});

export default function CategorySliderLight() {
  const [categoryData, setCategoryData] = useState<CategoryType[]>([]);
  const [displayCategory, setDisplayCategory] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const {
    productCategoryIdG,
    setProductCategoryIdG,
    setDisablePickupCatDiscountIds,
    settings,
  } = UseSiteContext();

  //  Handle displayCategory selection


useEffect(() => {
  if (!productCategoryIdG) {
   setDisplayCategory(settings.display_category?.toString() ?? null);
  } else {
    setDisplayCategory(productCategoryIdG);
  }
}, [settings, productCategoryIdG]);

  //  Fetch categories
useEffect(() => {
  const fetchData = async () => {
    try {
      const res = await fetch("/api/categories");
      const categories: CategoryType[] = await res.json();

      categories.sort((a, b) => Number(a.sortOrder ?? 0) - Number(b.sortOrder ?? 0));

      const featured = categories.filter(
        (category) => category.isFeatured !== "no"
      );
      setCategoryData(featured);

      const disablePickupCategoryIds = categories
        .filter((category) => category.disablePickupDiscount === true)
        .map((category) => category.id);

      setDisablePickupCatDiscountIds(disablePickupCategoryIds);
    } catch (err) {
      console.error("Error fetching categories:", err);
    }
  };



  fetchData();
}, []);


  //  Scroll handler
  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const { scrollLeft, clientWidth } = scrollRef.current;
      const scrollAmount =
        direction === "left" ? -clientWidth / 1.5 : clientWidth / 1.5;
      scrollRef.current.scrollTo({
        left: scrollLeft + scrollAmount,
        behavior: "smooth",
      });
    }
  };

  return (
    <div id="order_now" className="scroll-mt-24 relative max-w-7xl mx-auto  px-4 sm:px-6 lg:px-12 my-6">
      {/* Arrows */}
      <button
        onClick={() => scroll("left")}
        className="absolute opacity-[65%] left-0 top-[37%] -translate-y-1/2 z-10 bg-gray-300 text-white p-2 sm:p-3 rounded-full  transition shadow-md"
        aria-label="Scroll Left"
      >
        <FaChevronLeft className="text-sm sm:text-base" />
      </button>

      <button
        onClick={() => scroll("right")}
        className="absolute opacity-[65%] right-0 top-[37%] -translate-y-1/2 z-10 bg-gray-300 text-white p-2 sm:p-3 rounded-full  transition shadow-md"
        aria-label="Scroll Right"
      >
        <FaChevronRight className="text-sm sm:text-base" />
      </button>

      {/* Category scroll area */}
      <div
        ref={scrollRef}
        className="flex gap-3 sm:gap-4 overflow-x-auto scroll-smooth snap-x snap-mandatory scrollbar-hide justify-start px-0"
      >
        {categoryData.length > 0 ? (
          categoryData.map((category) => {
            const isActive = displayCategory === category.id;
      return (
  <div key={category.id} className="flex-shrink-0 snap-start">
    <button
      onClick={() => setProductCategoryIdG(category.id)}
      className={`group w-[120px] sm:w-[140px] h-[170px] bg-white rounded-xl  transition-all duration-300 ease-in-out flex flex-col items-center justify-start gap-3`}
    >
      <div
        className={`${
          isActive
            ? "relative rounded-xl overflow-hidden bg-gray-100 shadow-inner border-slate-200 border-2"
            : "relative rounded-xl overflow-hidden bg-gray-100 shadow-inner"
        } w-full h-[100px] sm:h-[110px]`}
      >
        <img
          src={category.image || "/com.jpg"}
          alt={category.name || "Category"}
          className="w-full h-full object-cover transition-transform group-hover:scale-105"
        />
      </div>

      <span
        className={`text-center text-[14px] font-bold leading-tight ${
          isActive
            ? "text-zinc-700"
            : "text-slate-500 group-hover:text-slate-400"
        }`}
      >
        {category.name}
      </span>
    </button>
  </div>
);

          })
        ) : (
          // Skeleton Loader
          [...Array(4)].map((_, i) => (
            <div
              key={i}
              className="w-[130px] h-[150px] bg-gray-100 animate-pulse rounded-xl flex-shrink-0 snap-start"
            />
          ))
        )}
      </div>
    </div>
  );
}
