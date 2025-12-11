"use client";

import { useEffect, useRef, useState } from "react";
import { fetchProducts } from "@/app/(universal)/action/products/dbOperation";
import { UseSiteContext } from "@/SiteContext/SiteContext";
import {
  FaStar,
  FaFireAlt,
  FaLeaf,
  FaHeart,
  FaSmile,
  FaChevronLeft,
  FaChevronRight,
} from "react-icons/fa";
import { Playfair_Display, Quicksand } from "next/font/google";

const playfair = Playfair_Display({
  subsets: ["latin"],
  weight: ["700"],
});

const quicksand = Quicksand({
  subsets: ["latin"],
  weight: ["400", "500"],
});

export default function BestOfMonth() {
  const [featuredProducts, setFeaturedProducts] = useState<any[]>([]);
  const { settings } = UseSiteContext();
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const products = await fetchProducts();
        const featured = products.filter((p) => p.isFeatured === true);
        featured.sort((a, b) => a.sortOrder - b.sortOrder);
        setFeaturedProducts(featured);
      } catch (err) {
        console.error("Error fetching featured products:", err);
      }
    };
    fetchData();
  }, []);

  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const { scrollLeft, clientWidth } = scrollRef.current;
      const scrollAmount = direction === "left" ? -clientWidth : clientWidth;
      scrollRef.current.scrollTo({
        left: scrollLeft + scrollAmount,
        behavior: "smooth",
      });
    }
  };

  return (
    <section className="bg-[#fdf4ec] py-12 relative overflow-hidden select-none">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
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

        {/* Arrows */}
        <button
          onClick={() => scroll("left")}
          className="hidden md:flex absolute left-2 top-1/2 -translate-y-1/2 z-10 bg-[#2B2E4A] text-white p-3 rounded-full hover:bg-[#d24a0f] transition"
        >
          <FaChevronLeft />
        </button>
        <button
          onClick={() => scroll("right")}
          className="hidden md:flex absolute right-2 top-1/2 -translate-y-1/2 z-10 bg-[#2B2E4A] text-white p-3 rounded-full hover:bg-[#d24a0f] transition"
        >
          <FaChevronRight />
        </button>

        {/* Scroll Snap Container */}
        <div
          ref={scrollRef}
          className="flex gap-6 overflow-hidden pb-6 scroll-smooth snap-x snap-mandatory"
        >
          {featuredProducts.length > 0
            ? featuredProducts.map((product) => (
                <div
                  key={product.id}
                  className="min-w-[280px] sm:min-w-[300px] md:min-w-[320px] flex-shrink-0 snap-center"
                >
                  <div className="relative bg-white rounded-2xl shadow-sm hover:shadow-md transition p-4 h-full">
                    {/* Discount Badge */}
                    {product.discountPrice && (
                      <div className="absolute top-2 right-2 bg-[#8b0000] text-white text-xs px-2 py-1 rounded-md font-semibold">
                        -{Math.round(
                          100 - (product.discountPrice / product.price) * 100
                        )}
                        %
                      </div>
                    )}

                    {/* Product Info */}
                    <button className="text-left w-full">
                      <h3
                        className={`${quicksand.className} text-lg font-extrabold text-[#2B2E4A] mb-1`}
                      >
                        {product.name}
                      </h3>

                      <p className="italic text-gray-500 text-sm mb-1">
                        Empfehlung vom Chefkoch
                      </p>

                      <div className="flex items-center gap-2 text-[#d24a0f] text-xs mb-1">
                        <FaFireAlt /> <FaLeaf /> <span>🌶️</span>
                      </div>

                      <p className="text-gray-700 text-sm leading-snug mb-2">
                        {product.productDesc || "Leckeres Gericht des Monats"}
                      </p>

                      {/* Price */}
                      <div className="flex items-center gap-2 text-sm">
                        {product.discountPrice ? (
                          <>
                            <span className="line-through text-gray-400">
                              {product.price}€
                            </span>
                            <span className="text-[#d24a0f] font-semibold">
                              {product.discountPrice}€
                            </span>
                          </>
                        ) : (
                          <span className="text-[#d24a0f] font-semibold">
                            {product.price}€
                          </span>
                        )}
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
              ))
            : [...Array(3)].map((_, i) => (
                <div
                  key={i}
                  className="min-w-[280px] sm:min-w-[300px] md:min-w-[320px] flex-shrink-0 snap-center bg-white rounded-2xl shadow-sm animate-pulse p-6"
                >
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-full mb-1"></div>
                  <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                </div>
              ))}
        </div>
      </div>
    </section>
  );
}
