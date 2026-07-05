"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_URL ?? "http://localhost:1337";

const items = [
  { label: "Dashboard",         href: "/user" },
  { label: "My Profile",        href: "/user/my-profile" },
  { label: "My Offered Skills",  href: "/user/my-offered-skills" },
  { label: "Browse Skills",     href: "/user/browse-skills" },
  { label: "Requests",          href: "/user/requests" },
  { label: "Exchanges",         href: "/user/exchanges" },
  { label: "Rating & Reviews",  href: "/user/rating-and-reviews" },
  { label: "Report Abuse",      href: "/user/report-abuse" },
];

export default function UserSidebar() {
  const pathname = usePathname();
  const { user } = useAuth();

  const displayName = user?.fullName || user?.username || "User";
  const rawUrl = user?.profileImage?.url ?? null;
  const avatarUrl = rawUrl
    ? rawUrl.startsWith("http") ? rawUrl : `${STRAPI_URL}${rawUrl}`
    : null;

  return (
    <aside className="w-65 shrink-0 hidden lg:block">
      <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
        <div className="p-5 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="relative w-11 h-11 rounded-full overflow-hidden shrink-0 bg-gray-100 border-3 border-green-100">
              <Image
                src={avatarUrl ?? "/images/noProfileImage.png"}
                fill
                className="object-cover"
                alt={displayName}
                unoptimized
              />
            </div>

            <div className="min-w-0">
              <div className="font-bold text-green-900 truncate leading-tight">
                {displayName}
              </div>
              <Link
                href="/user/change-password"
                className="text-sm text-green-600 hover:text-green-800 hover:underline font-semibold mt-0.5 inline-block"
              >
                Change Password
              </Link>
            </div>
          </div>
        </div>

        <nav className="p-2">
          {items.map((it) => {
            const active =
              it.href === "/user"
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
