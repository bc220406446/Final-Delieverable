// Displays full abuse report information in a focused admin details modal.
"use client";

export type ReportStatus = "open" | "resolved";
export type ReportType = "User" | "Skill" | "Exchange";

export type Report = {
  id: number;
  type: ReportType;
  reportedBy: string;
  reason: string;
  description: string;
  status: ReportStatus;
};

type Props = {
  report: Report;
  onClose: () => void;
};

export default function AbuseReportDetailsModal({ report, onClose }: Props) {
  return (
    <>
      <div className="fixed inset-0 bg-black/30 z-40" onClick={onClose} />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
          <h3 className="font-extrabold text-gray-900 text-base mb-5">Report Details</h3>

          <dl className="flex flex-col gap-3 text-sm">
            {[
              { label: "Type",        value: report.type },
              { label: "Reported By", value: report.reportedBy },
              { label: "Reason",      value: report.reason },
              { label: "Description", value: report.description },
              { label: "Status",      value: report.status === "open" ? "Open" : "Resolved" },
            ].map(({ label, value }) => (
              <div key={label} className="flex gap-2">
                <dt className="font-semibold text-gray-700 w-28 shrink-0">{label}:</dt>
                <dd className="text-gray-600">{value}</dd>
              </div>
            ))}
          </dl>

          <button
            onClick={onClose}
            className="mt-6 w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold text-sm py-2.5 rounded-xl transition"
          >
            Close
          </button>
        </div>
      </div>
    </>
  );
}