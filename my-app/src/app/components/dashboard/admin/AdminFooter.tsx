// Renders the admin footer with legal text and public information links.
import Link from "next/link";

export default function AdminFooter() {
  return (
    <footer className="mt-10 border-t border-gray-200 pt-6 pb-8 text-sm text-gray-600 flex flex-col md:flex-row gap-3 md:items-center md:justify-between">
      <div>© 2025 Community Skills Exchange. All rights reserved.</div>

      <div className="flex gap-5">
        <Link className="hover:text-green-700" href="/public/about">
          About
        </Link>
        <Link className="hover:text-green-700" href="/public/faqs">
          FAQs
        </Link>
        <Link className="hover:text-green-700" href="/public/policies">
          Policies
        </Link>
      </div>
    </footer>
  );
}
