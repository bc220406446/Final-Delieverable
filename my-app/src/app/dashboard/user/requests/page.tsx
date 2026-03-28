"use client";

import { useMemo, useState, useEffect, useCallback, JSX } from "react";
import { useAuth } from "@/context/AuthContext";
import {
  getMyRequests, updateRequest, acceptRequest,
  rejectRequest, cancelRequest, StrapiRequest,
} from "@/lib/api";
import EditRequestModal, { RequestForEdit, EditRequestDraft }
  from "@/app/components/dashboard/user/request/EditRequestModal";
import AcceptRequestModal
  from "@/app/components/dashboard/user/request/AcceptRequestModal";

type RequestTab = "sent" | "received";

function badgeClasses(status: StrapiRequest["status"]): string {
  const base = "inline-flex items-center border text-xs font-semibold px-2 py-0.5 rounded-full";
  if (status === "accepted") return `${base} bg-green-100 text-green-700 border-green-200`;
  if (status === "pending")  return `${base} bg-yellow-100 text-yellow-700 border-yellow-200`;
  return                            `${base} bg-red-100 text-red-700 border-red-200`;
}

function statusLabel(s: StrapiRequest["status"]) {
  return s === "accepted" ? "Accepted" : s === "pending" ? "Pending" : "Rejected";
}

// Full-width pill - label bold, value on same row
function Pill({ label, value }: { label: string; value: string }): JSX.Element {
  return (
    <div className="rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-xs text-gray-800 flex items-start gap-1.5">
      <span className="font-semibold text-gray-700 shrink-0 whitespace-nowrap">{label}:</span>
      <span className="text-gray-600 wrap-break-word">{value || "-"}</span>
    </div>
  );
}

// Full-width pill spanning entire row (for offered skills)
function FullPill({ label, value }: { label: string; value: string }): JSX.Element {
  return (
    <div className="col-span-2 rounded-xl border border-green-200 bg-green-50 px-3 py-2 text-xs text-gray-800 flex items-start gap-1.5">
      <span className="font-semibold text-green-700 shrink-0 whitespace-nowrap">{label}:</span>
      <span className="text-gray-700 wrap-break-word font-medium">{value || "-"}</span>
    </div>
  );
}

