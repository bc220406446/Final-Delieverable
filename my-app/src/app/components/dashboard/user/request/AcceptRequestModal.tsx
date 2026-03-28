// Modal for provider to accept a request - selects which of their skills to offer.
"use client";

import { useState, useEffect, JSX } from "react";

interface Props {
  requestId:           number;
  requesterName:       string;
  requestedSkillTitle: string;
  offeredSkillTitle:   string;
  onAccept: (requestId: number, acceptedSkillTitle: string) => void;
  onClose:  () => void;
}

function inputCls(): string {
  return "w-full rounded-xl border border-gray-200 bg-white px-3.5 py-2.5 text-sm text-gray-900 outline-none transition focus:ring-2 focus:ring-green-500 focus:border-green-500";
}

export default function AcceptRequestModal({
  requestId, requesterName, requestedSkillTitle, offeredSkillTitle, onAccept, onClose
}: Props): JSX.Element {
  const [selectedId,    setSelectedId]    = useState<string>("");
  const [submitting,    setSubmitting]    = useState(false);
  const [error,         setError]         = useState<string | null>(null);

  useEffect(() => {
    function handleKey(e: KeyboardEvent) { if (e.key === "Escape") onClose(); }
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [onClose]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!selectedId) { setError("Please select which skill to accept."); return; }
    setSubmitting(true);
    onAccept(requestId, selectedId);
  }

  return (
    <>
      <div className="fixed inset-0 bg-black/30 z-40" onClick={onClose} />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">

          {/* Header */}
          <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
            <div>
              <h3 className="text-base font-extrabold text-gray-900">Accept Exchange Request</h3>
              <p className="text-xs text-gray-500 mt-0.5">Choose the skill you will provide.</p>
            </div>
            <button type="button" onClick={onClose}
              className="text-xs font-semibold text-gray-600 border border-gray-200 hover:bg-gray-50 transition px-2.5 py-1.5 rounded-lg">
              Close
            </button>
          </div>

          <div className="p-6">

            {/* Exchange summary */}
            <div className="mb-5 bg-green-50 border border-green-100 rounded-xl p-4 flex flex-col gap-1.5">
              <p className="text-xs font-extrabold uppercase tracking-wide text-green-700 mb-1">Exchange Summary</p>
              {[
                { label: "Requester",     value: requesterName       },
                { label: "They want",     value: requestedSkillTitle  },
                { label: "They offer",    value: offeredSkillTitle    },
              ].map(({ label, value }) => (
                <div key={label} className="flex gap-2 text-sm">
                  <span className="font-semibold text-gray-700 w-24 shrink-0">{label}:</span>
                  <span className="text-gray-600">{value}</span>
                </div>
              ))}
            </div>

            {error && (
              <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} noValidate>
              <div className="flex flex-col gap-4">

                {/* Offered skills - parse comma/plus separated titles into individual options */}
                <div>
                  <label className="block text-xs font-extrabold uppercase tracking-wide text-gray-500 mb-1.5">
                    Select Offered Skill to Accept *
                  </label>
                  <select
                    className={inputCls()}
                    value={selectedId}
                    onChange={(e) => setSelectedId(e.target.value)}
                  >
                    <option value="">Choose one skill they offered…</option>
                    {offeredSkillTitle
                      .split(/[,+]/)
                      .map((t) => t.trim())
                      .filter(Boolean)
                      .map((title, i) => (
                        <option key={i} value={title}>{title}</option>
                      ))}
                  </select>
                  <p className="mt-1.5 text-xs text-gray-400">
                    All skills they offered: <strong>{offeredSkillTitle}</strong>
                  </p>
                </div>

                <div className="flex gap-3 pt-1">
                  <button type="button" onClick={onClose} disabled={submitting}
                    className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold text-sm py-2.5 rounded-xl transition disabled:opacity-50">
                    Cancel
                  </button>
                  <button type="submit" disabled={submitting || !selectedId}
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold text-sm py-2.5 rounded-xl transition disabled:opacity-60 disabled:cursor-not-allowed">
                    {submitting ? "Accepting…" : "Confirm Accept"}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}
