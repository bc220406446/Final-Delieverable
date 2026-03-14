// Provides the modal for submitting ratings and written exchange reviews.
"use client";

import { useState, useEffect, JSX } from "react";

// Defines form state, validation errors, and modal props for reviews.

interface FormState {
  exchange: string;
  rating: number;
  comment: string;
}

interface FormErrors {
  exchange?: string;
  rating?: string;
  comment?: string;
}

interface Props {
  completedExchanges: string[];
  onSave: (exchange: string, rating: number, comment: string) => void;
  onClose: () => void;
}

// Renders the interactive star rating selector for review scoring.

function StarPicker({
  value,
  onChange,
}: {
  value: number;
  onChange: (v: number) => void;
}): JSX.Element {
  const [hover, setHover] = useState(0);
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => onChange(star)}
          onMouseEnter={() => setHover(star)}
          onMouseLeave={() => setHover(0)}
          className="focus:outline-none"
        >
          <svg
            className={`w-7 h-7 transition ${
              star <= (hover || value) ? "text-yellow-400" : "text-gray-200"
            }`}
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.957a1 1 0 00.95.69h4.162c.969 0 1.371 1.24.588 1.81l-3.37 2.448a1 1 0 00-.364 1.118l1.287 3.957c.3.921-.755 1.688-1.54 1.118L10 14.347l-3.95 2.878c-.784.57-1.838-.197-1.539-1.118l1.287-3.957a1 1 0 00-.364-1.118L2.063 9.384c-.783-.57-.38-1.81.588-1.81h4.162a1 1 0 00.95-.69l1.286-3.957z" />
          </svg>
        </button>
      ))}
      {value > 0 && (
        <span className="ml-1 text-xs font-semibold text-gray-500">{value}/5</span>
      )}
    </div>
  );
}

// Renders the add-review modal with validation and submission actions.

export default function AddReviewModal({ completedExchanges, onSave, onClose }: Props): JSX.Element {
  const [form, setForm] = useState<FormState>({ exchange: "", rating: 0, comment: "" });
  const [errors, setErrors] = useState<FormErrors>({});

  // Escape key to close
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [onClose]);

  function validate(): FormErrors {
    const e: FormErrors = {};
    if (!form.exchange)        e.exchange = "Please select an exchange.";
    if (form.rating === 0)     e.rating   = "Please select a rating.";
    if (!form.comment.trim())  e.comment  = "Review comment is required.";
    return e;
  }

  function handleSave() {
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    onSave(form.exchange, form.rating, form.comment.trim());
  }

  const fieldCls = (hasError: boolean) =>
    `w-full rounded-xl border px-3.5 py-2.5 text-sm text-gray-900 placeholder-gray-400 outline-none transition focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white ${
      hasError ? "border-red-400" : "border-gray-200"
    }`;

  return (
    <>
      {/* Backdrop - pointer-events-none, only Close / Escape dismisses */}
      <div className="fixed inset-0 bg-black/30 z-40 pointer-events-none" />

      {/* Panel */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">

          {/* Header */}
          <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
            <h3 className="text-base font-extrabold text-gray-900">Add Review</h3>
            <button
              type="button"
              onClick={onClose}
              className="text-xs font-semibold text-gray-600 border border-gray-200 hover:bg-gray-50 transition px-2.5 py-1.5 rounded-lg"
            >
              Close
            </button>
          </div>

          {/* Body */}
          <div className="px-6 py-5 flex flex-col gap-4">

            {/* Exchange */}
            <div>
              <label className="block text-xs font-extrabold uppercase tracking-wide text-gray-500 mb-1.5">
                Exchange
              </label>
              <select
                value={form.exchange}
                onChange={(e) => {
                  setForm((p) => ({ ...p, exchange: e.target.value }));
                  setErrors((p) => ({ ...p, exchange: undefined }));
                }}
                className={fieldCls(!!errors.exchange)}
              >
                <option value="">Select a completed exchange…</option>
                {completedExchanges.map((ex) => (
                  <option key={ex} value={ex}>{ex}</option>
                ))}
              </select>
              {errors.exchange && <p className="mt-1 text-xs text-red-500">{errors.exchange}</p>}
            </div>

            {/* Rating */}
            <div>
              <label className="block text-xs font-extrabold uppercase tracking-wide text-gray-500 mb-1.5">
                Rating
              </label>
              <StarPicker
                value={form.rating}
                onChange={(v) => {
                  setForm((p) => ({ ...p, rating: v }));
                  setErrors((p) => ({ ...p, rating: undefined }));
                }}
              />
              {errors.rating && <p className="mt-1 text-xs text-red-500">{errors.rating}</p>}
            </div>

            {/* Comment */}
            <div>
              <label className="block text-xs font-extrabold uppercase tracking-wide text-gray-500 mb-1.5">
                Review
              </label>
              <textarea
                rows={3}
                value={form.comment}
                onChange={(e) => {
                  setForm((p) => ({ ...p, comment: e.target.value }));
                  setErrors((p) => ({ ...p, comment: undefined }));
                }}
                placeholder="Share your experience with this exchange…"
                className={`${fieldCls(!!errors.comment)} resize-none`}
              />
              {errors.comment && <p className="mt-1 text-xs text-red-500">{errors.comment}</p>}
            </div>
          </div>

          {/* Footer */}
          <div className="px-6 pb-6 flex gap-3">
            <button
              type="button"
              onClick={handleSave}
              className="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold text-sm py-2.5 rounded-xl transition"
            >
              Submit Review
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold text-sm py-2.5 rounded-xl transition"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </>
  );
}