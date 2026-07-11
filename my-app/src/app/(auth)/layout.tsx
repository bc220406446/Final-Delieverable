import AuthHeader from "@/app/components/auth/AuthHeader";
import Footer from "@/app/components/shared/Footer";

// Shared layout for all auth pages so login, register, and recovery screens use the same header/footer.
export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <AuthHeader />
      {children}
      <Footer />
    </>
  );
}
