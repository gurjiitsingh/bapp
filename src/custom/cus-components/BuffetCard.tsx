"use client";

import { Lato, Chicle } from "next/font/google";
import Image from "next/image";

const lato = Lato({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-lato",
  display: "swap",
});

const chicle = Chicle({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-chicle",
  display: "swap",
});

export default function BuffetCard() {
  return (
    <section
      id="bf"
      className="max-w-5xl mx-auto px-2 md:px-0 my-8 pt-[50px] scroll-mt-[50px]"
    >
      <div className="bg-[#fff2e9] rounded-2xl overflow-hidden shadow-md">
        <div className="grid grid-cols-1 md:grid-cols-[0.6fr_1.4fr]">
          {/* Left Side - Image */}
          <div className="relative w-full h-[180px] md:h-[300px]">
            <Image
              src="/images/catering-1.jpg" // <-- replace with your image path
              alt="Buffet dishes"
              fill
              className="object-cover"
              priority
            />
          </div>

          {/* Right Side - Text */}
          <div className="flex flex-col justify-center bg-[#fff2e9] text-[#2b2b2b] px-5 py-5 md:px-8">
            <h2
              className={`${chicle.className} text-[22px] sm:text-[26px] md:text-[28px] font-bold text-[#7a1512]`}
            >
              MASALA – Taste of India
            </h2>

            {/* Two-column content */}
            <div
              className={`${lato.className} grid grid-cols-2 gap-x-6 gap-y-1 text-[13px] sm:text-[14px] md:text-[15px] mt-1 leading-snug`}
            >
              <p>Indisches Buffet</p>
              <p>+ Alkoholfreies Getränk (1× – 0,4 L)</p>

              <p className="font-semibold text-[#7a1512]">Pro Person 19,99 €</p>
              <p>Kinder bis 7 Jahre 9,99 €</p>

              <p>Angebot bis 31.12.2025</p>
              <p>Freitag, Samstag, Sonntag</p>

              <p>Von 17:00 bis 21:00 Uhr</p>
              <p>Braunschweigerstr. 93, 38518 Gifhorn</p>

              <p>05371 62 66 291</p>
              <p>masala-gf.de</p>
            </div>

            <button
              className="mt-4 bg-[#7a1512] text-white font-semibold rounded-full px-5 py-2 text-sm hover:bg-[#611616] transition w-fit"
              onClick={() => {
                window.location.href =
                  "https://www.google.com/maps/reserve/v/dine/c/6JTgdCnqFvM?source=pa&opi=89978449&hl=en-IN&gei=tyL_aJLxDNCL4-EP4_HqqQQ&sourceurl=https://www.google.com/search?q%3Dmasala%2Btaste%2Bof%2Bindia%2Bbraunschweig%26rlz%3D1C1UEAD_enIN1131IN1131%26oq%3Dmasala%2Btaste%2Bof%2Bindia%2B%26gs_lcrp%3DEgZjaHJvbWUqBwgBEAAYgAQyBggAEEUYOTIHCAEQABiABDIHCAIQABiABDIGCAMQRRg9MgYIBBBFGDwyBggFEEUYPTIGCAYQRRhBMgYIBxBFGEHSAQg5NzUwajFqN6gCCLACAfEF8AkcktHNSkY%26sourceid%3Dchrome%26ie%3DUTF-8"
              }}
            >
              Tischreservierung
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
