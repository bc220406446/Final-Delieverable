import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-green-900 text-white py-8">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-5 px-5">
        <ul className="flex flex-col md:flex-row gap-6 text-sm">
          <li>
            <Link href="/about" className="hover:text-green-400">
              About
            </Link>
          </li>
          <li>
            <Link href="/faqs" className="hover:text-green-400">
              FAQ
            </Link>
          </li>
          <li>
            <Link href="/policies" className="hover:text-green-400">
              Policies
            </Link>
          </li>
        </ul>

        <p className="text-sm text-green-200">
          © {new Date().getFullYear()} Community Skills Exchange Platform. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
