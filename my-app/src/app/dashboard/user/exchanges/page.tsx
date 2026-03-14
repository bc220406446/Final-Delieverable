// Displays exchange requests and confirmation flows for the user.
"use client";

import { useMemo, useState, JSX } from "react";
import Link from "next/link";
import exchangesData from "@/data/exchanges.json";

// Types used by exchange cards and actions.

type ExchangeTab = "active" | "completed" | "cancelled";

interface SkillSide {
  title: string;
  scheduledTime: string;
  mode: "Online" | "In-person";
}

interface ExchangeItem {
  id: string;
  exchangeId: string;
  tab: ExchangeTab;
  withName: string;
  withEmail: string;
  providerConfirmed: boolean;
  receiverConfirmed: boolean;
  providing: SkillSide;
  receiving: SkillSide;
}

const INITIAL_EXCHANGES: ExchangeItem[] = exchangesData as ExchangeItem[];

const TABS: { key: ExchangeTab; label: string }[] = [
  { key: "active",    label: "Active"    },
  { key: "completed", label: "Completed" },
  { key: "cancelled", label: "Cancelled" },
];

// Helpers for status formatting and action gating.

function Row({ label, value }: { label: string; value: string }): JSX.Element {
  return (
    <div className="flex gap-2 text-sm">
      <span className="font-semibold text-gray-700 shrink-0 w-32">{label}:</span>
      <span className="text-gray-600 break-all">{value}</span>
    </div>
  );
}

function SectionDivider(): JSX.Element {
  return <div className="border-t border-gray-100 my-4" />;
}

function ModePill({ mode }: { mode: SkillSide["mode"] }): JSX.Element {
  return (
    <span className={`inline-flex items-center border text-xs font-semibold px-2 py-0.5 rounded-full ${
      mode === "Online"
        ? "bg-blue-100 text-blue-700 border-blue-200"
        : "bg-orange-100 text-orange-700 border-orange-200"
    }`}>{mode}</span>
  );
}

// Action button used to confirm cancellation.

function ConfirmCancelButton({
  id, confirmId, onRequest, onConfirm, onCancel,
}: {
  id: string; confirmId: string | null;
  onRequest: (id: string) => void;
  onConfirm: (id: string) => void;
  onCancel: () => void;
}): JSX.Element {
  if (confirmId === id) {
    return (
      <div className="flex items-center gap-2">
        <button type="button" onClick={() => onConfirm(id)}
          className="text-xs font-semibold text-white bg-red-500 hover:bg-red-600 transition px-2.5 py-1.5 rounded-lg">
          Confirm Cancel
        </button>
        <button type="button" onClick={onCancel}
          className="text-xs font-semibold text-gray-600 border border-gray-200 hover:bg-gray-50 transition px-2.5 py-1.5 rounded-lg">
          Keep
        </button>
      </div>
    );
  }
  return (
    <button type="button" onClick={() => onRequest(id)}
      className="inline-flex items-center justify-center rounded-lg border border-red-200 px-3 py-2 text-sm font-semibold text-red-600 hover:bg-red-50 transition">
      Cancel Exchange
    </button>
  );
}

// Card shown while confirming a skill action.

function SkillConfirmCard({
  heading, subheading, skill, confirmed, onConfirm, otherConfirmed,
}: {
  heading: string; subheading: string; skill: SkillSide;
  confirmed: boolean; onConfirm: () => void; otherConfirmed: boolean;
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
        <Row label="Skill Title"    value={skill.title}         />
        <Row label="Scheduled Time" value={skill.scheduledTime} />
        <div className="flex gap-2 text-sm items-center">
          <span className="font-semibold text-gray-700 w-36 shrink-0">Mode:</span>
          <ModePill mode={skill.mode} />
        </div>
      </div>

      {!confirmed && (
        <button type="button" onClick={onConfirm}
          className="mt-3 w-full text-sm rounded-lg px-3 py-2 font-semibold text-white border bg-green-600 hover:bg-green-700 transition">
          ✓ Mark as Done
        </button>
      )}
    </div>
  );
}

// Card component for each exchange item.

