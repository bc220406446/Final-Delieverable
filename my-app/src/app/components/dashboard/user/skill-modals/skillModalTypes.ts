// Defines shared types, constants, and validation helpers for skill modals.

export type SkillLevel = "Beginner" | "Intermediate" | "Expert" | "";

export interface Category {
  id: string;
  label: string;
}

export interface SkillFormState {
  title: string;
  desc: string;
  categoryId: string;
  level: SkillLevel;
  city: string;
  slots: string;
  imagePreview: string | null;
  imageFile: File | null;
}

export interface SkillFormErrors {
  title?: string;
  desc?: string;
  categoryId?: string;
  level?: string;
  slots?: string;
}

export interface SkillPayload {
  title: string;
  description: string;
  category: string;
  level: "Beginner" | "Intermediate" | "Expert";
  location: string;
  availability: string;
  imageSrc: string;
  imageFile?: File | null; // actual File for upload to Strapi
}

// Categories are now loaded from Strapi skill-category collection.
// This empty default is used as initial state before fetch completes.
export const CATEGORIES: Category[] = [];

// Converts a StrapiSkillCategory array to the Category[] shape used by forms.
export function toCategories(strapiCategories: { id: number; name: string }[]): Category[] {
  return strapiCategories.map((c) => ({ id: String(c.id), label: c.name }));
}

export const CITIES = [
  "Islamabad", "Rawalpindi", "Lahore",   "Karachi",    "Faisalabad",
  "Multan",    "Peshawar",   "Quetta",   "Gujranwala", "Sialkot",
  "Hyderabad", "Bahawalpur", "Sargodha", "Abbottabad", "Gujrat",
  "Online",
] as const;

export function inputCls(hasError = false): string {
  return [
    "w-full rounded-xl border px-3.5 py-2.5 text-sm text-gray-900",
    "placeholder-gray-400 outline-none transition bg-white",
    "focus:ring-2 focus:ring-green-500 focus:border-green-500",
    hasError ? "border-red-400" : "border-gray-200",
  ].join(" ");
}

export function validateSkillForm(form: SkillFormState): SkillFormErrors {
  const e: SkillFormErrors = {};
  if (!form.title.trim())  e.title      = "Skill title is required.";
  if (!form.desc.trim())   e.desc       = "Description is required.";
  if (!form.categoryId)    e.categoryId = "Please select a category.";
  if (!form.level)         e.level      = "Please select a skill level.";
  if (!form.slots.trim())  e.slots      = "Availability / time slots are required.";
  return e;
}
