// Renders the admin dashboard home overview.
import Link from "next/link";

type Stat = { label: string; value: string | number };

const STATS: Stat[] = [
  { label: "Total Users", value: 13 },
  { label: "Total Skills", value: 14 },
  { label: "Total Categories", value: 7 },
  { label: "Open Reports", value: 4 },
];

type ActionCard = {
  title: string;
  desc: string;
  href: string;
  variant: "primary" | "outline" | "ghost";
  cta: string;
};

const ACTIONS: ActionCard[] = [
  {
    title: "Manage Users",
    desc: "View, edit, or suspend platform users.",
    href: "/dashboard/admin/manage-users",
    variant: "primary",
    cta: "Manage Users",
  },
  {
    title: "Review Skills",
    desc: "Approve or reject pending skill listings.",
    href: "/dashboard/admin/manage-skills",
    variant: "outline",
    cta: "Review Skills",
  },
  {
    title: "Manage Categories",
    desc: "Create, edit, or delete skill categories.",
    href: "/dashboard/admin/manage-categories",
    variant: "ghost",
    cta: "Manage Categories",
  },
];

function buttonClass(v: ActionCard["variant"]) {
  const base =
    "inline-flex items-center justify-center rounded-lg px-3 py-2 text-sm font-semibold transition";
  if (v === "primary") return `${base} bg-green-600 text-white hover:bg-green-700`;
  if (v === "outline")
    return `${base} border border-green-600 text-green-700 hover:bg-green-50`;
  return `${base} border border-gray-200 text-gray-700 hover:bg-gray-50`;
}

export default function AdminDashboardPage() {
  const adminName = "Administrator";

  return (
    <div>
      <h1 className="text-2xl md:text-3xl font-extrabold text-green-900">Admin Dashboard</h1>
      <p className="mt-2 text-sm text-gray-600">
        Welcome, <span className="font-semibold">{adminName}</span>
      </p>

      {/* Stats */}
      <section className="mt-6 grid grid-cols-2 lg:grid-cols-4 gap-3">
        {STATS.map((s) => (
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

      {/* Quick Actions */}
      <section className="mt-4 bg-white border border-gray-100 rounded-2xl shadow-sm p-5 md:p-6">
        <div className="text-lg font-extrabold text-gray-900">Quick Actions</div>
        <p className="mt-1 text-sm text-gray-600">Jump directly to common tasks.</p>

        <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-3">
          {ACTIONS.map((a) => (
            <div key={a.title} className="border border-gray-200 rounded-2xl p-4 bg-white">
              <div className="font-bold text-gray-900">{a.title}</div>
              <p className="mt-1 text-sm text-gray-600">{a.desc}</p>
              <div className="mt-4">
                <Link className={buttonClass(a.variant)} href={a.href}>
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