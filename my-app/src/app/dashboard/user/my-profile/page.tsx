"use client";

// Displays the current user's profile details fetched from auth context.
// After EditProfileModal saves, auth context is updated so changes persist.

import { JSX } from "react";
import Image from "next/image";
import { useAuth } from "@/context/AuthContext";
import { useState } from "react";
import EditProfileModal, { ProfileData } from "@/app/components/dashboard/user/edit-profile/EditProfileModal";

const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_URL ?? "http://localhost:1337";

function resolveAvatarUrl(profileImage: { url: string } | null | undefined): string | null {
  if (!profileImage?.url) return null;
  const url = profileImage.url;
  return url.startsWith("http") ? url : `${STRAPI_URL}${url}`;
}

export default function MyProfilePage(): JSX.Element {
  const { user } = useAuth();
  const [modalOpen, setModalOpen] = useState(false);

  // Always read directly from auth context - setAuthData in modal updates
  // context + localStorage so data persists across refreshes.
  const displayName = user?.fullName || user?.username || "User";
  const displayEmail = user?.email || "";
  const displayLocation = (user as any)?.location || "";
  const displayBio = (user as any)?.bio || "";
  const displayAvatar = resolveAvatarUrl(user?.profileImage) ?? "/images/noProfileImage.png";

  // Profile for the modal pre-fill
  const profileForModal: ProfileData = {
    name: displayName,
    location: displayLocation,
    about: displayBio,
    avatarSrc: displayAvatar,
  };

  // After modal saves it calls setAuthData which updates context.
  // The component re-renders automatically - no local state needed.
  function handleSave(_updated: ProfileData) {
    setModalOpen(false);
  }

  return (
    <div>
      {/* Heading */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-green-900">My Profile</h1>
          <p className="mt-2 text-sm text-gray-600">
            View and manage your public profile information.
          </p>
        </div>
        <button
          onClick={() => setModalOpen(true)}
          className="shrink-0 inline-flex items-center justify-center rounded-xl bg-green-600 hover:bg-green-700 text-white font-semibold text-sm px-4 py-2.5 transition"
        >
          Edit Profile
        </button>
      </div>

      {/* Profile card */}
      <section className="mt-6 bg-white border border-gray-100 rounded-2xl shadow-sm p-5 md:p-6">

        {/* Avatar + identity */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-5">
          <div className="relative w-24 h-24 md:w-28 md:h-28 rounded-full overflow-hidden border-4 border-green-100 shrink-0 bg-gray-100">
            <Image
              src={displayAvatar}
              alt={displayName}
              fill
              className="object-cover"
              priority
              unoptimized
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <h2 className="text-xl font-extrabold text-green-900">{displayName}</h2>

            {displayEmail && (
              <p className="text-sm text-gray-600">{displayEmail}</p>
            )}

            {displayLocation ? (
              <p className="flex items-center gap-1.5 text-sm text-gray-600">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                >
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                  <circle cx="12" cy="10" r="3" />
                </svg>
                {displayLocation}
              </p>
            ) : (
              <p className="flex items-center gap-1.5 text-sm text-gray-400 italic">
                <Image src="/icons/location.svg" alt="Location" width={14} height={14} />
                No location added
              </p>
            )}
          </div>
        </div>

        <div className="border-t border-gray-100 my-5" />

        {/* Bio */}
        <div>
          <div className="text-[11px] font-extrabold tracking-wide uppercase text-gray-500 mb-2">
            About Me
          </div>
          {displayBio ? (
            <p className="text-sm text-gray-600 leading-relaxed">{displayBio}</p>
          ) : (
            <p className="text-sm text-gray-400 italic leading-relaxed">
              Add your bio from edit profile.
            </p>
          )}
        </div>
      </section>

      {/* Edit modal */}
      {modalOpen && (
        <EditProfileModal
          profile={profileForModal}
          onSave={handleSave}
          onClose={() => setModalOpen(false)}
        />
      )}
    </div>
  );
}
