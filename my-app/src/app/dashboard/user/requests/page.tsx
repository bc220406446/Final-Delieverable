// Manages and renders the user's request list with status tabs.
"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import EditRequestModal, {
  EditRequestDraft,
  RequestForEdit,
} from "@/app/components/dashboard/user/request/EditRequestModal";
import requestsData from "@/data/requests.json";

// Request data and tab filter types used by this page.

type RequestStatus = "pending" | "approved" | "rejected";
type RequestTab    = "sent" | "received";
type Mode          = "Online" | "In-person";

type RequestItem = {
  id: string;
  tab: RequestTab;
  skillTitle: string;
  status: RequestStatus;
  personName: string;
  personCity: string;
  personEmail: string;
  preferredTimeSlot: string;
  mode: Mode;
  message: string;
  imageSrc?: string;
};

const INITIAL_REQUESTS: RequestItem[] = requestsData as RequestItem[];

// Helpers for tab filtering and status styling.

function badgeClasses(status: RequestStatus): string {
  const base = "inline-flex items-center border text-xs font-semibold px-2 py-0.5 rounded-full";
  if (status === "approved") return `${base} bg-green-100 text-green-700 border-green-200`;
  if (status === "pending")  return `${base} bg-yellow-100 text-yellow-700 border-yellow-200`;
  return                            `${base} bg-red-100 text-red-700 border-red-200`;
}

function statusLabel(status: RequestStatus): string {
  if (status === "pending")  return "Pending";
  if (status === "approved") return "Accepted";
  return "Rejected";
}

function Pill({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0 rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-xs text-gray-800">
      <span className="font-semibold text-gray-700">{label}:</span>{" "}
      <span className="break-words text-gray-600">{value}</span>
    </div>
  );
}

function MessageBox({ message }: { message: string }) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-4">
      <div className="text-xs font-extrabold tracking-wide uppercase text-gray-500">Message</div>
      <p className="mt-2 text-sm text-gray-600 leading-relaxed">{message}</p>
    </div>
  );
}

// Renders the requests dashboard view.

