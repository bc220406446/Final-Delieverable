"use client";

import { useState, useEffect, JSX } from "react";
import Image from "next/image";
import { getFaqPage, CmsFaqItem } from "@/lib/api";

function FaqAccordion({ faqs }: { faqs: CmsFaqItem[] }): JSX.Element {
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  return (
    <div className="flex flex-col gap-3">
      {faqs.map((item, i) => {
        const isOpen = openIndex === i;
        return (
          <article key={i} className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden transition hover:shadow-md">
            <button type="button" onClick={() => setOpenIndex(isOpen ? null : i)}
              className="w-full flex items-center justify-between text-left px-5 py-4 gap-4" aria-expanded={isOpen}>
              <span className="text-sm font-semibold text-gray-900">
                <span className="text-green-600 font-extrabold mr-1.5">Q:</span>{item.question}
              </span>
              <span className={`text-green-600 text-xl font-extrabold transition-transform select-none shrink-0 ${isOpen ? "rotate-90" : "rotate-0"}`}>›</span>
            </button>
            {isOpen && (
              <div className="border-t border-gray-100 bg-green-50/40 px-5 py-4">
                <p className="text-sm text-gray-600 leading-relaxed">
                  <span className="text-green-600 font-extrabold mr-1.5">A:</span>{item.answer}
                </p>
              </div>
            )}
          </article>
        );
      })}
    </div>
  );
}

export default function FaqsPage(): JSX.Element {
  const [data,    setData]    = useState<Awaited<ReturnType<typeof getFaqPage>>>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getFaqPage()
      .then((d) => setData(d))
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <main className="min-h-[60vh] flex items-center justify-center">
        <p className="text-sm text-gray-400">Loading…</p>
      </main>
    );
  }

  if (!data) {
    return (
      <main className="min-h-[60vh] flex items-center justify-center">
        <p className="text-sm text-gray-400">Content unavailable. Please try again later.</p>
      </main>
    );
  }

  return (
    <main className="bg-gray-50 text-gray-800">
      <section className="bg-gradient-to-br from-green-700 to-green-500 text-white py-20 px-5">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <h1 className="text-3xl md:text-4xl font-extrabold leading-tight">{data.hero_title}</h1>
            <p className="mt-4 text-sm md:text-base leading-relaxed opacity-90">{data.hero_description}</p>
          </div>
          <div className="relative w-full h-72 md:h-80">
            <Image src="/images/coverImage.jpg" alt="FAQ illustration" fill className="rounded-2xl shadow-2xl object-cover" priority unoptimized />
          </div>
        </div>
      </section>

      <section className="max-w-3xl mx-auto px-5 py-12 md:py-16">
        <h2 className="text-2xl md:text-3xl font-extrabold text-center text-green-900 mb-8">
          {data.section_heading}
        </h2>
        {data.faqs?.length > 0
          ? <FaqAccordion faqs={data.faqs} />
          : <p className="text-center text-sm text-gray-400">No FAQs added yet.</p>
        }
      </section>
    </main>
  );
}
