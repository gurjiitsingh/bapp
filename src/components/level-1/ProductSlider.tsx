"use client";

import { useRef } from "react";
import Image from "next/image";
import {
  ChevronLeft,
  ChevronRight,
  Info,
  Flame,
  Utensils,
  Leaf,
  CircleHelp,
} from "lucide-react";
import ProductCardForSlider from "../level-2/ProductCardForSlider";
import { ProductType } from "@/lib/types/productType";




export default function ProductSlider({
  products,
}: {
  products: ProductType[];
}) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (dir: "left" | "right") => {
    if (!scrollRef.current) return;
    const amount = dir === "left" ? -300 : 300;
    scrollRef.current.scrollBy({ left: amount, behavior: "smooth" });
  };
  

  return (
    <div className="relative">
      {/* Scroll Buttons */}
      <button
        onClick={() => scroll("left")}
        className="md:flex absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white border border-gray-300 w-10 h-10 rounded-full items-center justify-center shadow-md hover:bg-[#d24a0f] hover:text-white transition"
      >
        <ChevronLeft size={20} />
      </button>

      <button
        onClick={() => scroll("right")}
        className=" md:flex absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white border border-gray-300 w-10 h-10 rounded-full items-center justify-center shadow-md hover:bg-[#d24a0f] hover:text-white transition"
      >
        <ChevronRight size={20} />
      </button>

      {/* Product Cards Slider */}
      <div
        ref={scrollRef}
        className="flex gap-4 overflow-x-auto pb-3 hide-scrollbar scroll-smooth"
      >

  {products.map((product, i) => (
          <ProductCardForSlider
            key={product.id ?? `${product.name}-${i}`}
            product={product}
            
          />
        ))}

       
      </div>
    </div>
  );
}

// "use client";

// import { useRef } from "react";
// import Image from "next/image";
// import { ChevronLeft, ChevronRight, Info } from "lucide-react";
// import { MdOutlineEuro } from "react-icons/md";
// import { IoMdInformationCircleOutline } from "react-icons/io";
// import {  Lato } from "next/font/google";

// const lato = Lato({
//   subsets: ["latin"],
//   weight: ["300", "400", "700"],
//   variable: "--font-lato",
//   display: "swap",
// });



// type ProductType = {
//   id: string;
//   name: string;
//   price: number;
//   discountPrice?: number;
//   productDesc?: string;
//   categoryId: string;
//   image?: string;
// };

// export default function ProductSlider({ products }: { products: ProductType[] }) {
//   const scrollRef = useRef<HTMLDivElement>(null);

//   const scroll = (dir: "left" | "right") => {
//     if (!scrollRef.current) return;
//     const amount = dir === "left" ? -300 : 300;
//     scrollRef.current.scrollBy({ left: amount, behavior: "smooth" });
//   };

//   return (
//     <div className="relative">
//       {/* Scroll Buttons */}
//       <button
//         onClick={() => scroll("left")}
//         className="hidden md:flex absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white shadow-md border border-gray-200 w-10 h-10 rounded-full items-center justify-center hover:bg-[#d24a0f] hover:text-white transition"
//       >
//         <ChevronLeft size={20} />
//       </button>

//       <button
//         onClick={() => scroll("right")}
//         className="hidden md:flex absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white shadow-md border border-gray-200 w-10 h-10 rounded-full items-center justify-center hover:bg-[#d24a0f] hover:text-white transition"
//       >
//         <ChevronRight size={20} />
//       </button>

//       {/* Slider */}
//       <div
//         ref={scrollRef}
//         className="flex gap-4 overflow-x-auto pb-3 hide-scrollbar scroll-smooth"
//       >
//         {products.map((product) => (
//           <div
//             key={product.id}
//             className="min-w-[250px] bg-white rounded-3xl border border-[#f5e6dc] shadow-sm hover:shadow-lg transition-all flex-shrink-0 p-5"
//           >
//             {/* Optional Image (commented per your design) */}
//             {/* <div className="w-full h-32 rounded-xl overflow-hidden bg-gray-100 mb-3">
//               {product.image ? (
//                 <Image
//                   src={product.image}
//                   alt={product.name}
//                   width={200}
//                   height={200}
//                   className="w-full h-full object-cover"
//                 />
//               ) : (
//                 <div className="w-full h-full bg-gray-200" />
//               )}
//             </div> */}

//             {/* Name & Description */}
            
//             <h3
//   className={`${lato.className} font-bold text-[#000000] text-[18px] leading-tight tracking-wide`}
//   style={{
//     fontFamily: `'Lato', sans-serif`,
//   }}
// >
//   {product.name}
// </h3>
//             <p className="text-sm text-gray-600 mt-1 line-clamp-2 italic max-w-[250px] max-h-[50px]">
//               {product.productDesc || "Leckeres Gericht"}
//             </p>

//             {/* Price Row */}
//             <div className="mt-3 flex items-center justify-between">
//               <p className="text-base font-bold text-[#d24a0f] flex items-center gap-1">
//                 {product.discountPrice ? (
//                   <>
//                     <span className="line-through text-gray-400 text-sm">
//                       {product.price}€
//                     </span>
//                     {product.discountPrice}€
//                   </>
//                 ) : (
//                   <>
//                     {product.price}
//                     <MdOutlineEuro size={16} />
//                   </>
//                 )}
//               </p>

//               <IoMdInformationCircleOutline
//                 size={18}
//                 className="text-gray-400 hover:text-[#d24a0f] cursor-pointer"
//               />
//             </div>
//           </div>
//         ))}
//       </div>
//     </div>
//   );
// }
