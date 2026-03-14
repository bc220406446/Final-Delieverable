// Provides the modal for editing pending user request details.
"use client";

import { useState, useEffect, JSX } from "react";

// Defines editable request data structures and component props.

export interface EditRequestDraft {
  preferredTimeSlot: string;
  mode: "" | "Online" | "In-person";
  message: string;
}

export interface RequestForEdit {
  id: string;
  skillTitle: string;
  personName: string;
  personEmail: string;
  preferredTimeSlot: string;
  mode: "" | "Online" | "In-person";
  message: string;
}

interface Props {
  request: RequestForEdit;
  onSave: (id: string, draft: EditRequestDraft) => void;
  onClose: () => void;
}

// Supplies shared input styling for request form controls.

function inputCls(): string {
  return [
    "w-full min-w-0 rounded-xl border border-gray-200 bg-white",
    "px-3.5 py-2.5 text-sm text-gray-900 placeholder-gray-400",
    "outline-none transition",
    "focus:ring-2 focus:ring-green-500 focus:border-green-500",
  ].join(" ");
}

// Renders the edit-request form modal with validation and save actions.

export default function EditRequestModal({ request, onSave, onClose }: Props): JSX.Element {
  const [draft, setDraft] = useState<EditRequestDraft>({
    preferredTimeSlot: request.preferredTimeSlot,
    mode:              request.mode,
    message:           request.message,
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
    if (!draft.preferredTimeSlot || !draft.mode) return;
    onSave(request.id, draft);
  }

  return (
    <>
      {/* Backdrop - pointer-events-none, only Close / Escape dismisses */}
      <div className="fixed inset-0 bg-black/30 z-40 pointer-events-none" />

      {/* Panel */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">

          {/* Header */}
          <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
            <h3 className="text-base font-extrabold text-gray-900">Edit Request</h3>
            <button
              type="button"
              onClick={onClose}
              className="text-xs font-semibold text-gray-600 border border-gray-200 hover:bg-gray-50 transition px-2.5 py-1.5 rounded-lg"
            >
              Close
            </button>
          </div>

          <div className="p-6">
            {/* Request info */}
            <div className="mb-5 flex flex-col gap-1.5">
              {[
                { label: "Skill",    value: request.skillTitle  },
                { label: "Provider", value: request.personName  },
                { label: "Email",    value: request.personEmail },
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
                    value={draft.preferredTimeSlot}
                    onChange={(e) =>
                      setDraft((p) => ({ ...p, preferredTimeSlot: e.target.value }))
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
                    value={draft.mode}
                    onChange={(e) =>
                      setDraft((p) => ({
                        ...p,
                        mode: e.target.value as EditRequestDraft["mode"],
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
                    value={draft.message}
                    onChange={(e) =>
                      setDraft((p) => ({ ...p, message: e.target.value }))
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
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}