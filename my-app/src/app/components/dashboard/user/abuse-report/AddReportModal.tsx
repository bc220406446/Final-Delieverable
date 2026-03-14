// Provides the abuse report submission modal used from the user dashboard.
"use client";

import { useState, useEffect, JSX } from "react";

// Defines report form types and component props for abuse submission.

export type AbuseReportType = "User" | "Skill" | "Exchange";

export interface AbuseReportForm {
  type: AbuseReportType | "";
  target: string;
  reason: string;
  description: string;
}

interface FormErrors {
  type?: string;
  target?: string;
  reason?: string;
  description?: string;
}

interface Props {
  onSave: (form: AbuseReportForm) => void;
  onClose: () => void;
}

// Provides selectable report types and target labels/placeholders by type.

const REPORT_TYPES: AbuseReportType[] = ["User", "Skill", "Exchange"];

const TARGET_CONFIG: Record<AbuseReportType, { label: string; placeholder: string }> = {
  User:     { label: "Username",    placeholder: "Enter the username you want to report…"          },
  Skill:    { label: "Skill Title", placeholder: "Enter the skill title you want to report…"       },
  Exchange: { label: "Exchange ID", placeholder: "Enter the Exchange ID (e.g. EX-2026-014)…" },
};

// Shared form styling and small field helper components for validation feedback.

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
  if (!msg) return null;
  return <p className="mt-1 text-xs text-red-500">{msg}</p>;
}

// Renders the report form modal and submits validated abuse report details.

export default function AddReportModal({ onSave, onClose }: Props): JSX.Element {
  const [form, setForm] = useState<AbuseReportForm>({
    type: "", target: "", reason: "", description: "",
  });
  const [errors, setErrors] = useState<FormErrors>({});

  // Escape key to close
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [onClose]);

  function validate(): FormErrors {
    const e: FormErrors = {};
    if (!form.type) e.type = "Please select a report type.";
    if (!form.target.trim()) {
      if      (form.type === "User")     e.target = "Username is required.";
      else if (form.type === "Skill")    e.target = "Skill title is required.";
      else if (form.type === "Exchange") e.target = "Exchange ID is required.";
      else                               e.target = "This field is required.";
    }
    if (!form.reason.trim())      e.reason      = "Reason is required.";
    if (!form.description.trim()) e.description = "Description is required.";
    return e;
  }

  function handleSubmit() {
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    onSave(form);
  }

  return (
    <>
      {/* Backdrop - pointer-events-none, only Close / Escape dismisses */}
      <div className="fixed inset-0 bg-black/30 z-40 pointer-events-none" />

      {/* Panel */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md my-auto overflow-hidden">

          {/* Header */}
          <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
            <h3 className="text-base font-extrabold text-gray-900">Submit Abuse Report</h3>
            <button
              type="button"
              onClick={onClose}
              className="text-xs font-semibold text-gray-600 border border-gray-200 hover:bg-gray-50 transition px-2.5 py-1.5 rounded-lg"
            >
              Close
            </button>
          </div>

          {/* Body */}
          <div className="px-6 py-5 flex flex-col gap-4">

            {/* Type */}
            <div>
              <FieldLabel>Type</FieldLabel>
              <select
                value={form.type}
                onChange={(e) => {
                  setForm((p) => ({ ...p, type: e.target.value as AbuseReportType | "", target: "" }));
                  setErrors((p) => ({ ...p, type: undefined, target: undefined }));
                }}
                className={fieldCls(!!errors.type)}
              >
                <option value="">Select report type…</option>
                {REPORT_TYPES.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
              <FieldError msg={errors.type} />
            </div>

            {/* Dynamic target - shown only after type is selected */}
            {form.type !== "" && (
              <div>
                <FieldLabel>{TARGET_CONFIG[form.type as AbuseReportType].label}</FieldLabel>
                <input
                  type="text"
                  value={form.target}
                  onChange={(e) => {
                    setForm((p) => ({ ...p, target: e.target.value }));
                    setErrors((p) => ({ ...p, target: undefined }));
                  }}
                  placeholder={TARGET_CONFIG[form.type as AbuseReportType].placeholder}
                  className={fieldCls(!!errors.target)}
                />
                <FieldError msg={errors.target} />
              </div>
            )}

            {/* Reason */}
            <div>
              <FieldLabel>Reason</FieldLabel>
              <input
                type="text"
                value={form.reason}
                onChange={(e) => {
                  setForm((p) => ({ ...p, reason: e.target.value }));
                  setErrors((p) => ({ ...p, reason: undefined }));
                }}
                placeholder="e.g. Spam, Harassment, Misleading content…"
                className={fieldCls(!!errors.reason)}
              />
              <FieldError msg={errors.reason} />
            </div>

            {/* Description */}
            <div>
              <FieldLabel>Description</FieldLabel>
              <textarea
                rows={3}
                value={form.description}
                onChange={(e) => {
                  setForm((p) => ({ ...p, description: e.target.value }));
                  setErrors((p) => ({ ...p, description: undefined }));
                }}
                placeholder="Describe the issue in detail…"
                className={`${fieldCls(!!errors.description)} resize-none`}
              />
              <FieldError msg={errors.description} />
            </div>
          </div>

          {/* Footer */}
          <div className="px-6 pb-6 flex gap-3">
            <button
              type="button"
              onClick={handleSubmit}
              className="flex-1 bg-red-500 hover:bg-red-600 text-white font-semibold text-sm py-2.5 rounded-xl transition"
            >
              Submit Report
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold text-sm py-2.5 rounded-xl transition"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </>
  );
}