function ExchangeCard({
  item, tab, confirmCancelId,
  onConfirmProvider, onConfirmReceiver,
  onRequestCancel, onConfirmCancel, onClearConfirm,
}: {
  item: ExchangeItem; tab: ExchangeTab; confirmCancelId: string | null;
  onConfirmProvider: (id: string) => void;
  onConfirmReceiver: (id: string) => void;
  onRequestCancel: (id: string) => void;
  onConfirmCancel: (id: string) => void;
  onClearConfirm: () => void;
}): JSX.Element {
  return (
    <div className="border border-gray-200 rounded-2xl p-4 md:p-5 bg-white">

      {/* Exchange ID + counterpart */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-[11px] font-extrabold tracking-wide uppercase text-gray-500">Exchange ID</span>
          <span className="inline-flex items-center border text-xs font-semibold px-2 py-0.5 rounded-full bg-gray-100 text-gray-700 border-gray-200">
            {item.exchangeId}
          </span>
        </div>
        <Row label="Exchanging with" value={item.withName}  />
        <Row label="Email"           value={item.withEmail} />
      </div>

      <SectionDivider />

      {/* Skill sides */}
      {tab === "active" ? (
        <div className="flex flex-col gap-3">
          <p className="text-xs text-gray-500">
            Mark both skills as done once each is delivered and received. The exchange completes automatically when both are confirmed.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <SkillConfirmCard
              heading="Skill Providing" subheading="(You provide)"
              skill={item.providing}
              confirmed={item.providerConfirmed}
              onConfirm={() => onConfirmProvider(item.id)}
              otherConfirmed={item.receiverConfirmed}
            />
            <SkillConfirmCard
              heading="Skill Receiving" subheading="(You receive)"
              skill={item.receiving}
              confirmed={item.receiverConfirmed}
              onConfirm={() => onConfirmReceiver(item.id)}
              otherConfirmed={item.providerConfirmed}
            />
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {[
            { heading: "Skill Providing", subheading: "(You provide)", skill: item.providing  },
            { heading: "Skill Receiving", subheading: "(You receive)", skill: item.receiving },
          ].map(({ heading, subheading, skill }) => (
            <div key={heading} className="bg-gray-50 border border-gray-100 rounded-xl p-3.5">
              <p className="text-[11px] font-extrabold tracking-wide uppercase text-gray-500 mb-3">
                {heading}<span className="ml-1 normal-case font-semibold text-gray-400">{subheading}</span>
              </p>
              <div className="flex flex-col gap-2">
                <Row label="Skill Title"    value={skill.title}         />
                <Row label="Scheduled Time" value={skill.scheduledTime} />
                <div className="flex gap-2 text-sm items-center">
                  <span className="font-semibold text-gray-700 w-36 shrink-0">Mode:</span>
                  <ModePill mode={skill.mode} />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <SectionDivider />

      {/* Exchange action controls */}
      <div className="flex flex-wrap gap-2">
        {tab === "active" && (
          <ConfirmCancelButton
            id={item.id} confirmId={confirmCancelId}
            onRequest={onRequestCancel} onConfirm={onConfirmCancel} onCancel={onClearConfirm}
          />
        )}
        {tab === "completed" && (
          <Link href="/dashboard/user/rating-and-reviews">
            <button type="button" className="inline-flex items-center justify-center rounded-lg bg-green-600 px-3 py-2 text-sm font-semibold text-white hover:bg-green-700 transition">
              Leave a Review
            </button>
          </Link>
        )}
        {tab === "cancelled" && (
          <Link href="/dashboard/user/report-abuse">
            <button type="button" className="inline-flex items-center justify-center rounded-lg border border-red-200 px-3 py-2 text-sm font-semibold text-red-600 hover:bg-red-50 transition">
              Report Abuse
            </button>
          </Link>
        )}
      </div>
    </div>
  );
}

// Renders the exchanges page.

export default function ExchangesPage(): JSX.Element {
  const [tab, setTab] = useState<ExchangeTab>("active");
  const [items, setItems] = useState<ExchangeItem[]>(INITIAL_EXCHANGES);
  const [confirmCancelId, setConfirmCancelId] = useState<string | null>(null);

  const filtered = useMemo(() => items.filter((x) => x.tab === tab), [items, tab]);
  const counts = useMemo(() => ({
    active:    items.filter((x) => x.tab === "active").length,
    completed: items.filter((x) => x.tab === "completed").length,
    cancelled: items.filter((x) => x.tab === "cancelled").length,
  }), [items]);

  function handleConfirmProvider(id: string): void {
    setItems((prev) => prev.map((x) => {
      if (x.id !== id) return x;
      const updated = { ...x, providerConfirmed: true };
      if (updated.receiverConfirmed) {
        setTimeout(() => setTab("completed"), 500);
        return { ...updated, tab: "completed" };
      }
      return updated;
    }));
  }

  function handleConfirmReceiver(id: string): void {
    setItems((prev) => prev.map((x) => {
      if (x.id !== id) return x;
      const updated = { ...x, receiverConfirmed: true };
      if (updated.providerConfirmed) {
        setTimeout(() => setTab("completed"), 500);
        return { ...updated, tab: "completed" };
      }
      return updated;
    }));
  }

  function handleConfirmCancel(id: string): void {
    setItems((prev) => prev.map((x) => (x.id === id ? { ...x, tab: "cancelled" } : x)));
    setConfirmCancelId(null);
    setTab("cancelled");
  }

  return (
    <div>
      <h1 className="text-2xl md:text-3xl font-extrabold text-green-900">Exchanges</h1>
      <p className="mt-2 text-sm text-gray-600">
        Track your active, completed, and cancelled skill exchanges.
      </p>

      <section className="mt-6 bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
        <div className="flex flex-wrap gap-2 border-b border-gray-100 p-3">
          {TABS.map(({ key, label }) => (
            <button key={key} type="button"
              onClick={() => { setTab(key); setConfirmCancelId(null); }}
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
          {filtered.length === 0 ? (
            <div className="py-10 text-center text-sm text-gray-400">
              {tab === "active" ? "No active exchanges." : tab === "completed" ? "No completed exchanges yet." : "No cancelled exchanges."}
            </div>
          ) : (
            filtered.map((x) => (
              <ExchangeCard key={x.id} item={x} tab={tab}
                confirmCancelId={confirmCancelId}
                onConfirmProvider={handleConfirmProvider}
                onConfirmReceiver={handleConfirmReceiver}
                onRequestCancel={(id) => setConfirmCancelId(id)}
                onConfirmCancel={handleConfirmCancel}
                onClearConfirm={() => setConfirmCancelId(null)}
              />
            ))
          )}
        </div>
      </section>
    </div>
  );
}