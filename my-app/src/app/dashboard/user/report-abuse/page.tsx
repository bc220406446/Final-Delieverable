// Shows submitted abuse reports with status-based filtering.
"use client";

import { JSX, useState } from "react";
import AddReportModal, {
  AbuseReportForm,
} from "@/app/components/dashboard/user/abuse-report/AddReportModal";

// Abuse report shapes used for table and tabs.

type ReportTab = "user" | "skill" | "exchange";

interface UserReport     { id: number; userName: string;    reason: string; description: string; }
interface SkillReport    { id: number; skillName: string;   reason: string; description: string; }
interface ExchangeReport { id: number; exchangeRef: string; skillName: string; reason: string; description: string; }

// Tab labels and report status metadata.

const INITIAL_USER_REPORTS: UserReport[] = [
  { id: 1, userName: "Farhan Malik", reason: "Spam messages",  description: "User repeatedly sent irrelevant promotional messages in chat." },
  { id: 2, userName: "Nida Zahra",   reason: "Harassment",     description: "Inappropriate tone during the exchange discussion." },
];

const INITIAL_SKILL_REPORTS: SkillReport[] = [
  { id: 1, skillName: "Project Planning with Trello",      reason: "Misleading description", description: "Skill content did not match what was described on the card." },
  { id: 2, skillName: "Freelancing Profile Setup (Basics)", reason: "Low quality",            description: "The skill listing lacks clear details and samples." },
];

const INITIAL_EXCHANGE_REPORTS: ExchangeReport[] = [
  { id: 1, exchangeRef: "EX-2026-014", skillName: "Web Design Basics (HTML/CSS)", reason: "No-show",          description: "Provider did not join at the agreed time and did not respond." },
  { id: 2, exchangeRef: "EX-2026-011", skillName: "Public Speaking Workshop",     reason: "Policy violation", description: "Exchange included unrelated content not agreed beforehand." },
];

const TABS: { key: ReportTab; label: string }[] = [
  { key: "user",     label: "Report User"     },
  { key: "skill",    label: "Report Skill"    },
  { key: "exchange", label: "Report Exchange" },
];

// Shared table UI helpers for report rows.

function Th({ children }: { children: React.ReactNode }): JSX.Element {
  return (
    <th className="px-5 py-3.5 text-[11px] font-extrabold tracking-wide uppercase text-gray-500 text-left">
      {children}
    </th>
  );
}

function Td({ children, className = "" }: { children: React.ReactNode; className?: string }): JSX.Element {
  return <td className={`px-5 py-4 text-sm text-gray-600 ${className}`}>{children}</td>;
}

function EmptyState({ cols }: { cols: number }): JSX.Element {
  return (
    <tr>
      <td colSpan={cols} className="px-5 py-10 text-center text-sm text-gray-400">
        No reports submitted yet.
      </td>
    </tr>
  );
}

function MobileCard({ title, reason, description }: { title: string; reason: string; description: string }): JSX.Element {
  return (
    <div className="p-4 flex flex-col gap-1.5">
      <div className="font-bold text-gray-900 text-sm">{title}</div>
      <div className="text-xs text-gray-600"><span className="font-semibold text-gray-700">Reason:</span> {reason}</div>
      <div className="text-xs text-gray-500 line-clamp-2">{description}</div>
    </div>
  );
}

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

// Renders the report abuse page.

