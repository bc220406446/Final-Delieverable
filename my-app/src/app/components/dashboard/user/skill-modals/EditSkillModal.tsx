// Provides the modal for editing an existing offered skill entry.
"use client";

import { useState, useMemo, useEffect, JSX } from "react";
import SkillFormFields from "./SkillFormFields";
import { useAuth } from "@/context/AuthContext";
import { getSkillCategories, resolveSkillCategory } from "@/lib/api";
import {
  SkillFormState,
  SkillPayload,
  Category,
  toCategories,
  validateSkillForm,
} from "./skillModalTypes";

export interface ExistingSkill {
  id:           string;
  title:        string;
  description:  string;
  category:     string;  // stored as category name in Strapi
  level:        "Beginner" | "Intermediate" | "Expert";
  location:     string;
  availability: string;
  imageSrc:     string;
}

interface Props {
  skill:   ExistingSkill;
  onSave:  (id: string, updated: SkillPayload) => void | Promise<void>;
  onClose: () => void;
}

export default function EditSkillModal({ skill, onSave, onClose }: Props): JSX.Element {
  const { token } = useAuth();

  const [categories, setCategories] = useState<Category[]>([]);
  const [form,       setForm]       = useState<SkillFormState>({
    title:        skill.title,
    desc:         skill.description,
    categoryId:   "",   // resolved after categories load
    level:        skill.level,
    city:         skill.location,
    slots:        skill.availability,
    imagePreview: skill.imageSrc,
    imageFile:    null,
  });
  const [errors,  setErrors]  = useState<ReturnType<typeof validateSkillForm>>({});
  const [saving,  setSaving]  = useState(false);

  // Resolve selected category name — if categoryId found use its label, else fall back to stored name
  const selectedCategory = useMemo(
    () => categories.find((c) => c.id === form.categoryId)?.label ?? skill.category,
    [form.categoryId, categories, skill.category]
  );

  // Close on Escape
  useEffect(() => {
    function handleKey(e: KeyboardEvent) { if (e.key === "Escape") onClose(); }
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [onClose]);

  // Load categories and resolve pre-selected id from stored category name
  useEffect(() => {
    if (!token) return;
    getSkillCategories(token)
      .then((cats) => {
        const mapped = toCategories(cats);
        setCategories(mapped);
        // Find the category whose label matches the stored category name
        // skill.category is already a resolved string name passed from parent
        const match = mapped.find((c) => c.label === skill.category);
        if (match) {
          setForm((prev) => ({ ...prev, categoryId: match.id }));
        }
      })
      .catch(() => {});
  }, [token, skill.category]); // skill.category is resolved string from parent

  function onChange<K extends keyof SkillFormState>(key: K, value: SkillFormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: undefined }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const errs = validateSkillForm(form);
    if (Object.keys(errs).length) { setErrors(errs); return; }

    setSaving(true);
    try {
      await onSave(skill.id, {
        title:        form.title.trim(),
        description:  form.desc.trim(),
        category:     form.categoryId,   // category id — Strapi stores as relation
        level:        form.level as "Beginner" | "Intermediate" | "Expert",
        location:     form.city || "Online",
        availability: form.slots.trim(),
        imageSrc:     form.imagePreview ?? skill.imageSrc,
        imageFile:    form.imageFile,
      });
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <div className="fixed inset-0 bg-black/30 z-40 pointer-events-none" />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl my-auto">

          {/* Header */}
          <div className="px-6 pt-6 pb-4 border-b border-gray-100 flex items-start justify-between gap-4">
            <div>
              <h3 className="text-base font-extrabold text-gray-900">Edit Skill</h3>
              <p className="text-xs text-gray-500 mt-0.5">
                Editing will reset this skill to <strong className="text-gray-700">Pending</strong> for re-review.
              </p>
            </div>
            <button type="button" onClick={onClose}
              className="text-xs font-semibold text-gray-600 border border-gray-200 hover:bg-gray-50 transition px-2.5 py-1.5 rounded-lg shrink-0">
              Close
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} noValidate>
            <div className="px-6 py-5">
              <SkillFormFields
                form={form}
                errors={errors}
                categories={categories}
                onChange={onChange}
              />
            </div>

            {/* Footer */}
            <div className="px-6 pb-6 flex gap-3">
              <button type="submit" disabled={saving}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold text-sm py-2.5 rounded-xl transition disabled:opacity-60 disabled:cursor-not-allowed">
                {saving ? "Saving…" : "Save Changes"}
              </button>
              <button type="button" onClick={onClose}
                className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold text-sm py-2.5 rounded-xl transition">
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
