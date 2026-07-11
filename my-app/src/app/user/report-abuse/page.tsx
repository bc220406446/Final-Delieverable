"use client";

import { JSX, useState, useEffect, useCallback, useMemo } from "react";
import { useAuth } from "@/context/AuthContext";
import { getMyReports, StrapiReport } from "@/lib/api";
import AddReportModal from "@/app/components/user/abuse-report/AddReportModal";
import Pagination from "@/app/components/user/Pagination";
import { paginateItems } from "@/lib/pagination";

// Badge color for report review status.
function statusBadge(status: StrapiReport["report_status"]): JSX.Element {
  const cfg = {
    pending:   "bg-yellow-100 text-yellow-700 border-yellow-200",
    resolved:  "bg-green-100  text-green-700  border-green-200",
    dismissed: "bg-gray-100   text-gray-600   border-gray-200",
  }[status as string] ?? "bg-gray-100 text-gray-600 border-gray-200";
  return (
    <span className={`inline-flex items-center border text-xs font-semibold px-2 py-0.5 rounded-full capitalize ${cfg}`}>
      {status}
    </span>
  );
}

// Badge color for the kind of thing being reported.
function typeBadge(type: StrapiReport["type"]): JSX.Element {
  const cfg = {
    User:     "bg-blue-100   text-blue-700   border-blue-200",
    Skill:    "bg-purple-100 text-purple-700 border-purple-200",
    Exchange: "bg-orange-100 text-orange-700 border-orange-200",
  }[type];
  return (
    <span className={`inline-flex items-center border text-xs font-semibold px-2 py-0.5 rounded-full ${cfg}`}>
      {type}
    </span>
  );
}

// Temporary success message shown after a report is submitted.
function SuccessToast({ message, onClose }: { message: string; onClose: () => void }): JSX.Element {
  return (
    <div className="fixed bottom-5 right-5 z-50 flex items-center gap-3 bg-white border border-gray-100 rounded-2xl shadow-lg px-4 py-3">
      <div className="flex items-center justify-center w-7 h-7 rounded-full bg-green-100 shrink-0">
        <svg className="w-4 h-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
      </div>
      <span className="text-sm font-semibold text-gray-800">{message}</span>
      <button onClick={onClose} className="ml-1 text-gray-400 hover:text-gray-600 transition">
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
}

export default function ReportAbusePage(): JSX.Element {
  const { token } = useAuth();

  // Page state: reports for the table/cards, modal visibility, toast message, and current page.
  const [reports,    setReports]    = useState<StrapiReport[]>([]);
  const [loading,    setLoading]    = useState(true);
  const [showModal,  setShowModal]  = useState(false);
  const [toast,      setToast]      = useState<string | null>(null);
  const [page,       setPage]       = useState(1);

  // Load reports submitted by the current user.
  const fetchReports = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const data = await getMyReports(token);
      setReports(data);
    } catch { /* Keep the page quiet if report history fails to load. */ }
    finally { setLoading(false); }
  }, [token]);

  // Fetch reports when the page loads or when the token-backed fetch function changes.
  useEffect(() => { fetchReports(); }, [fetchReports]);

  // Paginate the user's report history.
  const { items: pagedReports, state: pagination } = useMemo(
    () => paginateItems(reports, page),
    [reports, page]
  );

  // Refresh the report list after the modal creates a new report.
  async function handleSaved() {
    setShowModal(false);
    await fetchReports();
    setToast("Report submitted. Our team will review it shortly.");
    setTimeout(() => setToast(null), 4000);
  }

  return (
    <div>
      {/* Header row keeps the title and submit button aligned, with intro text below full-width. */}
      <div className="flex flex-wrap items-start justify-between gap-x-4 gap-y-2">
        <h1 className="text-2xl md:text-3xl font-extrabold text-green-900">Report Abuse</h1>
        <button type="button" onClick={() => setShowModal(true)}
          className="shrink-0 inline-flex items-center gap-1.5 bg-red-500 hover:bg-red-600 text-white font-semibold text-sm px-4 py-2.5 rounded-xl transition whitespace-nowrap">
          <span className="text-base leading-none">+</span>
          Submit Report
        </button>
        <p className="basis-full text-sm text-gray-600">
          Report users, skills, or exchanges that violate community guidelines.
        </p>
      </div>

      {/* Report history shows a table on desktop and compact cards on mobile. */}
      <section className="mt-6 bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
        {/* Section header shows the total number of reports loaded for this user. */}
        <div className="px-5 py-3.5 border-b border-gray-100 bg-gray-50 flex items-center justify-between">
          <span className="text-xs font-extrabold uppercase tracking-wide text-gray-500">My Reports</span>
          <span className="text-xs font-semibold text-gray-400">{reports.length} total</span>
        </div>

        {loading ? (
          // Loading state appears while the report list is being fetched.
          <div className="py-10 text-center text-sm text-gray-400">Loading reports...</div>
        ) : reports.length === 0 ? (
          // Empty state appears when the user has not submitted any reports yet.
          <div className="py-10 text-center text-sm text-gray-400">No reports submitted yet.</div>
        ) : (
          <>
            {/* Desktop view uses table columns in the same order as the report model. */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100">
                    {["Type", "Target", "Reason", "Status", "Admin Note"].map((h) => (
                      <th key={h} className="px-5 py-3.5 text-[11px] font-extrabold tracking-wide uppercase text-gray-500 text-left">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {pagedReports.map((r) => (
                    <tr key={r.id} className="hover:bg-gray-50 transition">
                      <td className="px-5 py-4 align-top">{typeBadge(r.type)}</td>
                      <td className="px-5 py-4 align-top text-gray-900 font-semibold text-sm">{r.target_label}</td>
                      <td className="px-5 py-4 align-top text-gray-600 text-sm">{r.reason}</td>
                      <td className="px-5 py-4 align-top">{statusBadge(r.report_status)}</td>
                      <td className="px-5 py-4 align-top text-gray-500 text-sm max-w-xs">
                        {r.admin_note || <span className="italic text-gray-300">-</span>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile view stacks the same fields vertically for easier reading on small screens. */}
            <div className="md:hidden divide-y divide-gray-100">
              {pagedReports.map((r) => (
                <div key={r.id} className="p-4 flex flex-col gap-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    {typeBadge(r.type)}
                  </div>
                  <div className="font-semibold text-gray-900 text-sm">{r.target_label}</div>
                  <div className="text-xs text-gray-500">{r.reason}</div>
                  <div className="flex items-center gap-2 flex-wrap">
                    {statusBadge(r.report_status)}
                  </div>
                  {r.admin_note && (
                    <div className="text-xs text-gray-400 italic">Note: {r.admin_note}</div>
                  )}
                </div>
              ))}
            </div>

            {/* Pagination controls only the visible page of report history. */}
            <Pagination
              page={pagination.page}
              pageCount={pagination.pageCount}
              total={pagination.total}
              startItem={pagination.startItem}
              endItem={pagination.endItem}
              onPageChange={setPage}
            />
          </>
        )}
      </section>

      {/* Report modal and toast are mounted only while active. */}
      {showModal && <AddReportModal onSaved={handleSaved} onClose={() => setShowModal(false)} />}
      {toast && <SuccessToast message={toast} onClose={() => setToast(null)} />}
    </div>
  );
}
