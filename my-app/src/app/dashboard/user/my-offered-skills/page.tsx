// Manages the user's offered skills with tab-based filtering.
"use client";

import { useMemo, useState, JSX } from "react";
import Image from "next/image";
import AddSkillModal from "@/app/components/dashboard/user/skill-modals/AddSkillModal";
import EditSkillModal, { ExistingSkill } from "@/app/components/dashboard/user/skill-modals/EditSkillModal";
import { SkillPayload } from "@/app/components/dashboard/user/skill-modals/skillModalTypes";

// Types for skill records and filter tabs.

type SkillStatus = "approved" | "pending" | "rejected";

interface Skill {
  id: string;
  title: string;
  description: string;
  category: string;
  level: "Beginner" | "Intermediate" | "Expert";
  location: string;
  availability: string;
  status: SkillStatus;
  imageSrc: string;
}

// Seed data used for local UI state.

const INITIAL_SKILLS: Skill[] = [
  {
    id: "seo",
    title: "SEO Audit & On-Page Optimization",
    description: "I can review your website, fix on-page issues, and guide you on keyword targeting.",
    category: "Digital / IT Skills",
    level: "Expert",
    location: "Lahore",
    availability: "Mon–Fri • 7:00–9:00 PM",
    status: "approved",
    imageSrc: "/images/skills/seo.jpg",
  },
  {
    id: "excel",
    title: "Excel Salary Sheet Automation (VBA)",
    description: "Automate attendance, salary calculations, and reports using Excel macros.",
    category: "Technical / Hard Skills",
    level: "Intermediate",
    location: "Islamabad",
    availability: "Sat • 2:00–4:00 PM",
    status: "approved",
    imageSrc: "/images/skills/excel.jpg",
  },
  {
    id: "planner",
    title: "Goal Setting & Weekly Planning",
    description: "Practical weekly planning method for students and freelancers.",
    category: "Organizational / Management Skills",
    level: "Intermediate",
    location: "Rawalpindi",
    availability: "Sun • 10:00–11:00 AM",
    status: "pending",
    imageSrc: "/images/skills/planning.jpg",
  },
  {
    id: "freelance",
    title: "Freelancing Profile Setup (Basics)",
    description: "Guidance for setting up a basic freelancing profile and portfolio structure.",
    category: "Personal / Self-Management Skills",
    level: "Beginner",
    location: "Online",
    availability: "Fri • 6:00–7:00 PM",
    status: "rejected",
    imageSrc: "/images/skills/freelance.jpg",
  },
];

const TABS: { key: SkillStatus; label: string }[] = [
  { key: "approved", label: "Approved" },
  { key: "pending",  label: "Pending"  },
  { key: "rejected", label: "Rejected" },
];

// Helpers for filtering and status badge styling.

function badgeClasses(status: SkillStatus): string {
  const base = "inline-flex items-center border text-xs font-semibold px-2 py-0.5 rounded-full";
  if (status === "approved") return `${base} bg-green-100 text-green-700 border-green-200`;
  if (status === "pending")  return `${base} bg-yellow-100 text-yellow-700 border-yellow-200`;
  return                            `${base} bg-red-100 text-red-700 border-red-200`;
}

function Pill({ label, value }: { label: string; value: string }): JSX.Element {
  return (
    <div className="min-w-0 rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-xs text-gray-800">
      <span className="font-semibold text-gray-700">{label}:</span>{" "}
      <span className="break-words text-gray-600">{value}</span>
    </div>
  );
}

// Renders the offered skills management page.

