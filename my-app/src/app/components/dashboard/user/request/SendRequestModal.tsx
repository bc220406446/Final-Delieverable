// Provides the booking request modal used when users contact skill providers.
"use client";

import { useState, useEffect, JSX } from "react";

// Defines booking draft and selected-skill data used by the modal.

type BookingDraft = {
  preferredSlot: string;
  mode: "" | "Online" | "In-person";
  message: string;
};

export type { BookingDraft };

export interface SkillForRequest {
  id: string;
  title: string;
  providerName: string;
  providerEmail: string;
  availability: string;
}

interface Props {
  skill: SkillForRequest;
  onSend: (skillId: string, draft: BookingDraft) => void;
  onClose: () => void;
}

// Supplies shared input styling for booking request fields.

function inputCls(): string {
  return [
    "w-full min-w-0 rounded-xl border border-gray-200 bg-white",
    "px-3.5 py-2.5 text-sm text-gray-900 placeholder-gray-400",
    "outline-none transition",
    "focus:ring-2 focus:ring-green-500 focus:border-green-500",
  ].join(" ");
}

// Renders the send-request modal and submits validated booking details.

export default function SendRequestModal({ skill, onSend, onClose }: Props): JSX.Element {
  const [booking, setBooking] = useState<BookingDraft>({
    preferredSlot: "",
    mode: "",
    message: "",
  });

  // Escape key to close
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [onClose]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!booking.preferredSlot || !booking.mode) return;
    onSend(skill.id, booking);
  }

  return (
    <>
      {/* Backdrop - pointer-events-none, only Close button / Escape closes */}
      <div className="fixed inset-0 bg-black/30 z-40 pointer-events-none" />

      {/* Panel */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">

          {/* Header */}
          <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
            <h3 className="text-base font-extrabold text-gray-900">Send Request</h3>
            <button
              type="button"
              onClick={onClose}
              className="text-xs font-semibold text-gray-600 border border-gray-200 hover:bg-gray-50 transition px-2.5 py-1.5 rounded-lg"
            >
              Close
            </button>
          </div>

          <div className="p-6">
            {/* Skill info */}
            <div className="mb-5 flex flex-col gap-1.5">
              {[
                { label: "Skill",      value: skill.title        },
                { label: "Provider",   value: skill.providerName  },
                { label: "Email",      value: skill.providerEmail },
                { label: "Available",  value: skill.availability  },
              ].map(({ label, value }) => (
                <div key={label} className="flex gap-2 text-sm">
                  <span className="font-semibold text-gray-700 w-20 shrink-0">{label}:</span>
                  <span className="text-gray-600">{value}</span>
                </div>
              ))}
            </div>

            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                {/* Preferred time slot */}
                <div className="min-w-0">
                  <label className="block text-xs font-extrabold uppercase tracking-wide text-gray-500 mb-1.5">
                    Preferred Time Slot
                  </label>
                  <input
                    className={inputCls()}
                    placeholder="e.g. Sat 11:00 AM"
                    required
                    value={booking.preferredSlot}
                    onChange={(e) =>
                      setBooking((p) => ({ ...p, preferredSlot: e.target.value }))
                    }
                  />
                </div>

                {/* Mode */}
                <div className="min-w-0">
                  <label className="block text-xs font-extrabold uppercase tracking-wide text-gray-500 mb-1.5">
                    Mode
                  </label>
                  <select
                    className={inputCls()}
                    required
                    value={booking.mode}
                    onChange={(e) =>
                      setBooking((p) => ({
                        ...p,
                        mode: e.target.value as BookingDraft["mode"],
                      }))
                    }
                  >
                    <option value="">Select mode…</option>
                    <option value="Online">Online</option>
                    <option value="In-person">In-person</option>
                  </select>
                </div>

                {/* Message */}
                <div className="md:col-span-2 min-w-0">
                  <label className="block text-xs font-extrabold uppercase tracking-wide text-gray-500 mb-1.5">
                    Message (optional)
                  </label>
                  <textarea
                    className={`${inputCls()} min-h-[100px] resize-y`}
                    placeholder="Short message to the provider…"
                    value={booking.message}
                    onChange={(e) =>
                      setBooking((p) => ({ ...p, message: e.target.value }))
                    }
                  />
                </div>
              </div>

              {/* Buttons */}
              <div className="mt-5 flex gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold text-sm py-2.5 rounded-xl transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold text-sm py-2.5 rounded-xl transition"
                >
                  Send Request
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}