import Image from "next/image";
import Link from "next/link";
import { JSX } from "react";

// Defines props for skill category cards shown in the categories section.
interface CategoryCardProps {
  title: string;
  desc: string;
  img: string;
  alt: string;
}

// Defines props for the numbered process cards in the "How It Works" section.
interface StepCardProps {
  num: number;
  title: string;
  desc: string;
}

// Defines props for contributor cards shown in the team section.
interface TeamCardProps {
  name: string;
  role: string;
  desc: string;
  img: string;
}

// Renders a skill category summary card related to platform discovery content.
function CategoryCard({ title, desc, img, alt }: CategoryCardProps): JSX.Element {
  return (
    <div className="group cursor-pointer bg-white border border-gray-200 rounded-2xl overflow-hidden hover:shadow-lg transition duration-300">
      <div className="relative h-40 overflow-hidden">
        <Image
          src={img}
          alt={alt}
          fill
          className="object-cover group-hover:scale-105 transition duration-300"
          unoptimized
        />
      </div>
      <div className="p-4">
        <h3 className="font-extrabold text-sm text-gray-900 leading-snug">{title}</h3>
        <p className="text-xs text-gray-500 mt-1 leading-relaxed">{desc}</p>
      </div>
    </div>
  );
}

// Renders a single onboarding step related to the platform usage flow.
function StepCard({ num, title, desc }: StepCardProps): JSX.Element {
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

// Renders a team profile card related to platform ownership and credibility.
function TeamCard({ name, role, desc, img }: TeamCardProps): JSX.Element {
  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-8 text-center hover:shadow-lg transition">
      <div className="relative w-24 h-24 mx-auto mb-4">
        <Image
          src={img}
          alt={name}
          fill
          className="rounded-full object-cover border-4 border-green-100"
          unoptimized
        />
      </div>
      <span className="inline-flex items-center border text-xs font-semibold px-2 py-0.5 rounded-full bg-green-100 text-green-700 border-green-200">
        {role}
      </span>
      <h3 className="mt-2 text-base font-extrabold text-gray-900">{name}</h3>
      <p className="mt-2 text-sm text-gray-500 leading-relaxed">{desc}</p>
    </div>
  );
}

// Renders a consistent heading style shared across home page sections.
function SectionHeading({ children }: { children: React.ReactNode }): JSX.Element {
  return (
    <h2 className="text-2xl md:text-3xl font-extrabold text-center text-green-900 mb-10">
      {children}
    </h2>
  );
}

// Renders the public home page with hero, categories, process, and team sections.
export default function HomePage(): JSX.Element {
  return (
    <main className="bg-gray-50 text-gray-800">

      {/* Hero section introducing the platform mission and primary sign-up action. */}
      <section className="bg-linear-to-br from-green-700 to-green-500 text-white py-20 px-5">
        <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h1 className="text-4xl md:text-5xl font-extrabold mb-5 leading-tight">
              Community Skills Exchange Platform
            </h1>
            <p className="text-base md:text-lg mb-8 opacity-90">
              Connect, Learn, and Share Your Talents with Your Local Community
            </p>
            <Link
              href="/register"
              className="inline-flex items-center justify-center bg-white text-green-700 font-semibold text-sm px-8 py-3 rounded-xl hover:shadow-lg transition"
            >
              Get Started
            </Link>
          </div>

          <div className="relative w-full h-80 md:h-96">
            <Image
              src="/images/coverImage.jpg"
              alt="People collaborating"
              fill
              className="rounded-2xl shadow-2xl object-cover"
              priority
              unoptimized
            />
          </div>
        </div>
      </section>

      {/* Categories section highlighting the skill domains available for exchange. */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-5">
          <SectionHeading>Skill Categories</SectionHeading>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            <CategoryCard
              title="Cognitive / Intellectual Skills"
              desc="Skills that involve thinking, reasoning, and learning."
              img="/images/categories/cognitive.jpg"
              alt="Cognitive Skills"
            />
            <CategoryCard
              title="Digital / IT Skills"
              desc="Skills for using modern technology and digital tools."
              img="/images/categories/digital.jpg"
              alt="Digital Skills"
            />
            <CategoryCard
              title="Technical / Hard Skills"
              desc="Job-specific abilities that can be measured or taught."
              img="/images/categories/technical.jpg"
              alt="Technical Skills"
            />
            <CategoryCard
              title="Interpersonal / People Skills"
              desc="Skills that help you work and communicate effectively with others."
              img="/images/categories/interpersonal.jpg"
              alt="Interpersonal Skills"
            />
            <CategoryCard
              title="Personal / Self-Management Skills"
              desc="Skills related to how you manage yourself and your work habits."
              img="/images/categories/personal.jpg"
              alt="Personal Skills"
            />
            <CategoryCard
              title="Organizational / Management Skills"
              desc="Skills used to plan, organize, and oversee tasks or people."
              img="/images/categories/organizational.jpg"
              alt="Organizational Skills"
            />
            <CategoryCard
              title="Language / Communication Skills"
              desc="Skills in speaking, writing, and understanding languages."
              img="/images/categories/language.jpg"
              alt="Language Skills"
            />
          </div>
        </div>
      </section>

      {/* Process section explaining the end-to-end skill exchange journey. */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-5">
          <SectionHeading>How It Works</SectionHeading>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">
            <StepCard
              num={1}
              title="Create Account"
              desc="Sign up quickly and easily to join our vibrant community."
            />
            <StepCard
              num={2}
              title="Offer Your Skills"
              desc="Share what you can offer or what you need help with."
            />
            <StepCard
              num={3}
              title="Send Requests & Exchange"
              desc="Connect with others, send requests, and start exchanging skills!"
            />
            <StepCard
              num={4}
              title="Rate & Review"
              desc="Rate and review experiences to help build trust in the community."
            />
          </div>
        </div>
      </section>

      {/* Team section presenting the contributors behind the platform experience. */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-5">
          <SectionHeading>Our Team</SectionHeading>

          <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto">
            <TeamCard
              name="Muhammad Kamran"
              role="Developer • Debugger"
              desc="Focused on building core features, improving performance, and solving bugs to keep the platform reliable and scalable."
              img="/images/team/kamran.png"
            />
            <TeamCard
              name="Malaika Ashraf"
              role="UI / UX Designer"
              desc="Responsible for UI/UX design, layout consistency, and optimizing user experience for smooth and intuitive interaction."
              img="/images/team/malaika.png"
            />
          </div>
        </div>
      </section>

    </main>
  );
}