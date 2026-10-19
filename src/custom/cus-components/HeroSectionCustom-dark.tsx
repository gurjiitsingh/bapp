"use client";

import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  Check,
  Clock3,
  Leaf,
  ShieldCheck,
  ShoppingBag,
  Star,
} from "lucide-react";
import Cart from "./cart";

export default function FoodHero() {
  return (
    <section className="relative overflow-hidden bg-[#15110F] pt-12 text-[#FFF8F0]">
      {/* =========================================================
          Decorative Background
      ========================================================= */}

      <div className="pointer-events-none absolute -left-40 top-20 h-96 w-96 rounded-full bg-[#5A3218]/40 blur-3xl" />

      <div className="pointer-events-none absolute right-[-180px] top-[-120px] h-[520px] w-[520px] rounded-full bg-[#7A461F]/25 blur-3xl" />

      <div className="pointer-events-none absolute bottom-[-180px] left-[35%] h-[400px] w-[400px] rounded-full bg-orange-500/5 blur-3xl" />

      {/* =========================================================
          Header
      ========================================================= */}

      <header className="relative z-20">
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-5 sm:px-8 lg:px-10">
          {/* Logo */}

          <Link href="/" className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#F59E45] text-[#15110F] shadow-lg shadow-orange-950/30">
              <ShoppingBag size={22} strokeWidth={2.2} />
            </div>

            <div>
              <div className="text-xl font-black tracking-tight text-[#FFF8F0]">
                Pizzeria
              </div>

              <div className="hidden text-[9px] font-semibold uppercase tracking-[0.22em] text-[#B8AAA0] sm:block">
                Fresh food · Happy mood
              </div>
            </div>
          </Link>

          {/* =====================================================
              Desktop navigation
          ===================================================== */}

          {/*
          <nav className="hidden items-center gap-9 md:flex">
            <Link
              href="/"
              className="relative text-sm font-semibold text-[#F59E45]"
            >
              Home

              <span className="absolute -bottom-3 left-0 h-0.5 w-full rounded-full bg-[#F59E45]" />
            </Link>

            <Link
              href="/menu"
              className="text-sm font-medium text-[#B8AAA0] transition hover:text-[#F59E45]"
            >
              Menu
            </Link>

            <Link
              href="/about"
              className="text-sm font-medium text-[#B8AAA0] transition hover:text-[#F59E45]"
            >
              About
            </Link>

            <Link
              href="/contact"
              className="text-sm font-medium text-[#B8AAA0] transition hover:text-[#F59E45]"
            >
              Contact
            </Link>
          </nav>
          */}

          {/* Right */}

          <div className="flex items-center gap-3">
            <Cart />

            <Link
              href="/#order_now"
              className="
                hidden
                items-center
                gap-2
                rounded-full
                bg-[#F59E45]
                px-6
                py-3
                text-sm
                font-bold
                text-[#15110F]
                shadow-lg
                shadow-orange-950/30
                transition
                hover:-translate-y-0.5
                hover:bg-[#FFB35F]
                sm:flex
              "
            >
              Order Now
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </header>

      {/* =========================================================
          Hero
      ========================================================= */}

      <div className="relative z-10 mx-auto max-w-7xl px-5 pb-14 pt-8 sm:px-8 lg:px-10 lg:pb-20 lg:pt-10">
        <div className="grid min-h-[650px] items-center gap-12 lg:grid-cols-[0.92fr_1.08fr]">
          {/* =====================================================
              Left Content
          ===================================================== */}

          <div className="relative z-10 max-w-xl">
            {/* Badge */}

            <div
              className="
                mb-7
                inline-flex
                items-center
                gap-2
                rounded-full
                border
                border-orange-400/20
                bg-[#211A17]
                px-4
                py-2
                text-sm
                font-semibold
                text-[#F59E45]
              "
            >
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#F59E45] text-[#15110F]">
                <Check size={12} strokeWidth={3} />
              </span>

              Delicious food, delivered fresh
            </div>

            {/* Heading */}

            <h1
              className="
                text-[clamp(3.2rem,6vw,5.8rem)]
                font-black
                leading-[0.92]
                tracking-[-0.055em]
                text-[#FFF8F0]
              "
            >
              Pizzeria
              <br />

              <span className="text-[#F59E45]">
                Milano Segle
              </span>
            </h1>

            {/* Description */}

            <p className="mt-7 max-w-lg text-base leading-7 text-[#B8AAA0] sm:text-lg">
              Fresh ingredients, bold flavors, and your favorite meals
              delivered straight to your door. Order something delicious
              today.
            </p>

            {/* Buttons */}

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/#order_now"
                className="
                  group
                  inline-flex
                  items-center
                  justify-center
                  gap-3
                  rounded-full
                  bg-[#F59E45]
                  px-7
                  py-4
                  text-sm
                  font-bold
                  text-[#15110F]
                  shadow-xl
                  shadow-orange-950/30
                  transition
                  hover:-translate-y-0.5
                  hover:bg-[#FFB35F]
                "
              >
                Order Now

                <span
                  className="
                    flex
                    h-7
                    w-7
                    items-center
                    justify-center
                    rounded-full
                    bg-[#15110F]/15
                    transition
                    group-hover:translate-x-1
                  "
                >
                  <ArrowRight size={15} />
                </span>
              </Link>

              <Link
                href="/menu"
                className="
                  inline-flex
                  items-center
                  justify-center
                  rounded-full
                  border
                  border-white/10
                  bg-[#211A17]
                  px-7
                  py-4
                  text-sm
                  font-bold
                  text-[#FFF8F0]
                  shadow-sm
                  transition
                  hover:border-orange-400/30
                  hover:bg-[#2A211D]
                  hover:text-[#F59E45]
                "
              >
                Explore Menu
              </Link>
            </div>

            {/* Features */}

            <div
              className="
                mt-11
                grid
                max-w-lg
                grid-cols-3
                border-t
                border-white/10
                pt-6
              "
            >
              <Feature
                icon={<Clock3 size={18} />}
                title="Fast Delivery"
                text="30–40 min"
              />

              <Feature
                icon={<Leaf size={18} />}
                title="Fresh Food"
                text="Every day"
                border
              />

              <Feature
                icon={<ShieldCheck size={18} />}
                title="Secure Pay"
                text="100% secure"
                border
              />
            </div>
          </div>

          {/* =====================================================
              Right Food Visual
          ===================================================== */}

          <div className="relative flex min-h-[480px] items-center justify-center lg:min-h-[650px]">
            {/* Large soft shape */}

            <div
              className="
                absolute
                right-0
                top-1/2
                h-[430px]
                w-[430px]
                -translate-y-1/2
                rounded-[42%]
                bg-[#3B2418]
                sm:h-[530px]
                sm:w-[530px]
                lg:h-[600px]
                lg:w-[600px]
              "
            />

            {/* Orange glow */}

            <div
              className="
                absolute
                right-4
                top-12
                h-24
                w-24
                rounded-full
                bg-orange-400/10
                blur-xl
              "
            />

            {/* Food image */}

            <div className="relative z-10 w-full max-w-[620px]">
              <Image
                src="/images/hero-14.jpg"
                alt="Fresh delicious food"
                width={900}
                height={900}
                priority
                className="
                  h-auto
                  w-full
                  rounded-full
                  object-contain
                  drop-shadow-[0_35px_35px_rgba(0,0,0,0.45)]
                "
              />
            </div>

            {/* =================================================
                Fresh Badge
            ================================================= */}

            <div
              className="
                absolute
                left-1
                top-20
                z-20
                hidden
                rotate-[-7deg]
                rounded-3xl
                border
                border-white/10
                bg-[#211A17]
                px-5
                py-4
                shadow-2xl
                shadow-black/30
                sm:block
              "
            >
              <div className="flex items-center gap-2">
                <span className="text-xl">✨</span>

                <div>
                  <p className="text-sm font-black text-[#FFF8F0]">
                    Fresh & Tasty
                  </p>

                  <p className="mt-0.5 text-[11px] text-[#B8AAA0]">
                    Made with love
                  </p>
                </div>
              </div>
            </div>

            {/* =================================================
                Rating Card
            ================================================= */}

            <div
              className="
                absolute
                bottom-20
                left-0
                z-20
                hidden
                items-center
                gap-3
                rounded-2xl
                border
                border-white/10
                bg-[#211A17]
                px-4
                py-3
                shadow-2xl
                shadow-black/30
                sm:flex
              "
            >
              <div
                className="
                  flex
                  h-10
                  w-10
                  items-center
                  justify-center
                  rounded-xl
                  bg-[#3B2418]
                  text-[#F59E45]
                "
              >
                <Star size={19} fill="currentColor" />
              </div>

              <div>
                <div className="flex items-center gap-1">
                  <span className="text-sm font-black text-[#FFF8F0]">
                    4.9
                  </span>

                  <div className="flex text-[#F59E45]">
                    <Star size={11} fill="currentColor" />
                    <Star size={11} fill="currentColor" />
                    <Star size={11} fill="currentColor" />
                    <Star size={11} fill="currentColor" />
                    <Star size={11} fill="currentColor" />
                  </div>
                </div>

                <p className="text-[11px] text-[#B8AAA0]">
                  2,000+ happy customers
                </p>
              </div>
            </div>

            {/* =================================================
                Delivery Floating Card
            ================================================= */}

            <div
              className="
                absolute
                right-0
                top-28
                z-20
                hidden
                rounded-2xl
                border
                border-white/10
                bg-[#211A17]
                px-4
                py-3
                shadow-2xl
                shadow-black/30
                md:block
              "
            >
              <div className="flex items-center gap-3">
                <div
                  className="
                    flex
                    h-10
                    w-10
                    items-center
                    justify-center
                    rounded-xl
                    bg-[#193027]
                    text-emerald-400
                  "
                >
                  <Clock3 size={19} />
                </div>

                <div>
                  <p className="text-xs font-bold text-[#FFF8F0]">
                    Quick delivery
                  </p>

                  <p className="mt-0.5 text-[11px] text-[#B8AAA0]">
                    At your doorstep
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* =========================================================
            Bottom Category Strip
        ========================================================= */}

        <div
          className="
            relative
            mt-2
            hidden
            items-center
            justify-between
            rounded-3xl
            border
            border-white/10
            bg-[#211A17]
            px-7
            py-5
            shadow-xl
            shadow-black/20
            lg:flex
          "
        >
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#F59E45]">
              What are you craving?
            </p>

            <p className="mt-1 text-sm text-[#B8AAA0]">
              Choose your favorite and start ordering
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Category emoji="🍕" title="Pizza" />
            <Category emoji="🍔" title="Burgers" />
            <Category emoji="🍜" title="Noodles" />
            <Category emoji="🥗" title="Healthy" />
            <Category emoji="🍰" title="Desserts" />
          </div>

          <Link
            href="/menu"
            className="
              flex
              items-center
              gap-2
              text-sm
              font-bold
              text-[#FFF8F0]
              transition
              hover:text-[#F59E45]
            "
          >
            View all
            <ArrowRight size={15} />
          </Link>
        </div>
      </div>
    </section>
  );
}

/* =========================================================
   Feature
========================================================= */

function Feature({
  icon,
  title,
  text,
  border = false,
}: {
  icon: React.ReactNode;
  title: string;
  text: string;
  border?: boolean;
}) {
  return (
    <div
      className={`flex gap-3 ${
        border
          ? "border-l border-white/10 pl-4 sm:pl-5"
          : ""
      }`}
    >
      <div className="mt-0.5 text-[#F59E45]">
        {icon}
      </div>

      <div>
        <p className="text-xs font-bold text-[#FFF8F0] sm:text-sm">
          {title}
        </p>

        <p className="mt-0.5 text-[10px] text-[#B8AAA0] sm:text-xs">
          {text}
        </p>
      </div>
    </div>
  );
}

/* =========================================================
   Category
========================================================= */

function Category({
  emoji,
  title,
}: {
  emoji: string;
  title: string;
}) {
  return (
    <Link
      href="/"
      className="
        flex
        items-center
        gap-2
        rounded-full
        border
        border-white/10
        bg-[#2A211D]
        px-4
        py-2.5
        text-sm
        font-semibold
        text-[#D8CCC4]
        transition
        hover:border-orange-400/20
        hover:bg-[#35271F]
        hover:text-[#F59E45]
      "
    >
      <span>{emoji}</span>
      {title}
    </Link>
  );
}