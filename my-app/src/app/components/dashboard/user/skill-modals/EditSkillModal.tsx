// Provides the modal for editing an existing offered skill entry.
"use client";

import { useState, useMemo, useEffect, JSX } from "react";
import SkillFormFields from "./SkillFormFields";
import {
  SkillFormState,
  SkillPayload,
  CATEGORIES,
  validateSkillForm,
} from "./skillModalTypes";

export interface ExistingSkill {
  id: string;
  title: string;
  description: string;
  category: string;
  level: "Beginner" | "Intermediate" | "Expert";
  location: string;
  availability: string;
  imageSrc: string;
}

interface Props {
  skill: ExistingSkill;
  onSave: (id: string, updated: SkillPayload) => void;
  onClose: () => void;
}

export default function EditSkillModal({ skill, onSave, onClose }: Props): JSX.Element {
  // Pre-fill form from existing skill
  const initialForm: SkillFormState = {
    title:        skill.title,
    desc:         skill.description,
    categoryId:   CATEGORIES.find((c) => c.label === skill.category)?.id ?? "",
    level:        skill.level,
    city:         skill.location,
    slots:        skill.availability,
    imagePreview: skill.imageSrc,
    imageFile:    null,
  };

  const [form, setForm] = useState<SkillFormState>(initialForm);
  const [errors, setErrors] = useState<ReturnType<typeof validateSkillForm>>({});
  const selectedCategory = useMemo(
    () => CATEGORIES.find((c) => c.id === form.categoryId)?.label ?? skill.category,
    [form.categoryId, skill.category]
  );

  useEffect(() => {
    function handleKey(e: KeyboardEvent) { if (e.key === "Escape") onClose(); }
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [onClose]);

  function onChange<K extends keyof SkillFormState>(key: K, value: SkillFormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: undefined }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const errs = validateSkillForm(form);
    if (Object.keys(errs).length) { setErrors(errs); return; }

    onSave(skill.id, {
      title:        form.title.trim(),
      description:  form.desc.trim(),
      category:     selectedCategory,
      level:        form.level as "Beginner" | "Intermediate" | "Expert",
      location:     form.city || "Online",
      availability: form.slots.trim(),
      imageSrc:     form.imagePreview ?? skill.imageSrc,
    });
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
                Update your skill details. Changes will be reflected immediately.
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="text-xs font-semibold text-gray-600 border border-gray-200 hover:bg-gray-50 transition px-2.5 py-1.5 rounded-lg shrink-0"
            >
              Close
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} noValidate>
            <div className="px-6 py-5">
              <SkillFormFields form={form} errors={errors} onChange={onChange} />
            </div>

            {/* Footer */}
            <div className="px-6 pb-6 flex gap-3">
              <button
                type="submit"
                className="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold text-sm py-2.5 rounded-xl transition"
              >
                Save Changes
              </button>
              <button
                type="button"
                onClick={onClose}
                className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold text-sm py-2.5 rounded-xl transition"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}