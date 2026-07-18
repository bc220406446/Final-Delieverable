"use client";

import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useMemo, useState } from "react";
import {
  getAvailableSkillsPage,
  getPublicApprovedSkills,
  resolveSkillCategory,
  resolveStrapiMediaUrl,
  StrapiSkill,
} from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import SendRequestModal, { SkillForRequest } from "@/app/components/user/request/SendRequestModal";
import Pagination from "@/app/components/user/Pagination";
import { paginateItems } from "@/lib/pagination";

const CITIES = [
  "Islamabad", "Rawalpindi", "Lahore", "Karachi", "Faisalabad", "Multan",
  "Peshawar", "Quetta", "Gujranwala", "Sialkot", "Hyderabad", "Bahawalpur",
  "Sargodha", "Abbottabad", "Gujrat", "Online",
] as const;

const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_URL ?? "http://localhost:1337";

function inputCls(): string {
  return "w-full min-w-0 rounded-xl border border-gray-200 bg-white px-3.5 py-2.5 text-sm text-gray-900 outline-none transition focus:border-green-500 focus:ring-2 focus:ring-green-500";
}

function FilterLabel({ children }: { children: React.ReactNode }) {
  return <label className="mb-1.5 block text-xs font-extrabold uppercase tracking-wide text-gray-500">{children}</label>;
}

function Pill({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0 rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-xs text-gray-800">
      <span className="font-semibold text-gray-700">{label}:</span>{" "}
      <span className="wrap-break-word text-gray-600">{value || "-"}</span>
    </div>
  );
}

function AvailableSkillsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isAuthenticated, isLoading: authLoading, user } = useAuth();
  const [skills, setSkills] = useState<StrapiSkill[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [heroImage, setHeroImage] = useState<string | null>(null);
  const [heroTitle, setHeroTitle] = useState("Get the Skill You Need Most");
  const [heroDescription, setHeroDescription] = useState(
    "Explore a wide range of community-offered skills—from technology, education, and creative arts to business, languages, and practical everyday expertise. To request a skill, you must first have an approved skill of your own to offer in exchange, keeping every connection true to the barter system."
  );
  const [category, setCategory] = useState(() => searchParams.get("category") ?? "");
  const [city, setCity] = useState("");
  const [level, setLevel] = useState("");
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [activeSkill, setActiveSkill] = useState<StrapiSkill | null>(null);
  const [sent, setSent] = useState<Set<number>>(new Set());

  useEffect(() => {
    getPublicApprovedSkills()
      .then(setSkills)
      .catch((err) => setError(err instanceof Error ? err.message : "Failed to load available skills."))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    getAvailableSkillsPage().then((data) => {
      if (data?.hero_title) setHeroTitle(data.hero_title);
      if (data?.hero_description) setHeroDescription(data.hero_description);
      const url = data?.hero_image?.url;
      if (url) setHeroImage(url.startsWith("http") ? url : `${STRAPI_URL}${url}`);
    }).catch(() => undefined);
  }, []);

  const categories = useMemo(
    () => Array.from(new Set(skills.map(resolveSkillCategory).filter(Boolean))).sort(),
    [skills]
  );

  const visibleSkills = useMemo(() => {
    const q = query.trim().toLowerCase();
    return skills.filter((skill) => {
      if (isAuthenticated && skill.provider_email.toLowerCase() === user?.email?.toLowerCase()) return false;
      const matchesCategory = category ? resolveSkillCategory(skill) === category : true;
      const matchesCity = city ? skill.location === city : true;
      const matchesLevel = level ? skill.level === level : true;
      const matchesQuery = !q || [skill.title, skill.description, skill.provider_name]
        .some((value) => value?.toLowerCase().includes(q));
      return matchesCategory && matchesCity && matchesLevel && matchesQuery;
    });
  }, [skills, category, city, level, query, isAuthenticated, user?.email]);

  const { items, state: pagination } = useMemo(() => paginateItems(visibleSkills, page), [visibleSkills, page]);

  function requestExchange(skill: StrapiSkill) {
    if (authLoading) return;
    if (!isAuthenticated) {
      router.push(`/login?returnTo=${encodeURIComponent("/available-skills")}`);
      return;
    }
    setActiveSkill(skill);
  }

  const modalSkill: SkillForRequest | null = activeSkill ? {
    id: String(activeSkill.id),
    title: activeSkill.title,
    providerName: activeSkill.provider_name,
    providerEmail: activeSkill.provider_email,
    availability: activeSkill.availability,
  } : null;

  return (
    <main className="bg-gray-50 text-gray-800 min-h-screen">
      <section className="bg-linear-to-br from-green-700 to-green-500 px-5 py-20 text-white">
        <div className="max-w-7xl mx-auto grid items-center gap-12 lg:grid-cols-2">
          <div>
            <h1 className="text-3xl md:text-4xl font-extrabold leading-tight">{heroTitle}</h1>
            <p className="mt-4 text-sm md:text-base leading-relaxed opacity-90">
              {heroDescription}
            </p>
          </div>
          <div className="relative h-72 w-full md:h-80">
            {heroImage ? (
              <Image src={heroImage} alt="Community members exchanging skills" fill priority unoptimized
                className="rounded-2xl object-cover shadow-2xl" />
            ) : (
              <div className="flex h-full items-center justify-center rounded-2xl border border-white/20 bg-white/10 text-sm text-white/70 shadow-2xl">
                Community Skills Exchange
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-5 py-12">
        <h2 className="mb-10 text-center text-2xl font-extrabold text-green-900 md:text-3xl">
          Explore Available Skills
        </h2>
        <div className="mb-6 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm md:p-6">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
            <div>
              <FilterLabel>Category</FilterLabel>
              <select className={inputCls()} value={category} onChange={(e) => { setCategory(e.target.value); setPage(1); }}>
                <option value="">All Categories</option>
                {categories.map((name) => <option key={name} value={name}>{name}</option>)}
              </select>
            </div>
            <div>
              <FilterLabel>Location / Mode</FilterLabel>
              <select className={inputCls()} value={city} onChange={(e) => { setCity(e.target.value); setPage(1); }}>
                <option value="">All Cities</option>
                {CITIES.map((name) => <option key={name} value={name}>{name}</option>)}
              </select>
            </div>
            <div>
              <FilterLabel>Skill Level</FilterLabel>
              <select className={inputCls()} value={level} onChange={(e) => { setLevel(e.target.value); setPage(1); }}>
                <option value="">All Levels</option>
                <option value="Beginner">Beginner</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Expert">Expert</option>
              </select>
            </div>
            <div>
              <FilterLabel>Search</FilterLabel>
              <input className={inputCls()} value={query} onChange={(e) => { setQuery(e.target.value); setPage(1); }}
                placeholder="Search skill or provider" />
            </div>
          </div>
          {!loading && !error && <p className="mt-3 text-sm text-gray-600">Showing <span className="font-semibold">{visibleSkills.length}</span> of <span className="font-semibold">{skills.length}</span> skills.</p>}
        </div>

        {loading ? (
          <div className="rounded-2xl bg-white p-12 text-center text-sm text-gray-400">Loading available skills...</div>
        ) : error ? (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-12 text-center text-sm text-red-600">{error}</div>
        ) : items.length === 0 ? (
          <div className="rounded-2xl bg-white p-12 text-center text-sm text-gray-400">No available skills found.</div>
        ) : (
          <div className="flex flex-col gap-4">
            {items.map((skill) => {
              const imageUrl = resolveStrapiMediaUrl(skill.image);
              const requestSent = sent.has(skill.id);
              return (
                <article key={skill.id} className="rounded-2xl border border-gray-200 bg-white p-4 md:p-5">
                  <div className="flex flex-col gap-4 overflow-hidden md:flex-row">
                    <div className="relative h-40 w-full shrink-0 overflow-hidden rounded-2xl bg-green-50 md:w-55">
                      {imageUrl ? <Image src={imageUrl.replace("/upload/", "/upload/f_auto,q_auto/")} alt={skill.title} fill className="object-fill" unoptimized />
                        : <div className="flex h-full items-center justify-center text-sm text-gray-400">No image</div>}
                    </div>
                    <div className="min-w-0 flex-1">
                      <h2 className="text-base font-extrabold text-gray-900">{skill.title}</h2>
                      <p className="mt-1.5 text-sm leading-relaxed text-gray-600">{skill.description}</p>
                      <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-3">
                        <Pill label="Offered By" value={skill.provider_name} />
                        <Pill label="Email" value={isAuthenticated ? skill.provider_email : "-"} />
                        <Pill label="Category" value={resolveSkillCategory(skill)} />
                        <Pill label="Level" value={skill.level} />
                        <Pill label="Location / Mode" value={skill.location} />
                        <Pill label="Availability" value={skill.availability} />
                      </div>
                      <button type="button" onClick={() => requestExchange(skill)} disabled={authLoading || requestSent}
                        className="mt-4 inline-flex items-center justify-center rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:bg-gray-300">
                        {requestSent ? "Request Sent" : "Send Exchange Request"}
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}

        <Pagination page={pagination.page} pageCount={pagination.pageCount} total={pagination.total}
          startItem={pagination.startItem} endItem={pagination.endItem} onPageChange={setPage} />
      </section>

      {modalSkill && (
        <SendRequestModal skill={modalSkill} onClose={() => setActiveSkill(null)} onSent={() => {
          setSent((previous) => new Set(previous).add(activeSkill!.id));
          setActiveSkill(null);
        }} />
      )}
    </main>
  );
}

export default function AvailableSkillsPage() {
  return (
    <Suspense fallback={<main className="min-h-[60vh] flex items-center justify-center"><p className="text-sm text-gray-400">Loading available skills...</p></main>}>
      <AvailableSkillsContent />
    </Suspense>
  );
}
