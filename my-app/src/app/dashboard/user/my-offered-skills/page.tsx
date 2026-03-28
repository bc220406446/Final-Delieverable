// Manages the user's offered skills - fetches real data from Strapi.
"use client";

import { useMemo, useState, useEffect, useCallback, JSX } from "react";
import Image from "next/image";
import { useAuth } from "@/context/AuthContext";
import {
  getMySkills,
  createSkill,
  updateSkill,
  deleteSkill,
  StrapiSkill, resolveSkillCategory,
} from "@/lib/api";
import AddSkillModal from "@/app/components/dashboard/user/skill-modals/AddSkillModal";
import EditSkillModal, { ExistingSkill } from "@/app/components/dashboard/user/skill-modals/EditSkillModal";
import { SkillPayload } from "@/app/components/dashboard/user/skill-modals/skillModalTypes";

const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_URL ?? "http://localhost:1337";

type SkillStatus = "approved" | "pending" | "rejected";

const TABS: { key: SkillStatus; label: string }[] = [
  { key: "approved", label: "Approved" },
  { key: "pending",  label: "Pending"  },
  { key: "rejected", label: "Rejected" },
];

function badgeClasses(status: SkillStatus): string {
  const base = "inline-flex items-center border text-xs font-semibold px-2 py-0.5 rounded-full";
  if (status === "approved") return `${base} bg-green-100 text-green-700 border-green-200`;
  if (status === "pending")  return `${base} bg-yellow-100 text-yellow-700 border-yellow-200`;
  return                            `${base} bg-red-100 text-red-700 border-red-200`;
}

function Pill({ label, value }: { label: string; value: string }): JSX.Element {
  return (
    <div className="min-w-0 rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-xs text-gray-800">
      <span className="font-semibold text-gray-700">{label}:</span>{" "}
      <span className="wrap-break-word text-gray-600">{value || "-"}</span>
    </div>
  );
}

// Resolves Strapi image URL to an absolute URL.
// Handles both REST (image.url) and entityService (image.formats etc.) shapes.
function resolveImageUrl(skill: StrapiSkill): string | null {
  const img = skill.image as any;
  if (!img) return null;
  // REST API shape: image.url
  const url = img.url
    ?? img.formats?.medium?.url
    ?? img.formats?.small?.url
    ?? img.formats?.thumbnail?.url
    ?? null;
  if (!url) return null;
  return url.startsWith("http") ? url : `${STRAPI_URL}${url}`;
}

