// Provides add/edit category modal actions for admin category management.
"use client";

import { useState } from "react";

export type Category = {
  id: number;
  name: string;
  description: string;
};

export type ModalMode = "add" | "edit";

type Props = {
  mode: ModalMode;
  initial?: Category;
  onSave: (name: string, description: string) => void;
  onClose: () => void;
};

export default function CategoryModal({ mode, initial, onSave, onClose }: Props) {
  const [name, setName] = useState(initial?.name ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [errors, setErrors] = useState<{ name?: string; description?: string }>({});

  function validate() {
    const e: typeof errors = {};
    if (!name.trim()) e.name = "Category name is required.";
    if (!description.trim()) e.description = "Description is required.";
    return e;
  }

  function handleSave() {
    const e = validate();
    if (Object.keys(e).length) return setErrors(e);
    onSave(name.trim(), description.trim());
  }

  return (
    <>
      <div className="fixed inset-0 bg-black/30 z-40" onClick={onClose} />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
          <h3 className="text-base font-extrabold text-gray-900 mb-5">
            {mode === "add" ? "Add New Category" : "Edit Category"}
          </h3>

          {/* Name */}
          <div className="mb-4">
            <label className="block text-xs font-extrabold uppercase tracking-wide text-gray-500 mb-1.5">
              Category Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setErrors((prev) => ({ ...prev, name: undefined }));
              }}
              placeholder="e.g. Arts / Creative Skills"
              className={`w-full rounded-xl border px-3.5 py-2.5 text-sm text-gray-900 placeholder-gray-400 outline-none transition focus:ring-2 focus:ring-green-500 focus:border-green-500 ${
                errors.name ? "border-red-400" : "border-gray-200"
              }`}
            />
            {errors.name && (
              <p className="mt-1 text-xs text-red-500">{errors.name}</p>
            )}
          </div>

          {/* Description */}
          <div className="mb-6">
            <label className="block text-xs font-extrabold uppercase tracking-wide text-gray-500 mb-1.5">
              Description
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => {
                setDescription(e.target.value);
                setErrors((prev) => ({ ...prev, description: undefined }));
              }}
              placeholder="Briefly describe what this category covers."
              className={`w-full rounded-xl border px-3.5 py-2.5 text-sm text-gray-900 placeholder-gray-400 outline-none transition focus:ring-2 focus:ring-green-500 focus:border-green-500 resize-none ${
                errors.description ? "border-red-400" : "border-gray-200"
              }`}
            />
            {errors.description && (
              <p className="mt-1 text-xs text-red-500">{errors.description}</p>
            )}
          </div>

          {/* Buttons */}
          <div className="flex gap-3">
            <button
              onClick={handleSave}
              className="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold text-sm py-2.5 rounded-xl transition"
            >
              {mode === "add" ? "Add Category" : "Save Changes"}
            </button>
            <button
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