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

export default function CategorySlider() {
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
      [1500, 7],
      [1400, 6],
      [1300, 6],
      [1200, 5],
      [1100, 5],
      [1000, 5],
      [900, 4],
      [800, 4],
      [700, 3],
      [600, 3],
      [500, 3],
      [400, 2],
    ];
    for (const [breakpoint, count] of breakpoints) {
      if (width > breakpoint) return count;
    }
    return 2;
  }, [width]);

  const sliderSettings = {
    dots: false,
    infinite: true,
    speed: 500,
    slidesToShow,
    slidesToScroll: 2,
  };

 return (
  <div className="relative z-10 mt-5 mb-7 container mx-auto ">
    {/* <div className="flex justify-end mb-1 px-2"> */}
   <div className=" mx-auto w-full flex justify-end ">

     <div className=" w-fit  text-zinc-500 bg-white rounded-t-2xl py-1 px-2 text-sm font-light md:font-normal">
          {TEXT.search_dish_or_category}
          
        </div>
    </div>

    <div className="mx-auto max-w-[1700px] min-h-[100px] bg-white backdrop-blur-md rounded-b-xl rounded-tl-xl shadow-md p-1">
      {categoryData.length > 0 && (
        <Slider {...sliderSettings}>
{categoryData.map((category) => {
  const isActive = displayCategory === category.id;

  return (
    <div
      key={category.id}
      className="!flex justify-center items-center px-1 py-1" // Add spacing between slides
    >
      <button
        onClick={() => setProductCategoryIdG(category.id)}
        className={`
          group max-w-[200px] h-[180px]  
          ${isActive ? '' : ''} 
           hover:shadow-md transition-all duration-300 ease-in-out
          flex flex-col items-center justify-start  gap-3
        `}
      >
        <div className={`${
                        displayCategory === category.id
                          ? "relative  rounded-xl overflow-hidden bg-gray-100 shadow-inner border-amber-200 border-2"
                          : "relative  rounded-xl overflow-hidden bg-gray-100 shadow-inner"
                      }`}>
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
            text-center text-[15px] font-medium leading-tight 
            ${isActive ? 'text-slate-600' : 'text-gray-800 group-hover:text-orange-600'}
          `}
        >
          {category.name}
        </span>
      </button>
    </div>
  );
})}



        </Slider>
      )}
    </div>
  </div>
);


}
