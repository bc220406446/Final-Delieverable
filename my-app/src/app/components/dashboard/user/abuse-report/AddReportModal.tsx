// Abuse report modal with live dropdowns for User, Skill, and Exchange targets.
"use client";

import { useState, useEffect, JSX } from "react";
import { useAuth } from "@/context/AuthContext";
import {
  getAllUsers, getApprovedSkills, getMyExchanges,
  createReport, StrapiUser, StrapiSkill, StrapiExchange,
} from "@/lib/api";

export type AbuseReportType = "User" | "Skill" | "Exchange";

interface Props {
  onSaved:  () => void;
  onClose:  () => void;
}

function fieldCls(hasError: boolean): string {
  return `w-full rounded-xl border px-3.5 py-2.5 text-sm text-gray-900 placeholder-gray-400 outline-none transition focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white ${
    hasError ? "border-red-400" : "border-gray-200"
  }`;
}

function FieldLabel({ children }: { children: React.ReactNode }): JSX.Element {
  return (
    <label className="block text-xs font-extrabold uppercase tracking-wide text-gray-500 mb-1.5">
      {children}
    </label>
  );
}

function FieldError({ msg }: { msg?: string }): JSX.Element | null {
  return msg ? <p className="mt-1 text-xs text-red-500">{msg}</p> : null;
}

