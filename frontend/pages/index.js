/*
 * index.js
 * This page component is used as the LANDING / INDEX page.
 */

import { Geist } from "next/font/google";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });

// LANDING PAGE
export default function Home() {
  return (
    <div
      className={`${geistSans.variable} font-[var(--font-geist-sans)] flex flex-col min-h-screen`}
    >
      <section className="bg-gradient-to-r from-blue-600 to-blue-700 text-white py-24 px-6 text-center">
        <h1 className="text-5xl sm:text-6xl font-bold mb-4">
          EU Crime Data Explorer
        </h1>
        <p className="text-lg sm:text-2xl mb-8 max-w-2xl mx-auto">
          Interactive visualizations of police‑recorded crime trends across EU
          countries. Filter by region, year, and crime category to uncover
          insights.
        </p>
        <div className="flex justify-center gap-4">
          <a
            href="/question1"
            className="bg-white text-blue-700 font-semibold py-3 px-8 rounded-full shadow hover:bg-gray-100 transition"
          >
            Get Started
          </a>
          <a
            href="https://github.com/maxverwiebe/crimerate-eu-datascienceproject-cau"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-transparent border border-white text-white font-semibold py-3 px-8 rounded-full hover:bg-white hover:text-blue-700 transition"
          >
            View on GitHub
          </a>
        </div>
      </section>

      <section className="py-16 px-6 bg-gray-50">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">About This Project</h2>
          <p className="text-gray-700 leading-relaxed">
            Developed as part of our Data Science Project course. All data is
            sourced from Eurostat for authoritative crime statistics across the
            European Union.
          </p>
        </div>
      </section>
    </div>
  );
}
