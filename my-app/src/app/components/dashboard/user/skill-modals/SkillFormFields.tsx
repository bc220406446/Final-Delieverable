// Renders reusable form controls shared by add/edit skill modals.
"use client";

import { JSX, useRef } from "react";
import Image from "next/image";
import {
  SkillFormState,
  SkillFormErrors,
  Category,
  CITIES,
  inputCls,
} from "./skillModalTypes";

interface Props {
  form:       SkillFormState;
  errors:     SkillFormErrors;
  categories: Category[];   // loaded from Strapi
  onChange:   <K extends keyof SkillFormState>(key: K, value: SkillFormState[K]) => void;
}

function FieldLabel({ htmlFor, children }: { htmlFor: string; children: React.ReactNode }): JSX.Element {
  return (
    <label
      htmlFor={htmlFor}
      className="block text-xs font-extrabold uppercase tracking-wide text-gray-500 mb-1.5"
    >
      {children}
    </label>
  );
}

function FieldError({ msg }: { msg?: string }): JSX.Element | null {
  if (!msg) return null;
  return <p className="mt-1 text-xs text-red-500">{msg}</p>;
}

export default function SkillFormFields({ form, errors, categories, onChange }: Props): JSX.Element {
  const fileRef = useRef<HTMLInputElement>(null);

  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    onChange("imagePreview", url);
    onChange("imageFile", file);
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

      {/* Image upload */}
      <div className="md:col-span-2">
        <FieldLabel htmlFor="m-img">Skill Image</FieldLabel>
        <div className="flex items-center gap-4">
          {/* Preview */}
          <div className="relative w-20 h-20 rounded-xl overflow-hidden bg-gray-100 border border-gray-200 shrink-0">
            {form.imagePreview ? (
              <Image
                src={form.imagePreview}
                alt="Skill preview"
                fill
                className="object-fill"
                unoptimized
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-300 text-2xl">
                🖼
              </div>
            )}
          </div>
          <div>
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="text-xs font-semibold text-green-700 border border-green-200 hover:bg-green-50 px-3 py-1.5 rounded-lg transition"
            >
              {form.imagePreview ? "Change Image" : "Upload Image"}
            </button>
            <p className="mt-1 text-xs text-gray-400">JPG, PNG recommended. Optional.</p>
            <input
              ref={fileRef}
              id="m-img"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleImageChange}
            />
          </div>
        </div>
      </div>

      {/* Title */}
      <div className="md:col-span-2">
        <FieldLabel htmlFor="m-title">Skill Title</FieldLabel>
        <input
          id="m-title"
          className={inputCls(!!errors.title)}
          placeholder="e.g. Web Design Basics"
          value={form.title}
          onChange={(e) => onChange("title", e.target.value)}
        />
        <FieldError msg={errors.title} />
      </div>

      {/* Description */}
      <div className="md:col-span-2">
        <FieldLabel htmlFor="m-desc">Description</FieldLabel>
        <textarea
          id="m-desc"
          className={`${inputCls(!!errors.desc)} min-h-22.5 resize-y`}
          placeholder="What you can teach or do…"
          value={form.desc}
          onChange={(e) => onChange("desc", e.target.value)}
        />
        <FieldError msg={errors.desc} />
      </div>

      {/* Category */}
      <div>
        <FieldLabel htmlFor="m-cat">Category</FieldLabel>
        <select
          id="m-cat"
          className={inputCls(!!errors.categoryId)}
          value={form.categoryId}
          onChange={(e) => onChange("categoryId", e.target.value)}
        >
          <option value="">Select category…</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>{c.label}</option>
          ))}
        </select>
        <FieldError msg={errors.categoryId} />
      </div>

      {/* Level */}
      <div>
        <FieldLabel htmlFor="m-level">Skill Level</FieldLabel>
        <select
          id="m-level"
          className={inputCls(!!errors.level)}
          value={form.level}
          onChange={(e) => onChange("level", e.target.value as SkillFormState["level"])}
        >
          <option value="">Select level…</option>
          <option value="Beginner">Beginner</option>
          <option value="Intermediate">Intermediate</option>
          <option value="Expert">Expert</option>
        </select>
        <FieldError msg={errors.level} />
      </div>

      {/* Location */}
      <div>
        <FieldLabel htmlFor="m-loc">Location / Mode</FieldLabel>
        <select
          id="m-loc"
          className={inputCls()}
          value={form.city}
          onChange={(e) => onChange("city", e.target.value)}
        >
          <option value="">Select city / mode ...</option>
          {CITIES.map((city) => (
            <option key={city} value={city}>{city}</option>
          ))}
        </select>
      </div>

      {/* Availability */}
      <div>
        <FieldLabel htmlFor="m-slots">Availability / Time Slots</FieldLabel>
        <input
          id="m-slots"
          className={inputCls(!!errors.slots)}
          placeholder="e.g. Sat 2–4 PM"
          value={form.slots}
          onChange={(e) => onChange("slots", e.target.value)}
        />
        <FieldError msg={errors.slots} />
      </div>
    </div>
  );
}