export default function MyOfferedSkillsPage(): JSX.Element {
  const { token, user } = useAuth();

  const [tab,         setTab]         = useState<SkillStatus>("approved");
  const [skills,      setSkills]      = useState<StrapiSkill[]>([]);
  const [loading,     setLoading]     = useState(true);
  const [error,       setError]       = useState<string | null>(null);
  const [addOpen,     setAddOpen]     = useState(false);
  const [editSkill,   setEditSkill]   = useState<ExistingSkill | null>(null);
  const [actionId,    setActionId]    = useState<number | null>(null);
  const [confirmDel,  setConfirmDel]  = useState<number | null>(null);

  const fetchSkills = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    setError(null);
    try {
      const data = await getMySkills(token);
      setSkills(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load skills.");
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => { fetchSkills(); }, [fetchSkills]);

  const filtered = useMemo(
    () => skills.filter((s) => s.state === tab),
    [skills, tab]
  );

  const counts = useMemo(() => ({
    approved: skills.filter((s) => s.state === "approved").length,
    pending:  skills.filter((s) => s.state === "pending").length,
    rejected: skills.filter((s) => s.state === "rejected").length,
  }), [skills]);

  // Add new skill - POST to Strapi, upload image if provided, then refresh.
  async function handleAddSkill(payload: SkillPayload): Promise<void> {
    if (!token || !user) return;
    setActionId(-1);
    try {
      // Pass imageFile directly - createSkill uploads it first then
      // attaches the media ID in the same POST request.
      const created = await createSkill(
        {
          title:          payload.title,
          description:    payload.description,
          category:       payload.category,
          level:          payload.level,
          location:       payload.location,
          availability:   payload.availability,
          provider_name:  user?.fullName || user?.username || "",
          provider_email: user?.email || "",
        },
        token,
        payload.imageFile ?? undefined
      );

      await fetchSkills();
      setAddOpen(false);
      setTab("pending");
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to add skill.");
    } finally {
      setActionId(null);
    }
  }

  // Edit skill - PUT to Strapi (resets to pending for re-review), then refresh.
  async function handleEditSkill(id: string, payload: SkillPayload): Promise<void> {
    if (!token) return;
    const numId = Number(id);
    if (!numId) { alert("Invalid skill ID."); return; }
    setActionId(numId);
    try {
      await updateSkill(
        numId,
        {
          title:        payload.title,
          description:  payload.description,
          category:     payload.category,
          level:        payload.level,
          location:     payload.location,
          availability: payload.availability,
        },
        token,
        payload.imageFile ?? undefined
      );

      await fetchSkills();
      setEditSkill(null);
      setTab("pending");
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to update skill.");
    } finally {
      setActionId(null);
    }
  }

  // Delete skill permanently.
  async function handleDelete(id: number): Promise<void> {
    if (!token) return;
    setActionId(id);
    setConfirmDel(null);
    try {
      await deleteSkill(id, token);
      setSkills((prev) => prev.filter((s) => s.id !== id));
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to delete skill.");
    } finally {
      setActionId(null);
    }
  }

  function openEdit(skill: StrapiSkill): void {
    setEditSkill({
      id:           String(skill.id),
      title:        skill.title,
      description:  skill.description,
      category:     resolveSkillCategory(skill),
      level:        skill.level as "Beginner" | "Intermediate" | "Expert",
      location:     skill.location,
      availability: skill.availability,
      imageSrc:     resolveImageUrl(skill) ?? "",
    });
  }

  return (
    <div>
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-green-900">
            My Offered Skills
          </h1>
          <p className="mt-2 text-sm text-gray-600">
            Skills you offer to the community. Status reflects admin review.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setAddOpen(true)}
          className="shrink-0 inline-flex items-center gap-1.5 bg-green-600 hover:bg-green-700 text-white font-semibold text-sm px-4 py-2.5 rounded-xl transition"
        >
          <span className="text-base leading-none">+</span>
          Add New Skill
        </button>
      </div>

      <section className="mt-6 bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">

        {/* Tabs */}
        <div className="flex flex-wrap gap-2 border-b border-gray-100 p-3">
          {TABS.map(({ key, label }) => (
            <button
              key={key}
              type="button"
              onClick={() => setTab(key)}
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition ${
                tab === key
                  ? "bg-green-600 text-white"
                  : "border border-gray-200 text-gray-600 hover:bg-gray-50"
              }`}
            >
              {label}
              <span className={`ml-2 text-xs font-bold px-1.5 py-0.5 rounded-full ${
                tab === key ? "bg-white/20 text-white" : "bg-gray-100 text-gray-500"
              }`}>
                {counts[key]}
              </span>
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="p-4 md:p-5 flex flex-col gap-4">
          {loading ? (
            <div className="py-10 text-center text-sm text-gray-400">Loading skills…</div>
          ) : error ? (
            <div className="py-10 text-center text-sm text-red-500">{error}</div>
          ) : filtered.length === 0 ? (
            <div className="py-10 text-center text-sm text-gray-400">
              {tab === "approved" ? "No approved skills yet."
               : tab === "pending" ? "No skills pending review."
               : "No rejected skills."}
            </div>
          ) : (
            filtered.map((skill) => {
              const imageUrl = resolveImageUrl(skill);
              return (
                <div key={skill.id} className="bg-white border border-gray-200 rounded-2xl p-4 md:p-5">
                  <div className="flex flex-col md:flex-row gap-4">

                    {/* Thumbnail */}
                    <div className="relative w-full md:w-[220px] h-[160px] rounded-2xl overflow-hidden bg-gray-100 shrink-0">
                      {imageUrl ? (
                        <Image src={imageUrl} alt={skill.title} fill className="object-fill" unoptimized />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-300 text-4xl">🖼</div>
                      )}
                    </div>

                    {/* Details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-start gap-2">
                        <div className="text-base font-extrabold text-gray-900 leading-snug">
                          {skill.title}
                        </div>
                        <span className={badgeClasses(skill.state as SkillStatus)}>
                          {skill.state.charAt(0).toUpperCase() + skill.state.slice(1)}
                        </span>
                      </div>

                      <p className="mt-1.5 text-sm text-gray-600 leading-relaxed">
                        {skill.description}
                      </p>

                      <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <Pill label="Category"     value={resolveSkillCategory(skill)}    />
                        <Pill label="Level"        value={skill.level}       />
                        <Pill label="Location"     value={skill.location}    />
                        <Pill label="Availability" value={skill.availability}/>
                      </div>

                      {/* Rejected message */}
                      {skill.state === "rejected" && (
                        <p className="mt-3 text-xs text-red-500 font-medium">
                          This skill was rejected by the admin. You may delete it or submit a new one.
                        </p>
                      )}

                      {/* Pending message */}
                      {skill.state === "pending" && (
                        <p className="mt-3 text-xs text-yellow-600 font-medium">
                          Awaiting admin review. You can edit it while pending.
                        </p>
                      )}

                      {/* Actions */}
                      <div className="mt-4 flex flex-wrap gap-2">
                        {skill.state !== "rejected" && (
                          <button
                            type="button"
                            onClick={() => openEdit(skill)}
                            disabled={actionId === skill.id}
                            className="inline-flex items-center justify-center rounded-lg border border-gray-200 px-3 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition disabled:opacity-50"
                          >
                            Edit
                          </button>
                        )}
                        {confirmDel === skill.id ? (
                          <>
                            <button
                              type="button"
                              onClick={() => handleDelete(skill.id)}
                              disabled={actionId === skill.id}
                              className="inline-flex items-center justify-center rounded-lg bg-red-500 hover:bg-red-600 text-white px-3 py-2 text-sm font-semibold transition disabled:opacity-50"
                            >
                              {actionId === skill.id ? "Deleting…" : "Confirm Delete"}
                            </button>
                            <button
                              type="button"
                              onClick={() => setConfirmDel(null)}
                              className="inline-flex items-center justify-center rounded-lg border border-gray-200 px-3 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition"
                            >
                              Cancel
                            </button>
                          </>
                        ) : (
                          <button
                            type="button"
                            onClick={() => setConfirmDel(skill.id)}
                            className="inline-flex items-center justify-center rounded-lg border border-red-200 px-3 py-2 text-sm font-semibold text-red-600 hover:bg-red-50 transition"
                          >
                            Remove
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </section>

      {/* Modals */}
      {addOpen && (
        <AddSkillModal onSave={handleAddSkill} onClose={() => setAddOpen(false)} />
      )}
      {editSkill && (
        <EditSkillModal
          skill={editSkill}
          onSave={handleEditSkill}
          onClose={() => setEditSkill(null)}
        />
      )}
    </div>
  );
}
