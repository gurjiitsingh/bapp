"use client";

import { ProductType } from "@/lib/types/productType";

type Props = {
  product: ProductType;
  onClick?: () => void;
};

export default function PosProductCard({ product, onClick }: Props) {
  return (
    <button
      onClick={onClick}
      className="
        group
        relative
        w-full
        h-[110px]
    
        border
        border-slate-200/80
        bg-white
        text-left
        p-3.5
        shadow-xs
        hover:shadow-md
        hover:border-indigo-300
        active:scale-[0.98]
        transition-all
        duration-150
        flex
        flex-col
        justify-between
        overflow-hidden
        cursor-pointer
      "
    >
      {/* Top Bar: Title & Optional Indicator Dot */}
      <div className="flex items-start justify-between gap-1.5">
        <span className="text-[14px] font-bold text-slate-800 leading-snug line-clamp-2 group-hover:text-indigo-600 transition-colors">
          {product.name}
        </span>
        
        {/* Subtle accent indicator */}
        <span className="shrink-0 h-2 w-2 rounded-full bg-indigo-500/80 mt-1" />
      </div>

      {/* Bottom Bar: Price & Badge Status */}
      <div className="flex items-end justify-between mt-auto">
        <div className="flex items-baseline gap-0.5">
          <span className="text-xs font-semibold text-slate-500">₹</span>
          <span className="text-lg font-black text-slate-900 tracking-tight">
            {Number(product.price).toFixed(0)}
          </span>
        </div>

        {product.type === "variant" && (
          <span className="rounded-md bg-indigo-50 px-1.5 py-0.5 text-[10px] font-bold text-indigo-600 uppercase tracking-wider">
            Options
          </span>
        )}
      </div>
    </button>
  );
}