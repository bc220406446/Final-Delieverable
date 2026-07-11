"use client";

import { useState, useEffect, JSX } from "react";
import Image from "next/image";
import { useAuth } from "@/context/AuthContext";
import { getMySkills, StrapiSkill, resolveSkillCategory, resolveStrapiMediaUrl } from "@/lib/api";

export interface EditRequestDraft {
  offered_skill_id:    number;
  offered_skill_title: string;
  preferred_slot:      string;
  mode:                "Online" | "In-person";
  message:             string;
}

// Request data needed to reopen an existing pending request for editing.
export interface RequestForEdit {
  id:                    number;
  requested_skill_title: string;
  provider_name:         string;
  provider_email:        string;
  offered_skill_title:   string;
  preferred_slot:        string;
  mode:                  "Online" | "In-person";
  message:               string;
}

interface Props {
  request: RequestForEdit;
  onSave:  (id: number, draft: EditRequestDraft) => void;
  onClose: () => void;
}

// Shared input/select class builder for request editing fields.
function inputCls(): string {
  return [
    "w-full rounded-xl border border-gray-200 bg-white",
    "px-3.5 py-2.5 text-sm text-gray-900 placeholder-gray-400",
    "outline-none transition",
    "focus:ring-2 focus:ring-green-500 focus:border-green-500",
  ].join(" ");
}

// Resolve an offered skill image URL for the selectable skill list.
function resolveImage(skill: StrapiSkill): string | null {
  return resolveStrapiMediaUrl(skill.image);
}

