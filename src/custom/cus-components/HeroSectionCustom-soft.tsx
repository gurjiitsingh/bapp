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
    <section className="relative min-h-screen overflow-hidden bg-[#FFF9F6] text-[#241329]">
      {/* =====================================================
          BACKGROUND
      ===================================================== */}

      <div className="pointer-events-none absolute left-[-180px] top-[-160px] h-[500px] w-[500px] rounded-full bg-[#E9D5FF]/60 blur-3xl" />

      <div className="pointer-events-none absolute bottom-[-200px] right-[-160px] h-[500px] w-[500px] rounded-full bg-[#FFD8C8]/50 blur-3xl" />

      {/* =====================================================
          HEADER
      ===================================================== */}

      <header className="relative z-30">
        <div className="mx-auto flex h-24 max-w-[1440px] items-center justify-between px-6 sm:px-10 lg:px-14">
          {/* Brand */}
          <Link
            href="/"
            className="group flex items-center gap-3"
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-[14px] bg-[#241329] text-[#E9D5FF] transition group-hover:rotate-6">
              <Sparkles size={19} />
            </div>

            <div>
              <p className="text-lg font-black tracking-[-0.05em]">
                Pizzeria
              </p>

              <p className="-mt-1 text-[9px] font-bold uppercase tracking-[0.3em] text-[#241329]/45">
                Milano Segle
              </p>
            </div>
          </Link>

          {/* Navigation */}
          <nav className="hidden items-center gap-9 lg:flex">
            <Link
              href="/"
              className="text-sm font-bold text-[#7C3AED]"
            >
              Home
            </Link>

            <Link
              href="/menu"
              className="text-sm font-medium text-[#241329]/55 transition hover:text-[#7C3AED]"
            >
              Menu
            </Link>

            <Link
              href="/about"
              className="text-sm font-medium text-[#241329]/55 transition hover:text-[#7C3AED]"
            >
              About
            </Link>

            <Link
              href="/contact"
              className="text-sm font-medium text-[#241329]/55 transition hover:text-[#7C3AED]"
            >
              Contact
            </Link>
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-3">
            <Link
              href="/cart"
              className="relative flex h-11 w-11 items-center justify-center rounded-full border border-[#241329]/10 bg-white text-[#241329] shadow-sm transition hover:border-[#7C3AED]/40 hover:text-[#7C3AED]"
            >
              <ShoppingBag size={18} />

              <span className="absolute right-0 top-0 flex h-4 w-4 items-center justify-center rounded-full bg-[#7C3AED] text-[8px] font-black text-white">
                2
              </span>
            </Link>

            <Link
              href="/menu"
              className="hidden rounded-full bg-[#241329] px-6 py-3 text-sm font-bold text-white transition hover:bg-[#7C3AED] sm:block"
            >
              Order Online
            </Link>
          </div>
        </div>
      </header>

      {/* =====================================================
          HERO
      ===================================================== */}

      <div className="relative z-10 mx-auto max-w-[1440px] px-6 sm:px-10 lg:px-14">
        <div className="grid min-h-[calc(100vh-96px)] items-center gap-8 lg:grid-cols-[0.82fr_1.18fr]">
          {/* =================================================
              LEFT
          ================================================= */}

          <div className="relative z-20 py-14 lg:py-20">
            {/* Eyebrow */}
            <div className="mb-8 flex items-center gap-3">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#E9D5FF] text-[#7C3AED]">
                <Sparkles size={13} />
              </span>

              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-[#241329]/50">
                Freshly made every day
              </span>
            </div>

            {/* Main heading */}
            <h1 className="max-w-[700px] text-[clamp(4rem,8vw,8.2rem)] font-black leading-[0.78] tracking-[-0.08em]">
              Pizzeria
              <br />

              <span className="text-[#7C3AED]">
                Milano
              </span>

              <br />

              <span className="font-medium italic">
                Segle.
              </span>
            </h1>

            {/* Description */}
            <p className="mt-9 max-w-md text-base leading-7 text-[#241329]/55 sm:text-lg">
              Fresh ingredients, delicious flavours and handcrafted
              food prepared for every craving. Order your favourites
              today.
            </p>

            {/* Buttons */}
            <div className="mt-9 flex flex-wrap items-center gap-4">
              <Link
                href="/menu"
                className="group inline-flex items-center gap-4 rounded-full bg-[#7C3AED] px-7 py-4 text-sm font-bold text-white shadow-lg shadow-purple-200 transition hover:-translate-y-0.5 hover:bg-[#6D28D9]"
              >
                Explore Menu

                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white/15 transition group-hover:translate-x-1">
                  <ArrowRight size={15} />
                </span>
              </Link>

              <Link
                href="/contact"
                className="inline-flex items-center gap-2 rounded-full border border-[#241329]/10 bg-white px-6 py-4 text-sm font-bold text-[#241329] transition hover:border-[#7C3AED]/30 hover:text-[#7C3AED]"
              >
                Find Us
                <ArrowUpRight size={15} />
              </Link>
            </div>

            {/* =================================================
                INFO
            ================================================= */}

            <div className="mt-14 flex flex-wrap gap-x-10 gap-y-6 border-t border-[#241329]/10 pt-7">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#E9D5FF] text-[#7C3AED]">
                  <MapPin size={15} />
                </div>

                <div>
                  <p className="text-[9px] font-black uppercase tracking-[0.18em] text-[#241329]/40">
                    Visit Us
                  </p>

                  <p className="mt-1 text-xs font-bold">
                    Rainham, London
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#FFD8C8] text-[#241329]">
                  <Clock3 size={15} />
                </div>

                <div>
                  <p className="text-[9px] font-black uppercase tracking-[0.18em] text-[#241329]/40">
                    Open Today
                  </p>

                  <p className="mt-1 text-xs font-bold">
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
                MAIN LAVENDER SHAPE
            ================================================= */}

            <div className="absolute right-[-7%] top-1/2 h-[460px] w-[460px] -translate-y-1/2 rounded-[45%_55%_52%_48%] bg-[#E9D5FF] sm:h-[570px] sm:w-[570px] lg:h-[700px] lg:w-[700px]" />

            {/* Peach shape */}
            <div className="absolute bottom-[10%] left-[4%] h-32 w-32 rounded-full bg-[#FFD8C8] sm:h-40 sm:w-40" />

            {/* Small purple dot */}
            <div className="absolute left-[16%] top-[18%] h-4 w-4 rounded-full bg-[#7C3AED]" />

            {/* =================================================
                FOOD IMAGE
            ================================================= */}

            <div className="absolute left-[2%] top-1/2 z-10 w-[96%] -translate-y-1/2 sm:left-[5%] sm:w-[92%] lg:left-[2%]">
              <div className="relative overflow-hidden rounded-[50px] shadow-[0_35px_70px_rgba(36,19,41,0.20)]">
                <Image
                  src="/images/hero-14.jpg"
                  alt="Fresh food from Pizzeria Milano Segle"
                  width={1100}
                  height={1100}
                  priority
                  className="h-auto w-full object-cover"
                />
              </div>
            </div>

            {/* =================================================
                TEXT OVER IMAGE
            ================================================= */}

            <div className="absolute right-[5%] top-[8%] z-20 max-w-[320px]">
              <p className="mb-3 text-right text-[9px] font-black uppercase tracking-[0.3em] text-[#241329]/45">
                Taste something special
              </p>

              <h2 className="text-right text-[clamp(2.8rem,5vw,5.2rem)] font-black leading-[0.8] tracking-[-0.07em] text-[#241329]">
                Good
                <br />

                <span className="text-[#7C3AED]">
                  food.
                </span>

                <br />

                Good mood.
              </h2>
            </div>

            {/* =================================================
                PEACH STICKER
            ================================================= */}

            <div className="absolute left-[1%] top-[22%] z-30 flex h-24 w-24 rotate-[-10deg] items-center justify-center rounded-full bg-[#FFD8C8] shadow-lg sm:h-28 sm:w-28">
              <div className="text-center">
                <p className="text-[9px] font-black uppercase tracking-[0.14em] text-[#241329]">
                  Fresh
                </p>

                <p className="mt-1 text-[9px] font-black uppercase tracking-[0.14em] text-[#241329]">
                  Handmade
                </p>

                <p className="mt-1 text-[9px] font-black uppercase tracking-[0.14em] text-[#7C3AED]">
                  Daily
                </p>
              </div>
            </div>

            {/* =================================================
                ORDER BUTTON
            ================================================= */}

            <Link
              href="/menu"
              className="absolute bottom-[8%] right-[4%] z-30 flex h-28 w-28 items-center justify-center rounded-full bg-[#241329] text-center text-[10px] font-black uppercase leading-4 tracking-[0.12em] text-white shadow-2xl transition hover:scale-105 hover:bg-[#7C3AED] sm:h-32 sm:w-32"
            >
              <span>
                Order
                <br />
                Your
                <br />
                Favourites
              </span>

              <ArrowRight
                size={15}
                className="absolute bottom-7 right-7"
              />
            </Link>

            {/* =================================================
                IMAGE LABEL
            ================================================= */}

            <div className="absolute bottom-[5%] left-[8%] z-20 hidden sm:block">
              <div className="flex items-center gap-3">
                <span className="h-2 w-2 rounded-full bg-[#7C3AED]" />

                <p className="text-[9px] font-black uppercase tracking-[0.28em] text-[#241329]/45">
                  Pizzeria Milano Segle
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* =====================================================
          BOTTOM STRIP
      ===================================================== */}

      <div className="relative z-30 overflow-hidden bg-[#241329]">
        <div className="flex min-w-max items-center gap-9 px-6 py-4 text-[10px] font-black uppercase tracking-[0.3em] text-[#E9D5FF]">
          <span>Fresh Ingredients</span>
          <span className="text-[#FFD8C8]">✦</span>

          <span>Handcrafted Food</span>
          <span className="text-[#FFD8C8]">✦</span>

          <span>Made With Love</span>
          <span className="text-[#FFD8C8]">✦</span>

          <span>Italian Flavours</span>
          <span className="text-[#FFD8C8]">✦</span>

          <span>Fresh Ingredients</span>
          <span className="text-[#FFD8C8]">✦</span>

          <span>Handcrafted Food</span>
          <span className="text-[#FFD8C8]">✦</span>

          <span>Made With Love</span>
          <span className="text-[#FFD8C8]">✦</span>
        </div>
      </div>
    </section>
  );
}