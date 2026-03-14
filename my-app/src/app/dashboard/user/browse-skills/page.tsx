// Shows skill listings users can browse and filter.
"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import SendRequestModal, {
  SkillForRequest,
  BookingDraft,
} from "@/app/components/dashboard/user/request/SendRequestModal";
import skillsData from "@/data/skills.json";

// Types for browse cards and filter state.

type SkillLevel = "Beginner" | "Intermediate" | "Expert";

type Skill = {
  id: string;
  title: string;
  description: string;
  providerName: string;
  providerEmail: string;
  category: string;
  level: SkillLevel;
  location: string;
  availability: string;
  imageSrc: string;
};

// Cast imported JSON to typed array
const SKILLS: Skill[] = skillsData as Skill[];

// Static labels and browse filter options.

const CATEGORIES = [
  "Cognitive / Intellectual Skills",
  "Technical / Hard Skills",
  "Interpersonal / People Skills",
  "Personal / Self-Management Skills",
  "Organizational / Management Skills",
  "Digital / IT Skills",
  "Language / Communication Skills",
] as const;

const CITIES = [
  "Islamabad", "Rawalpindi", "Lahore",
  "Karachi",   "Faisalabad", "Peshawar",
] as const;

// Helpers for search and category filtering.

function inputCls(): string {
  return [
    "w-full min-w-0 rounded-xl border border-gray-200 bg-white",
    "px-3.5 py-2.5 text-sm text-gray-900 placeholder-gray-400",
    "outline-none transition",
    "focus:ring-2 focus:ring-green-500 focus:border-green-500",
  ].join(" ");
}

function FilterLabel({ children }: { children: React.ReactNode }) {
  return (
    <label className="block text-xs font-extrabold uppercase tracking-wide text-gray-500 mb-1.5">
      {children}
    </label>
  );
}

function Pill({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0 rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-xs text-gray-800">
      <span className="font-semibold text-gray-700">{label}:</span>{" "}
      <span className="wrap-break-word text-gray-600">{value}</span>
    </div>
  );
}

// Renders the browse skills page.

export default function BrowseSkillsPage() {
  const [category, setCategory] = useState("");
  const [city, setCity] = useState("");
  const [level, setLevel] = useState("");
  const [q, setQ] = useState("");

  const [activeSkill, setActiveSkill] = useState<Skill | null>(null);
  const [sent, setSent] = useState<Record<string, boolean>>({});

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase();
    return SKILLS.filter((s) => {
      const matchCategory = category ? s.category === category : true;
      const matchCity     = city     ? s.location === city     : true;
      const matchLevel    = level    ? s.level === level        : true;
      const matchQuery    = query
        ? s.title.toLowerCase().includes(query) ||
          s.providerName.toLowerCase().includes(query) ||
          s.providerEmail.toLowerCase().includes(query)
        : true;
      return matchCategory && matchCity && matchLevel && matchQuery;
    });
  }, [category, city, level, q]);

  function handleSend(skillId: string, _draft: BookingDraft) {
    setSent((prev) => ({ ...prev, [skillId]: true }));
    setActiveSkill(null);
  }

  const skillForModal: SkillForRequest | null = activeSkill
    ? {
        id:            activeSkill.id,
        title:         activeSkill.title,
        providerName:  activeSkill.providerName,
        providerEmail: activeSkill.providerEmail,
        availability:  activeSkill.availability,
      }
    : null;

  return (
    <div>
      {/* Heading section describing discovery and filtering context. */}
      <h1 className="text-2xl md:text-3xl font-extrabold text-green-900">Browse Skills</h1>
      <p className="mt-2 text-sm text-gray-600">
        Explore skills from the community. Use filters to find the best match.
      </p>

      {/* Filter controls section for category, location, level, and search. */}
      <section className="mt-6 bg-white border border-gray-100 rounded-2xl shadow-sm p-5 md:p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">

          <div className="min-w-0">
            <FilterLabel>Category</FilterLabel>
            <select className={inputCls()} value={category} onChange={(e) => setCategory(e.target.value)}>
              <option value="">All Categories</option>
              {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          <div className="min-w-0">
            <FilterLabel>Location</FilterLabel>
            <select className={inputCls()} value={city} onChange={(e) => setCity(e.target.value)}>
              <option value="">All Cities</option>
              {CITIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          <div className="min-w-0">
            <FilterLabel>Skill Level</FilterLabel>
            <select className={inputCls()} value={level} onChange={(e) => setLevel(e.target.value)}>
              <option value="">All Levels</option>
              <option value="Beginner">Beginner</option>
              <option value="Intermediate">Intermediate</option>
              <option value="Expert">Expert</option>
            </select>
          </div>

          <div className="min-w-0">
            <FilterLabel>Search</FilterLabel>
            <input
              className={inputCls()}
              placeholder="Search skill"
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
          </div>
        </div>

        <p className="mt-3 text-sm text-gray-600">
          Showing <span className="font-semibold">{filtered.length}</span> of{" "}
          <span className="font-semibold">{SKILLS.length}</span> skills.
        </p>
      </section>

      {/* Skill results section showing cards that match active filters. */}
      <section className="mt-4 flex flex-col gap-4">
        {filtered.length === 0 ? (
          <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-6 text-center text-sm text-gray-400">
            No skills match your filters.
          </div>
        ) : (
          filtered.map((skill) => {
            const isSent = !!sent[skill.id];
            return (
              <div key={skill.id} className="bg-white border border-gray-200 rounded-2xl p-4 md:p-5">
                <div className="flex flex-col md:flex-row gap-4">

                  {/* Thumbnail */}
                  <div className="relative w-full md:w-[220px] h-[160px] rounded-2xl overflow-hidden bg-green-50 shrink-0">
                    <Image
                      src={skill.imageSrc}
                      alt={skill.title}
                      fill
                      className="object-cover"
                      unoptimized
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="text-base font-extrabold text-gray-900 leading-snug">
                      {skill.title}
                    </div>

                    <p className="mt-1.5 text-sm text-gray-600 leading-relaxed">
                      {skill.description}
                    </p>

                    <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <Pill label="Offered By"   value={skill.providerName}  />
                      <Pill label="Email"        value={skill.providerEmail} />
                      <Pill label="Category"     value={skill.category}      />
                      <Pill label="Level"        value={skill.level}         />
                      <Pill label="Location"     value={skill.location}      />
                      <Pill label="Availability" value={skill.availability}  />
                    </div>

                    <div className="mt-4">
                      <button
                        type="button"
                        onClick={() => setActiveSkill(skill)}
                        disabled={isSent}
                        className={`inline-flex items-center justify-center rounded-lg px-3 py-2 text-sm font-semibold transition ${
                          isSent
                            ? "bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200"
                            : "bg-green-600 text-white hover:bg-green-700"
                        }`}
                      >
                        {isSent ? "Request Sent" : "Send Request"}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </section>

      {/* Request modal section for initiating a booking with selected skill provider. */}
      {skillForModal && (
        <SendRequestModal
          skill={skillForModal}
          onSend={handleSend}
          onClose={() => setActiveSkill(null)}
        />
      )}
    </div>
  );
}