// Modal for editing a pending sent exchange request.
export default function EditRequestModal({ request, onSave, onClose }: Props): JSX.Element {
  const { token } = useAuth();

  const [mySkills,      setMySkills]      = useState<StrapiSkill[]>([]);
  const [loadingSkills, setLoadingSkills] = useState(true);

  // Rebuild previous selections from the saved offered-skill title list.
  const prevTitles = request.offered_skill_title.split(" + ").map((t) => t.trim());
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());

  const [slot,    setSlot]    = useState(request.preferred_slot);
  const [mode,    setMode]    = useState<"Online" | "In-person">(request.mode);
  const [message, setMessage] = useState(request.message);
  const [error,   setError]   = useState<string | null>(null);
  const [saving,  setSaving]  = useState(false);

  // Load approved skills and preselect the ones already attached to this request.
  useEffect(() => {
    if (!token) return;
    getMySkills(token)
      .then((skills) => {
        const approved = skills.filter((s) => s.state === "approved");
        setMySkills(approved);
        const preSelected = new Set(
          approved.filter((s) => prevTitles.includes(s.title)).map((s) => s.id)
        );
        setSelectedIds(preSelected);
      })
      .catch(() => setMySkills([]))
      .finally(() => setLoadingSkills(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  // Allow Escape key to close the modal.
  useEffect(() => {
    function handleKey(e: KeyboardEvent) { if (e.key === "Escape") onClose(); }
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [onClose]);

  // Toggle an offered skill in the selected set.
  function toggleSkill(id: number) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }

  // Validate edits and send the updated request draft to the parent page.
  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (selectedIds.size === 0) { setError("Please select at least one skill to offer."); return; }
    if (!slot.trim())           { setError("Please enter your preferred time slot."); return; }
    if (!mode)                  { setError("Please select a mode."); return; }

    const offeredSkills = mySkills.filter((s) => selectedIds.has(s.id));
    setSaving(true);

    onSave(request.id, {
      offered_skill_id:    offeredSkills[0].id,
      offered_skill_title: offeredSkills.map((s) => s.title).join(" + "),
      preferred_slot:      slot.trim(),
      mode,
      message:             message.trim(),
    });
  }

  return (
    <>
      <div className="fixed inset-0 bg-black/30 z-40" onClick={onClose} />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg my-auto">

          <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
            <div>
              <h3 className="text-base font-extrabold text-gray-900">Edit Exchange Request</h3>
              <p className="text-xs text-gray-500 mt-0.5">Update your offered skills or details.</p>
            </div>
            <button type="button" onClick={onClose}
              className="text-xs font-semibold text-gray-600 border border-gray-200 hover:bg-gray-50 transition px-2.5 py-1.5 rounded-lg">
              Close
            </button>
          </div>

          <div className="p-6">

            {/* Summary of the request target being edited. */}
            <div className="mb-5 bg-green-50 border border-green-100 rounded-xl p-4 flex flex-col gap-1">
              <p className="text-xs font-extrabold uppercase tracking-wide text-green-700 mb-1">Requesting</p>
              {[
                { label: "Skill",    value: request.requested_skill_title },
                { label: "Provider", value: request.provider_name         },
                { label: "Email",    value: request.provider_email        },
              ].map(({ label, value }) => (
                <div key={label} className="flex gap-2 text-sm">
                  <span className="font-semibold text-gray-700 w-20 shrink-0">{label}:</span>
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
              <div className="flex flex-col gap-5">

                {/* User can update which approved skills they are offering. */}
                <div>
                  <label className="block text-xs font-extrabold uppercase tracking-wide text-gray-500 mb-2">
                    Skills You Offer in Exchange * (select one or more)
                  </label>

                  {loadingSkills ? (
                    <div className="text-sm text-gray-400 py-3">Loading your skills...</div>
                  ) : mySkills.length === 0 ? (
                    <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                      You have no approved skills to offer.
                    </div>
                  ) : (
                    <div className="flex flex-col gap-2 max-h-52 overflow-y-auto pr-1">
                      {mySkills.map((s) => {
                        const isSelected = selectedIds.has(s.id);
                        const imgUrl     = resolveImage(s);
                        return (
                          <label
                            key={s.id}
                            className={`flex items-center gap-3 rounded-xl border-2 p-3 cursor-pointer transition select-none ${
                              isSelected
                                ? "border-green-500 bg-green-50"
                                : "border-gray-200 hover:border-green-300 hover:bg-gray-50"
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => toggleSkill(s.id)}
                              className="accent-green-600 w-4 h-4 shrink-0"
                            />

                            <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-gray-100 shrink-0">
                              {imgUrl ? (
                                <Image src={imgUrl} alt={s.title} fill className="object-fill" unoptimized />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-gray-300 text-lg">🖼</div>
                              )}
                            </div>

                            <div className="min-w-0 flex-1">
                              <div className={`text-sm font-bold truncate ${isSelected ? "text-green-900" : "text-gray-900"}`}>
                                {s.title}
                              </div>
                              <div className="text-xs text-gray-500 mt-0.5">
                                {resolveSkillCategory(s)} · {s.level}
                              </div>
                            </div>

                            {isSelected && (
                              <div className="shrink-0 w-5 h-5 rounded-full bg-green-600 flex items-center justify-center">
                                <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" strokeWidth={3} viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                </svg>
                              </div>
                            )}
                          </label>
                        );
                      })}
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-extrabold uppercase tracking-wide text-gray-500 mb-1.5">
                      Preferred Time Slot *
                    </label>
                    <input
                      className={inputCls()}
                      placeholder="e.g. Sat 11:00 AM"
                      value={slot}
                      onChange={(e) => setSlot(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-extrabold uppercase tracking-wide text-gray-500 mb-1.5">
                      Mode *
                    </label>
                    <select
                      className={inputCls()}
                      value={mode}
                      onChange={(e) => setMode(e.target.value as typeof mode)}
                    >
                      <option value="Online">Online</option>
                      <option value="In-person">In-person</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-extrabold uppercase tracking-wide text-gray-500 mb-1.5">
                    Message (optional)
                  </label>
                  <textarea
                    className={`${inputCls()} min-h-20 resize-y`}
                    placeholder="Short message to the provider..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                  />
                </div>

                <div className="flex gap-3">
                  <button type="button" onClick={onClose} disabled={saving}
                    className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold text-sm py-2.5 rounded-xl transition disabled:opacity-50">
                    Cancel
                  </button>
                  <button type="submit" disabled={saving || selectedIds.size === 0}
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold text-sm py-2.5 rounded-xl transition disabled:opacity-60 disabled:cursor-not-allowed">
                    {saving ? "Saving..." : "Save Changes"}
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
