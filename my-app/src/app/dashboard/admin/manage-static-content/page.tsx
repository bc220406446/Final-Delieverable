// Allows admins to maintain static site content.

const STATIC_PAGES = [
  {
    label: "About",
    description: "Manage the About page content - mission and team information.",
  },
  {
    label: "FAQs",
    description: "Add, edit, or remove frequently asked questions shown to users.",
  },
  {
    label: "Policies",
    description: "Update the platform's terms of use, privacy policy, and community guidelines.",
  },
];

export default function ManageStaticContentPage() {
  return (
    <div>
      <h1 className="text-2xl md:text-3xl font-extrabold text-green-900">
        Manage Static Content
      </h1>
      <p className="mt-2 text-sm text-gray-600">
        Static pages are managed through the Strapi CMS dashboard. Click the button below to open
        Strapi and edit content directly.
      </p>

      <section className="mt-6 bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
        <div className="divide-y divide-gray-100">
          {STATIC_PAGES.map((page) => (
            <div
              key={page.label}
              className="flex items-center justify-between gap-4 px-5 py-4"
            >
              <div>
                <div className="font-semibold text-gray-900">{page.label}</div>
                <div className="text-xs text-gray-500 mt-0.5">{page.description}</div>
              </div>

              <a
                href="http://localhost:1337/admin"
                target="_blank"
                rel="noopener noreferrer"
                className="shrink-0 inline-flex items-center justify-center rounded-lg px-3 py-2 text-sm font-semibold transition border border-green-600 text-green-700 hover:bg-green-50"
              >
                Go to Strapi
              </a>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}