export default function RequestsPage() {
  const [tab, setTab] = useState<RequestTab>("sent");
  const [items, setItems] = useState<RequestItem[]>(INITIAL_REQUESTS);
  const [editRequest, setEditRequest] = useState<RequestForEdit | null>(null);

  const filtered = useMemo(() => items.filter((r) => r.tab === tab), [items, tab]);

  const counts = useMemo(() => ({
    sent:     items.filter((r) => r.tab === "sent").length,
    received: items.filter((r) => r.tab === "received").length,
  }), [items]);

  function cancelRequest(id: string) {
    setItems((prev) => prev.filter((r) => r.id !== id));
  }

  function acceptRequest(id: string) {
    setItems((prev) => prev.map((r) => (r.id === id ? { ...r, status: "approved" } : r)));
  }

  function rejectRequest(id: string) {
    setItems((prev) => prev.map((r) => (r.id === id ? { ...r, status: "rejected" } : r)));
  }

  function openEdit(r: RequestItem) {
    setEditRequest({
      id:                r.id,
      skillTitle:        r.skillTitle,
      personName:        r.personName,
      personEmail:       r.personEmail,
      preferredTimeSlot: r.preferredTimeSlot,
      mode:              r.mode,
      message:           r.message,
    });
  }

  function handleEditSave(id: string, draft: EditRequestDraft) {
    setItems((prev) =>
      prev.map((r) =>
        r.id === id
          ? { ...r, preferredTimeSlot: draft.preferredTimeSlot, mode: draft.mode as Mode, message: draft.message }
          : r
      )
    );
    setEditRequest(null);
  }

  return (
    <div>
      <div>
        <h1 className="text-2xl md:text-3xl font-extrabold text-green-900">Requests</h1>
        <p className="mt-2 text-sm text-gray-600">
          Track your sent and received requests. 
        </p>
      </div>

      <section className="mt-6 bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">

        {/* Request status filters */}
        <div className="flex flex-wrap gap-2 border-b border-gray-100 p-3">
          {(["sent", "received"] as RequestTab[]).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTab(t)}
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition ${
                tab === t
                  ? "bg-green-600 text-white"
                  : "border border-gray-200 text-gray-600 hover:bg-gray-50"
              }`}
            >
              {t === "sent" ? "Sent Requests" : "Received Requests"}
              <span
                className={`ml-2 text-xs font-bold px-1.5 py-0.5 rounded-full ${
                  tab === t ? "bg-white/20 text-white" : "bg-gray-100 text-gray-500"
                }`}
              >
                {counts[t]}
              </span>
            </button>
          ))}
        </div>

        {/* Filtered request cards */}
        <div className="p-4 md:p-5 flex flex-col gap-4">
          {filtered.length === 0 ? (
            <div className="py-10 text-center text-sm text-gray-400">No requests found.</div>
          ) : (
            filtered.map((r) => (
              <div key={r.id} className="bg-white border border-gray-200 rounded-2xl p-4 md:p-5">
                <div className="flex flex-col md:flex-row gap-4">

                  {/* Thumb */}
                  <div className="relative w-full md:w-[220px] h-[160px] rounded-2xl overflow-hidden bg-green-50 shrink-0">
                    {r.imageSrc ? (
                      <Image src={r.imageSrc} alt={r.skillTitle} fill className="object-cover" unoptimized />
                    ) : (
                      <div className="w-full h-full" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    {/* Title + Status */}
                    <div className="flex flex-wrap items-start gap-2">
                      <div className="text-base font-extrabold text-gray-900 leading-snug">{r.skillTitle}</div>
                      <span className={badgeClasses(r.status)}>{statusLabel(r.status)}</span>
                    </div>

                    {/* Pills */}
                    <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <Pill label={tab === "sent" ? "Provider" : "Requester"} value={`${r.personName} (${r.personCity})`} />
                      <Pill label="Email"               value={r.personEmail}       />
                      <Pill label="Preferred Time Slot" value={r.preferredTimeSlot} />
                      <Pill label="Mode"                value={r.mode}              />
                    </div>

                    {/* Message */}
                    <div className="mt-3">
                      <MessageBox message={r.message} />
                    </div>

                    {/* Request-level actions */}
                    <div className="mt-4 flex flex-wrap gap-2">

                      {/* Sent + pending → Edit + Cancel */}
                      {tab === "sent" && r.status === "pending" && (
                        <>
                          <button
                            type="button"
                            onClick={() => openEdit(r)}
                            className="inline-flex items-center justify-center rounded-lg border border-gray-200 px-3 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition"
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => cancelRequest(r.id)}
                            className="inline-flex items-center justify-center rounded-lg border border-red-200 px-3 py-2 text-sm font-semibold text-red-600 hover:bg-red-50 transition"
                          >
                            Cancel
                          </button>
                        </>
                      )}

                      {/* Sent + approved → no buttons */}
                      {/* Sent + rejected → no buttons */}

                      {/* Received + pending → Accept + Reject */}
                      {tab === "received" && r.status === "pending" && (
                        <>
                          <button
                            type="button"
                            onClick={() => acceptRequest(r.id)}
                            className="inline-flex items-center justify-center rounded-lg bg-green-600 px-3 py-2 text-sm font-semibold text-white hover:bg-green-700 transition"
                          >
                            Accept
                          </button>
                          <button
                            type="button"
                            onClick={() => rejectRequest(r.id)}
                            className="inline-flex items-center justify-center rounded-lg border border-red-200 px-3 py-2 text-sm font-semibold text-red-600 hover:bg-red-50 transition"
                          >
                            Reject
                          </button>
                        </>
                      )}

                      {/* Received + approved / rejected → no buttons */}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </section>

      {/* Edit Request Modal */}
      {editRequest && (
        <EditRequestModal
          request={editRequest}
          onSave={handleEditSave}
          onClose={() => setEditRequest(null)}
        />
      )}
    </div>
  );
}