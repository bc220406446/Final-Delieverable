// Provides the modal for editing profile identity, location, and bio details.
// Saves changes to Strapi via updateUser and updateUserAvatar.
"use client";

import { useState, useRef, useEffect, JSX } from "react";
import Image from "next/image";
import { useAuth } from "@/context/AuthContext";
import { updateUser, updateUserAvatar, getMe } from "@/lib/api";

export interface ProfileData {
  name:      string;
  location:  string;
  about:     string;
  avatarSrc: string;
}

interface EditProfileModalProps {
  profile:  ProfileData;
  onSave:   (updated: ProfileData) => void;
  onClose:  () => void;
}

export default function EditProfileModal({
  profile,
  onSave,
  onClose,
}: EditProfileModalProps): JSX.Element {
  const { user, token, setAuthData } = useAuth();

  const [name,          setName]          = useState(profile.name);
  const [location,      setLocation]      = useState(profile.location);
  const [about,         setAbout]         = useState(profile.about);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [avatarFile,    setAvatarFile]    = useState<File | null>(null);
  const [saving,        setSaving]        = useState(false);
  const [errors,        setErrors]        = useState<{ name?: string; location?: string }>({});

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    function handleKey(e: KeyboardEvent) { if (e.key === "Escape") onClose(); }
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [onClose]);

  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarPreview(URL.createObjectURL(file));
    setAvatarFile(file);
  }

  function validate() {
    const e: typeof errors = {};
    if (!name.trim())     e.name     = "Name is required.";
    if (!location.trim()) e.location = "Location is required.";
    return e;
  }

  async function handleSave() {
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    if (!user || !token) return;

    setSaving(true);
    try {
      // Step 1 - update text fields (fullName, location, bio)
      await updateUser(
        user.id,
        {
          fullName: name.trim(),
          location: location.trim(),
          bio:      about.trim(),
        },
        token
      );

      // Step 2 - upload new avatar if user picked one
      if (avatarFile) {
        await updateUserAvatar(user.id, avatarFile, token);
      }

      // Step 3 - fetch fresh user data and update global auth context
      // so sidebar name/avatar and other pages reflect the change immediately.
      const freshUser = await getMe(token);
      await setAuthData(token, freshUser);

      // Step 4 - notify parent page for local optimistic update
      onSave({
        name:      name.trim(),
        location:  location.trim(),
        about:     about.trim(),
        avatarSrc: avatarPreview ?? profile.avatarSrc,
      });
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to save profile. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  const displayAvatar = avatarPreview ?? profile.avatarSrc;

  return (
    <>
      <div className="fixed inset-0 bg-black/30 z-40" />

      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md my-auto">

          {/* Header */}
          <div className="px-6 pt-6 pb-4 border-b border-gray-100 flex items-start justify-between gap-4">
            <div>
              <h3 className="text-base font-extrabold text-gray-900">Edit Profile</h3>
              <p className="text-xs text-gray-500 mt-0.5">
                Update your public profile information.
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="text-xs font-semibold text-gray-600 border border-gray-200 hover:bg-gray-50 transition px-2.5 py-1.5 rounded-lg shrink-0 disabled:opacity-50"
            >
              Close
            </button>
          </div>

          {/* Body */}
          <div className="px-6 py-5 flex flex-col gap-5">

            {/* Avatar upload */}
            <div className="flex flex-col items-center gap-3">
              <div className="relative w-24 h-24 rounded-full overflow-hidden border-4 border-green-100 shrink-0 bg-gray-100">
                <Image
                  src={displayAvatar}
                  alt="Profile"
                  fill
                  className="object-cover"
                  unoptimized
                />
              </div>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={saving}
                className="text-xs font-semibold text-green-700 border border-green-200 hover:bg-green-50 px-3 py-1.5 rounded-lg transition disabled:opacity-50"
              >
                Change Photo
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleImageChange}
              />
            </div>

            {/* Full Name */}
            <div>
              <label className="block text-xs font-extrabold uppercase tracking-wide text-gray-500 mb-1.5">
                Full Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => { setName(e.target.value); setErrors((p) => ({ ...p, name: undefined })); }}
                placeholder="Muhammad Kamran"
                className={`w-full rounded-xl border px-3.5 py-2.5 text-sm text-gray-900 placeholder-gray-400 outline-none transition focus:ring-2 focus:ring-green-500 focus:border-green-500 ${errors.name ? "border-red-400" : "border-gray-200"}`}
              />
              {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name}</p>}
            </div>

            {/* Location */}
            <div>
              <label className="block text-xs font-extrabold uppercase tracking-wide text-gray-500 mb-1.5">
                Location
              </label>
              <input
                type="text"
                value={location}
                onChange={(e) => { setLocation(e.target.value); setErrors((p) => ({ ...p, location: undefined })); }}
                placeholder="Islamabad, Pakistan"
                className={`w-full rounded-xl border px-3.5 py-2.5 text-sm text-gray-900 placeholder-gray-400 outline-none transition focus:ring-2 focus:ring-green-500 focus:border-green-500 ${errors.location ? "border-red-400" : "border-gray-200"}`}
              />
              {errors.location && <p className="mt-1 text-xs text-red-500">{errors.location}</p>}
            </div>

            {/* About */}
            <div>
              <label className="block text-xs font-extrabold uppercase tracking-wide text-gray-500 mb-1.5">
                About Me
              </label>
              <textarea
                rows={3}
                value={about}
                onChange={(e) => setAbout(e.target.value)}
                placeholder="Tell others what you do and what you'd like to exchange..."
                className="w-full rounded-xl border border-gray-200 px-3.5 py-2.5 text-sm text-gray-900 placeholder-gray-400 outline-none transition focus:ring-2 focus:ring-green-500 focus:border-green-500 resize-none"
              />
            </div>
          </div>

          {/* Footer */}
          <div className="px-6 pb-6 flex gap-3">
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold text-sm py-2.5 rounded-xl transition disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {saving ? "Saving…" : "Save Changes"}
            </button>
            <button
              onClick={onClose}
              disabled={saving}
              className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold text-sm py-2.5 rounded-xl transition disabled:opacity-60"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </>
  );
}