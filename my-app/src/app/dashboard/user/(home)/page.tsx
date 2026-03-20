// Renders the user dashboard home summary with live data from Strapi.
"use client";

import Link from "next/link";
import { JSX, useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import {
  getMySkills,
  getMyExchanges,
  getMyReviews,
  getMyReports,
} from "@/lib/api";

interface ActionCard {
  title:   string;
  desc:    string;
  href:    string;
  variant: "primary" | "outline" | "ghost";
  cta:     string;
}

const ACTIONS: ActionCard[] = [
  { title: "Edit Your Profile",    desc: "Update your personal information and preferences.",  href: "/dashboard/user/my-profile",       variant: "primary",  cta: "Edit Profile"    },
  { title: "Add an Offered Skill", desc: "Share what you can teach or do.",                    href: "/dashboard/user/my-offered-skills", variant: "outline",  cta: "Add Skill"       },
  { title: "Browse Skills",        desc: "Find a skill and book an exchange.",                 href: "/dashboard/user/browse-skills",     variant: "ghost",    cta: "Browse"          },
  { title: "Check Requests",       desc: "Approve or manage pending requests.",                href: "/dashboard/user/requests",          variant: "primary",  cta: "Open Requests"   },
  { title: "Add Review",           desc: "Share your experience with a skill provider.",       href: "/dashboard/user/rating-and-reviews",variant: "outline",  cta: "Add Review"      },
  { title: "Report Abuse",         desc: "Report any abusive behavior or content.",            href: "/dashboard/user/report-abuse",      variant: "ghost",    cta: "Report Abuse"    },
];

function buttonClass(v: ActionCard["variant"]): string {
  const base = "inline-flex items-center justify-center rounded-lg px-3 py-2 text-sm font-semibold transition";
  if (v === "primary") return `${base} bg-green-600 text-white hover:bg-green-700`;
  if (v === "outline") return `${base} border border-green-600 text-green-700 hover:bg-green-50`;
  return                      `${base} border border-gray-200 text-gray-700 hover:bg-gray-50`;
}

function StatCard({ label, value, loading }: { label: string; value: string | number; loading: boolean }): JSX.Element {
  return (
    <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-4 flex flex-col gap-1">
      <div className="text-[11px] font-extrabold tracking-wide uppercase text-gray-500">{label}</div>
      {loading ? (
        <div className="h-8 w-12 rounded-lg bg-gray-100 animate-pulse mt-1" />
      ) : (
        <div className="text-2xl font-black text-gray-900">{value}</div>
      )}
    </div>
  );
}

export default function UserDashboardHomePage(): JSX.Element {
  const { user, token } = useAuth();

  const [offeredSkills,    setOfferedSkills]    = useState(0);
  const [activeExchanges,  setActiveExchanges]  = useState(0);
  const [avgRating,        setAvgRating]        = useState<string>("—");
  const [pendingReports,   setPendingReports]   = useState(0);
  const [loading,          setLoading]          = useState(true);

  useEffect(() => {
    if (!token) return;

    async function load() {
      setLoading(true);
      try {
        const [skills, exchanges, reviews, reports] = await Promise.allSettled([
          getMySkills(token!),
          getMyExchanges(token!),
          getMyReviews(token!),
          getMyReports(token!),
        ]);

        if (skills.status      === "fulfilled")
          setOfferedSkills(skills.value.filter((s) => s.state === "approved").length);

        if (exchanges.status   === "fulfilled")
          setActiveExchanges(exchanges.value.filter((x) => x.status === "active").length);

        if (reviews.status     === "fulfilled") {
          const received = reviews.value.received;
          if (received.length > 0) {
            const sum = received.reduce((acc, r) => acc + r.rating, 0);
            setAvgRating((sum / received.length).toFixed(1));
          } else {
            setAvgRating("—");
          }
        }

        if (reports.status     === "fulfilled")
          setPendingReports(reports.value.filter((r) => (r as any).report_status === "pending").length);

      } finally {
        setLoading(false);
      }
    }

    load();
  }, [token]);

  const displayName = user?.fullName || user?.username || "User";

  const stats = [
    { label: "Approved Skills",   value: offeredSkills   },
    { label: "Active Exchanges",  value: activeExchanges },
    { label: "Avg Rating",        value: avgRating       },
    { label: "Pending Reports",   value: pendingReports  },
  ];

  return (
    <div>
      <h1 className="text-2xl md:text-3xl font-extrabold text-green-900">Dashboard</h1>
      <p className="mt-2 text-sm text-gray-600">
        Assalam-o-Alaikum,{" "}
        <span className="font-semibold text-gray-800">{displayName}</span>
      </p>

      {/* Stats */}
      <section className="mt-6 grid grid-cols-2 lg:grid-cols-4 gap-3">
        {stats.map((s) => (
          <StatCard key={s.label} label={s.label} value={s.value} loading={loading} />
        ))}
      </section>

      {/* Quick Actions */}
      <section className="mt-4 bg-white border border-gray-100 rounded-2xl shadow-sm p-5 md:p-6">
        <div className="text-base font-extrabold text-gray-900">Quick Actions</div>
        <p className="mt-1 text-sm text-gray-600">Jump directly to common tasks.</p>

        <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-3">
          {ACTIONS.map((a) => (
            <div key={a.title} className="border border-gray-200 rounded-2xl p-4 bg-white">
              <div className="font-semibold text-gray-900">{a.title}</div>
              <p className="mt-1 text-sm text-gray-600">{a.desc}</p>
              <div className="mt-4">
                <Link href={a.href} className={buttonClass(a.variant)}>{a.cta}</Link>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}