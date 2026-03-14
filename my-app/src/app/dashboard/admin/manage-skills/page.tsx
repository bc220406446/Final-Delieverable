// Enables admins to review and manage submitted skills.
"use client";

import { useState } from "react";
import SkillDetailsModal, { Skill } from "@/app/components/dashboard/admin/skills/SkillDetailsModal";
import activeSkillsData from "@/data/active-skills.json";
import pendingSkillsData from "@/data/pending-skills.json";

type Tab = "active" | "pending";

export default function ManageSkillsPage() {
  const [tab, setTab] = useState<Tab>("active");
  const [activeSkills, setActiveSkills] = useState<Skill[]>(activeSkillsData as Skill[]);
  const [pendingSkills, setPendingSkills] = useState<Skill[]>(pendingSkillsData as Skill[]);
  const [selectedSkill, setSelectedSkill] = useState<Skill | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);

  function deleteActive(id: number) {
    setActiveSkills((prev) => prev.filter((s) => s.id !== id));
    setConfirmDeleteId(null);
  }

  function approve(id: number) {
    const skill = pendingSkills.find((s) => s.id === id);
    if (skill) {
      setActiveSkills((prev) => [...prev, { ...skill, id: Date.now() }]);
      setPendingSkills((prev) => prev.filter((s) => s.id !== id));
    }
  }

  function reject(id: number) {
    setPendingSkills((prev) => prev.filter((s) => s.id !== id));
  }

  const skills = tab === "active" ? activeSkills : pendingSkills;

  return (
    <div>
      <h1 className="text-2xl md:text-3xl font-extrabold text-green-900">Manage Skills</h1>
      <p className="mt-2 text-sm text-gray-600">
        Review active skills and approve or reject pending submissions.
      </p>

      {/* Skill status filters */}
      <div className="mt-6 flex gap-2">
        {(["active", "pending"] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition ${
              tab === t
                ? "bg-green-600 text-white"
                : "border border-gray-200 text-gray-600 hover:bg-gray-50"
            }`}
          >
            {t === "active" ? "Active Skills" : "Pending Approvals"}
            {t === "pending" && pendingSkills.length > 0 && (
              <span
                className={`ml-2 text-xs font-bold px-1.5 py-0.5 rounded-full ${
                  tab === t ? "bg-white/20 text-white" : "bg-yellow-100 text-yellow-700"
                }`}
              >
                {pendingSkills.length}
              </span>
            )}
            {t === "active" && activeSkills.length > 0 && (
              <span
                className={`ml-2 text-xs font-bold px-1.5 py-0.5 rounded-full ${
                  tab === t ? "bg-white/20 text-white" : "bg-green-100 text-green-700"
                }`}
              >
                {activeSkills.length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Table */}
      <section className="mt-4 bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
        {/* Desktop */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50 text-left">
                {["Skill Title", "Provider", "Details", "Action"].map((h) => (
                  <th
                    key={h}
                    className="px-5 py-3.5 text-[11px] font-extrabold tracking-wide uppercase text-gray-500"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {skills.map((skill) => (
                <tr key={skill.id} className="hover:bg-gray-50 transition">
                  <td className="px-5 py-4">
                    <div className="font-semibold text-gray-900">{skill.title}</div>
                    <div className="text-xs text-gray-400 mt-0.5 max-w-xs line-clamp-1">
                      {skill.description}
                    </div>
                  </td>
                  <td className="px-5 py-4 text-gray-600 whitespace-nowrap">
                    {skill.provider}
                  </td>
                  <td className="px-5 py-4">
                    <button
                      onClick={() => setSelectedSkill(skill)}
                      className="text-green-700 font-semibold text-sm hover:underline hover:text-green-800 transition"
                    >
                      Click to View
                    </button>
                  </td>
                  <td className="px-5 py-4">
                    {tab === "active" ? (
                      confirmDeleteId === skill.id ? (
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => deleteActive(skill.id)}
                            className="text-xs font-semibold text-white bg-red-500 hover:bg-red-600 transition px-2.5 py-1.5 rounded-lg"
                          >
                            Confirm
                          </button>
                          <button
                            onClick={() => setConfirmDeleteId(null)}
                            className="text-xs font-semibold text-gray-600 border border-gray-200 hover:bg-gray-50 transition px-2.5 py-1.5 rounded-lg"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setConfirmDeleteId(skill.id)}
                          className="text-xs font-semibold text-red-600 border border-red-200 hover:bg-red-50 transition px-2.5 py-1.5 rounded-lg"
                        >
                          Delete
                        </button>
                      )
                    ) : (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => approve(skill.id)}
                          className="text-xs font-semibold text-white bg-green-600 hover:bg-green-700 transition px-2.5 py-1.5 rounded-lg"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => reject(skill.id)}
                          className="text-xs font-semibold text-red-600 border border-red-200 hover:bg-red-50 transition px-2.5 py-1.5 rounded-lg"
                        >
                          Reject
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}

              {skills.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-5 py-10 text-center text-sm text-gray-400">
                    {tab === "active" ? "No active skills." : "No pending approvals."}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile cards */}
        <div className="md:hidden divide-y divide-gray-100">
          {skills.map((skill) => (
            <div key={skill.id} className="p-4 flex flex-col gap-2">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="font-bold text-gray-900 text-sm">{skill.title}</div>
                  <div className="text-xs text-gray-500 mt-0.5">{skill.provider}</div>
                </div>
                <button
                  onClick={() => setSelectedSkill(skill)}
                  className="text-green-700 font-semibold text-xs hover:underline shrink-0"
                >
                  Click to View
                </button>
              </div>

              <div className="flex gap-2 mt-1 flex-wrap">
                {tab === "active" ? (
                  confirmDeleteId === skill.id ? (
                    <>
                      <button
                        onClick={() => deleteActive(skill.id)}
                        className="text-xs font-semibold text-white bg-red-500 hover:bg-red-600 transition px-2.5 py-1.5 rounded-lg"
                      >
                        Confirm
                      </button>
                      <button
                        onClick={() => setConfirmDeleteId(null)}
                        className="text-xs font-semibold text-gray-600 border border-gray-200 hover:bg-gray-50 transition px-2.5 py-1.5 rounded-lg"
                      >
                        Cancel
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => setConfirmDeleteId(skill.id)}
                      className="text-xs font-semibold text-red-600 border border-red-200 hover:bg-red-50 transition px-2.5 py-1.5 rounded-lg"
                    >
                      Delete
                    </button>
                  )
                ) : (
                  <>
                    <button
                      onClick={() => approve(skill.id)}
                      className="text-xs font-semibold text-white bg-green-600 hover:bg-green-700 transition px-2.5 py-1.5 rounded-lg"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => reject(skill.id)}
                      className="text-xs font-semibold text-red-600 border border-red-200 hover:bg-red-50 transition px-2.5 py-1.5 rounded-lg"
                    >
                      Reject
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}

          {skills.length === 0 && (
            <div className="py-10 text-center text-sm text-gray-400">
              {tab === "active" ? "No active skills." : "No pending approvals."}
            </div>
          )}
        </div>
      </section>

      {/* Details modal */}
      {selectedSkill && (
        <SkillDetailsModal skill={selectedSkill} onClose={() => setSelectedSkill(null)} />
      )}
    </div>
  );
}