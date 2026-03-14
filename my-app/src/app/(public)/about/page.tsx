import Image from "next/image";
import { JSX } from "react";

// Defines display props for individual team member profile cards.
interface TeamCardProps {
    name: string;
    role: string;
    desc: string;
    img: string;
}

// Defines content props for problem/solution explanation blocks on the About page.
interface ProblemSolutionBlockProps {
    problem: string;
    solution: string;
    flip?: boolean;
}

// Renders a team member card related to the "Our Team" section.
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

// Renders one problem/solution pair related to the platform value proposition.
function ProblemSolutionBlock({ problem, solution, flip = false }: ProblemSolutionBlockProps): JSX.Element {
    const problemCard = (
        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6 border-l-4 border-l-green-600">
            <div className="text-[11px] font-extrabold tracking-wide uppercase text-red-500 mb-2">
                Problem
            </div>
            <p className="text-sm text-gray-600 leading-relaxed">{problem}</p>
        </div>
    );

    const solutionCard = (
        <div className="rounded-2xl shadow-sm border border-green-200 p-6 bg-linear-to-br from-green-50 to-emerald-50">
            <div className="text-[11px] font-extrabold tracking-wide uppercase text-green-700 mb-2">
                Solution
            </div>
            <p className="text-sm text-gray-700 leading-relaxed">{solution}</p>
        </div>
    );

    return (
        <div className="grid lg:grid-cols-2 gap-5 items-start">
            {problemCard}
            {solutionCard}
        </div>
    );
}

// Renders a consistent heading style shared across About page sections.
function SectionHeading({ children }: { children: React.ReactNode }): JSX.Element {
    return (
        <h2 className="text-2xl md:text-3xl font-extrabold text-center text-green-900 mb-8">
            {children}
        </h2>
    );
}

// Renders the public About page with mission, solution, and team information.
export default function AboutPage(): JSX.Element {
    return (
        <main className="bg-gray-50 text-gray-800">

            {/* Hero section introducing mission and collaboration context. */}
            <section className="bg-linear-to-br from-green-700 to-green-500 text-white py-20 px-5">
                <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 items-center">
                    <div>
                        <h1 className="text-3xl md:text-4xl font-extrabold leading-tight">
                            Our Mission: Unlocking Potential Through Skill Sharing
                        </h1>
                        <p className="mt-4 text-sm md:text-base leading-relaxed opacity-90">
                            Welcome to our platform, a community-driven space designed to connect people through skills and
                            knowledge. Many individuals possess valuable expertise - from web development to photography or
                            design - but often lack the means to monetize or share it effectively. Our mission is to create
                            opportunities for everyone to exchange skills, learn, and grow together.
                        </p>
                    </div>

                    <div className="relative w-full h-72 md:h-80">
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

            {/* Problem-solution section explaining why the platform exists. */}
            <section className="py-16 px-5 bg-white">
                <div className="max-w-5xl mx-auto">
                    <SectionHeading>Solution to the Problems</SectionHeading>

                    <div className="flex flex-col gap-5">
                        <ProblemSolutionBlock
                            problem="Many individuals have talents and knowledge they want to share, but lack financial resources or a platform to connect with like-minded people. Traditional methods of learning or hiring can be expensive, limiting the flow of knowledge. This creates a gap between people who want to learn and those who are willing to teach or share skills."
                            solution="Our web-based platform bridges this gap by enabling skill exchange and knowledge sharing. Through a membership system, users can connect with others, offer their expertise, and receive help in areas they want to learn. The system fosters a supportive environment where everyone can contribute meaningfully."
                        />
                        <ProblemSolutionBlock
                            flip
                            problem="In many communities, opportunities for collaboration and learning are scattered or inaccessible. People struggle to find reliable ways to barter their skills for knowledge or support, leading to untapped potential and wasted talent."
                            solution="We facilitate a seamless skill bartering system that allows users to exchange knowledge, give feedback, and participate in community growth. By providing a structured yet flexible environment, our platform ensures meaningful contributions and personal development."
                        />
                    </div>
                </div>
            </section>

            {/* Team section showing contributors responsible for platform delivery. */}
            <section className="py-16 bg-gray-50">
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