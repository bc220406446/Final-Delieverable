import Image from "next/image";
import { JSX } from "react";
import { getAboutPage, CmsProblemBlock, CmsTeamMember } from "@/lib/api";

const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_URL ?? "http://localhost:1337";

function resolveUrl(url?: string | null): string | null {
  if (!url) return null;
  return url.startsWith("http") ? url : `${STRAPI_URL}${url}`;
}

function SectionHeading({ children }: { children: React.ReactNode }): JSX.Element {
  return <h2 className="text-2xl md:text-3xl font-extrabold text-center text-green-900 mb-8">{children}</h2>;
}

function ProblemSolutionBlock({ problem, solution }: CmsProblemBlock): JSX.Element {
  return (
    <div className="grid lg:grid-cols-2 gap-5 items-start">
      <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6 border-l-4 border-l-green-600">
        <div className="text-[11px] font-extrabold tracking-wide uppercase text-red-500 mb-2">Problem</div>
        <p className="text-sm text-gray-600 leading-relaxed">{problem}</p>
      </div>
      <div className="rounded-2xl shadow-sm border border-green-200 p-6 bg-linear-to-br from-green-50 to-emerald-50">
        <div className="text-[11px] font-extrabold tracking-wide uppercase text-green-700 mb-2">Solution</div>
        <p className="text-sm text-gray-700 leading-relaxed">{solution}</p>
      </div>
    </div>
  );
}

function TeamCard({ name, role, desc, image }: CmsTeamMember): JSX.Element {
  const imgUrl = image?.url
    ? (image.url.startsWith("http") ? image.url : `${STRAPI_URL}${image.url}`)
    : "/images/noProfileImage.png";
  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-8 text-center hover:shadow-lg transition">
      <div className="relative w-24 h-24 mx-auto mb-4">
        <Image src={imgUrl} alt={name} fill className="rounded-full object-cover border-4 border-green-100" unoptimized />
      </div>
      <span className="inline-flex items-center border text-xs font-semibold px-2 py-0.5 rounded-full bg-green-100 text-green-700 border-green-200">{role}</span>
      <h3 className="mt-2 text-base font-extrabold text-gray-900">{name}</h3>
      <p className="mt-2 text-sm text-gray-500 leading-relaxed">{desc}</p>
    </div>
  );
}

export default async function AboutPage(): Promise<JSX.Element> {
  const data = await getAboutPage();

  if (!data) {
    return (
      <main className="min-h-[60vh] flex items-center justify-center">
        <p className="text-sm text-gray-400">Content unavailable. Please try again later.</p>
      </main>
    );
  }

const heroImgUrl = resolveUrl(data.hero_image?.url) ?? "";


  return (
    <main className="bg-gray-50 text-gray-800">
      <section className="bg-linear-to-br from-green-700 to-green-500 text-white py-20 px-5">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <h1 className="text-3xl md:text-4xl font-extrabold leading-tight">{data.hero_title}</h1>
            <p className="mt-4 text-sm md:text-base leading-relaxed opacity-90">{data.hero_description}</p>
          </div>
          <div className="relative w-full h-72 md:h-80">
            <Image src={heroImgUrl} alt="People collaborating" fill className="rounded-2xl shadow-2xl object-cover" priority unoptimized />
          </div>
        </div>
      </section>

      {data.problem_blocks?.length > 0 && (
        <section className="py-16 px-5 bg-white">
          <div className="max-w-5xl mx-auto">
            <SectionHeading>Solution to the Problems</SectionHeading>
            <div className="flex flex-col gap-5">
              {data.problem_blocks.map((b, i) => <ProblemSolutionBlock key={i} {...b} />)}
            </div>
          </div>
        </section>
      )}

      {data.team_members?.length > 0 && (
        <section className="py-16 bg-gray-50">
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
