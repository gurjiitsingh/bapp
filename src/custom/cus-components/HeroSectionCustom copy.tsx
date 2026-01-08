"use client";

import Image from "next/image";
import { FaThumbsUp, FaShieldAlt, FaSmile } from "react-icons/fa";
import { Chicle } from "next/font/google";
import Link from "next/link";

const chicle = Chicle({
  subsets: ["latin"],
  weight: "400",
});

export default function HeroSectionCustom() {
  return (
    <section className="relative w-full overflow-hidden">
      {/* Background Image (Top Section) */}
      <div className="relative w-full h-[50vh] md:h-[80vh]">
        <Image
          src="/images/hero.jpg" // Replace with your image path
          alt="Restaurant background"
          fill
          className="object-cover"
          priority
        />

        {/* Overlay - visible on all screens */}
        <div className="absolute inset-0 bg-black/40 md:bg-black/60 backdrop-blur-[2px]" />

        {/* Curved white bottom for Desktop */}
        <div className=" block absolute bottom-0 left-0 right-0 h-20 bg-white rounded-t-[50%]" />
      </div>

      {/* Content Section */}
      <div className="relative bg-white  md:bg-transparent md:absolute md:inset-0 md:flex md:items-center md:px-20 md:justify-start">
        <div className="w-full flex justify-center md:justify-start ">
          <div className=" text-[#2b2b2b] md:text-white max-w-lg p-6 md:p-0 space-y-5 text-left md:text-left mt-0">
            {/* Logo */}
            <div
              className="w-24 h-24 md:w-28 md:h-28 rounded-full bg-white flex items-center justify-center md:mx-0 shadow-lg"
              data-aos="fade-right"
            >
              <img
                src="/logo-10.webp"
                alt="Logo"
                className="w-20 h-20 md:w-24 md:h-24 object-contain"
              />
            </div>

            {/* Title */}
            <h2
              className={`${chicle.className} text-3xl md:text-5xl mt-3 text-[#c36b1e] md:text-white`}
            >
              Masala Taste of India
            </h2>

            {/* Features */}
            <ul className="space-y-2 text-base md:text-lg">
              <li className="flex items-center justify-start gap-2">
                <FaThumbsUp className="text-[#c36b1e] md:text-green-400" />
                No platform fees
              </li>
              <li className="flex items-center justify-start gap-2">
                <FaShieldAlt className="text-[#c36b1e] md:text-green-400" />
                No payment fees
              </li>
              <li className="flex items-center justify-start gap-2">
                <FaSmile className="text-[#c36b1e] md:text-green-400" />
                1135{" "}
                <a
                  href="#"
                  className="underline text-[#c36b1e] md:text-white hover:text-green-400"
                >
                  Guest Recommendations
                </a>
              </li>
            </ul>

            {/* Buttons */}
            <div className="flex flex-col md:flex-row justify-start gap-4 pt-4">
              <Link
                href="https://eat.allo.restaurant/restaurant/masala-taste-of-india"
                rel="noopener noreferrer"
                data-aos="fade-left"
                className="bg-[#7a1f1f] hover:bg-[#611616] text-white font-semibold px-8 py-3 rounded-lg transition text-center"
              >
                🍴 Order Menu
              </Link>

              <Link
                href="/#bf"
                rel="noopener noreferrer"
                className="bg-white text-[#7a1f1f] font-semibold px-8 py-3 rounded-lg border-2 border-[#7a1f1f] hover:bg-[#7a1f1f] hover:text-white transition text-center"
              >
                Buffet
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
