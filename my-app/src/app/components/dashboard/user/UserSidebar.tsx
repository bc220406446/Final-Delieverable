"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_URL ?? "http://localhost:1337";

const items = [
  { label: "Dashboard",         href: "/dashboard/user" },
  { label: "My Profile",        href: "/dashboard/user/my-profile" },
  { label: "My Offered Skills",  href: "/dashboard/user/my-offered-skills" },
  { label: "Browse Skills",     href: "/dashboard/user/browse-skills" },
  { label: "Requests",          href: "/dashboard/user/requests" },
  { label: "Exchanges",         href: "/dashboard/user/exchanges" },
  { label: "Rating & Reviews",  href: "/dashboard/user/rating-and-reviews" },
  { label: "Report Abuse",      href: "/dashboard/user/report-abuse" },
];

export default function UserSidebar() {
  const pathname = usePathname();
  const { user } = useAuth();

  const displayName = (user as any)?.fullName || user?.username || "User";

  // profileImage is a Strapi media field — it returns an object with a url property.
  // The url from Strapi is a relative path like /uploads/image.jpg so we
  // prepend STRAPI_URL to make it absolute.
  const rawUrl      = user?.profileImage?.url ?? null;
  const avatarUrl   = rawUrl
    ? rawUrl.startsWith("http") ? rawUrl : `${STRAPI_URL}${rawUrl}`
    : null;

  return (
    <aside className="w-[260px] shrink-0 hidden lg:block">
      <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">

        {/* ── Mini profile ─────────────────────────────────────────────── */}
        <div className="p-5 border-b border-gray-100">
          <div className="flex items-center gap-3">

            {/* Avatar — profileImage from Strapi or default noProfileImage */}
            <div className="relative w-11 h-11 rounded-full overflow-hidden shrink-0 bg-gray-100 border-3 border-green-100">
              <Image
                src={avatarUrl ?? "/images/noProfileImage.png"}
                fill
                className="object-cover"
                alt={displayName}
                unoptimized
              />
            </div>

            {/* Name + change-password link */}
            <div className="min-w-0">
              <div className="font-bold text-green-900 truncate leading-tight">
                {displayName}
              </div>
              <Link
                href="/dashboard/user/change-password"
                className="text-sm text-green-600 hover:text-green-800 hover:underline font-semibold mt-0.5 inline-block"
              >
                Change Password
              </Link>
            </div>
          </div>
        </div>

        {/* ── Nav ──────────────────────────────────────────────────────── */}
        <nav className="p-2">
          {items.map((it) => {
            const active =
              it.href === "/dashboard/user"
                ? pathname === it.href
                : pathname.startsWith(it.href);
            return (
              <Link
                key={it.href}
                href={it.href}
                className={`block rounded-xl px-3 py-3 text-sm font-semibold transition ${
                  active
                    ? "bg-green-50 text-green-800"
                    : "text-gray-700 hover:bg-green-50 hover:text-green-800"
                }`}
              >
                {it.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </aside>
  );
}