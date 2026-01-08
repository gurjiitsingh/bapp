"use client";

import { useEffect, useState, useMemo } from "react";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { FaStar, FaFireAlt, FaLeaf, FaHeart, FaSmile } from "react-icons/fa";
import { UseSiteContext } from "@/SiteContext/SiteContext";
import { fetchCategories } from "@/app/(universal)/action/category/dbOperations";
import { Playfair_Display, Quicksand } from "next/font/google";

const playfair = Playfair_Display({
  subsets: ["latin"],
  weight: ["700"],
});

const quicksand = Quicksand({
  subsets: ["latin"],
  weight: ["400", "500"],
});

export default function CategorySliderNewStyle() {
  const [width, setWidth] = useState(0);
  const [categoryData, setCategoryData] = useState([]);
  const [displayCategory, setDisplayCategory] = useState("");
  const { productCategoryIdG, setProductCategoryIdG, setDisablePickupCatDiscountIds, settings } =
    UseSiteContext();

  useEffect(() => {
    const handleResize = () => setWidth(window.innerWidth);
    handleResize();
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
        const featured = categories.filter((c) => c.isFeatured !== "no");
        setCategoryData(featured);

        const disablePickupCategoryIds = categories
          .filter((c) => c.disablePickupDiscount === true)
          .map((c) => c.id);

        setDisablePickupCatDiscountIds(disablePickupCategoryIds);
      } catch (err) {
        console.error("Error fetching categories:", err);
      }
    };
    fetchData();
  }, []);

  const slidesToShow = useMemo(() => {
    const breakpoints = [
      [1500, 4],
      [1000, 3],
      [700, 2],
      [400, 1],
    ];
    for (const [bp, count] of breakpoints) {
      if (width > bp) return count;
    }
    return 1;
  }, [width]);

  const sliderSettings = {
    dots: false,
    infinite: true,
    speed: 500,
    slidesToShow,
    slidesToScroll: 1,
  };

  return (
    <section className="bg-[#fdf4ec] py-12">
      <div className="max-w-6xl mx-auto px-4">
        {/* --- Header --- */}
        <div className="text-center mb-10">
          <h2
            className={`${playfair.className} text-3xl md:text-4xl font-extrabold text-[#2B2E4A] uppercase flex items-center justify-center gap-2`}
          >
            <FaStar className="text-[#d24a0f]" /> Best of the Month
          </h2>
          <p className="text-[#d24a0f] text-sm mt-2">
            Die meistbestellten Gerichte der letzten 30 Tage
          </p>
          <p className="text-gray-600 text-sm mt-1">
            Fast alle Gerichte mit: <span className="font-semibold">Reis</span>
          </p>
        </div>

        {/* --- Slider --- */}
        {categoryData.length > 0 && (
          <Slider {...sliderSettings}>
            {categoryData.map((category) => {
              const isActive = displayCategory === category.id;
              return (
                <div key={category.id} className="px-3">
                  <div className="relative bg-white rounded-2xl shadow-sm hover:shadow-md transition p-4">
                    {/* Discount Badge */}
                    <div className="absolute top-2 right-2 bg-[#8b0000] text-white text-xs px-2 py-1 rounded-md font-semibold">
                      -5%
                    </div>

                    {/* Product Info */}
                    <button
                      onClick={() => setProductCategoryIdG(category.id)}
                      className="text-left w-full"
                    >
                      <h3
                        className={`${quicksand.className} text-lg font-extrabold text-[#2B2E4A] mb-1`}
                      >
                        {category.name || "74 Chicken Tikka Masala"}
                      </h3>

                      <p className="italic text-gray-500 text-sm mb-1">
                        Empfehlung vom Chefkoch
                      </p>

                      <div className="flex items-center gap-2 text-[#d24a0f] text-xs mb-1">
                        <FaFireAlt /> <FaLeaf /> <span>🌶️</span>
                      </div>

                      <p className="text-gray-700 text-sm leading-snug mb-2">
                        Tandoori-Hähnchenfiletstücke, Tomaten, Knoblauch, Rote
                        Currysauce
                      </p>

                      {/* Price */}
                      <div className="flex items-center gap-2 text-sm">
                        <span className="line-through text-gray-400">18,90€</span>
                        <span className="text-[#d24a0f] font-semibold">17,96€</span>
                      </div>

                      {/* Emojis / Reactions */}
                      <div className="flex items-center gap-3 mt-2 text-sm">
                        <span className="flex items-center gap-1 text-gray-600">
                          <FaHeart className="text-[#d24a0f]" /> 41
                        </span>
                        <span className="flex items-center gap-1 text-gray-600">
                          <FaSmile className="text-[#d24a0f]" /> 13
                        </span>
                      </div>
                    </button>
                  </div>
                </div>
              );
            })}
          </Slider>
        )}
      </div>
    </section>
  );
}
