// Displays the current user's profile details and skills.
"use client";

import { useState, JSX } from "react";
import Image from "next/image";
import EditProfileModal, {
  ProfileData,
} from "@/app/components/dashboard/user/edit-profile/EditProfileModal";

export default function MyProfilePage(): JSX.Element {
  const [profile, setProfile] = useState<ProfileData>({
    name: "Muhammad Kamran",
    location: "Islamabad, Pakistan",
    about:
      "I'm a passionate hobbyist gardener and a professional web developer. I love exchanging knowledge with my neighbors. I believe everyone has something valuable to teach.",
    avatarSrc: "/images/team/kamran.png",
  });

  const [modalOpen, setModalOpen] = useState(false);

  function handleSave(updated: ProfileData) {
    setProfile(updated);
    setModalOpen(false);
  }

  return (
    <div>
      {/* Heading section introducing profile viewing and edit action. */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-green-900">
            My Profile
          </h1>
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

      {/* Profile details section showing avatar, identity, and bio info. */}
      <section className="mt-6 bg-white border border-gray-100 rounded-2xl shadow-sm p-5 md:p-6">

        {/* Avatar + name row */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-5">

          {/* Avatar */}
          <div className="relative w-24 h-24 md:w-28 md:h-28 rounded-full overflow-hidden border-4 border-green-100 shrink-0">
            <Image
              src={profile.avatarSrc}
              alt={profile.name}
              fill
              className="object-cover"
              priority
              unoptimized
            />
          </div>

          {/* Name / email / location */}
          <div className="flex flex-col gap-1">
            <h2 className="text-xl font-extrabold text-green-900">{profile.name}</h2>

            <p className="text-sm text-gray-600">muhammad.kamran@gmail.com</p>

            <p className="flex items-center gap-1.5 text-sm text-gray-600">
              <Image
                src="/icons/location.svg"
                alt="Location"
                width={14}
                height={14}
              />
              {profile.location}
            </p>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-gray-100 my-5" />

        {/* About */}
        <div>
          <div className="text-[11px] font-extrabold tracking-wide uppercase text-gray-500 mb-2">
            About Me
          </div>
          <p className="text-sm text-gray-600 leading-relaxed">{profile.about}</p>
        </div>
      </section>

      {/* Edit modal section for updating profile details. */}
      {modalOpen && (
        <EditProfileModal
          profile={profile}
          onSave={handleSave}
          onClose={() => setModalOpen(false)}
        />
      )}
    </div>
  );
}