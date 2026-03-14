// Provides navigation links for the user dashboard.
import Link from "next/link";
import Image from "next/image";


const items = [
    { label: "Dashboard", href: "/dashboard/user" },
    { label: "My Profile", href: "/dashboard/user/my-profile" },
    { label: "My Offered Skills", href: "/dashboard/user/my-offered-skills" },
    { label: "Browse Skills", href: "/dashboard/user/browse-skills" },
    { label: "Requests", href: "/dashboard/user/requests" },
    { label: "Exchanges", href: "/dashboard/user/exchanges" },
    { label: "Rating & Reviews", href: "/dashboard/user/rating-and-reviews" },
    { label: "Report Abuse", href: "/dashboard/user/report-abuse" },
];

export default function UserSidebar() {
    return (
        <aside className="w-[260px] shrink-0 hidden lg:block">
            <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
                {/* mini profile */}
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
                        <div className="font-bold text-green-900 truncate">Muhammad Kamran</div>
                    </div>
                </div>

                {/* nav */}
                <nav className="p-2">
                    {items.map((it) => (
                        <Link
                            key={it.href}
                            href={it.href}
                            className="block rounded-xl px-3 py-3 text-sm font-semibold text-gray-700 hover:bg-green-50 hover:text-green-800 transition"
                        >
                            {it.label}
                        </Link>
                    ))}
                </nav>
            </div>
        </aside>
    );
}