export default function AddReportModal({ onSaved, onClose }: Props): JSX.Element {
  const { token, user } = useAuth();

  const [type,        setType]        = useState<AbuseReportType | "">("");
  const [targetId,    setTargetId]    = useState("");   // id/email/exchange_id
  const [targetLabel, setTargetLabel] = useState("");   // human-readable label
  const [reason,      setReason]      = useState("");
  const [description, setDescription] = useState("");
  const [submitting,  setSubmitting]  = useState(false);
  const [apiError,    setApiError]    = useState<string | null>(null);
  const [errors,      setErrors]      = useState<Record<string, string>>({});

  // Data for dropdowns
  const [users,     setUsers]     = useState<StrapiUser[]>([]);
  const [skills,    setSkills]    = useState<StrapiSkill[]>([]);
  const [exchanges, setExchanges] = useState<StrapiExchange[]>([]);
  const [loadingOptions, setLoadingOptions] = useState(false);

  useEffect(() => {
    function handleKey(e: KeyboardEvent) { if (e.key === "Escape") onClose(); }
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [onClose]);

  // Load options when type changes
  useEffect(() => {
    if (!type || !token) return;
    setTargetId(""); setTargetLabel("");
    setLoadingOptions(true);

    const loaders: Record<AbuseReportType, () => Promise<void>> = {
      User: async () => {
        const all = await getAllUsers(token);
        // Exclude self
        setUsers(all.filter((u) => u.email !== user?.email && !(u as any).blocked));
      },
      Skill: async () => {
        const all = await getApprovedSkills(token);
        // Exclude own skills
        setSkills(all.filter((s) => s.provider_email !== user?.email));
      },
      Exchange: async () => {
        const all = await getMyExchanges(token);
        setExchanges(all);
      },
    };

    loaders[type as AbuseReportType]()
      .catch(() => {})
      .finally(() => setLoadingOptions(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [type, token]);

  function selectUser(u: StrapiUser) {
    setTargetId(u.email);
    setTargetLabel(u.fullName || u.username || u.email);
    setErrors((p) => ({ ...p, target: "" }));
  }

  function selectSkill(s: StrapiSkill) {
    setTargetId(String(s.id));
    setTargetLabel(s.title);
    setErrors((p) => ({ ...p, target: "" }));
  }

  function selectExchange(x: StrapiExchange) {
    setTargetId(x.exchange_id);
    const isRequester = x.requester_email === user?.email;
    const partner     = isRequester ? x.provider_name : x.requester_name;
    setTargetLabel(`${x.exchange_id} — ${partner}`);
    setErrors((p) => ({ ...p, target: "" }));
  }

  async function handleSubmit() {
    const e: Record<string, string> = {};
    if (!type)              e.type        = "Please select a report type.";
    if (!targetId)          e.target      = "Please select a target.";
    if (!reason.trim())     e.reason      = "Reason is required.";
    if (!description.trim()) e.description = "Description is required.";
    if (Object.keys(e).length) { setErrors(e); return; }
    if (!token) return;

    setSubmitting(true); setApiError(null);
    try {
      await createReport({
        type:         type as AbuseReportType,
        target_id:    targetId,
        target_label: targetLabel,
        reason:       reason.trim(),
        description:  description.trim(),
      }, token);
      onSaved();
    } catch (err) {
      setApiError(err instanceof Error ? err.message : "Failed to submit report.");
      setSubmitting(false);
    }
  }

  // Dropdown content by type
  function renderTargetSelector(): JSX.Element {
    if (!type) return <></>;

    if (loadingOptions) {
      return <div className="text-sm text-gray-400 py-2">Loading options…</div>;
    }

    if (type === "User") {
      return (
        <div>
          <FieldLabel>Select User to Report</FieldLabel>
          <select className={fieldCls(!!errors.target)} value={targetId}
            onChange={(e) => {
              const u = users.find((x) => x.email === e.target.value);
              if (u) selectUser(u);
            }}>
            <option value="">Choose a user…</option>
            {users.map((u) => (
              <option key={u.id} value={u.email}>
                {u.fullName || u.username} ({u.email})
              </option>
            ))}
          </select>
          <FieldError msg={errors.target} />
        </div>
      );
    }

    if (type === "Skill") {
      return (
        <div>
          <FieldLabel>Select Skill to Report</FieldLabel>
          <select className={fieldCls(!!errors.target)} value={targetId}
            onChange={(e) => {
              const s = skills.find((x) => String(x.id) === e.target.value);
              if (s) selectSkill(s);
            }}>
            <option value="">Choose a skill…</option>
            {skills.map((s) => (
              <option key={s.id} value={String(s.id)}>
                {s.title} — {s.provider_name}
              </option>
            ))}
          </select>
          <FieldError msg={errors.target} />
        </div>
      );
    }

    if (type === "Exchange") {
      return (
        <div>
          <FieldLabel>Select Exchange to Report</FieldLabel>
          <select className={fieldCls(!!errors.target)} value={targetId}
            onChange={(e) => {
              const x = exchanges.find((ex) => ex.exchange_id === e.target.value);
              if (x) selectExchange(x);
            }}>
            <option value="">Choose an exchange…</option>
            {exchanges.map((x) => {
              const isReq   = x.requester_email === user?.email;
              const partner = isReq ? x.provider_name : x.requester_name;
              return (
                <option key={x.id} value={x.exchange_id}>
                  {x.exchange_id} — {partner} ({x.status})
                </option>
              );
            })}
          </select>
          <FieldError msg={errors.target} />
        </div>
      );
    }

    return <></>;
  }

  return (
    <>
      <div className="fixed inset-0 bg-black/30 z-40" onClick={onClose} />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md my-auto overflow-hidden">

          <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
            <h3 className="text-base font-extrabold text-gray-900">Submit Abuse Report</h3>
            <button type="button" onClick={onClose}
              className="text-xs font-semibold text-gray-600 border border-gray-200 hover:bg-gray-50 transition px-2.5 py-1.5 rounded-lg">
              Close
            </button>
          </div>

          <div className="px-6 py-5 flex flex-col gap-4">

            {apiError && (
              <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {apiError}
              </div>
            )}

            {/* Report Type */}
            <div>
              <FieldLabel>Report Type</FieldLabel>
              <select className={fieldCls(!!errors.type)} value={type}
                onChange={(e) => { setType(e.target.value as AbuseReportType | ""); setErrors({}); }}>
                <option value="">Select report type…</option>
                <option value="User">User</option>
                <option value="Skill">Skill</option>
                <option value="Exchange">Exchange</option>
              </select>
              <FieldError msg={errors.type} />
            </div>

            {/* Dynamic target dropdown */}
            {renderTargetSelector()}

            {/* Reason */}
            {type && (
              <>
                <div>
                  <FieldLabel>Reason</FieldLabel>
                  <input type="text" value={reason}
                    onChange={(e) => { setReason(e.target.value); setErrors((p) => ({ ...p, reason: "" })); }}
                    placeholder="e.g. Spam, Harassment, Misleading content…"
                    className={fieldCls(!!errors.reason)} />
                  <FieldError msg={errors.reason} />
                </div>

                <div>
                  <FieldLabel>Description</FieldLabel>
                  <textarea rows={3} value={description}
                    onChange={(e) => { setDescription(e.target.value); setErrors((p) => ({ ...p, description: "" })); }}
                    placeholder="Describe the issue in detail…"
                    className={`${fieldCls(!!errors.description)} resize-none`} />
                  <FieldError msg={errors.description} />
                </div>
              </>
            )}
          </div>

          <div className="px-6 pb-6 flex gap-3">
            <button type="button" onClick={handleSubmit} disabled={submitting}
              className="flex-1 bg-red-500 hover:bg-red-600 text-white font-semibold text-sm py-2.5 rounded-xl transition disabled:opacity-60 disabled:cursor-not-allowed">
              {submitting ? "Submitting…" : "Submit Report"}
            </button>
            <button type="button" onClick={onClose} disabled={submitting}
              className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold text-sm py-2.5 rounded-xl transition disabled:opacity-50">
              Cancel
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