export default function ReportAbusePage(): JSX.Element {
  const [tab, setTab] = useState<ReportTab>("user");
  const [showModal, setShowModal] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const [userReports,     setUserReports]     = useState<UserReport[]>(INITIAL_USER_REPORTS);
  const [skillReports,    setSkillReports]     = useState<SkillReport[]>(INITIAL_SKILL_REPORTS);
  const [exchangeReports, setExchangeReports] = useState<ExchangeReport[]>(INITIAL_EXCHANGE_REPORTS);

  const counts: Record<ReportTab, number> = {
    user:     userReports.length,
    skill:    skillReports.length,
    exchange: exchangeReports.length,
  };

  function showToast(message: string) {
    setToast(message);
    setTimeout(() => setToast(null), 3500);
  }

  function handleSaveReport(form: AbuseReportForm) {
    if (form.type === "User") {
      setUserReports((p) => [...p, { id: Date.now(), userName: form.target.trim(), reason: form.reason.trim(), description: form.description.trim() }]);
      setTab("user");
    } else if (form.type === "Skill") {
      setSkillReports((p) => [...p, { id: Date.now(), skillName: form.target.trim(), reason: form.reason.trim(), description: form.description.trim() }]);
      setTab("skill");
    } else if (form.type === "Exchange") {
      setExchangeReports((p) => [...p, { id: Date.now(), exchangeRef: form.target.trim(), skillName: "", reason: form.reason.trim(), description: form.description.trim() }]);
      setTab("exchange");
    }
    setShowModal(false);
    showToast("Abuse report submitted. Admin will review it shortly.");
  }

  return (
    <div>
      {/* Page title and summary */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-green-900">Report Abuse</h1>
          <p className="mt-2 text-sm text-gray-600">
            Report issues related to users, skills, or exchanges. Admin will review your report.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setShowModal(true)}
          className="shrink-0 inline-flex items-center gap-1.5 bg-red-500 hover:bg-red-600 text-white font-semibold text-sm px-4 py-2.5 rounded-xl transition"
        >
          <span className="text-base leading-none">+</span>
          Report Abuse
        </button>
      </div>

      {/* Section card */}
      <section className="mt-6 bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">

        {/* Report status filters */}
        <div className="flex flex-wrap gap-2 border-b border-gray-100 p-3">
          {TABS.map(({ key, label }) => (
            <button
              key={key}
              type="button"
              onClick={() => setTab(key)}
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition ${
                tab === key
                  ? "bg-green-600 text-white"
                  : "border border-gray-200 text-gray-600 hover:bg-gray-50"
              }`}
            >
              {label}
              <span className={`ml-2 text-xs font-bold px-1.5 py-0.5 rounded-full ${
                tab === key ? "bg-white/20 text-white" : "bg-gray-100 text-gray-500"
              }`}>
                {counts[key]}
              </span>
            </button>
          ))}
        </div>

        {/* User report table/cards section for member-related complaints. */}
        {tab === "user" && (
          <>
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-sm">
                <thead><tr className="border-b border-gray-100 bg-gray-50"><Th>User Name</Th><Th>Reason</Th><Th>Description</Th></tr></thead>
                <tbody className="divide-y divide-gray-100">
                  {userReports.length === 0 ? <EmptyState cols={3} /> : userReports.map((r) => (
                    <tr key={r.id} className="hover:bg-gray-50 transition">
                      <Td className="font-semibold text-gray-900 whitespace-nowrap">{r.userName}</Td>
                      <Td className="whitespace-nowrap">
                        <span className="inline-flex items-center border text-xs font-semibold px-2 py-0.5 rounded-full bg-red-100 text-red-700 border-red-200">{r.reason}</span>
                      </Td>
                      <Td className="max-w-sm text-gray-500"><span className="line-clamp-2">{r.description}</span></Td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="md:hidden divide-y divide-gray-100">
              {userReports.length === 0
                ? <div className="py-10 text-center text-sm text-gray-400">No reports submitted yet.</div>
                : userReports.map((r) => <MobileCard key={r.id} title={r.userName} reason={r.reason} description={r.description} />)}
            </div>
          </>
        )}

        {/* Skill report table/cards section for listing-related complaints. */}
        {tab === "skill" && (
          <>
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-sm">
                <thead><tr className="border-b border-gray-100 bg-gray-50"><Th>Skill</Th><Th>Reason</Th><Th>Description</Th></tr></thead>
                <tbody className="divide-y divide-gray-100">
                  {skillReports.length === 0 ? <EmptyState cols={3} /> : skillReports.map((r) => (
                    <tr key={r.id} className="hover:bg-gray-50 transition">
                      <Td className="font-semibold text-gray-900 whitespace-nowrap">{r.skillName}</Td>
                      <Td className="whitespace-nowrap">
                        <span className="inline-flex items-center border text-xs font-semibold px-2 py-0.5 rounded-full bg-purple-100 text-purple-700 border-purple-200">{r.reason}</span>
                      </Td>
                      <Td className="max-w-sm text-gray-500"><span className="line-clamp-2">{r.description}</span></Td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="md:hidden divide-y divide-gray-100">
              {skillReports.length === 0
                ? <div className="py-10 text-center text-sm text-gray-400">No reports submitted yet.</div>
                : skillReports.map((r) => <MobileCard key={r.id} title={r.skillName} reason={r.reason} description={r.description} />)}
            </div>
          </>
        )}

        {/* Exchange report table/cards section for session-related complaints. */}
        {tab === "exchange" && (
          <>
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-sm">
                <thead><tr className="border-b border-gray-100 bg-gray-50"><Th>Exchange</Th><Th>Reason</Th><Th>Description</Th></tr></thead>
                <tbody className="divide-y divide-gray-100">
                  {exchangeReports.length === 0 ? <EmptyState cols={3} /> : exchangeReports.map((r) => (
                    <tr key={r.id} className="hover:bg-gray-50 transition">
                      <Td className="font-semibold text-gray-900">
                        <div>{r.exchangeRef}</div>
                        {r.skillName && <div className="text-xs text-gray-400 mt-0.5">{r.skillName}</div>}
                      </Td>
                      <Td className="whitespace-nowrap">
                        <span className="inline-flex items-center border text-xs font-semibold px-2 py-0.5 rounded-full bg-orange-100 text-orange-700 border-orange-200">{r.reason}</span>
                      </Td>
                      <Td className="max-w-sm text-gray-500"><span className="line-clamp-2">{r.description}</span></Td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="md:hidden divide-y divide-gray-100">
              {exchangeReports.length === 0
                ? <div className="py-10 text-center text-sm text-gray-400">No reports submitted yet.</div>
                : exchangeReports.map((r) => <MobileCard key={r.id} title={`${r.exchangeRef}${r.skillName ? ` • ${r.skillName}` : ""}`} reason={r.reason} description={r.description} />)}
            </div>
          </>
        )}
      </section>

      {/* Modal */}
      {showModal && (
        <AddReportModal
          onSave={handleSaveReport}
          onClose={() => setShowModal(false)}
        />
      )}

      {/* Toast */}
      {toast && <SuccessToast message={toast} onClose={() => setToast(null)} />}
    </div>
  );
}