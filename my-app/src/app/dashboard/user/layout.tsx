import type { ReactNode } from "react";
import UserDashboardHeader from "@/app/components/dashboard/user/UserHeader";
import UserDashboardSidebar from "@/app/components/dashboard/user/UserSidebar";
import UserDashboardFooter from "@/app/components/dashboard/user/UserFooter";

export default function UserDashboardLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50 text-gray-800">
      <UserDashboardHeader />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex min-h-[calc(100vh-72px)] gap-6 py-6">
          <UserDashboardSidebar />

          <main className="flex-1 min-w-0">
            {children}
            <UserDashboardFooter />
          </main>
        </div>
      </div>
    </div>
  );
}
