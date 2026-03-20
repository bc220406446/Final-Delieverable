// Exchanges page — fetches real exchanges from Strapi.
"use client";

import { useMemo, useState, useEffect, useCallback, JSX } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { getMyExchanges, confirmExchange, cancelExchange, StrapiExchange } from "@/lib/api";

type ExchangeTab = "active" | "completed" | "cancelled";

const TABS: { key: ExchangeTab; label: string }[] = [
  { key: "active",    label: "Active"    },
  { key: "completed", label: "Completed" },
  { key: "cancelled", label: "Cancelled" },
];

function Row({ label, value }: { label: string; value: string }): JSX.Element {
  return (
    <div className="flex gap-2 text-sm">
      <span className="font-semibold text-gray-700 shrink-0 w-36">{label}:</span>
      <span className="text-gray-600 wrap-break-word">{value || "—"}</span>
    </div>
  );
}

function ModePill({ mode }: { mode: "Online" | "In-person" }): JSX.Element {
  return (
    <span className={`inline-flex items-center border text-xs font-semibold px-2 py-0.5 rounded-full ${
      mode === "Online"
        ? "bg-blue-100 text-blue-700 border-blue-200"
        : "bg-orange-100 text-orange-700 border-orange-200"
    }`}>{mode}</span>
  );
}

function SkillCard({
  heading, subheading, skillTitle, slot, mode, confirmed, otherConfirmed,
  isActive, onConfirm, confirming,
}: {
  heading: string; subheading: string; skillTitle: string;
  slot: string; mode: "Online" | "In-person";
  confirmed: boolean; otherConfirmed: boolean;
  isActive: boolean; onConfirm: () => void; confirming: boolean;
}): JSX.Element {
  return (
    <div className={`rounded-xl border p-3.5 transition ${
      confirmed ? "bg-green-50 border-green-200" : "bg-gray-50 border-gray-100"
    }`}>
      <div className="flex items-start justify-between gap-2 mb-3">
        <p className="text-[11px] font-extrabold tracking-wide uppercase text-gray-500">
          {heading}
          <span className="ml-1 normal-case font-semibold text-gray-400">{subheading}</span>
        </p>
        {confirmed ? (
          <span className="shrink-0 inline-flex items-center gap-1 text-xs font-semibold text-green-700 bg-green-100 border border-green-200 px-2 py-0.5 rounded-full">
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
            Confirmed
          </span>
        ) : otherConfirmed ? (
          <span className="shrink-0 text-xs font-semibold text-amber-600 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
            Awaiting you
          </span>
        ) : null}
      </div>

      <div className="flex flex-col gap-2">
        <Row label="Skill" value={skillTitle} />
        <Row label="Scheduled Slot" value={slot} />
        <div className="flex gap-2 text-sm items-center">
          <span className="font-semibold text-gray-700 w-36 shrink-0">Mode:</span>
          <ModePill mode={mode} />
        </div>
      </div>

      {isActive && !confirmed && (
        <button
          type="button"
          onClick={onConfirm}
          disabled={confirming}
          className="mt-3 w-full text-sm rounded-lg px-3 py-2 font-semibold text-white bg-green-600 hover:bg-green-700 transition disabled:opacity-60"
        >
          {confirming ? "Confirming…" : "✓ Mark as Done"}
        </button>
      )}
    </div>
  );
}

