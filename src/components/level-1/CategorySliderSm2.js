"use client";

import { useEffect, useState, useMemo } from "react";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { fetchCategories } from "@/app/(universal)/action/category/dbOperations";
import { UseSiteContext } from "@/SiteContext/SiteContext";
import { TEXT } from "@/config/languages";

import { Cinzel, Lato, Roboto, Poppins } from "next/font/google";

const cinzel = Cinzel({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
});

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "600", "700"], // choose what you need
});

const lato = Lato({
  subsets: ["latin"],
  weight: ["400", "700"],
});

export default function CategorySliderSm2() {
  const [width, setWidth] = useState(0); // Start with 0, safe for SSR
  // const [width, setWidth] = useState(() =>
  //   typeof window !== "undefined" ? window.innerWidth : 300
  // );

  const [categoryData, setCategoryData] = useState([]);
  const [displayCategory, setDisplayCategory] = useState("");
  const {
    productCategoryIdG,
    setProductCategoryIdG,
    setDisablePickupCatDiscountIds,
    settings,
  } = UseSiteContext();

  useEffect(() => {
    // Only access window inside useEffect
    const handleResize = () => setWidth(window.innerWidth);
    handleResize(); // set initial width
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (!productCategoryIdG) {
      setDisplayCategory(settings.display_category);
    } else {
      setDisplayCategory(productCategoryIdG);
    }
  }, [settings, productCategoryIdG]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const categories = await fetchCategories();
        categories.sort((a, b) => Number(a.sortOrder) - Number(b.sortOrder));
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

  const slidesToShow = useMemo(() => {
    const breakpoints = [
      [1500, 10],
      [1400, 9],
      [1300, 8],
      [1200, 6],
      [1100, 6],
      [1000, 6],
      [900, 6],
      [800, 6],
      [700, 5],
      [600, 4],
      [500, 4],
      [400, 4],
    ];
    for (const [breakpoint, count] of breakpoints) {
      if (width > breakpoint) return count;
    }
    return 3;
  }, [width]);

  const sliderSettings = {
    dots: false,
    infinite: true,
    speed: 500,
    slidesToShow,
    slidesToScroll: 2,
  };

  return (
    <div className="relative z-10 mt-1 mb-1 container mx-auto ">
      <div className="mx-auto max-w-[1700px] min-h-[100px]     p-1">
        {categoryData.length > 0 && (
          <Slider {...sliderSettings}>
            {categoryData.map((category) => {
              const isActive = displayCategory === category.id;

              return (
                <div
                  key={category.id}
                  className="!flex   justify-center items-center px-1 py-1" // Add spacing between slides
                >
                  <div className="bg-white pb-1 rounded-2xl">
                    <button
                      onClick={() => setProductCategoryIdG(category.id)}
                      className={`
          group max-w-[130px] h-[150px]  
          ${isActive ? "" : ""} 
           hover:shadow-md transition-all duration-300 ease-in-out
          flex flex-col items-center justify-start  gap-3
        `}
                    >
                      <div
                        className={`${
                          displayCategory === category.id
                            ? "relative  rounded-xl overflow-hidden bg-gray-100 shadow-inner border-slate-200 border-2"
                            : "relative  rounded-xl overflow-hidden bg-gray-100 shadow-inner"
                        }`}
                      >
                        {/* <div
                      className={`${
                        displayCategory === category.id
                          ? "bg-amber-300 py-1 rounded-xl"
                          : "py-1 rounded-xl"
                      }`}
                    > */}
                        <img
                          src={category.image || "/com.jpg"}
                          alt={category.name || "Category"}
                          className=" h-full object-cover transition-transform group-hover:scale-105"
                        />
                      </div>

                      <span
                        className={`
            text-center text-[15px]  h-[50px] font-bold leading-tight 
            ${
              isActive
                ? "text-zinc-600"
                : "text-slate-500 group-hover:text-slate-300"
            }
          `}
                      >
                        {category.name}
                      </span>
                    </button>
                  </div>
                </div>
              );
            })}
          </Slider>
        )}
      </div>
    </div>
  );
}
