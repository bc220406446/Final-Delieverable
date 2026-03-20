// Send request modal — requester selects their offered skill via checkbox cards.
"use client";

import { useState, useEffect, JSX } from "react";
import Image from "next/image";
import { useAuth } from "@/context/AuthContext";
import { getMySkills, createRequest, StrapiSkill } from "@/lib/api";

const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_URL ?? "http://localhost:1337";

export interface SkillForRequest {
  id:            string;
  title:         string;
  providerName:  string;
  providerEmail: string;
  availability:  string;
}

interface Props {
  skill:   SkillForRequest;
  onSent:  () => void;
  onClose: () => void;
}

function inputCls(): string {
  return [
    "w-full rounded-xl border border-gray-200 bg-white",
    "px-3.5 py-2.5 text-sm text-gray-900 placeholder-gray-400",
    "outline-none transition",
    "focus:ring-2 focus:ring-green-500 focus:border-green-500",
  ].join(" ");
}

function resolveImage(skill: StrapiSkill): string | null {
  const img = skill.image as any;
  if (!img) return null;
  const url = img.url ?? img.formats?.thumbnail?.url ?? null;
  if (!url) return null;
  return url.startsWith("http") ? url : `${STRAPI_URL}${url}`;
}

export default function SendRequestModal({ skill, onSent, onClose }: Props): JSX.Element {
  const { token, user } = useAuth();

  const [mySkills,      setMySkills]      = useState<StrapiSkill[]>([]);
  const [loadingSkills, setLoadingSkills] = useState(true);
  const [selectedIds,   setSelectedIds]   = useState<Set<number>>(new Set());
  const [slot,          setSlot]          = useState("");
  const [mode,          setMode]          = useState<"" | "Online" | "In-person">("");
  const [message,       setMessage]       = useState("");
  const [submitting,    setSubmitting]    = useState(false);
  const [error,         setError]         = useState<string | null>(null);

  useEffect(() => {
    if (!token) return;
    getMySkills(token)
      .then((skills) => setMySkills(skills.filter((s) => s.state === "approved")))
      .catch(() => setMySkills([]))
      .finally(() => setLoadingSkills(false));
  }, [token]);

  useEffect(() => {
    function handleKey(e: KeyboardEvent) { if (e.key === "Escape") onClose(); }
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [onClose]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (selectedIds.size === 0) { setError("Please select at least one skill to offer in exchange."); return; }
    if (!slot)       { setError("Please enter your preferred time slot."); return; }
    if (!mode)       { setError("Please select a mode."); return; }
    if (!token || !user) return;

    const offeredSkills = mySkills.filter((s) => selectedIds.has(s.id));
    if (offeredSkills.length === 0) { setError("Selected skill not found."); return; }

    setSubmitting(true);
    try {
      await createRequest(
        {
          provider_name:         skill.providerName,
          provider_email:        skill.providerEmail,
          requested_skill_id:    Number(skill.id),
          requested_skill_title: skill.title,
          offered_skill_id:      offeredSkills[0].id, // primary offered skill
          offered_skill_title:   offeredSkills.map((s) => s.title).join(" + "),
          preferred_slot:        slot,
          mode:                  mode as "Online" | "In-person",
          message:               message.trim(),
        },
        token
      );
      onSent();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to send request. Please try again.");
      setSubmitting(false);
    }
  }

  return (
    <>
      <div className="fixed inset-0 bg-black/30 z-40" onClick={onClose} />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg my-auto">

          {/* Header */}
          <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
            <div>
              <h3 className="text-base font-extrabold text-gray-900">Send Exchange Request</h3>
              <p className="text-xs text-gray-500 mt-0.5">Select one or more skills to offer in exchange.</p>
            </div>
            <button type="button" onClick={onClose}
              className="text-xs font-semibold text-gray-600 border border-gray-200 hover:bg-gray-50 transition px-2.5 py-1.5 rounded-lg">
              Close
            </button>
          </div>

          <div className="p-6">

            {/* Requested skill summary */}
            <div className="mb-5 bg-green-50 border border-green-100 rounded-xl p-4 flex flex-col gap-1">
              <p className="text-xs font-extrabold uppercase tracking-wide text-green-700 mb-1">You are requesting</p>
              {[
                { label: "Skill",     value: skill.title       },
                { label: "Provider",  value: skill.providerName },
                { label: "Available", value: skill.availability },
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

                {/* ── Skill checkbox cards ── */}
                <div>
                  <label className="block text-xs font-extrabold uppercase tracking-wide text-gray-500 mb-2">
                    Skills You Offer in Exchange * (select one or more)
                  </label>

                  {loadingSkills ? (
                    <div className="text-sm text-gray-400 py-3">Loading your skills…</div>
                  ) : mySkills.length === 0 ? (
                    <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                      You have no approved skills to offer. Get a skill approved first.
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
                            {/* Radio acting as checkbox (single-select) */}
                            <input
                              type="checkbox"
                              name="offeredSkill"
                              value={s.id}
                              checked={isSelected}
                              onChange={() => setSelectedIds((prev) => {
                                const next = new Set(prev);
                                if (next.has(s.id)) next.delete(s.id); else next.add(s.id);
                                return next;
                              })}
                              className="accent-green-600 w-4 h-4 shrink-0"
                            />

                            {/* Skill thumbnail */}
                            <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-gray-100 shrink-0">
                              {imgUrl ? (
                                <Image src={imgUrl} alt={s.title} fill className="object-cover" unoptimized />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-gray-300 text-lg">🖼</div>
                              )}
                            </div>

                            {/* Skill info */}
                            <div className="min-w-0 flex-1">
                              <div className={`text-sm font-bold truncate ${isSelected ? "text-green-900" : "text-gray-900"}`}>
                                {s.title}
                              </div>
                              <div className="text-xs text-gray-500 mt-0.5">
                                {s.category} · {s.level}
                              </div>
                            </div>

                            {/* Selected checkmark */}
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

                {/* ── Slot + Mode ── */}
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
                      <option value="">Select mode…</option>
                      <option value="Online">Online</option>
                      <option value="In-person">In-person</option>
                    </select>
                  </div>
                </div>

                {/* ── Message ── */}
                <div>
                  <label className="block text-xs font-extrabold uppercase tracking-wide text-gray-500 mb-1.5">
                    Message (optional)
                  </label>
                  <textarea
                    className={`${inputCls()} min-h-[80px] resize-y`}
                    placeholder="Introduce yourself and explain what you'd like to exchange…"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                  />
                </div>

                {/* ── Buttons ── */}
                <div className="flex gap-3">
                  <button type="button" onClick={onClose}
                    className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold text-sm py-2.5 rounded-xl transition">
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting || mySkills.length === 0 || selectedIds.size === 0}
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold text-sm py-2.5 rounded-xl transition disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {submitting ? "Sending…" : "Send Request"}
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
