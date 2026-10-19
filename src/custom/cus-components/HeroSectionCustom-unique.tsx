"use client";

import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  Clock3,
  MapPin,
  ShoppingBag,
  Sparkles,
} from "lucide-react";

export default function FoodHero() {
  return (
    <section className="relative min-h-screen overflow-hidden bg-[#101828] text-[#FFF8ED]">
      {/* =====================================================
          BACKGROUND DECORATION
      ===================================================== */}

      <div className="pointer-events-none absolute -left-32 top-[-120px] h-[420px] w-[420px] rounded-full bg-[#C7F36B]/10 blur-3xl" />

      <div className="pointer-events-none absolute right-[-160px] bottom-[-180px] h-[520px] w-[520px] rounded-full bg-[#FF7058]/10 blur-3xl" />

      {/* =====================================================
          HEADER
      ===================================================== */}

      <header className="relative z-30 border-b border-white/10">
        <div className="mx-auto flex h-24 max-w-[1440px] items-center justify-between px-6 sm:px-10 lg:px-14">
          {/* =================================================
              BRAND
          ================================================= */}

          <Link
            href="/"
            className="group flex items-center gap-3"
          >
            <div className="flex h-11 w-11 rotate-[-6deg] items-center justify-center rounded-xl bg-[#C7F36B] text-[#101828] transition group-hover:rotate-0">
              <Sparkles size={20} strokeWidth={2.5} />
            </div>

            <div>
              <p className="text-lg font-black tracking-[-0.04em] text-white">
                Pizzeria
              </p>

              <p className="-mt-1 text-[9px] font-bold uppercase tracking-[0.28em] text-white/45">
                Milano Segle
              </p>
            </div>
          </Link>

          {/* =================================================
              NAVIGATION
          ================================================= */}

          <nav className="hidden items-center gap-9 md:flex">
            <Link
              href="/"
              className="text-sm font-bold text-[#C7F36B]"
            >
              Home
            </Link>

            <Link
              href="/menu"
              className="text-sm font-medium text-white/55 transition hover:text-[#C7F36B]"
            >
              Menu
            </Link>

            <Link
              href="/about"
              className="text-sm font-medium text-white/55 transition hover:text-[#C7F36B]"
            >
              About
            </Link>

            <Link
              href="/contact"
              className="text-sm font-medium text-white/55 transition hover:text-[#C7F36B]"
            >
              Contact
            </Link>
          </nav>

          {/* =================================================
              HEADER ACTIONS
          ================================================= */}

          <div className="flex items-center gap-3">
            <Link
              href="/cart"
              className="relative flex h-11 w-11 items-center justify-center rounded-full border border-white/15 text-white transition hover:border-[#C7F36B] hover:text-[#C7F36B]"
            >
              <ShoppingBag size={18} />

              <span className="absolute right-0 top-0 flex h-4 w-4 items-center justify-center rounded-full bg-[#FF7058] text-[8px] font-black text-white">
                2
              </span>
            </Link>

            <Link
              href="/menu"
              className="hidden items-center gap-2 rounded-full bg-[#C7F36B] px-6 py-3 text-sm font-black text-[#101828] transition hover:bg-white sm:flex"
            >
              Order Online
              <ArrowRight size={15} />
            </Link>
          </div>
        </div>
      </header>

      {/* =====================================================
          HERO
      ===================================================== */}

      <div className="relative z-10 mx-auto max-w-[1440px] px-6 sm:px-10 lg:px-14">
        <div className="grid min-h-[calc(100vh-96px)] items-center lg:grid-cols-[0.9fr_1.1fr]">
          {/* =================================================
              LEFT CONTENT
          ================================================= */}

          <div className="relative z-20 py-14 lg:py-20">
            {/* Small label */}
            <div className="mb-8 flex items-center gap-3">
              <span className="h-2 w-2 rounded-full bg-[#C7F36B]" />

              <span className="text-[10px] font-bold uppercase tracking-[0.32em] text-white/50">
                Fresh · Bold · Delicious
              </span>
            </div>

            {/* =================================================
                MAIN HEADING
            ================================================= */}

            <h1 className="max-w-[720px] text-[clamp(4rem,8vw,8.5rem)] font-black leading-[0.78] tracking-[-0.075em]">
              Pizzeria
              <br />

              <span className="text-[#C7F36B]">
                Milano
              </span>

              <br />

              <span className="text-[#FF7058]">
                Segle
              </span>
            </h1>

            {/* Description */}
            <p className="mt-9 max-w-md text-base leading-7 text-white/55 sm:text-lg">
              Freshly prepared food, bold flavours and satisfying
              bites made for every kind of craving.
            </p>

            {/* =================================================
                ACTIONS
            ================================================= */}

            <div className="mt-9 flex flex-wrap items-center gap-4">
              <Link
                href="/menu"
                className="group inline-flex items-center gap-4 rounded-full bg-[#C7F36B] px-7 py-4 text-sm font-black text-[#101828] transition hover:bg-white"
              >
                Explore Menu

                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#101828]/10 transition group-hover:translate-x-1">
                  <ArrowRight size={15} />
                </span>
              </Link>

              <Link
                href="/contact"
                className="inline-flex items-center gap-2 rounded-full border border-white/15 px-6 py-4 text-sm font-bold text-white transition hover:border-[#C7F36B] hover:text-[#C7F36B]"
              >
                Find Us
                <ArrowUpRight size={16} />
              </Link>
            </div>

            {/* =================================================
                INFORMATION ROW
            ================================================= */}

            <div className="mt-14 flex flex-wrap gap-x-10 gap-y-6 border-t border-white/10 pt-7">
              <div className="flex items-center gap-3">
                <MapPin
                  size={17}
                  className="text-[#FF7058]"
                />

                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.18em] text-white/40">
                    Location
                  </p>

                  <p className="mt-1 text-xs font-semibold text-white/75">
                    Rainham, London
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Clock3
                  size={17}
                  className="text-[#C7F36B]"
                />

                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.18em] text-white/40">
                    Open Today
                  </p>

                  <p className="mt-1 text-xs font-semibold text-white/75">
                    12pm — 11pm
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* =================================================
              RIGHT VISUAL
          ================================================= */}

          <div className="relative min-h-[560px] lg:min-h-[760px]">
            {/* =================================================
                GIANT LIME CIRCLE
            ================================================= */}

            <div className="absolute right-[-10%] top-1/2 h-[460px] w-[460px] -translate-y-1/2 rounded-full bg-[#C7F36B] sm:h-[560px] sm:w-[560px] lg:h-[700px] lg:w-[700px]" />

            {/* Coral accent */}
            <div className="absolute bottom-[13%] left-[12%] h-24 w-24 rounded-full bg-[#FF7058] sm:h-32 sm:w-32" />

            {/* =================================================
                IMAGE FRAME
            ================================================= */}

            <div className="absolute left-[3%] top-1/2 z-10 w-[94%] -translate-y-1/2 sm:left-[6%] sm:w-[90%]">
              <div className="relative rotate-[-4deg] overflow-hidden rounded-[42px] border-[10px] border-[#101828] shadow-[0_40px_80px_rgba(0,0,0,0.35)]">
                <Image
                  src="/images/hero-14.jpg"
                  alt="Fresh food from Pizzeria Milano Segle"
                  width={1100}
                  height={1100}
                  priority
                  className="h-auto w-full object-cover"
                />

                {/* Image overlay */}
                <div className="absolute inset-0 bg-[#101828]/5" />
              </div>
            </div>

            {/* =================================================
                LARGE TEXT OVER IMAGE
            ================================================= */}

            <div className="absolute right-[2%] top-[8%] z-20 max-w-[300px] sm:right-[5%] lg:right-[2%]">
              <p className="mb-3 text-right text-[10px] font-black uppercase tracking-[0.3em] text-[#101828]/55">
                Made to crave
              </p>

              <h2 className="text-right text-[clamp(2.8rem,5vw,5.4rem)] font-black leading-[0.8] tracking-[-0.07em] text-[#101828]">
                Good
                <br />

                <span className="text-[#FF7058]">
                  food
                </span>

                <br />

                only.
              </h2>
            </div>

            {/* =================================================
                STICKER
            ================================================= */}

            <div className="absolute left-[2%] top-[18%] z-30 flex h-24 w-24 rotate-[-12deg] items-center justify-center rounded-full bg-[#FF7058] text-center shadow-xl sm:h-28 sm:w-28">
              <div>
                <p className="text-[9px] font-black uppercase tracking-[0.12em] text-white">
                  Fresh
                </p>

                <p className="mt-1 text-[9px] font-black uppercase tracking-[0.12em] text-white">
                  Every
                </p>

                <p className="text-[9px] font-black uppercase tracking-[0.12em] text-white">
                  Day
                </p>
              </div>
            </div>

            {/* =================================================
                ORDER CIRCLE
            ================================================= */}

            <Link
              href="/menu"
              className="absolute bottom-[8%] right-[3%] z-30 flex h-28 w-28 items-center justify-center rounded-full bg-[#101828] text-center text-[10px] font-black uppercase leading-4 tracking-[0.12em] text-white shadow-2xl transition hover:bg-[#FF7058] sm:h-32 sm:w-32"
            >
              <span>
                Order
                <br />
                Something
                <br />
                Delicious
              </span>

              <ArrowRight
                size={15}
                className="absolute bottom-7 right-7"
              />
            </Link>

            {/* =================================================
                IMAGE CAPTION
            ================================================= */}

            <div className="absolute bottom-[4%] left-[8%] z-20 hidden sm:block">
              <div className="flex items-center gap-3">
                <span className="h-2 w-2 rounded-full bg-[#C7F36B]" />

                <p className="text-[9px] font-black uppercase tracking-[0.28em] text-white/55">
                  Pizzeria Milano Segle
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* =====================================================
          BOTTOM BRAND STRIP
      ===================================================== */}

      <div className="relative z-30 overflow-hidden border-t border-white/10 bg-[#C7F36B]">
        <div className="flex min-w-max items-center gap-8 px-6 py-4 text-[10px] font-black uppercase tracking-[0.3em] text-[#101828]">
          <span>Freshly Made</span>

          <span>✦</span>

          <span>Big Flavours</span>

          <span>✦</span>

          <span>Handcrafted</span>

          <span>✦</span>

          <span>Good Food</span>

          <span>✦</span>

          <span>Made Fresh</span>

          <span>✦</span>

          <span>Big Flavours</span>

          <span>✦</span>

          <span>Handcrafted</span>

          <span>✦</span>
        </div>
      </div>
    </section>
  );
}