"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function HeroSection() {
  const [heroLogoScale, setHeroLogoScale] = useState(1);
  const router = useRouter();

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const scaleStart = 50;
      const scaleEnd = 300;

      // Slightly shrink logo as user scrolls
      const scale = 1 - Math.min(Math.max((scrollY - scaleStart) / (scaleEnd - scaleStart), 0), 0.2);
      setHeroLogoScale(scale);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <section className="relative bg-gradient-to-br from-slate-900 via-cyan-900 to-black text-white py-32 px-6 text-center overflow-hidden">
      <div className="max-w-5xl mx-auto flex flex-col items-center">
        {/* Center Logo */}
        <div
          className="mb-8 transition-transform duration-500"
style={{ transform: `scale(${heroLogoScale})` }}
        >
          <Image
            src="/logo.jpg"
            alt="Logo"
            width={190}
            height={190}
            className="rounded-full filter brightness-190 filter contrast-150 hover:scale-150 transition-transform duration-700"
          />
        </div>

        {/* Title */}
        <h1 className="text-5xl sm:text-6xl font-extrabold mb-6">
          Spacebio Search Engine Dashboard
        </h1>

        {/* Description */}
        <p className="text-lg sm:text-xl text-gray-300 mb-10">
          Explore NASA’s bioscience archives with AI-powered tools that visualize data, reveal insights,
          and accelerate scientific discovery.
        </p>

        {/* Buttons */}
        <div className="flex justify-center gap-4 flex-wrap">
          <button
            onClick={() => router.push("/publication")}
            className="bg-cyan-500 hover:bg-cyan-600 text-white px-6 py-3 rounded-full font-semibold shadow-lg transition transform hover:scale-105"
          >
            Explore Publications
          </button>

          <button
            onClick={() => router.push("/quiz")}
            className="border border-cyan-400 hover:bg-cyan-400/20 px-6 py-3 rounded-full font-semibold text-cyan-300 transition transform hover:scale-105"
          >
            Take a Space Quiz
          </button>
        </div>
      </div>

      {/* Radial background glow */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,255,255,0.08),transparent)]"></div>
    </section>
  );
}