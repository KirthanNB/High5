'use client';
import Link from "next/link";

export default function CTASection() {
  return (
    <section className="bg-gradient-to-r from-cyan-800 via-slate-800 to-black text-white py-16 text-center">
      <h2 className="text-3xl font-bold mb-4">Ready to Explore Space Biology?</h2>
      <p className="text-gray-300 mb-8">
        Join the AI-powered research experience and uncover hidden insights from NASA’s bioscience database.
      </p>
      <Link href="/publication">
        <button className="relative bg-gradient-to-r from-cyan-400 to-blue-600 text-white px-10 py-3 rounded-full font-semibold shadow-lg transform transition-all duration-300 hover:scale-105 hover:shadow-xl hover:from-blue-500 hover:to-cyan-500 after:content-[''] after:absolute after:inset-0 after:rounded-full after:bg-white after:opacity-0 after:blur-lg after:transition-opacity after:duration-300 hover:after:opacity-20">
          Start Exploring
        </button>
      </Link>
    </section>
  );
}