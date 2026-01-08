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

const roboto = Roboto({
  subsets: ["latin"],
  weight: ["400", "500", "700"], 
});


export default function CategorySlider1() {
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
      [1500, 9],
      [1400, 9],
      [1300, 8],
      [1200, 8],
      [1100, 7],
      [1000, 7],
      [900, 6],
      [800, 6],
      [700, 5],
      [650, 5],
      [550, 4],
      [400, 3],
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
  // <div className="relative z-10 mt-20 mb-7 container mx-auto ">
    
<div className="relative z-10 mt-10 mb-7 container mx-auto ">
   <div className="container mx-auto w-full flex justify-end ">
    <div className=" w-fit  text-zinc-500 light-bg rounded-t-2xl py-1 px-2 text-sm font-light md:font-normal">
          {TEXT.search_dish_or_category}
          
        </div>
</div>
    <div className="mx-auto max-w-[1700px] h-[150px] bg-white/70 backdrop-blur-md rounded-b-xl rounded-tl-xl shadow-md p-3">
      {categoryData.length > 0 && (
        <Slider {...sliderSettings}>
          {categoryData.map((category) => (
            <div key={category.id} className="mx-2">
              <button onClick={() => setProductCategoryIdG(category.id)}>
                <div className="w-[100px]">
                  <div className="flex flex-col gap-1">
                    <div
                      className={`${
                        displayCategory === category.id
                          ? "primary py-1 rounded-xl"
                          : "py-1 rounded-xl"
                      }`}
                    >
                      <div className="h-fit w-fit rounded-lg px-1">
                        <img
                          className="rounded-lg h-20 w-48 object-fill"
                          src={category.image || "/com.jpg"}
                          alt={category.name || "Category"}
                        />
                      </div>
                    </div>
                    <div className="flex flex-col justify-center w-[110px] items-center">
                      <h3 className={`${poppins.className} text-[.85rem] font-semibold text-slate-700 px-0`}>
                        {category.name}
                      </h3>
                    </div>
                  </div>
                </div>
              </button>
            </div>
          ))}
        </Slider>
      )}
    </div>
  </div>
);

}