export default function MyOfferedSkillsPage(): JSX.Element {
  const [tab, setTab] = useState<SkillStatus>("approved");
  const [items, setItems] = useState<Skill[]>(INITIAL_SKILLS);
  const [addOpen, setAddOpen] = useState(false);
  const [editSkill, setEditSkill] = useState<ExistingSkill | null>(null);

  const filtered = useMemo(() => items.filter((s) => s.status === tab), [items, tab]);

  const counts = useMemo(() => ({
    approved: items.filter((s) => s.status === "approved").length,
    pending:  items.filter((s) => s.status === "pending").length,
    rejected: items.filter((s) => s.status === "rejected").length,
  }), [items]);

  // Add: new skill goes to pending and tab switches
  function handleAddSkill(payload: SkillPayload): void {
    const newSkill: Skill = {
      id: `skill-${Date.now()}`,
      title:        payload.title,
      description:  payload.description,
      category:     payload.category,
      level:        payload.level,
      location:     payload.location,
      availability: payload.availability,
      imageSrc:     payload.imageSrc,
      status:       "pending",
    };
    setItems((prev) => [...prev, newSkill]);
    setAddOpen(false);
    setTab("pending");
  }

  // Edit: update matching skill in place
  function handleEditSkill(id: string, payload: SkillPayload): void {
    setItems((prev) =>
      prev.map((s) =>
        s.id === id
          ? {
              ...s,
              title:        payload.title,
              description:  payload.description,
              category:     payload.category,
              level:        payload.level,
              location:     payload.location,
              availability: payload.availability,
              imageSrc:     payload.imageSrc,
            }
          : s
      )
    );
    setEditSkill(null);
  }

  function handleRemove(id: string): void {
    setItems((prev) => prev.filter((s) => s.id !== id));
  }

  function openEdit(skill: Skill): void {
    setEditSkill({
      id:           skill.id,
      title:        skill.title,
      description:  skill.description,
      category:     skill.category,
      level:        skill.level,
      location:     skill.location,
      availability: skill.availability,
      imageSrc:     skill.imageSrc,
    });
  }

  return (
    <div>
      {/* Heading section with page summary and add-skill action. */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-green-900">
            My Offered Skills
          </h1>
          <p className="mt-2 text-sm text-gray-600">
            Skills you offer to the community. Status reflects review/approval.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setAddOpen(true)}
          className="shrink-0 inline-flex items-center gap-1.5 bg-green-600 hover:bg-green-700 text-white font-semibold text-sm px-4 py-2.5 rounded-xl transition"
        >
          <span className="text-base leading-none">+</span>
          Add New Skill
        </button>
      </div>

      {/* Main section containing status tabs and offered-skill cards. */}
      <section className="mt-6 bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">

        {/* Skill status filters */}
        <div className="flex flex-wrap gap-2 border-b border-gray-100 p-3">
          {TABS.map(({ key, label }) => (
            <button
              key={key}
              type="button"
              onClick={() => setTab(key)}
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition ${
                tab === key
                  ? "bg-green-600 text-white"
                  : "border border-gray-200 text-gray-600 hover:bg-gray-50"
              }`}
            >
              {label}
              <span
                className={`ml-2 text-xs font-bold px-1.5 py-0.5 rounded-full ${
                  tab === key ? "bg-white/20 text-white" : "bg-gray-100 text-gray-500"
                }`}
              >
                {counts[key]}
              </span>
            </button>
          ))}
        </div>

        {/* Cards */}
        <div className="p-4 md:p-5 flex flex-col gap-4">
          {filtered.length === 0 ? (
            <div className="py-10 text-center text-sm text-gray-400">
              No skills found in this category.
            </div>
          ) : (
            filtered.map((skill) => (
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

                  {/* Skill summary content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-start gap-2">
                      <div className="text-base font-extrabold text-gray-900 leading-snug">
                        {skill.title}
                      </div>
                      <span className={badgeClasses(skill.status)}>
                        {skill.status.charAt(0).toUpperCase() + skill.status.slice(1)}
                      </span>
                    </div>

                    <p className="mt-1.5 text-sm text-gray-600 leading-relaxed">
                      {skill.description}
                    </p>

                    <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <Pill label="Category"     value={skill.category}     />
                      <Pill label="Level"        value={skill.level}        />
                      <Pill label="Location"     value={skill.location}     />
                      <Pill label="Availability" value={skill.availability} />
                    </div>

                    {skill.status !== "rejected" && (
                      <div className="mt-4 flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() => openEdit(skill)}
                          className="inline-flex items-center justify-center rounded-lg border border-gray-200 px-3 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => handleRemove(skill.id)}
                          className="inline-flex items-center justify-center rounded-lg border border-red-200 px-3 py-2 text-sm font-semibold text-red-600 hover:bg-red-50 transition"
                        >
                          Remove
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </section>

      {/* Modals */}
      {addOpen && (
        <AddSkillModal onSave={handleAddSkill} onClose={() => setAddOpen(false)} />
      )}
      {editSkill && (
        <EditSkillModal
          skill={editSkill}
          onSave={handleEditSkill}
          onClose={() => setEditSkill(null)}
        />
      )}
    </div>
  );
}