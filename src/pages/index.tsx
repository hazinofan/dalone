// pages/index.tsx
import { ArrowBigRight, ArrowRight } from "lucide-react";
import * as React from "react";

export default function Home() {
  const cardItems = [
    "Design Consultation",
    "Home Plumbing",
    "Garden Landscaping",
    "Electrical Repair",
    "Personal Training",
    "Developpers",
    "Barbers",
    "Marketing Specialists",
    "Others"
  ];

  return (
    <main className=" h-screen flex flex-col">
      {/* HERO: 2/3 of screen */}
      <section className="relative overflow-hidden rounded-bl-3xl h-[95rem] rounded-br-3xl">
        {/* bg image */}
        <div
          className="
            absolute inset-0
            bg-[url('/assets/professionall.png')]
            bg-cover bg-center
            filter brightness-75
          "
        />
        {/* gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 to-black/60" />

        {/* hero content */}
        <div className="relative z-10 h-full flex flex-col justify-center px-8 md:px-16 lg:px-24">
          <h1 className="text-5xl md:text-6xl text-white drop-shadow-lg mb-8">
            Our Professionals<br />
            Will take it from here
          </h1>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-4xl">
            {cardItems.map((c, i) => (
              <button
                key={i}
                className="
                  flex items-center justify-between
                  w-full p-4 text-lg md:text-xl
                  border border-white rounded-md
                  bg-white/10 text-white
                  hover:bg-white/20 transition
                "
              >
                <span>{c}</span>
                <ArrowRight />
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* TRUSTED BY: 1/3 of screen */}
      <section className="h-1/3 bg-gray-50">
        <div className="flex flex-row items-center gap-16 px-5 md:px-16 lg:px-24 h-full justify-center">
          <img src="/assets/paypal.png" alt="paypal svg"  width={120} className=" "/>
          <img src="/assets/meta.png" alt="meta svg"  width={120} className=" "/>
          <img src="/assets/google.png" alt="google svg"  width={120} className=" "/>
          <img src="/assets/p&g.png" alt="p&g  svg"  width={120} className=" "/>
          <img src="/assets/payoneer.png" alt="payoneer svg"  width={120} className=" "/>
          <img src="/assets/netflix.png" alt="netflix svg"  width={120} className=" "/>
          <img src="/assets/venmo.png" alt="Venmo svg"  width={120} className=" "/>
        </div>
      </section>
    </main>
  );
}