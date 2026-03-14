"use client";

import { useState } from "react";
import { JSX } from "react";
import Image from "next/image";

// Defines the structure for each question/answer item shown in the FAQ list.
interface FaqItem {
  q: string;
  a: string;
}

// Provides static FAQ content rendered in the expandable public FAQ section.
const FAQS: FaqItem[] = [
  {
    q: "Is this platform really free?",
    a: "Yes. The platform enables you to exchange skills or knowledge without money, using a time/skills bartering system.",
  },
  {
    q: "How do I start exchanging skills?",
    a: "To start exchanging skills, first create your profile and list the skills you can offer and the skills you'd like to learn. Then browse through available skill providers, send booking requests, and arrange your first exchange session.",
  },
  {
    q: "How do I find and book someone to learn a skill on the platform?",
    a: "Browse the skills directory, find someone offering what you want to learn, and send them a booking request. You can communicate through our messaging system to arrange a time and format that works for both parties.",
  },
  {
    q: "How do I arrange a meeting with someone?",
    a: "Once you've connected with a skill provider, use our built-in messaging system to discuss details like preferred meeting times, location (in-person or virtual), and session duration. You can coordinate everything within the platform.",
  },
  {
    q: "How do I know a skill provider is reliable?",
    a: "Each skill provider has ratings and reviews from previous exchanges. You can read feedback from other community members to make an informed decision. We also encourage users to leave honest reviews after each session to maintain quality.",
  },
];

// Renders the public FAQs page and manages which answer panel is expanded.
export default function FaqsPage(): JSX.Element {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <main className="bg-gray-50 text-gray-800">

      {/* Hero section introducing FAQ purpose and community guidance context. */}
      <section className="bg-linear-to-br from-green-700 to-green-500 text-white py-20 px-5">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <h1 className="text-3xl md:text-4xl font-extrabold leading-tight">
              Frequently Asked Questions
            </h1>
            <p className="mt-4 text-sm md:text-base leading-relaxed opacity-90">
              Find answers to common questions about how our Community Skills Exchange works,
              how to connect with others, and how to start sharing your skills today.
            </p>
          </div>

          <div className="relative w-full h-72 md:h-80">
            <Image
              src="/images/coverImage.jpg"
              alt="FAQ illustration"
              fill
              className="rounded-2xl shadow-2xl object-cover"
              priority
              unoptimized
            />
          </div>
        </div>
      </section>

      {/* FAQ section listing common questions with collapsible answers. */}
      <section className="max-w-3xl mx-auto px-5 py-12 md:py-16">

        <h2 className="text-2xl md:text-3xl font-extrabold text-center text-green-900 mb-8">
          Common Questions &amp; Answers
        </h2>

        <div className="flex flex-col gap-3">
          {FAQS.map((item, i) => {
            const isOpen = openIndex === i;

            return (
              <article
                key={item.q}
                className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden transition hover:shadow-md"
              >
                {/* Question trigger row that toggles visibility of the related answer. */}
                <button
                  type="button"
                  onClick={() => setOpenIndex(isOpen ? null : i)}
                  className="w-full flex items-center justify-between text-left px-5 py-4 gap-4"
                  aria-expanded={isOpen}
                >
                  <span className="text-sm font-semibold text-gray-900">
                    <span className="text-green-600 font-extrabold mr-1.5">Q:</span>
                    {item.q}
                  </span>

                  <span
                    className={`text-green-600 text-xl font-extrabold transition-transform select-none shrink-0 ${
                      isOpen ? "rotate-90" : "rotate-0"
                    }`}
                    aria-hidden="true"
                  >
                    ›
                  </span>
                </button>

                {/* Answer panel displayed when the corresponding question is expanded. */}
                {isOpen && (
                  <div className="border-t border-gray-100 bg-green-50/40 px-5 py-4">
                    <p className="text-sm text-gray-600 leading-relaxed">
                      <span className="text-green-600 font-extrabold mr-1.5">A:</span>
                      {item.a}
                    </p>
                  </div>
                )}
              </article>
            );
          })}
        </div>
      </section>
    </main>
  );
}