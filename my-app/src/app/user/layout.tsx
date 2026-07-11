import type { ReactNode } from "react";
import UserDashboardHeader from "@/app/components/user/UserHeader";
import UserDashboardSidebar from "@/app/components/user/UserSidebar";
import UserDashboardFooter from "@/app/components/user/UserFooter";

// Shared shell for all authenticated user dashboard pages.
export default function UserDashboardLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50 text-gray-800">
      <UserDashboardHeader />

      {/* Dashboard content sits beside the persistent user sidebar. */}
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
