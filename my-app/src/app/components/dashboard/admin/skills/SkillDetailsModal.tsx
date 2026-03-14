// Shows full skill details in a modal for admin review workflows.
"use client";

import Image from "next/image";

export type Skill = {
  id: number;
  title: string;
  description: string;
  provider: string;
  email: string;
  category: string;
  level: string;
  location: string;
  availability: string;
  image: string;
};

type Props = {
  skill: Skill;
  onClose: () => void;
};

export default function SkillDetailsModal({ skill, onClose }: Props) {
  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/30 z-40" onClick={onClose} />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
          {/* Skill image */}
          <div className="relative w-full h-44 bg-gray-100">
            <Image
              src={skill.image}
              alt={skill.title}
              fill
              className="object-cover"
              unoptimized
            />
          </div>

          {/* Skill details section with title, summary, metadata, and close action. */}
          <div className="p-6">
            {/* Title */}
            <h3 className="font-extrabold text-gray-900 text-base leading-snug mb-1">
              {skill.title}
            </h3>

            {/* Description */}
            <p className="text-sm text-gray-500 mb-5 leading-relaxed">{skill.description}</p>

            {/* Details list */}
            <dl className="flex flex-col gap-2.5 text-sm">
              {[
                { label: "Offered By", value: skill.provider },
                { label: "Email",      value: skill.email },
                { label: "Category",   value: skill.category },
                { label: "Location",   value: skill.location },
                { label: "Level",      value: skill.level },
                { label: "Availability", value: skill.availability },
              ].map(({ label, value }) => (
                <div key={label} className="flex gap-2">
                  <dt className="font-semibold text-gray-700 w-28 shrink-0">{label}:</dt>
                  <dd className="text-gray-600">{value}</dd>
                </div>
              ))}
            </dl>

            {/* Close button */}
            <button
              onClick={onClose}
              className="mt-6 w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold text-sm py-2.5 rounded-xl transition"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </>
  );
}