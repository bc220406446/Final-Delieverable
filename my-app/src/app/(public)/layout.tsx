import PublicHeader from "@/app/components/public/PublicHeader";
import Footer from "@/app/components/shared/Footer";

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <PublicHeader />
      {children}
      <Footer />
    </>
  );
}
