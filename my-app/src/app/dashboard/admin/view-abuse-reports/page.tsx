// Lets admins review and filter abuse reports.
"use client";

import { useState } from "react";
import AbuseReportDetailsModal, {
  Report,
  ReportType,
} from "@/app/components/dashboard/admin/abuse-reports/AbuseReportDetailsModal";

const INITIAL_REPORTS: Report[] = [
  {
    id: 1,
    type: "User",
    reportedBy: "Farhan Malik",
    reason: "Spam messages",
    description: "User repeatedly sent irrelevant promotional messages in chat.",
    status: "open",
  },
  {
    id: 2,
    type: "User",
    reportedBy: "Nida Zahra",
    reason: "Harassment",
    description: "Inappropriate tone during the exchange discussion.",
    status: "open",
  },
  {
    id: 3,
    type: "Skill",
    reportedBy: "Ali Haider",
    reason: "Misleading description",
    description: "Skill content did not match what was described on the card.",
    status: "open",
  },
  {
    id: 4,
    type: "Skill",
    reportedBy: "Ayesha Siddiqui",
    reason: "Low quality",
    description: "The skill listing lacks clear details and samples.",
    status: "resolved",
  },
  {
    id: 5,
    type: "Exchange",
    reportedBy: "Bilal Ahmed",
    reason: "No‑show",
    description: "Provider did not join at the agreed time and did not respond.",
    status: "open",
  },
  {
    id: 6,
    type: "Exchange",
    reportedBy: "Usman Tariq",
    reason: "Policy violation",
    description: "Exchange included unrelated content not agreed beforehand.",
    status: "resolved",
  },
];

const TYPE_COLORS: Record<ReportType, string> = {
  User:     "bg-blue-100 text-blue-700 border-blue-200",
  Skill:    "bg-purple-100 text-purple-700 border-purple-200",
  Exchange: "bg-orange-100 text-orange-700 border-orange-200",
};

type Tab = "open" | "resolved";

export default function ViewAbuseReportsPage() {
  const [tab, setTab] = useState<Tab>("open");
  const [reports, setReports] = useState<Report[]>(INITIAL_REPORTS);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);

  function markResolved(id: number) {
    setReports((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status: "resolved" } : r))
    );
  }

  const openReports     = reports.filter((r) => r.status === "open");
  const resolvedReports = reports.filter((r) => r.status === "resolved");
  const visibleReports  = tab === "open" ? openReports : resolvedReports;

  return (
    <div>
      {/* Heading section explaining review workflow for abuse reports. */}
      <h1 className="text-2xl md:text-3xl font-extrabold text-green-900">
        View Abuse Reports
      </h1>
      <p className="mt-2 text-sm text-gray-600">
        Review and resolve reported issues related to users, skills, or exchanges.
      </p>

      {/* Report status filters */}
      <div className="mt-6 flex gap-2">
        {(["open", "resolved"] as Tab[]).map((t) => {
          const count = t === "open" ? openReports.length : resolvedReports.length;
          return (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition ${
                tab === t
                  ? "bg-green-600 text-white"
                  : "border border-gray-200 text-gray-600 hover:bg-gray-50"
              }`}
            >
              {t === "open" ? "Open Reports" : "Resolved"}
              {count > 0 && (
                <span
                  className={`ml-2 text-xs font-bold px-1.5 py-0.5 rounded-full ${
                    tab === t
                      ? "bg-white/20 text-white"
                      : t === "open"
                      ? "bg-yellow-100 text-yellow-700"
                      : "bg-green-100 text-green-700"
                  }`}
                >
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Table */}
      <section className="mt-4 bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
        {/* Desktop */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50 text-left">
                {[
                  "Type",
                  "Reported By",
                  "Detail",
                  ...(tab === "open" ? ["Action"] : []),
                ].map((h) => (
                  <th
                    key={h}
                    className="px-5 py-3.5 text-[11px] font-extrabold tracking-wide uppercase text-gray-500"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {visibleReports.map((report) => (
                <tr key={report.id} className="hover:bg-gray-50 transition">
                  <td className="px-5 py-4">
                    <span
                      className={`inline-flex items-center border text-xs font-semibold px-2 py-0.5 rounded-full ${TYPE_COLORS[report.type]}`}
                    >
                      {report.type}
                    </span>
                  </td>
                  <td className="px-5 py-4 font-semibold text-gray-900 whitespace-nowrap">
                    {report.reportedBy}
                  </td>
                  <td className="px-5 py-4">
                    <button
                      onClick={() => setSelectedReport(report)}
                      className="text-green-700 font-semibold text-sm hover:underline hover:text-green-800 transition"
                    >
                      Click to View
                    </button>
                  </td>
                  {tab === "open" && (
                    <td className="px-5 py-4">
                      <button
                        onClick={() => markResolved(report.id)}
                        className="inline-flex items-center justify-center rounded-lg px-3 py-2 text-sm font-semibold bg-green-600 text-white hover:bg-green-700 transition"
                      >
                        Mark as Resolved
                      </button>
                    </td>
                  )}
                </tr>
              ))}

              {visibleReports.length === 0 && (
                <tr>
                  <td
                    colSpan={tab === "open" ? 4 : 3}
                    className="px-5 py-10 text-center text-sm text-gray-400"
                  >
                    {tab === "open" ? "No open reports." : "No resolved reports."}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile cards */}
        <div className="md:hidden divide-y divide-gray-100">
          {visibleReports.map((report) => (
            <div key={report.id} className="p-4 flex flex-col gap-2">
              <div className="flex items-start justify-between gap-3">
                <div className="flex flex-col gap-1.5">
                  <span
                    className={`inline-flex items-center border text-xs font-semibold px-2 py-0.5 rounded-full w-fit ${TYPE_COLORS[report.type]}`}
                  >
                    {report.type}
                  </span>
                  <div className="font-bold text-gray-900 text-sm">{report.reportedBy}</div>
                </div>
                <button
                  onClick={() => setSelectedReport(report)}
                  className="text-green-700 font-semibold text-xs hover:underline shrink-0"
                >
                  Click to View
                </button>
              </div>

              {tab === "open" && (
                <div className="mt-1">
                  <button
                    onClick={() => markResolved(report.id)}
                    className="inline-flex items-center justify-center rounded-lg px-3 py-2 text-sm font-semibold bg-green-600 text-white hover:bg-green-700 transition"
                  >
                    Mark as Resolved
                  </button>
                </div>
              )}
            </div>
          ))}

          {visibleReports.length === 0 && (
            <div className="py-10 text-center text-sm text-gray-400">
              {tab === "open" ? "No open reports." : "No resolved reports."}
            </div>
          )}
        </div>
      </section>

      {/* Details modal */}
      {selectedReport && (
        <AbuseReportDetailsModal
          report={selectedReport}
          onClose={() => setSelectedReport(null)}
        />
      )}
    </div>
  );
}