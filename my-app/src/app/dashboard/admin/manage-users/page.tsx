// Provides admin controls for viewing and managing users.
"use client";

import { useState } from "react";

type User = {
  id: number;
  name: string;
  email: string;
  location: string;
  bio: string;
};

const INITIAL_USERS: User[] = [
  {
    id: 1,
    name: "Ali Haider",
    email: "ali.haider@gmail.com",
    location: "Lahore",
    bio: "Passionate about productivity and time management. Loves teaching goal-setting techniques.",
  },
  {
    id: 2,
    name: "Ayesha Siddiqui",
    email: "ayesha.siddiqui@gmail.com",
    location: "Karachi",
    bio: "Graphic designer with 5 years of experience. Interested in exchanging design skills.",
  },
  {
    id: 3,
    name: "Bilal Ahmed",
    email: "bilal.ahmed@gmail.com",
    location: "Faisalabad",
    bio: "Software engineer who enjoys teaching programming to beginners.",
  },
  {
    id: 4,
    name: "Farhan Malik",
    email: "farhan.malik@gmail.com",
    location: "Islamabad",
    bio: "Entrepreneur and business consultant with a focus on startups.",
  },
];

export default function ManageUsersPage() {
  const [users, setUsers] = useState<User[]>(INITIAL_USERS);
  const [confirmId, setConfirmId] = useState<number | null>(null);

  function handleDelete(id: number) {
    setUsers((prev) => prev.filter((u) => u.id !== id));
    setConfirmId(null);
  }

  return (
    <div>
      <h1 className="text-2xl md:text-3xl font-extrabold text-green-900">Manage Users</h1>
      <p className="mt-2 text-sm text-gray-600">
        View and manage registered users.
      </p>

      <section className="mt-6 bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
        {/* Desktop table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50 text-left">
                <th className="px-5 py-3.5 text-[11px] font-extrabold tracking-wide uppercase text-gray-500">
                  Name
                </th>
                <th className="px-5 py-3.5 text-[11px] font-extrabold tracking-wide uppercase text-gray-500">
                  Email
                </th>
                <th className="px-5 py-3.5 text-[11px] font-extrabold tracking-wide uppercase text-gray-500">
                  Location
                </th>
                <th className="px-5 py-3.5 text-[11px] font-extrabold tracking-wide uppercase text-gray-500">
                  Bio
                </th>
                <th className="px-5 py-3.5 text-[11px] font-extrabold tracking-wide uppercase text-gray-500 w-24">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50 transition">
                  <td className="px-5 py-4 font-semibold text-gray-900 whitespace-nowrap">
                    {user.name}
                  </td>
                  <td className="px-5 py-4 text-gray-600 whitespace-nowrap">{user.email}</td>
                  <td className="px-5 py-4 text-gray-600 whitespace-nowrap">{user.location}</td>
                  <td className="px-5 py-4 text-gray-500 max-w-xs">
                    <span className="line-clamp-2">{user.bio}</span>
                  </td>
                  <td className="px-5 py-4">
                    {confirmId === user.id ? (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleDelete(user.id)}
                          className="text-xs font-semibold text-white bg-red-500 hover:bg-red-600 transition px-2.5 py-1.5 rounded-lg"
                        >
                          Confirm
                        </button>
                        <button
                          onClick={() => setConfirmId(null)}
                          className="text-xs font-semibold text-gray-600 border border-gray-200 hover:bg-gray-50 transition px-2.5 py-1.5 rounded-lg"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setConfirmId(user.id)}
                        className="text-xs font-semibold text-red-600 border border-red-200 hover:bg-red-50 transition px-2.5 py-1.5 rounded-lg"
                      >
                        Delete
                      </button>
                    )}
                  </td>
                </tr>
              ))}

              {users.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-5 py-10 text-center text-sm text-gray-400">
                    No users found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile cards */}
        <div className="md:hidden divide-y divide-gray-100">
          {users.map((user) => (
            <div key={user.id} className="p-4 flex flex-col gap-2">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="font-bold text-gray-900">{user.name}</div>
                  <div className="text-xs text-gray-500 mt-0.5">{user.email}</div>
                </div>
                {confirmId === user.id ? (
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      onClick={() => handleDelete(user.id)}
                      className="text-xs font-semibold text-white bg-red-500 hover:bg-red-600 transition px-2 py-1 rounded-lg"
                    >
                      Confirm
                    </button>
                    <button
                      onClick={() => setConfirmId(null)}
                      className="text-xs font-semibold text-gray-600 border border-gray-200 hover:bg-gray-50 transition px-2 py-1 rounded-lg"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setConfirmId(user.id)}
                    className="text-xs font-semibold text-red-600 border border-red-200 hover:bg-red-50 transition px-2.5 py-1.5 rounded-lg shrink-0"
                  >
                    Delete
                  </button>
                )}
              </div>
              <div className="text-xs text-gray-500">
                <span className="font-semibold text-gray-700">Location:</span> {user.location}
              </div>
              <div className="text-xs text-gray-500 line-clamp-2">{user.bio}</div>
            </div>
          ))}

          {users.length === 0 && (
            <div className="py-10 text-center text-sm text-gray-400">No users found.</div>
          )}
        </div>
      </section>
    </div>
  );
}