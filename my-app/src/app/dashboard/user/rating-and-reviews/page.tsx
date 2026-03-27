// Ratings and reviews page — fetches real data from Strapi.
"use client";

import { JSX, useState, useEffect, useCallback } from "react";
import { useAuth } from "@/context/AuthContext";
import { getMyReviews, StrapiReview } from "@/lib/api";
import AddReviewModal from "@/app/components/dashboard/user/review/AddReviewModal";

type ReviewTab = "received" | "given";

const TABS: { key: ReviewTab; label: string }[] = [
  { key: "received", label: "Received Reviews" },
  { key: "given",    label: "Given Reviews"    },
];

function Stars({ rating }: { rating: number }): JSX.Element {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <svg key={i} className={`w-4 h-4 ${i < rating ? "text-yellow-400" : "text-gray-200"}`}
          fill="currentColor" viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.957a1 1 0 00.95.69h4.162c.969 0 1.371 1.24.588 1.81l-3.37 2.448a1 1 0 00-.364 1.118l1.287 3.957c.3.921-.755 1.688-1.54 1.118L10 14.347l-3.95 2.878c-.784.57-1.838-.197-1.539-1.118l1.287-3.957a1 1 0 00-.364-1.118L2.063 9.384c-.783-.57-.38-1.81.588-1.81h4.162a1 1 0 00.95-.69l1.286-3.957z" />
        </svg>
      ))}
      <span className="ml-1.5 text-xs font-semibold text-gray-500">{rating}/5</span>
    </div>
  );
}

function Th({ children }: { children: React.ReactNode }): JSX.Element {
  return <th className="px-5 py-3.5 text-[11px] font-extrabold tracking-wide uppercase text-gray-500 text-left">{children}</th>;
}

function Td({ children, className = "" }: { children: React.ReactNode; className?: string }): JSX.Element {
  return <td className={`px-5 py-4 text-sm text-gray-600 align-top ${className}`}>{children}</td>;
}

// function PersonBadge({ name, tab }: { name: string; tab: ReviewTab }): JSX.Element {
//   const cls = tab === "received"
//     ? "bg-blue-100 text-blue-700 border-blue-200"
//     : "bg-purple-100 text-purple-700 border-purple-200";
//   return (
//     <span className={`inline-flex items-center border text-xs font-semibold px-2 py-0.5 rounded-full ${cls}`}>
//       {name}
//     </span>
//   );
// }

function ReviewTable({ reviews, tab }: { reviews: StrapiReview[]; tab: ReviewTab }): JSX.Element {
  const colLabel   = tab === "received" ? "From"  : "To";
  const personName = (r: StrapiReview) => tab === "received" ? r.reviewer_name : r.reviewee_name;

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
              <tr><td colSpan={4} className="px-5 py-10 text-center text-sm text-gray-400">No reviews found.</td></tr>
            ) : reviews.map((r) => (
              <tr key={r.id} className="hover:bg-gray-50 transition">
                <Td className="font-semibold text-gray-900 line-clamp-3">{r.skill_title}</Td>
                <Td><span className="font-medium text-gray-900">{personName(r)}</span></Td>
                <Td><Stars rating={r.rating} /></Td>
                <Td className="max-w-xs text-gray-500"><span className="line-clamp-3">{r.comment}</span></Td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile */}
      <div className="md:hidden divide-y divide-gray-100">
        {reviews.length === 0 ? (
          <div className="py-10 text-center text-sm text-gray-400">No reviews found.</div>
        ) : reviews.map((r) => (
          <div key={r.id} className="p-4 flex flex-col gap-1.5">
            <div className="font-bold text-gray-900 text-sm line-clamp-3">{r.skill_title}</div>
            <div className="font-medium text-gray-900">{`${colLabel}: ${personName(r)}`}</div>
            <Stars rating={r.rating} />
            <div className="text-xs text-gray-500 line-clamp-3">{r.comment}</div>
          </div>
        ))}
      </div>
    </>
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

export default function RatingsReviewsPage(): JSX.Element {
  const { token } = useAuth();

  const [given,      setGiven]      = useState<StrapiReview[]>([]);
  const [received,   setReceived]   = useState<StrapiReview[]>([]);
  const [loading,    setLoading]    = useState(true);
  const [tab,        setTab]        = useState<ReviewTab>("received");
  const [showModal,  setShowModal]  = useState(false);
  const [toast,      setToast]      = useState<string | null>(null);

  const fetchReviews = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const { given: g, received: r } = await getMyReviews(token);
      setGiven(g);
      setReceived(r);
    } catch { /* silent */ }
    finally { setLoading(false); }
  }, [token]);

  useEffect(() => { fetchReviews(); }, [fetchReviews]);

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(null), 3500);
  }

  async function handleSaved() {
    setShowModal(false);
    setTab("given");
    await fetchReviews();
    showToast("Review submitted successfully!");
  }

  const visible = tab === "received" ? received : given;

  return (
    <div>
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-green-900">Ratings &amp; Reviews</h1>
          <p className="mt-2 text-sm text-gray-600">
            View reviews you have received and the reviews you have given.
          </p>
        </div>
        <button type="button" onClick={() => setShowModal(true)}
          className="shrink-0 inline-flex items-center gap-1.5 bg-green-600 hover:bg-green-700 text-white font-semibold text-sm px-4 py-2.5 rounded-xl transition">
          <span className="text-base leading-none">+</span>
          Add Review
        </button>
      </div>

      <section className="mt-6 bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
        <div className="flex flex-wrap gap-2 border-b border-gray-100 p-3">
          {TABS.map(({ key, label }) => (
            <button key={key} type="button" onClick={() => setTab(key)}
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition ${
                tab === key ? "bg-green-600 text-white" : "border border-gray-200 text-gray-600 hover:bg-gray-50"
              }`}>
              {label}
              <span className={`ml-2 text-xs font-bold px-1.5 py-0.5 rounded-full ${
                tab === key ? "bg-white/20 text-white" : "bg-gray-100 text-gray-500"
              }`}>
                {(tab === key ? visible : (key === "received" ? received : given)).length}
              </span>
            </button>
          ))}
        </div>

        {loading ? (
          <div className="py-10 text-center text-sm text-gray-400">Loading reviews…</div>
        ) : (
          <ReviewTable reviews={visible} tab={tab} />
        )}
      </section>

      {showModal && (
        <AddReviewModal onSaved={handleSaved} onClose={() => setShowModal(false)} />
      )}

      {toast && <SuccessToast message={toast} onClose={() => setToast(null)} />}
    </div>
  );
}
