// Displays ratings and reviews with tabbed filtering by status.
"use client";

import { JSX, useState } from "react";
import AddReviewModal from "@/app/components/dashboard/user/review/AddReviewModal";

// Rating and review types used in list rendering.

type ReviewTab = "received" | "given";

interface Review {
  id: number;
  tab: ReviewTab;
  skillTitle: string;
  person: string;
  direction: "from" | "to";
  rating: number;
  comment: string;
}

// Static labels and tab/status configuration.

const INITIAL_REVIEWS: Review[] = [
  {
    id: 1,
    tab: "received",
    skillTitle: "Excel Salary Sheet Automation (VBA)",
    person: "Maryam Iqbal (Islamabad)",
    direction: "from",
    rating: 5,
    comment: "Very helpful session. Ali explained macros clearly and shared a clean template.",
  },
  {
    id: 2,
    tab: "received",
    skillTitle: "SEO Audit & On-Page Optimization",
    person: "Umar Farooq (Karachi)",
    direction: "from",
    rating: 4,
    comment: "Good insights and practical checklist. Suggested improvements were easy to apply.",
  },
  {
    id: 3,
    tab: "given",
    skillTitle: "Public Speaking Confidence Workshop",
    person: "Sana Noor (Karachi)",
    direction: "to",
    rating: 4,
    comment: "Great feedback and supportive practice session. Helped me improve delivery.",
  },
  {
    id: 4,
    tab: "given",
    skillTitle: "Spoken English for Beginners",
    person: "Bilal Ahmed (Faisalabad)",
    direction: "to",
    rating: 5,
    comment: "Clear explanations and friendly practice. Looking forward to the next session.",
  },
];

const COMPLETED_EXCHANGES: string[] = [
  "Public Speaking Confidence Workshop - Sana Noor (Karachi)",
  "Spoken English for Beginners - Bilal Ahmed (Faisalabad)",
  "Excel Salary Sheet Automation (VBA) - Maryam Iqbal (Islamabad)",
  "Web Design Basics (HTML/CSS) - Ayesha Siddiqui (Karachi)",
];

const TABS: { key: ReviewTab; label: string }[] = [
  { key: "received", label: "Received Reviews" },
  { key: "given",    label: "Given Reviews"    },
];

// Utilities for filtering and formatting review data.

function Th({ children }: { children: React.ReactNode }): JSX.Element {
  return (
    <th className="px-5 py-3.5 text-[11px] font-extrabold tracking-wide uppercase text-gray-500 text-left">
      {children}
    </th>
  );
}

function Td({ children, className = "" }: { children: React.ReactNode; className?: string }): JSX.Element {
  return (
    <td className={`px-5 py-4 text-sm text-gray-600 align-top ${className}`}>
      {children}
    </td>
  );
}

function EmptyState({ cols }: { cols: number }): JSX.Element {
  return (
    <tr>
      <td colSpan={cols} className="px-5 py-10 text-center text-sm text-gray-400">
        No reviews found.
      </td>
    </tr>
  );
}

function Stars({ rating, max = 5 }: { rating: number; max?: number }): JSX.Element {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: max }).map((_, i) => (
        <svg
          key={i}
          className={`w-4 h-4 ${i < rating ? "text-yellow-400" : "text-gray-200"}`}
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.957a1 1 0 00.95.69h4.162c.969 0 1.371 1.24.588 1.81l-3.37 2.448a1 1 0 00-.364 1.118l1.287 3.957c.3.921-.755 1.688-1.54 1.118L10 14.347l-3.95 2.878c-.784.57-1.838-.197-1.539-1.118l1.287-3.957a1 1 0 00-.364-1.118L2.063 9.384c-.783-.57-.38-1.81.588-1.81h4.162a1 1 0 00.95-.69l1.286-3.957z" />
        </svg>
      ))}
      <span className="ml-1.5 text-xs font-semibold text-gray-500">{rating}/{max}</span>
    </div>
  );
}

