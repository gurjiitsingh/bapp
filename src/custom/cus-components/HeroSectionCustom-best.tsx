"use client";

import Image from "next/image";
import Link from "next/link";
import {
  ArrowDownRight,
  ArrowRight,
  Clock3,
  MapPin,
  ShoppingBag,
} from "lucide-react";

export default function FoodHero() {
  return (
    <section className="relative min-h-screen overflow-hidden bg-[#F8F1E7] text-[#241815]">
      {/* =====================================================
          BACKGROUND DETAILS
      ===================================================== */}

      <div className="pointer-events-none absolute -right-40 top-[-180px] h-[520px] w-[520px] rounded-full bg-[#E8D8C5]/60 blur-3xl" />

      <div className="pointer-events-none absolute bottom-[-220px] left-[-160px] h-[500px] w-[500px] rounded-full bg-[#E5D8C8]/50 blur-3xl" />

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
            <div className="flex h-12 w-12 items-center justify-center rounded-full border border-[#241815]/15 text-[#C9412B] transition group-hover:rotate-6">
              <span className="text-xl">✦</span>
            </div>

            <div>
              <p className="text-lg font-black tracking-[-0.04em]">
                Pizzeria
              </p>

              <p className="-mt-1 text-[10px] font-semibold uppercase tracking-[0.28em] text-[#241815]/50">
                Milano Segle
              </p>
            </div>
          </Link>

          {/* Center navigation */}
          <nav className="hidden items-center gap-10 lg:flex">
            <Link
              href="/"
              className="text-sm font-semibold text-[#C9412B]"
            >
              Home
            </Link>

            <Link
              href="/menu"
              className="text-sm font-medium text-[#241815]/60 transition hover:text-[#C9412B]"
            >
              Our Menu
            </Link>

            <Link
              href="/about"
              className="text-sm font-medium text-[#241815]/60 transition hover:text-[#C9412B]"
            >
              Our Story
            </Link>

            <Link
              href="/contact"
              className="text-sm font-medium text-[#241815]/60 transition hover:text-[#C9412B]"
            >
              Contact
            </Link>
          </nav>

          {/* Right */}
          <div className="flex items-center gap-3">
            <Link
              href="/cart"
              className="relative flex h-11 w-11 items-center justify-center rounded-full border border-[#241815]/15 bg-white/50 transition hover:border-[#C9412B] hover:text-[#C9412B]"
            >
              <ShoppingBag size={18} />

              <span className="absolute right-0 top-0 flex h-4 w-4 items-center justify-center rounded-full bg-[#C9412B] text-[8px] font-bold text-white">
                2
              </span>
            </Link>

            <Link
              href="/menu"
              className="hidden rounded-full bg-[#241815] px-6 py-3 text-sm font-bold text-white transition hover:bg-[#C9412B] sm:block"
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
        <div className="grid min-h-[calc(100vh-96px)] items-center lg:grid-cols-[0.8fr_1.2fr]">
          {/* =================================================
              LEFT CONTENT
          ================================================= */}

          <div className="relative z-20 py-12 lg:py-20">
            {/* Eyebrow */}
            <div className="mb-8 flex items-center gap-4">
              <span className="h-px w-12 bg-[#C9412B]" />

              <span className="text-xs font-bold uppercase tracking-[0.28em] text-[#C9412B]">
                Authentic Italian Taste
              </span>
            </div>

            {/* Main heading */}
            <h1 className="max-w-3xl text-[clamp(4.2rem,8vw,8.5rem)] font-black leading-[0.82] tracking-[-0.075em]">
              Pizzeria
              <br />

              <span className="text-[#C9412B]">
                Milano
              </span>

              <br />

              <span className="italic font-medium">
                Segle.
              </span>
            </h1>

            {/* Description */}
            <p className="mt-9 max-w-md text-base leading-7 text-[#241815]/60 sm:text-lg">
              Freshly prepared pizzas, bold Italian flavours and
              delicious food made with care. Come hungry, leave happy.
            </p>

            {/* Actions */}
            <div className="mt-9 flex flex-wrap items-center gap-4">
              <Link
                href="/menu"
                className="group inline-flex items-center gap-4 rounded-full bg-[#C9412B] px-7 py-4 text-sm font-bold text-white transition hover:bg-[#A93422]"
              >
                Explore Menu

                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white/15 transition group-hover:translate-x-1">
                  <ArrowRight size={15} />
                </span>
              </Link>

              <Link
                href="/contact"
                className="inline-flex items-center gap-2 px-3 py-3 text-sm font-bold text-[#241815] transition hover:text-[#C9412B]"
              >
                Find Us
                <ArrowDownRight size={16} />
              </Link>
            </div>

            {/* =================================================
                INFO
            ================================================= */}

            <div className="mt-14 flex flex-wrap gap-x-10 gap-y-5 border-t border-[#241815]/10 pt-7">
              {/* Location */}
              <div className="flex items-start gap-3">
                <MapPin
                  size={17}
                  className="mt-0.5 text-[#C9412B]"
                />

                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.12em]">
                    Visit Us
                  </p>

                  <p className="mt-1 text-xs text-[#241815]/50">
                    Rainham, London
                  </p>
                </div>
              </div>

              {/* Opening */}
              <div className="flex items-start gap-3">
                <Clock3
                  size={17}
                  className="mt-0.5 text-[#C9412B]"
                />

                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.12em]">
                    Open Today
                  </p>

                  <p className="mt-1 text-xs text-[#241815]/50">
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
            {/* Vertical label */}
            <div className="absolute left-0 top-1/2 z-20 hidden -translate-y-1/2 lg:block">
              <p className="rotate-[-90deg] whitespace-nowrap text-[10px] font-bold uppercase tracking-[0.4em] text-[#241815]/35">
                Fresh · Handmade · Italian
              </p>
            </div>

            {/* Main visual shape */}
            <div className="absolute right-[-8%] top-1/2 h-[470px] w-[470px] -translate-y-1/2 rounded-[48%_52%_45%_55%] bg-[#D94D35] sm:h-[570px] sm:w-[570px] lg:h-[700px] lg:w-[700px]" />

            {/* Secondary circle */}
            <div className="absolute bottom-[8%] left-[12%] h-28 w-28 rounded-full border border-[#241815]/15" />

            <div className="absolute bottom-[13%] left-[17%] h-3 w-3 rounded-full bg-[#C9412B]" />

            {/* Food image */}
            <div className="absolute left-[5%] top-1/2 z-10 w-[95%] -translate-y-1/2 sm:left-[7%] sm:w-[92%] lg:left-[4%] lg:w-[94%]">
              <Image
                src="/images/hero-14.jpg"
                alt="Fresh pizza and food at Pizzeria Milano Segle"
                width={1100}
                height={1100}
                priority
                className="h-auto w-full object-contain drop-shadow-[0_40px_35px_rgba(36,24,21,0.28)]"
              />
            </div>

            {/* =================================================
                TEXT OVER IMAGE
            ================================================= */}

            <div className="absolute right-[4%] top-[10%] z-20 max-w-[300px] sm:right-[7%] lg:right-[5%]">
              <p className="mb-3 text-right text-[10px] font-bold uppercase tracking-[0.3em] text-white/75">
                Made for sharing
              </p>

              <h2 className="text-right text-[clamp(2.8rem,5vw,5.2rem)] font-black leading-[0.83] tracking-[-0.065em] text-white">
                Good
                <br />

                <span className="italic font-medium">
                  food.
                </span>
              </h2>
            </div>

            {/* =================================================
                ROUND ORDER BUTTON
            ================================================= */}

            <Link
              href="/menu"
              className="absolute bottom-[10%] right-[4%] z-30 flex h-28 w-28 rotate-[-8deg] items-center justify-center rounded-full bg-[#241815] text-center text-[11px] font-bold uppercase leading-4 tracking-[0.08em] text-white shadow-2xl transition hover:rotate-0 hover:bg-[#C9412B] sm:h-32 sm:w-32"
            >
              Order
              <br />
              Your
              <br />
              Pizza
              <ArrowRight
                size={14}
                className="absolute bottom-7 right-7"
              />
            </Link>

            {/* =================================================
                IMAGE CAPTION
            ================================================= */}

            <div className="absolute bottom-[4%] left-[7%] z-20 hidden sm:block">
              <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#241815]/45">
                Pizzeria Milano Segle
              </p>

              <div className="mt-2 h-px w-20 bg-[#C9412B]" />
            </div>
          </div>
        </div>
      </div>

      {/* =====================================================
          BOTTOM MARQUEE
      ===================================================== */}

      <div className="relative z-20 overflow-hidden border-t border-[#241815]/10 bg-[#241815]">
        <div className="flex min-w-max items-center gap-10 px-6 py-4 text-[10px] font-bold uppercase tracking-[0.3em] text-[#F8F1E7]/70">
          <span>Freshly Made</span>
          <span className="text-[#C9412B]">✦</span>

          <span>Authentic Flavours</span>
          <span className="text-[#C9412B]">✦</span>

          <span>Handcrafted Pizza</span>
          <span className="text-[#C9412B]">✦</span>

          <span>Made With Love</span>
          <span className="text-[#C9412B]">✦</span>

          <span>Freshly Made</span>
          <span className="text-[#C9412B]">✦</span>

          <span>Authentic Flavours</span>
          <span className="text-[#C9412B]">✦</span>

          <span>Handcrafted Pizza</span>
          <span className="text-[#C9412B]">✦</span>
        </div>
      </div>
    </section>
  );
}