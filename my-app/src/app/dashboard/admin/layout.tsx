// Defines the shared admin dashboard layout shell.
import AdminHeader from "@/app/components/dashboard/admin/AdminHeader";
import AdminSidebar from "@/app/components/dashboard/admin/AdminSidebar";
import AdminFooter from "@/app/components/dashboard/admin/AdminFooter";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <AdminHeader adminName="Super Admin" />

      <div className="max-w-7xl mx-auto px-5 py-8 flex gap-8 items-start">
        <AdminSidebar adminName="Super Admin" adminAvatar="/images/admin/avatar.png" />

        <main className="flex-1 min-w-0">
          {children}
          <AdminFooter />
        </main>
      </div>
    </>
  );
}
