"use client";

import { useMemo, useState, useEffect, useCallback, JSX } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { getMyExchanges, confirmExchange, cancelExchange, StrapiExchange } from "@/lib/api";
import Pagination from "@/app/components/user/Pagination";
import { paginateItems } from "@/lib/pagination";

type Tab = "active" | "completed" | "cancelled";
type PillType = "pending" | "awaiting_confirmation" | "confirm_delivery" | "confirmed";

// Label/value row used throughout each exchange card.
function Row({ label, value }: { label: string; value: string }): JSX.Element {
  return (
    <div className="flex gap-1.5 sm:gap-2 text-sm">
      <span className="font-semibold text-gray-700 shrink-0 w-28 sm:w-36">{label}:</span>
      <span className="min-w-0 flex-1 text-gray-600 wrap-break-word">{value || "-"}</span>
    </div>
  );
}

// Pill-style detail row used inside each skill exchange panel.
function DetailPill({ label, children }: { label: string; children: React.ReactNode }): JSX.Element {
  return (
    <div className="min-w-0 rounded-xl border border-gray-200/70 bg-white/60 px-3 py-2 text-sm text-gray-800 flex items-start gap-1.5">
      <span className="font-semibold text-gray-700 shrink-0 whitespace-nowrap">{label}:</span>
      <span className="min-w-0 text-gray-600 wrap-break-word">{children}</span>
    </div>
  );
}

// Shows delivery/receipt progress for each side of an exchange.
function StatusPill({ type }: { type: PillType }): JSX.Element {
  const cfg: Record<PillType, { label: string; cls: string }> = {
    pending:               { label: "Pending",               cls: "bg-gray-100  text-gray-500  border-gray-200"  },
    awaiting_confirmation: { label: "Awaiting Confirmation", cls: "bg-amber-100 text-amber-700 border-amber-200" },
    confirm_delivery:      { label: "Confirm Delivery",      cls: "bg-blue-100  text-blue-700  border-blue-200"  },
    confirmed:             { label: "Confirmed",             cls: "bg-green-100 text-green-700 border-green-200" },
  };
  const { label, cls } = cfg[type];
  return (
    <span className={`inline-flex items-center gap-1 border text-xs font-semibold px-2 py-0.5 rounded-full ${cls}`}>
      {type === "confirmed" && (
        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
      )}
      {label}
    </span>
  );
}

