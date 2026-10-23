"use client";

import Image from "next/image";
import { FaFire, FaStar } from "react-icons/fa";
import { Chicle } from "next/font/google";
import Link from "next/link";

const chicle = Chicle({
  subsets: ["latin"],
  weight: "400",
});

export default function HeroSectionCustom() {
  return (
    <section className="relative isolate min-h-[95vh] w-full overflow-hidden">
      {/* Background image: never intercept taps */}
      <Image
        src="/images/hero-15.jpg"
        alt="Food background"
        fill
        priority
        sizes="100vw"
        className="pointer-events-none z-0 scale-110 object-cover"
      />

      {/* Decorative overlays: never intercept taps */}
      <div className="pointer-events-none absolute inset-0 z-[1] bg-[radial-gradient(circle_at_30%_40%,rgba(0,0,0,0.2),rgba(0,0,0,0.85))]" />

      <div className="pointer-events-none absolute inset-0 z-[2] bg-gradient-to-t from-black/80 via-transparent to-transparent" />

      <div className="pointer-events-none absolute inset-0 z-[3] bg-gradient-to-r from-black/70 via-transparent to-black/40" />

      {/* Glow accent */}
      <div className="pointer-events-none absolute left-10 top-32 z-[4] h-72 w-72 rounded-full bg-[#ea9244]/30 blur-3xl" />

      {/* Main content */}
      <div className="relative z-20 mx-auto flex min-h-[95vh] max-w-7xl items-center px-6 py-20 md:px-12">
        <div className="max-w-2xl text-white">
          {/* Tag */}
          <div className="mb-4 flex items-center gap-2 text-sm text-[#ea9244]">
            <FaFire aria-hidden="true" />
            <span>Trending Now</span>
          </div>

          {/* Title */}
          <h1
            className={`${chicle.className} mb-6 text-5xl leading-tight md:text-7xl`}
          >
            Food App
          </h1>

          {/* Subtitle */}
          <p className="mb-8 max-w-lg text-sm text-white/80 md:text-base">
            From rich curries to sizzling delights — experience food
            that excites every bite.
          </p>

          {/* Buttons: explicitly above every decorative layer */}
          <div className="relative z-30 flex flex-wrap gap-4">
            <Link
              href="/#order_now"
              className="relative z-30 inline-flex min-h-12 touch-manipulation items-center justify-center rounded-full bg-[#ea9244] px-7 py-3 text-sm font-semibold text-white shadow-xl transition-colors hover:bg-[#ff7b00] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#ea9244]"
            >
              🍴 Order Now
            </Link>

            <Link
              href="/menu"
              className="relative z-30 inline-flex min-h-12 touch-manipulation items-center justify-center rounded-full border border-white/40 px-7 py-3 text-sm font-semibold text-white transition-colors hover:bg-white hover:text-black focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
            >
              Explore Menu
            </Link>
          </div>
        </div>
      </div>

      {/* Floating card: decorative, so it must not capture touches */}
      <div className="pointer-events-none absolute bottom-6 right-4 z-10 flex items-center gap-3 rounded-2xl bg-white/90 px-5 py-3 shadow-2xl backdrop-blur-md md:bottom-10 md:right-16">
        <FaStar aria-hidden="true" className="shrink-0 text-yellow-500" />

        <div className="text-sm">
          <p className="font-semibold text-black">Top Rated Dish</p>
          <p className="text-xs text-gray-600">Loved by customers</p>
        </div>
      </div>
    </section>
  );
}
