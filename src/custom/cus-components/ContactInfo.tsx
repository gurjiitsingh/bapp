'use client'

// components/ContactInfo.tsx
import { FaMapMarkedAlt, FaPhoneAlt, FaEnvelope, FaCalendarAlt } from "react-icons/fa";

export default function ContactInfo() {
  return (
    <section className="bg-[#f4efdf]  bg-[#ffe5d2] text-[#2b2e4a] py-16 md:py-36 px-6">
      <div className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-12 text-center">
        
        {/* Standort */}
        <div>
          <FaMapMarkedAlt className="w-8 h-8 mx-auto mb-4 text-[#2b2e4a]" />
          <h3 className="uppercase text-sm tracking-wider font-semibold mb-2">Standort</h3>
          
          <p className="text-sm">Pizzeria Milano Segle XX</p>
          <p className="text-sm">Calle de Segle XX 9 (08041)</p>
          <p className="text-sm">Guinardó, Barcelona</p>
        </div>

        {/* Telefon */}
        <div>
          <FaPhoneAlt className="w-8 h-8 mx-auto mb-4 text-[#2b2e4a]" />
          <h3 className="uppercase text-sm tracking-wider font-semibold mb-2">Telefon</h3>
          <p className="text-sm">931416841</p>
        </div>

        {/* E-Mail */}
        <div>
          <FaEnvelope className="w-8 h-8 mx-auto mb-4 text-[#2b2e4a]" />
          <h3 className="uppercase text-sm tracking-wider font-semibold mb-2">E-Mail</h3>
          <a href="mailto:Bindujatt936@gmail.com" className="text-sm hover:underline">
            Bindujatt936@gmail.com
          </a>
        </div>

        {/* Öffnungszeiten */}
        <div>
          <FaCalendarAlt className="w-8 h-8 mx-auto mb-4 text-[#2b2e4a]" />
          <h3 className="uppercase text-sm tracking-wider font-semibold mb-2">Öffnungszeiten</h3>
          <div className="text-sm space-y-1">
            <p>Horario: 12:30 a 00:30</p>
            <p>Miércoles a lunes abierto</p>
            <p>Martes cerrado</p>
          </div>
        </div>

      </div>
    </section>
  );
}