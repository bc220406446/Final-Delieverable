// Renders the desktop admin sidebar with profile summary and section navigation.
"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";

const items = [
    { label: "Dashboard", href: "/dashboard/admin/" },
    { label: "Manage Users", href: "/dashboard/admin/manage-users" },
    { label: "Manage Skills", href: "/dashboard/admin/manage-skills" },
    { label: "Manage Categories", href: "/dashboard/admin/manage-categories" },
    { label: "View Abuse Reports", href: "/dashboard/admin/view-abuse-reports" },
    { label: "Manage Static Content", href: "/dashboard/admin/manage-static-content" },
];

type AdminSidebarProps = {
    adminName?: string;
    adminAvatar?: string;
};

export default function AdminSidebar({
    adminName = "Administrator",
    adminAvatar = "/images/admin/avatar.png",
}: AdminSidebarProps) {
    const pathname = usePathname();

    return (
        <aside className="w-[260px] shrink-0 hidden lg:block">
            <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
                {/* Mini profile */}
                <div className="p-5 border-b border-gray-100 flex items-center gap-3">
                    <div className="relative w-11 h-11 rounded-full overflow-hidden">
                        <Image
                            src="/images/team/kamran.png"
                            fill
                            className="object-cover"
                            alt="Kamran"
                        />
                    </div>
                    <div className="min-w-0">
                        <div className="font-bold text-green-900 truncate">{adminName}</div>
                        <span className="inline-flex items-center gap-1 text-xs font-semibold text-amber-600">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 inline-block" />
                            Admin Panel
                        </span>
                    </div>
                </div>

                {/* Nav */}
                <nav className="p-2">
                    {items.map((it) => {
                        const isActive = pathname === it.href;
                        return (
                            <Link
                                key={it.href}
                                href={it.href}
                                className={`block rounded-xl px-3 py-3 text-sm font-semibold transition ${isActive
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
