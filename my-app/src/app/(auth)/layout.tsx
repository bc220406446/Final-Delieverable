import AuthHeader from "@/app/components/auth/AuthHeader";
import Footer from "@/app/components/shared/Footer";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <AuthHeader />
      {children}
      <Footer />
    </>
  );
}
