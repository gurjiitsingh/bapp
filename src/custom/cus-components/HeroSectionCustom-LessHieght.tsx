 
"use client";

import Image from "next/image";
import { Chicle } from "next/font/google";
import Link from "next/link";

const chicle = Chicle({
  subsets: ["latin"],
  weight: "400",
});

export default function HeroSectionLuxuryMinimal() {
  return (
    <section className="relative w-full min-h-[88vh] md:min-h-[92vh] overflow-hidden bg-[#2b2e4a]">
      {/* =====================================================
          BACKGROUND IMAGE
      ====================================================== */}
      <Image
        src="/images/hero-14.jpg"
        alt="Pizzeria Milano Segle"
        fill
        priority
        sizes="100vw"
        className="object-cover scale-[1.02]"
      />

      {/* =====================================================
          MODERN GRADIENT OVERLAY
      ====================================================== */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/40 to-black/70" />

      {/* Soft warm glow */}
      <div className="absolute -left-20 top-1/4 h-72 w-72 rounded-full bg-[#ea9244]/10 blur-3xl" />

      {/* =====================================================
          CONTENT
      ====================================================== */}
      <div className="relative z-10 flex min-h-[88vh] md:min-h-[92vh] items-center justify-center px-5 py-20 sm:px-8">
        <div className="w-full max-w-4xl text-center">

          {/* Small eyebrow */}
          <div className="mb-5 flex items-center justify-center gap-3">
            <span className="h-px w-8 bg-[#ea9244]" />

            <span className="text-[10px] font-medium uppercase tracking-[0.35em] text-white/75 sm:text-xs">
              Authentic Italian Taste
            </span>

            <span className="h-px w-8 bg-[#ea9244]" />
          </div>

          {/* Main title */}
          <h1
            className={`${chicle.className} text-6xl leading-[0.95] text-white sm:text-7xl md:text-8xl lg:text-9xl`}
          >
            Pizzeria
            <span className="block text-[#ea9244]">
              Milano Segle
            </span>
          </h1>

          {/* Decorative divider */}
          <div className="mx-auto my-7 flex items-center justify-center gap-3">
            <span className="h-px w-12 bg-white/25 sm:w-16" />

            <span className="h-1.5 w-1.5 rotate-45 bg-[#ea9244]" />

            <span className="h-px w-12 bg-white/25 sm:w-16" />
          </div>

          {/* Description */}
          <p className="mx-auto max-w-xl text-sm leading-7 text-white/80 sm:text-base sm:leading-8 md:text-lg">
            Authentic Italian flavours, handcrafted with passion
            and served in a warm, modern atmosphere.
          </p>

          {/* =====================================================
              ACTION BUTTONS
          ====================================================== */}
          <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">

            {/* Primary */}
            <Link
              href="/#order_now"
              className="
                group
                flex
                min-w-[180px]
                items-center
                justify-center
                rounded-full
                bg-[#ea9244]
                px-7
                py-3.5
                text-sm
                font-medium
                uppercase
                tracking-[0.14em]
                text-white
                shadow-lg
                shadow-black/20
                transition-all
                duration-300
                hover:-translate-y-0.5
                hover:bg-[#f0a05b]
                hover:shadow-xl
              "
            >
              Order Now

              <span className="ml-2 transition-transform duration-300 group-hover:translate-x-1">
                →
              </span>
            </Link>

            {/* Secondary */}
            <Link
              href="/menu"
              className="
                flex
                min-w-[180px]
                items-center
                justify-center
                rounded-full
                border
                border-white/40
                bg-white/10
                px-7
                py-3.5
                text-sm
                font-medium
                uppercase
                tracking-[0.14em]
                text-white
                backdrop-blur-md
                transition-all
                duration-300
                hover:border-white
                hover:bg-white
                hover:text-[#2b2e4a]
              "
            >
              View Menu
            </Link>
          </div>

          {/* =====================================================
              BOTTOM INFO
          ====================================================== */}
          <div className="mt-12 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-[10px] uppercase tracking-[0.2em] text-white/55 sm:text-xs">
            <span>Fresh Ingredients</span>

            <span className="hidden h-1 w-1 rounded-full bg-[#ea9244] sm:block" />

            <span>Handcrafted Daily</span>

            <span className="hidden h-1 w-1 rounded-full bg-[#ea9244] sm:block" />

            <span>Italian Inspired</span>
          </div>
        </div>
      </div>

      {/* =====================================================
          BOTTOM FADE
      ====================================================== */}
      <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-[#2b2e4a]/50 to-transparent" />
    </section>
  );
}
 