export default function ExchangesPage(): JSX.Element {
  const { token, user } = useAuth();

  const [exchanges,       setExchanges]       = useState<StrapiExchange[]>([]);
  const [loading,         setLoading]         = useState(true);
  const [error,           setError]           = useState<string | null>(null);
  const [tab,             setTab]             = useState<Tab>("active");
  const [actionKey,       setActionKey]       = useState<string | null>(null);
  const [cancelConfirmId, setCancelConfirmId] = useState<number | null>(null);
  const [page,            setPage]            = useState(1);

  // Load every exchange involving the current user.
  const fetchExchanges = useCallback(async () => {
    if (!token) return;
    setLoading(true); setError(null);
    try { setExchanges(await getMyExchanges(token)); }
    catch (err) { setError(err instanceof Error ? err.message : "Failed to load exchanges."); }
    finally { setLoading(false); }
  }, [token]);

  // Fetch exchanges when the page loads or when the token-backed fetch function changes.
  useEffect(() => { fetchExchanges(); }, [fetchExchanges]);

  // Filter and paginate exchanges by active/completed/cancelled tab.
  const filtered = useMemo(() => exchanges.filter((x) => x.status === tab), [exchanges, tab]);
  const { items: pagedExchanges, state: pagination } = useMemo(
    () => paginateItems(filtered, page),
    [filtered, page]
  );

  // Counts are shown beside each exchange-status tab.
  const counts   = useMemo(() => ({
    active:    exchanges.filter((x) => x.status === "active").length,
    completed: exchanges.filter((x) => x.status === "completed").length,
    cancelled: exchanges.filter((x) => x.status === "cancelled").length,
  }), [exchanges]);

  // Reset pagination when switching between exchange-status tabs.
  useEffect(() => { setPage(1); }, [tab]);

  // Marks one side of the exchange as delivered or received.
  async function handleAction(id: number, action: "deliver" | "receive") {
    if (!token) return;
    const key = `${id}-${action}`;
    setActionKey(key);
    try {
      const updated = await confirmExchange(id, token, action);
      setExchanges((prev) => prev.map((x) => x.id === id ? { ...x, ...updated } : x));
      if (updated.status === "completed") setTimeout(() => setTab("completed"), 500);
    } catch (err) { alert(err instanceof Error ? err.message : "Failed."); }
    finally { setActionKey(null); }
  }

  // Cancels an active exchange after confirmation.
  async function handleCancel(id: number) {
    if (!token) return;
    setCancelConfirmId(null);
    try {
      const updated = await cancelExchange(id, token);
      setExchanges((prev) => prev.map((x) => x.id === id ? { ...x, ...updated } : x));
      setTimeout(() => setTab("cancelled"), 400);
    } catch (err) { alert(err instanceof Error ? err.message : "Failed."); }
  }

  return (
    <div>
      {/* Page heading explains that this screen tracks the full exchange lifecycle. */}
      <h1 className="text-2xl md:text-3xl font-extrabold text-green-900">Exchanges</h1>
      <p className="mt-2 text-sm text-gray-600">Track your active, completed, and cancelled skill exchanges.</p>

      {/* Tabs separate active, completed, and cancelled exchange records. */}
      <section className="mt-6 bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
        {/* Tab buttons show counts and reset cancel confirmation when switching tabs. */}
        <div className="flex flex-wrap gap-2 border-b border-gray-100 p-3">
          {(["active","completed","cancelled"] as Tab[]).map((key) => (
            <button key={key} type="button"
              onClick={() => { setTab(key); setCancelConfirmId(null); }}
              className={`px-4 py-2 rounded-xl text-sm font-semibold capitalize transition ${
                tab === key ? "bg-green-600 text-white" : "border border-gray-200 text-gray-600 hover:bg-gray-50"
              }`}>
              {key}
              <span className={`ml-2 text-xs font-bold px-1.5 py-0.5 rounded-full ${
                tab === key ? "bg-white/20 text-white" : "bg-gray-100 text-gray-500"
              }`}>{counts[key]}</span>
            </button>
          ))}
        </div>

        {/* Exchange list area handles loading, error, empty, and populated states. */}
        <div className="p-4 md:p-5 flex flex-col gap-4">
          {loading ? (
            // Loading state appears while exchanges are being fetched from the API.
            <div className="py-10 text-center text-sm text-gray-400">Loading exchanges...</div>
          ) : error ? (
            // Error state shows the API failure message if loading exchanges fails.
            <div className="py-10 text-center text-sm text-red-500">{error}</div>
          ) : filtered.length === 0 ? (
            // Empty state appears when the selected tab has no exchanges.
            <div className="py-10 text-center text-sm text-gray-400">No {tab} exchanges.</div>
          ) : pagedExchanges.map((x) => {

            // Work out which side of the exchange belongs to the logged-in user.
            const isRequester = x.requester_email === user?.email;
            const isActive    = tab === "active";

            // Skill A belongs to requester, skill B belongs to provider.
            const aDelivered = x.skill_a_delivered === true;
            const aReceived  = x.skill_a_received  === true;
            const bDelivered = x.skill_b_delivered === true;
            const bReceived  = x.skill_b_received  === true;

            // Requester provides skill A and receives skill B; provider does the reverse.
            const mySkill      = isRequester ? x.skill_a_title  : x.skill_b_title;
            const theirSkill   = isRequester ? x.skill_b_title  : x.skill_a_title;
            const partnerName  = isRequester ? x.provider_name  : x.requester_name;
            const partnerEmail = isRequester ? x.provider_email : x.requester_email;

            // Translate request/provider flags into "my side" and "their side" for the UI.
            const iDelivered  = isRequester ? aDelivered : bDelivered;
            const myDeliveryConfirmed = isRequester ? aReceived : bReceived;
            const theyDelivered = isRequester ? bDelivered : aDelivered;
            const iReceived   = isRequester ? bReceived : aReceived;

            // Status for the skill the current user is providing.
            const providingPill: PillType =
              myDeliveryConfirmed ? "confirmed" :
              iDelivered          ? "awaiting_confirmation" :
              "pending";

            // Status for the skill the current user is receiving.
            const receivingPill: PillType =
              iReceived    ? "confirmed" :
              theyDelivered ? "confirm_delivery" :
              "pending";

            // Unique keys let only the clicked action button show a processing state.
            const deliveringKey = `${x.id}-deliver`;
            const receivingKey  = `${x.id}-receive`;

            return (
              // Each exchange card shows partner info, both skill directions, and available actions.
              <div key={x.id} className="border border-gray-200 rounded-2xl p-4 md:p-5 bg-white">

                {/* Exchange identity block: ID plus the other participant's name/email. */}
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

                {/* Two-panel layout: one panel for what user provides, one for what user receives. */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">

                  {/* Providing panel tracks whether the user's delivered skill has been confirmed. */}
                  <div className={`rounded-xl border p-3.5 transition ${
                    providingPill === "confirmed"             ? "bg-green-50 border-green-200"
                    : providingPill === "awaiting_confirmation" ? "bg-amber-50 border-amber-200"
                    : "bg-gray-50 border-gray-100"
                  }`}>
                    <div className="flex items-start justify-between gap-2 mb-3">
                      <p className="text-[11px] font-extrabold tracking-wide uppercase text-gray-500">
                        Skill Providing
                        <span className="ml-1 normal-case font-semibold text-gray-400">(You provide)</span>
                      </p>
                      <StatusPill type={providingPill} />
                    </div>
                    {/* Skill details use pill-style rows for consistent mobile and desktop layout. */}
                    <div className="grid grid-cols-1 gap-2 mb-3">
                      <DetailPill label="Skill">{mySkill || "-"}</DetailPill>
                      <DetailPill label="Scheduled Slot">{x.preferred_slot || "-"}</DetailPill>
                      <DetailPill label="Mode">{x.mode || "-"}</DetailPill>
                    </div>

                    {/* User can mark their own provided skill as delivered while exchange is active. */}
                    {isActive && !iDelivered && (
                      <button type="button"
                        onClick={() => handleAction(x.id, "deliver")}
                        disabled={actionKey === deliveringKey}
                        className="w-full text-sm rounded-lg px-3 py-2.5 font-semibold text-white bg-green-600 hover:bg-green-700 transition disabled:opacity-60">
                        {actionKey === deliveringKey ? "Processing..." : "Mark as Delivered"}
                      </button>
                    )}

                    {/* After delivery, the user waits for the partner to confirm receipt. */}
                    {isActive && iDelivered && !myDeliveryConfirmed && (
                      <button type="button" disabled
                        className="w-full text-sm rounded-lg px-3 py-2.5 font-semibold text-amber-700 bg-amber-50 border border-amber-200 cursor-not-allowed">
                        Awaiting Confirmation
                      </button>
                    )}
                  </div>

                  {/* Receiving panel tracks whether the partner has delivered and user has confirmed receipt. */}
                  <div className={`rounded-xl border p-3.5 transition ${
                    receivingPill === "confirmed"        ? "bg-green-50 border-green-200"
                    : receivingPill === "confirm_delivery" ? "bg-blue-50 border-blue-200"
                    : "bg-gray-50 border-gray-100"
                  }`}>
                    <div className="flex items-start justify-between gap-2 mb-3">
                      <p className="text-[11px] font-extrabold tracking-wide uppercase text-gray-500">
                        Skill Receiving
                        <span className="ml-1 normal-case font-semibold text-gray-400">(You receive)</span>
                      </p>
                      <StatusPill type={receivingPill} />
                    </div>
                    {/* Skill details use the same pill-style rows as the providing panel. */}
                    <div className="grid grid-cols-1 gap-2 mb-3">
                      <DetailPill label="Skill">{theirSkill || "-"}</DetailPill>
                      <DetailPill label="Scheduled Slot">{x.preferred_slot || "-"}</DetailPill>
                      <DetailPill label="Mode">{x.mode || "-"}</DetailPill>
                    </div>

                    {/* User can confirm receipt only after the partner marks their skill delivered. */}
                    {isActive && theyDelivered && !iReceived && (
                      <button type="button"
                        onClick={() => handleAction(x.id, "receive")}
                        disabled={actionKey === receivingKey}
                        className="w-full text-sm rounded-lg px-3 py-2.5 font-semibold text-white bg-blue-600 hover:bg-blue-700 transition disabled:opacity-60">
                        {actionKey === receivingKey ? "Processing..." : "Mark as Received"}
                      </button>
                    )}

                    {/* Waiting hint appears until the partner marks their skill as delivered. */}
                    {isActive && !theyDelivered && (
                      <p className="text-xs text-gray-400 italic mt-1">
                        Waiting for {partnerName.split(" ")[0]} to mark as delivered.
                      </p>
                    )}
                  </div>
                </div>

                <div className="border-t border-gray-100 my-3" />

                {/* Footer actions change based on exchange status. */}
                <div className="flex flex-wrap gap-2">
                  {isActive && (
                    // Active exchanges require a confirmation click before cancellation.
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
                    // Completed exchanges can be reviewed by the user.
                    <Link href="/user/rating-and-reviews">
                      <button type="button"
                        className="inline-flex items-center justify-center rounded-lg bg-green-600 px-3 py-2 text-sm font-semibold text-white hover:bg-green-700 transition">
                        Leave a Review
                      </button>
                    </Link>
                  )}
                  {tab === "cancelled" && (
                    // Cancelled exchanges can be reported if something went wrong.
                    <Link href="/user/report-abuse">
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

        <Pagination
          page={pagination.page}
          pageCount={pagination.pageCount}
          total={pagination.total}
          startItem={pagination.startItem}
          endItem={pagination.endItem}
          onPageChange={setPage}
        />
      </section>
    </div>
  );
}
