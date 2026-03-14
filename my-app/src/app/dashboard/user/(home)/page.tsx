// Renders the user dashboard home summary.
import Link from "next/link";
import { JSX } from "react";

// Types used by dashboard metric cards.

interface Stat {
  label: string;
  value: string | number;
}

interface ActionCard {
  title: string;
  desc: string;
  href: string;
  variant: "primary" | "outline" | "ghost";
  cta: string;
}

// Static dashboard stats and quick links.

const STATS: Stat[] = [
  { label: "Offered Skills",      value: 6   },
  { label: "Requests",            value: 5   },
  { label: "Upcoming Exchanges",  value: 2   },
  { label: "Rating",              value: 4.7 },
];

const ACTIONS: ActionCard[] = [
  {
    title:   "Add an Offered Skill",
    desc:    "Share what you can teach or do.",
    href:    "/dashboard/user/my-offered-skills",
    variant: "primary",
    cta:     "Add Skill",
  },
  {
    title:   "Browse Skills",
    desc:    "Find a skill and book an exchange.",
    href:    "/dashboard/user/browse-skills",
    variant: "outline",
    cta:     "Browse",
  },
  {
    title:   "Check Requests",
    desc:    "Approve or manage pending requests.",
    href:    "/dashboard/user/requests",
    variant: "ghost",
    cta:     "Open Requests",
  },
];

// Helpers for card labels and display values.

function buttonClass(v: ActionCard["variant"]): string {
  const base =
    "inline-flex items-center justify-center rounded-lg px-3 py-2 text-sm font-semibold transition";
  if (v === "primary") return `${base} bg-green-600 text-white hover:bg-green-700`;
  if (v === "outline") return `${base} border border-green-600 text-green-700 hover:bg-green-50`;
  return                      `${base} border border-gray-200 text-gray-700 hover:bg-gray-50`;
}

// Renders the user dashboard home page.

export default function UserDashboardHomePage(): JSX.Element {
  const userName = "Muhammad Kamran";

  return (
    <div>
      {/* Heading section introducing the user dashboard summary view. */}
      <h1 className="text-2xl md:text-3xl font-extrabold text-green-900">
        Dashboard
      </h1>
      <p className="mt-2 text-sm text-gray-600">
        Assalam-o-Alaikum,{" "}
        <span className="font-semibold text-gray-800">{userName}</span>
      </p>

      {/* Stats section showing high-level user activity metrics. */}
      <section className="mt-6 grid grid-cols-2 lg:grid-cols-4 gap-3">
        {STATS.map((s: Stat) => (
          <div
            key={s.label}
            className="bg-white border border-gray-100 rounded-2xl shadow-sm p-4 flex flex-col gap-1"
          >
            <div className="text-[11px] font-extrabold tracking-wide uppercase text-gray-500">
              {s.label}
            </div>
            <div className="text-2xl font-black text-gray-900">{s.value}</div>
          </div>
        ))}
      </section>

      {/* Quick actions section linking to common dashboard tasks. */}
      <section className="mt-4 bg-white border border-gray-100 rounded-2xl shadow-sm p-5 md:p-6">
        <div className="text-base font-extrabold text-gray-900">Quick Actions</div>
        <p className="mt-1 text-sm text-gray-600">
          Jump directly to common tasks.
        </p>

        <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-3">
          {ACTIONS.map((a: ActionCard) => (
            <div
              key={a.title}
              className="border border-gray-200 rounded-2xl p-4 bg-white"
            >
              <div className="font-semibold text-gray-900">{a.title}</div>
              <p className="mt-1 text-sm text-gray-600">{a.desc}</p>

              <div className="mt-4">
                <Link href={a.href} className={buttonClass(a.variant)}>
                  {a.cta}
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}