function SuccessToast({ message, onClose }: { message: string; onClose: () => void }): JSX.Element {
  return (
    <div className="fixed bottom-5 right-5 z-50 flex items-center gap-3 bg-white border border-gray-100 rounded-2xl shadow-lg px-4 py-3">
      <div className="flex items-center justify-center w-7 h-7 rounded-full bg-green-100 shrink-0">
        <svg className="w-4 h-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
      </div>
      <span className="text-sm font-semibold text-gray-800">{message}</span>
      <button onClick={onClose} className="ml-1 text-gray-400 hover:text-gray-600 transition">
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
}

function ReviewTable({ reviews, tab }: { reviews: Review[]; tab: ReviewTab }): JSX.Element {
  const colLabel = tab === "received" ? "From" : "To";
  return (
    <>
      {/* Desktop */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50">
              <Th>Skill</Th>
              <Th>{colLabel}</Th>
              <Th>Rating</Th>
              <Th>Comment</Th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {reviews.length === 0 ? (
              <EmptyState cols={4} />
            ) : (
              reviews.map((r) => (
                <tr key={r.id} className="hover:bg-gray-50 transition">
                  <Td className="font-semibold text-gray-900 whitespace-nowrap">{r.skillTitle}</Td>
                  <Td className="whitespace-nowrap">
                    <span className={`inline-flex items-center border text-xs font-semibold px-2 py-0.5 rounded-full ${
                      r.direction === "from"
                        ? "bg-blue-100 text-blue-700 border-blue-200"
                        : "bg-purple-100 text-purple-700 border-purple-200"
                    }`}>
                      {r.person}
                    </span>
                  </Td>
                  <Td><Stars rating={r.rating} /></Td>
                  <Td className="max-w-xs text-gray-500"><span className="line-clamp-2">{r.comment}</span></Td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile */}
      <div className="md:hidden divide-y divide-gray-100">
        {reviews.length === 0 ? (
          <div className="py-10 text-center text-sm text-gray-400">No reviews found.</div>
        ) : (
          reviews.map((r) => (
            <div key={r.id} className="p-4 flex flex-col gap-1.5">
              <div className="font-bold text-gray-900 text-sm">{r.skillTitle}</div>
              <span className={`inline-flex items-center border text-xs font-semibold px-2 py-0.5 rounded-full w-fit ${
                r.direction === "from"
                  ? "bg-blue-100 text-blue-700 border-blue-200"
                  : "bg-purple-100 text-purple-700 border-purple-200"
              }`}>
                {colLabel}: {r.person}
              </span>
              <Stars rating={r.rating} />
              <div className="text-xs text-gray-500 line-clamp-2">{r.comment}</div>
            </div>
          ))
        )}
      </div>
    </>
  );
}

// Renders the ratings and reviews page.

export default function RatingsReviewsPage(): JSX.Element {
  const [tab, setTab] = useState<ReviewTab>("received");
  const [reviews, setReviews] = useState<Review[]>(INITIAL_REVIEWS);
  const [showModal, setShowModal] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const visible = reviews.filter((r) => r.tab === tab);

  function showToast(message: string) {
    setToast(message);
    setTimeout(() => setToast(null), 3500);
  }

  function handleAddReview(exchange: string, rating: number, comment: string) {
    const skillTitle = exchange.split(" - ")[0];
    const personPart = exchange.split(" - ")[1] ?? "";
    setReviews((prev) => [
      ...prev,
      { id: Date.now(), tab: "given", skillTitle, person: personPart, direction: "to", rating, comment },
    ]);
    setShowModal(false);
    setTab("given");
    showToast("Review submitted successfully!");
  }

  return (
    <div>
      {/* Page title and summary */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-green-900">
            Ratings &amp; Reviews
          </h1>
          <p className="mt-2 text-sm text-gray-600">
            View reviews you have received and the reviews you have given.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setShowModal(true)}
          className="shrink-0 inline-flex items-center gap-1.5 bg-green-600 hover:bg-green-700 text-white font-semibold text-sm px-4 py-2.5 rounded-xl transition"
        >
          <span className="text-base leading-none">+</span>
          Add Review
        </button>
      </div>

      {/* Section card */}
      <section className="mt-6 bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
        {/* Review status filters */}
        <div className="flex flex-wrap gap-2 border-b border-gray-100 p-3">
          {TABS.map(({ key, label }) => (
            <button
              key={key}
              type="button"
              onClick={() => setTab(key)}
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition ${
                tab === key
                  ? "bg-green-600 text-white"
                  : "border border-gray-200 text-gray-600 hover:bg-gray-50"
              }`}
            >
              {label}
              <span className={`ml-2 text-xs font-bold px-1.5 py-0.5 rounded-full ${
                tab === key ? "bg-white/20 text-white" : "bg-gray-100 text-gray-500"
              }`}>
                {reviews.filter((r) => r.tab === key).length}
              </span>
            </button>
          ))}
        </div>

        <ReviewTable reviews={visible} tab={tab} />
      </section>

      {/* Modal */}
      {showModal && (
        <AddReviewModal
          completedExchanges={COMPLETED_EXCHANGES}
          onSave={handleAddReview}
          onClose={() => setShowModal(false)}
        />
      )}

      {/* Toast */}
      {toast && <SuccessToast message={toast} onClose={() => setToast(null)} />}
    </div>
  );
}