export default function ExchangesPage(): JSX.Element {
  const { token, user } = useAuth();

  const [exchanges,    setExchanges]    = useState<StrapiExchange[]>([]);
  const [loading,      setLoading]      = useState(true);
  const [error,        setError]        = useState<string | null>(null);
  const [tab,          setTab]          = useState<ExchangeTab>("active");
  const [confirmingId, setConfirmingId] = useState<number | null>(null);
  const [cancelConfirmId, setCancelConfirmId] = useState<number | null>(null);

  const fetchExchanges = useCallback(async () => {
    if (!token) return;
    setLoading(true); setError(null);
    try {
      const data = await getMyExchanges(token);
      setExchanges(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load exchanges.");
    } finally { setLoading(false); }
  }, [token]);

  useEffect(() => { fetchExchanges(); }, [fetchExchanges]);

  const filtered = useMemo(
    () => exchanges.filter((x) => x.status === tab),
    [exchanges, tab]
  );

  const counts = useMemo(() => ({
    active:    exchanges.filter((x) => x.status === "active").length,
    completed: exchanges.filter((x) => x.status === "completed").length,
    cancelled: exchanges.filter((x) => x.status === "cancelled").length,
  }), [exchanges]);

  async function handleConfirm(id: number) {
    if (!token) return;
    setConfirmingId(id);
    try {
      const updated = await confirmExchange(id, token);
      setExchanges((prev) => prev.map((x) => x.id === id ? { ...x, ...updated } : x));
      // If just completed, switch tab
      if (updated.status === "completed") setTimeout(() => setTab("completed"), 400);
    } catch (err) { alert(err instanceof Error ? err.message : "Failed."); }
    finally { setConfirmingId(null); }
  }

  async function handleCancel(id: number) {
    if (!token) return;
    setCancelConfirmId(null);
    try {
      const updated = await cancelExchange(id, token);
      setExchanges((prev) => prev.map((x) => x.id === id ? { ...x, ...updated } : x));
      setTimeout(() => setTab("cancelled"), 400);
    } catch (err) { alert(err instanceof Error ? err.message : "Failed."); }
  }

  // Determine skill perspective based on whether viewer is requester or provider
  function getPerspective(x: StrapiExchange) {
    const isRequester = x.requester_email === user?.email;
    return {
      // What I provide
      mySkill:           isRequester ? x.skill_a_title       : x.skill_b_title,
      myConfirmed:       isRequester ? x.requester_confirmed  : x.provider_confirmed,
      // What I receive
      theirSkill:        isRequester ? x.skill_b_title       : x.skill_a_title,
      theirConfirmed:    isRequester ? x.provider_confirmed   : x.requester_confirmed,
      // Partner info
      partnerName:       isRequester ? x.provider_name       : x.requester_name,
      partnerEmail:      isRequester ? x.provider_email      : x.requester_email,
    };
  }

  return (
    <div>
      <h1 className="text-2xl md:text-3xl font-extrabold text-green-900">Exchanges</h1>
      <p className="mt-2 text-sm text-gray-600">
        Track your active, completed, and cancelled skill exchanges.
      </p>

      <section className="mt-6 bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">

        {/* Tabs */}
        <div className="flex flex-wrap gap-2 border-b border-gray-100 p-3">
          {TABS.map(({ key, label }) => (
            <button key={key} type="button"
              onClick={() => { setTab(key); setCancelConfirmId(null); }}
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition ${
                tab === key ? "bg-green-600 text-white" : "border border-gray-200 text-gray-600 hover:bg-gray-50"
              }`}>
              {label}
              <span className={`ml-2 text-xs font-bold px-1.5 py-0.5 rounded-full ${
                tab === key ? "bg-white/20 text-white" : "bg-gray-100 text-gray-500"
              }`}>{counts[key]}</span>
            </button>
          ))}
        </div>

        <div className="p-4 md:p-5 flex flex-col gap-4">
          {loading ? (
            <div className="py-10 text-center text-sm text-gray-400">Loading exchanges…</div>
          ) : error ? (
            <div className="py-10 text-center text-sm text-red-500">{error}</div>
          ) : filtered.length === 0 ? (
            <div className="py-10 text-center text-sm text-gray-400">
              {tab === "active" ? "No active exchanges." : tab === "completed" ? "No completed exchanges yet." : "No cancelled exchanges."}
            </div>
          ) : filtered.map((x) => {
            const { mySkill, myConfirmed, theirSkill, theirConfirmed, partnerName, partnerEmail } = getPerspective(x);
            return (
              <div key={x.id} className="border border-gray-200 rounded-2xl p-4 md:p-5 bg-white">

                {/* Header */}
                <div className="flex flex-col gap-2 mb-4">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[11px] font-extrabold tracking-wide uppercase text-gray-500">Exchange ID</span>
                    <span className="inline-flex items-center border text-xs font-semibold px-2 py-0.5 rounded-full bg-gray-100 text-gray-700 border-gray-200">
                      {x.exchange_id}
                    </span>
                  </div>
                  <Row label="Exchanging with" value={partnerName}  />
                  <Row label="Email"           value={partnerEmail} />
                </div>

                <div className="border-t border-gray-100 my-3" />

                {/* Skill cards */}
                {tab === "active" ? (
                  <>
                    <p className="text-xs text-gray-500 mb-3">
                      Mark your side done once you've delivered your skill. Exchange completes when both sides confirm.
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <SkillCard
                        heading="Skill Providing" subheading="(You provide)"
                        skillTitle={mySkill} slot={x.preferred_slot} mode={x.mode}
                        confirmed={myConfirmed} otherConfirmed={theirConfirmed}
                        isActive onConfirm={() => handleConfirm(x.id)}
                        confirming={confirmingId === x.id}
                      />
                      <SkillCard
                        heading="Skill Receiving" subheading="(You receive)"
                        skillTitle={theirSkill} slot={x.preferred_slot} mode={x.mode}
                        confirmed={theirConfirmed} otherConfirmed={myConfirmed}
                        isActive={false} onConfirm={() => {}} confirming={false}
                      />
                    </div>
                  </>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {[
                      { heading: "Skill Providing", subheading: "(You provide)", skill: mySkill    },
                      { heading: "Skill Receiving", subheading: "(You receive)", skill: theirSkill },
                    ].map(({ heading, subheading, skill }) => (
                      <div key={heading} className="bg-gray-50 border border-gray-100 rounded-xl p-3.5">
                        <p className="text-[11px] font-extrabold tracking-wide uppercase text-gray-500 mb-3">
                          {heading}<span className="ml-1 normal-case font-semibold text-gray-400">{subheading}</span>
                        </p>
                        <div className="flex flex-col gap-2">
                          <Row label="Skill"          value={skill}          />
                          <Row label="Scheduled Slot" value={x.preferred_slot} />
                          <div className="flex gap-2 text-sm items-center">
                            <span className="font-semibold text-gray-700 w-36 shrink-0">Mode:</span>
                            <ModePill mode={x.mode} />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                <div className="border-t border-gray-100 my-3" />

                {/* Actions */}
                <div className="flex flex-wrap gap-2">
                  {tab === "active" && (
                    cancelConfirmId === x.id ? (
                      <div className="flex items-center gap-2">
                        <button onClick={() => handleCancel(x.id)}
                          className="text-xs font-semibold text-white bg-red-500 hover:bg-red-600 transition px-2.5 py-1.5 rounded-lg">
                          Confirm Cancel
                        </button>
                        <button onClick={() => setCancelConfirmId(null)}
                          className="text-xs font-semibold text-gray-600 border border-gray-200 hover:bg-gray-50 transition px-2.5 py-1.5 rounded-lg">
                          Keep
                        </button>
                      </div>
                    ) : (
                      <button onClick={() => setCancelConfirmId(x.id)}
                        className="inline-flex items-center justify-center rounded-lg border border-red-200 px-3 py-2 text-sm font-semibold text-red-600 hover:bg-red-50 transition">
                        Cancel Exchange
                      </button>
                    )
                  )}
                  {tab === "completed" && (
                    <Link href="/dashboard/user/rating-and-reviews">
                      <button type="button"
                        className="inline-flex items-center justify-center rounded-lg bg-green-600 px-3 py-2 text-sm font-semibold text-white hover:bg-green-700 transition">
                        Leave a Review
                      </button>
                    </Link>
                  )}
                  {tab === "cancelled" && (
                    <Link href="/dashboard/user/report-abuse">
                      <button type="button"
                        className="inline-flex items-center justify-center rounded-lg border border-red-200 px-3 py-2 text-sm font-semibold text-red-600 hover:bg-red-50 transition">
                        Report Abuse
                      </button>
                    </Link>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
