// Shows approved skill listings fetched from Strapi with filter support.
"use client";

import { useMemo, useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { getApprovedSkills, StrapiSkill } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import SendRequestModal, { SkillForRequest } from "@/app/components/dashboard/user/request/SendRequestModal";

const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_URL ?? "http://localhost:1337";

// Category labels matching Strapi enum → display label
const CATEGORY_LABELS: Record<string, string> = {
  Cognitive:      "Cognitive / Intellectual Skills",
  Technical:      "Technical / Hard Skills",
  Interpersonal:  "Interpersonal / People Skills",
  Personal:       "Personal / Self-Management Skills",
  Organizational: "Organizational / Management Skills",
  Digital:        "Digital / IT Skills",
  Language:       "Language / Communication",
};

const CITIES = [
  "Islamabad", "Rawalpindi", "Lahore",
  "Karachi",   "Faisalabad", "Peshawar",
  "Multan",    "Quetta",     "Gujranwala",
  "Online",
] as const;

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
      <span className="wrap-break-word text-gray-600">{value || "—"}</span>
    </div>
  );
}

// Resolves Strapi image URL to absolute.
function resolveImage(skill: StrapiSkill): string | null {
  const img = skill.image as any;
  if (!img) return null;
  const url = img.url ?? img.formats?.medium?.url ?? img.formats?.thumbnail?.url ?? null;
  if (!url) return null;
  return url.startsWith("http") ? url : `${STRAPI_URL}${url}`;
}

export default function BrowseSkillsPage() {
  const { token, user } = useAuth();
  const [skills,      setSkills]      = useState<StrapiSkill[]>([]);
  const [loading,     setLoading]     = useState(true);
  const [error,       setError]       = useState<string | null>(null);

  const [category,    setCategory]    = useState("");
  const [city,        setCity]        = useState("");
  const [level,       setLevel]       = useState("");
  const [q,           setQ]           = useState("");

  const [activeSkill, setActiveSkill] = useState<StrapiSkill | null>(null);
  const [sent,        setSent]        = useState<Record<number, boolean>>({});

  const fetchSkills = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      if (!token) return;
      const data = await getApprovedSkills(token);
      // Exclude own skills — user should not request their own skills
      const others = data.filter(
        (s) => s.provider_email?.toLowerCase() !== user?.email?.toLowerCase()
      );
      setSkills(others);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load skills.");
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => { fetchSkills(); }, [fetchSkills]);

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase();
    return skills.filter((s) => {
      // category filter compares against Strapi enum value e.g. "Cognitive"
      const matchCategory = category ? s.category === category          : true;
      const matchCity     = city     ? s.location  === city             : true;
      const matchLevel    = level    ? s.level      === level            : true;
      const matchQuery    = query
        ? s.title.toLowerCase().includes(query) ||
          s.provider_name.toLowerCase().includes(query) ||
          s.provider_email.toLowerCase().includes(query)
        : true;
      return matchCategory && matchCity && matchLevel && matchQuery;
    });
  }, [skills, category, city, level, q]);

  function handleSent() {
    if (activeSkill) setSent((prev) => ({ ...prev, [activeSkill.id]: true }));
    setActiveSkill(null);
  }

  const skillForModal: SkillForRequest | null = activeSkill
    ? {
        id:            String(activeSkill.id),
        title:         activeSkill.title,
        providerName:  activeSkill.provider_name,
        providerEmail: activeSkill.provider_email,
        availability:  activeSkill.availability,
      }
    : null;

  return (
    <div>
      <h1 className="text-2xl md:text-3xl font-extrabold text-green-900">Browse Skills</h1>
      <p className="mt-2 text-sm text-gray-600">
        Explore approved skills from the community. Use filters to find the best match.
      </p>

      {/* Filters */}
      <section className="mt-6 bg-white border border-gray-100 rounded-2xl shadow-sm p-5 md:p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">

          <div className="min-w-0">
            <FilterLabel>Category</FilterLabel>
            <select className={inputCls()} value={category} onChange={(e) => setCategory(e.target.value)}>
              <option value="">All Categories</option>
              {Object.entries(CATEGORY_LABELS).map(([val, label]) => (
                <option key={val} value={val}>{label}</option>
              ))}
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
              placeholder="Search skill or provider"
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
          </div>
        </div>

        {!loading && !error && (
          <p className="mt-3 text-sm text-gray-600">
            Showing <span className="font-semibold">{filtered.length}</span> of{" "}
            <span className="font-semibold">{skills.length}</span> skills.
          </p>
        )}
      </section>

      {/* Results */}
      <section className="mt-4 flex flex-col gap-4">
        {loading ? (
          <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-10 text-center text-sm text-gray-400">
            Loading skills…
          </div>
        ) : error ? (
          <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-10 text-center text-sm text-red-500">
            {error}
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-10 text-center text-sm text-gray-400">
            No skills match your filters.
          </div>
        ) : (
          filtered.map((skill) => {
            const isSent   = !!sent[skill.id];
            const imageUrl = resolveImage(skill);
            return (
              <div key={skill.id} className="bg-white border border-gray-200 rounded-2xl p-4 md:p-5">
                <div className="flex flex-col md:flex-row gap-4">

                  {/* Thumbnail */}
                  <div className="relative w-full md:w-[220px] h-[160px] rounded-2xl overflow-hidden bg-green-50 shrink-0">
                    {imageUrl ? (
                      <Image src={imageUrl} alt={skill.title} fill className="object-cover" unoptimized />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-300 text-4xl">🖼</div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="text-base font-extrabold text-gray-900 leading-snug">
                      {skill.title}
                    </div>
                    <p className="mt-1.5 text-sm text-gray-600 leading-relaxed">
                      {skill.description}
                    </p>

                    <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <Pill label="Offered By"   value={skill.provider_name}                          />
                      <Pill label="Email"        value={skill.provider_email}                         />
                      <Pill label="Category"     value={CATEGORY_LABELS[skill.category] ?? skill.category} />
                      <Pill label="Level"        value={skill.level}                                  />
                      <Pill label="Location"     value={skill.location}                               />
                      <Pill label="Availability" value={skill.availability}                           />
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

      {skillForModal && (
        <SendRequestModal
          skill={skillForModal}
          onSent={handleSent}
          onClose={() => setActiveSkill(null)}
        />
      )}
    </div>
  );
}