export default function RequestsPage(): JSX.Element {
  const { token } = useAuth();

  const [sent,          setSent]          = useState<StrapiRequest[]>([]);
  const [received,      setReceived]      = useState<StrapiRequest[]>([]);
  const [loading,       setLoading]       = useState(true);
  const [error,         setError]         = useState<string | null>(null);
  const [tab,           setTab]           = useState<RequestTab>("sent");
  const [editRequest,   setEditRequest]   = useState<RequestForEdit | null>(null);
  const [acceptRequest_, setAcceptRequest_] = useState<StrapiRequest | null>(null);
  const [actionId,      setActionId]      = useState<number | null>(null);

  const fetchRequests = useCallback(async () => {
    if (!token) return;
    setLoading(true); setError(null);
    try {
      const { sent: s, received: r } = await getMyRequests(token);
      setSent(s); setReceived(r);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load requests.");
    } finally { setLoading(false); }
  }, [token]);

  useEffect(() => { fetchRequests(); }, [fetchRequests]);

  const counts = useMemo(() => ({ sent: sent.length, received: received.length }), [sent, received]);
  const items  = tab === "sent" ? sent : received;

  async function handleAcceptConfirm(id: number, acceptedSkillTitle: string) {
    if (!token) return;
    setActionId(id);
    try {
      await acceptRequest(id, token, acceptedSkillTitle);
      // Update received list with accepted_skill_title so display updates immediately
      setReceived((prev) => prev.map((r) =>
        r.id === id ? { ...r, status: "accepted" as const, accepted_skill_title: acceptedSkillTitle } : r
      ));
      // Note: the sent list on requester's side will update on next fetch via accepted_skill_title
      setAcceptRequest_(null);
    } catch (err) { alert(err instanceof Error ? err.message : "Failed."); }
    finally { setActionId(null); }
  }

  async function handleReject(id: number) {
    if (!token) return;
    setActionId(id);
    try {
      await rejectRequest(id, token);
      setReceived((prev) => prev.map((r) => r.id === id ? { ...r, status: "rejected" as const } : r));
    } catch (err) { alert(err instanceof Error ? err.message : "Failed."); }
    finally { setActionId(null); }
  }

  async function handleCancel(id: number) {
    if (!token) return;
    setActionId(id);
    try {
      await cancelRequest(id, token);
      setSent((prev) => prev.filter((r) => r.id !== id));
    } catch (err) { alert(err instanceof Error ? err.message : "Failed."); }
    finally { setActionId(null); }
  }

  async function handleEditSave(id: number, draft: EditRequestDraft) {
    if (!token) return;
    setActionId(id);
    try {
      await updateRequest(id, { 
        offered_skill_id:    draft.offered_skill_id,
        offered_skill_title: draft.offered_skill_title,
        preferred_slot:      draft.preferred_slot,
        mode:                draft.mode,
        message:             draft.message, 
      }, token);
      setSent((prev) => prev.map((r) => r.id === id ? {
        ...r,
        offered_skill_id:    draft.offered_skill_id,
        offered_skill_title: draft.offered_skill_title,
        preferred_slot:      draft.preferred_slot,
        mode:                draft.mode,
        message:             draft.message,
      } : r));
      setEditRequest(null);
    } catch (err) { alert(err instanceof Error ? err.message : "Failed."); }
    finally { setActionId(null); }
  }

  function openEdit(r: StrapiRequest) {
    setEditRequest({
      id: r.id, requested_skill_title: r.requested_skill_title,
      provider_name: r.provider_name, provider_email: r.provider_email,
      offered_skill_title: r.offered_skill_title,
      preferred_slot: r.preferred_slot, mode: r.mode, message: r.message,
    });
  }

  return (
    <div>
      <h1 className="text-2xl md:text-3xl font-extrabold text-green-900">Requests</h1>
      <p className="mt-2 text-sm text-gray-600">Track your sent and received skill exchange requests.</p>

      <section className="mt-6 bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">

        {/* Tabs */}
        <div className="flex flex-wrap gap-2 border-b border-gray-100 p-3">
          {(["sent", "received"] as RequestTab[]).map((t) => (
            <button key={t} onClick={() => setTab(t)}
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition ${
                tab === t ? "bg-green-600 text-white" : "border border-gray-200 text-gray-600 hover:bg-gray-50"
              }`}>
              {t === "sent" ? "Sent Requests" : "Received Requests"}
              <span className={`ml-2 text-xs font-bold px-1.5 py-0.5 rounded-full ${
                tab === t ? "bg-white/20 text-white" : "bg-gray-100 text-gray-500"
              }`}>{counts[t]}</span>
            </button>
          ))}
        </div>

        <div className="p-4 md:p-5 flex flex-col gap-4">
          {loading ? (
            <div className="py-10 text-center text-sm text-gray-400">Loading requests…</div>
          ) : error ? (
            <div className="py-10 text-center text-sm text-red-500">{error}</div>
          ) : items.length === 0 ? (
            <div className="py-10 text-center text-sm text-gray-400">No requests found.</div>
          ) : items.map((r) => (
            <div key={r.id} className="bg-white border border-gray-200 rounded-2xl p-4 md:p-5">

              <div className="flex flex-wrap items-start gap-2 mb-3">
                <div className="text-base font-extrabold text-gray-900 leading-snug">{r.requested_skill_title}</div>
                <span className={badgeClasses(r.status)}>{statusLabel(r.status)}</span>
              </div>

              <div className="grid grid-cols-2 gap-2">
                {tab === "sent" ? (
                  <>
                    {/* After acceptance: show only the skill provider chose, not the full offered list */}
                    <FullPill
                      label="You Offer"
                      value={r.status === "accepted" && r.accepted_skill_title
                        ? r.accepted_skill_title
                        : r.offered_skill_title}
                    />
                    <Pill label="Provider"          value={r.provider_name}  />
                    <Pill label="Provider Email"    value={r.provider_email} />
                  </>
                ) : (
                  <>
                    {/* Provider side: show only the accepted skill, not the full list */}
                    <FullPill
                      label="They Offer"
                      value={r.status === "accepted" && r.accepted_skill_title
                        ? r.accepted_skill_title
                        : r.offered_skill_title}
                    />
                    <Pill label="Requester"         value={r.requester_name}   />
                    <Pill label="Requester Email"   value={r.requester_email}  />
                  </>
                )}
                <Pill label="Time Slot" value={r.preferred_slot} />
                <Pill label="Mode"      value={r.mode}           />
              </div>

              {r.message && (
                <div className="mt-3 rounded-xl border border-gray-200 bg-gray-50 p-3">
                  <div className="text-xs font-extrabold tracking-wide uppercase text-gray-500 mb-1">Message</div>
                  <p className="text-sm text-gray-600 leading-relaxed">{r.message}</p>
                </div>
              )}

              <div className="mt-4 flex flex-wrap gap-2">
                {tab === "sent" && r.status === "pending" && (
                  <>
                    <button onClick={() => openEdit(r)}
                      className="rounded-lg border border-gray-200 px-3 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition">
                      Edit
                    </button>
                    <button onClick={() => handleCancel(r.id)} disabled={actionId === r.id}
                      className="rounded-lg border border-red-200 px-3 py-2 text-sm font-semibold text-red-600 hover:bg-red-50 transition disabled:opacity-50">
                      {actionId === r.id ? "Cancelling…" : "Cancel"}
                    </button>
                  </>
                )}
                {tab === "received" && r.status === "pending" && (
                  <>
                    <button onClick={() => setAcceptRequest_(r)} disabled={actionId === r.id}
                      className="rounded-lg bg-green-600 hover:bg-green-700 px-3 py-2 text-sm font-semibold text-white transition disabled:opacity-50">
                      Accept
                    </button>
                    <button onClick={() => handleReject(r.id)} disabled={actionId === r.id}
                      className="rounded-lg border border-red-200 px-3 py-2 text-sm font-semibold text-red-600 hover:bg-red-50 transition disabled:opacity-50">
                      {actionId === r.id ? "…" : "Reject"}
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      {editRequest && (
        <EditRequestModal
          request={editRequest}
          onSave={handleEditSave}
          onClose={() => setEditRequest(null)}
        />
      )}

      {acceptRequest_ && (
        <AcceptRequestModal
          requestId={acceptRequest_.id}
          requesterName={acceptRequest_.requester_name}
          requestedSkillTitle={acceptRequest_.requested_skill_title}
          offeredSkillTitle={acceptRequest_.offered_skill_title}
          onAccept={handleAcceptConfirm}
          onClose={() => setAcceptRequest_(null)}
        />
      )}
    </div>
  );
}