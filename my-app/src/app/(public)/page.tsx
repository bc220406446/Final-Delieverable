"use client";

import Image from "next/image";
import Link from "next/link";
import { JSX, useEffect, useState } from "react";
import { getHomePage, CmsHomePage, CmsCategoryCard, CmsStepCard, CmsTeamMember } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";

const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_URL ?? "http://localhost:1337";

function resolveUrl(url?: string | null): string | null {
  if (!url) return null;
  return url.startsWith("http") ? url : `${STRAPI_URL}${url}`;
}

function SectionHeading({ children }: { children: React.ReactNode }): JSX.Element {
  return (
    <h2 className="text-2xl md:text-3xl font-extrabold text-center text-green-900 mb-10">
      {children}
    </h2>
  );
}

function CategoryCard({ title, desc, image }: CmsCategoryCard): JSX.Element {
  const imgUrl = resolveUrl(image?.url) ?? "/images/categories/cognitive.jpg";
  return (
    <div className="group cursor-pointer bg-white border border-gray-200 rounded-2xl overflow-hidden hover:shadow-lg transition duration-300">
      <div className="relative h-40 overflow-hidden">
        <Image src={imgUrl} alt={title} fill className="object-cover group-hover:scale-105 transition duration-300" unoptimized />
      </div>
      <div className="p-4">
        <h3 className="font-extrabold text-sm text-gray-900 leading-snug">{title}</h3>
        <p className="text-xs text-gray-500 mt-1 leading-relaxed">{desc}</p>
      </div>
    </div>
  );
}

function StepCard({ num, title, desc }: CmsStepCard): JSX.Element {
  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-6 text-center hover:shadow-lg transition">
      <div className="w-14 h-14 mx-auto rounded-full bg-green-600 text-white flex items-center justify-center text-xl font-extrabold shadow-sm">
        {num}
      </div>
      <h3 className="mt-4 font-extrabold text-sm text-green-900">{title}</h3>
      <p className="mt-1.5 text-xs text-gray-500 leading-relaxed">{desc}</p>
    </div>
  );
}

function TeamCard({ name, role, desc, image }: CmsTeamMember): JSX.Element {
  const imgUrl = resolveUrl(image?.url) ?? "/images/noProfileImage.png";
  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-8 text-center hover:shadow-lg transition">
      <div className="relative w-24 h-24 mx-auto mb-4">
        <Image src={imgUrl} alt={name} fill className="rounded-full object-cover border-4 border-green-100" unoptimized />
      </div>
      <span className="inline-flex items-center border text-xs font-semibold px-2 py-0.5 rounded-full bg-green-100 text-green-700 border-green-200">
        {role}
      </span>
      <h3 className="mt-2 text-base font-extrabold text-gray-900">{name}</h3>
      <p className="mt-2 text-sm text-gray-500 leading-relaxed">{desc}</p>
    </div>
  );
}

export default function HomePage(): JSX.Element {
  const { isAuthenticated } = useAuth();
  const [data,    setData]    = useState<CmsHomePage | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getHomePage()
      .then((d) => setData(d))
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <main className="min-h-[60vh] flex items-center justify-center">
        <p className="text-sm text-gray-400">Loading…</p>
      </main>
    );
  }

  if (!data) {
    return (
      <main className="min-h-[60vh] flex items-center justify-center">
        <p className="text-sm text-gray-400">Content unavailable. Please try again later.</p>
      </main>
    );
  }

  const heroImgUrl = resolveUrl(data.hero_image?.url) ?? "/images/coverImage.jpg";

  return (
    <main className="bg-gray-50 text-gray-800">

      {/* Hero */}
      <section className="bg-gradient-to-br from-green-700 to-green-500 text-white py-20 px-5">
        <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h1 className="text-4xl md:text-5xl font-extrabold mb-5 leading-tight">
              {data.hero_title}
            </h1>
            <p className="text-base md:text-lg mb-8 opacity-90">{data.hero_subtitle}</p>
            {data.hero_cta_label && (
              <Link
                href={isAuthenticated ? "/dashboard/user" : "/register"}
                className="inline-flex items-center justify-center bg-white text-green-700 font-semibold text-sm px-8 py-3 rounded-xl hover:shadow-lg transition"
              >
                {data.hero_cta_label}
              </Link>
            )}
          </div>
          <div className="relative w-full h-80 md:h-96">
            <Image src={heroImgUrl} alt="People collaborating" fill className="rounded-2xl shadow-2xl object-cover" priority unoptimized />
          </div>
        </div>
      </section>

      {/* Categories */}
      {data.categories?.length > 0 && (
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-5">
            <SectionHeading>Skill Categories</SectionHeading>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {data.categories.map((c, i) => <CategoryCard key={i} {...c} />)}
            </div>
          </div>
        </section>
      )}

      {/* How It Works */}
      {data.steps?.length > 0 && (
        <section className="py-20 bg-gray-50">
          <div className="max-w-7xl mx-auto px-5">
            <SectionHeading>How It Works</SectionHeading>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">
              {data.steps.map((s, i) => <StepCard key={i} {...s} />)}
            </div>
          </div>
        </section>
      )}

      {/* Team */}
      {data.team_members?.length > 0 && (
        <section className="py-20 bg-gray-50">
          <div className="max-w-7xl mx-auto px-5">
            <SectionHeading>Our Team</SectionHeading>
            <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto">
              {data.team_members.map((m, i) => <TeamCard key={i} {...m} />)}
            </div>
          </div>
        </section>
      )}

    </main>
  );
}