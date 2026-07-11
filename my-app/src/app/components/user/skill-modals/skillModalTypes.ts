
export type SkillLevel = "Beginner" | "Intermediate" | "Expert" | "";

// Option shape used by skill category selects.
export interface Category {
  id: string;
  label: string;
}

// Local form state shared by add/edit skill modals.
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

// Field-level validation messages for skill forms.
export interface SkillFormErrors {
  title?: string;
  desc?: string;
  categoryId?: string;
  level?: string;
  slots?: string;
}

// Clean payload passed from modal components back to page-level API handlers.
export interface SkillPayload {
  title: string;
  description: string;
  category: string;
  level: "Beginner" | "Intermediate" | "Expert";
  location: string;
  availability: string;
  imageSrc: string;
  imageFile?: File | null;
}

export const CATEGORIES: Category[] = [];

// Convert Strapi categories into select-friendly options.
export function toCategories(strapiCategories: { id: number; name: string }[]): Category[] {
  return strapiCategories.map((c) => ({ id: String(c.id), label: c.name }));
}

// Cities/modes available when offering a skill.
export const CITIES = [
  "Islamabad", "Rawalpindi", "Lahore",   "Karachi",    "Faisalabad",
  "Multan",    "Peshawar",   "Quetta",   "Gujranwala", "Sialkot",
  "Hyderabad", "Bahawalpur", "Sargodha", "Abbottabad", "Gujrat",
  "Online",
] as const;

// Shared input class builder with optional error border.
export function inputCls(hasError = false): string {
  return [
    "w-full rounded-xl border px-3.5 py-2.5 text-sm text-gray-900",
    "placeholder-gray-400 outline-none transition bg-white",
    "focus:ring-2 focus:ring-green-500 focus:border-green-500",
    hasError ? "border-red-400" : "border-gray-200",
  ].join(" ");
}

// Basic client-side validation before add/edit skill submit.
export function validateSkillForm(form: SkillFormState): SkillFormErrors {
  const e: SkillFormErrors = {};
  if (!form.title.trim())  e.title      = "Skill title is required.";
  if (!form.desc.trim())   e.desc       = "Description is required.";
  if (!form.categoryId)    e.categoryId = "Please select a category.";
  if (!form.level)         e.level      = "Please select a skill level.";
  if (!form.slots.trim())  e.slots      = "Availability / time slots are required.";
  return e;
}
