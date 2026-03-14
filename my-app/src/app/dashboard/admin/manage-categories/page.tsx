// Provides admin category management actions.
"use client";

import { useState } from "react";
import CategoryModal, { Category, ModalMode } from "@/app/components/dashboard/admin/categories/CategoryModal";
import categoriesData from "@/data/categories.json";

const INITIAL_CATEGORIES: Category[] = categoriesData;

export default function ManageCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>(INITIAL_CATEGORIES);
  const [modal, setModal] = useState<{ mode: ModalMode; category?: Category } | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);

  function handleSave(name: string, description: string) {
    if (modal?.mode === "add") {
      setCategories((prev) => [
        ...prev,
        { id: Date.now(), name, description },
      ]);
    } else if (modal?.mode === "edit" && modal.category) {
      setCategories((prev) =>
        prev.map((c) =>
          c.id === modal.category!.id ? { ...c, name, description } : c
        )
      );
    }
    setModal(null);
  }

  function handleDelete(id: number) {
    setCategories((prev) => prev.filter((c) => c.id !== id));
    setConfirmDeleteId(null);
  }

  return (
    <div>
      {/* Heading section with category overview and add-category action. */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-green-900">
            Manage Categories
          </h1>
          <p className="mt-2 text-sm text-gray-600">
            Platform categories - must match user dropdowns exactly.
          </p>
        </div>
        <button
          onClick={() => setModal({ mode: "add" })}
          className="shrink-0 inline-flex items-center gap-1.5 bg-green-600 hover:bg-green-700 text-white font-semibold text-sm px-4 py-2.5 rounded-xl transition"
        >
          <span className="text-base leading-none">+</span>
          Add Category
        </button>
      </div>

      {/* Table */}
      <section className="mt-6 bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
        {/* Desktop */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50 text-left">
                {["Category", "Description", "Actions"].map((h) => (
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
              {categories.map((cat) => (
                <tr key={cat.id} className="hover:bg-gray-50 transition">
                  <td className="px-5 py-4 font-semibold text-gray-900 whitespace-nowrap">
                    {cat.name}
                  </td>
                  <td className="px-5 py-4 text-gray-500 max-w-sm">{cat.description}</td>
                  <td className="px-5 py-4">
                    {confirmDeleteId === cat.id ? (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleDelete(cat.id)}
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
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setModal({ mode: "edit", category: cat })}
                          className="text-xs font-semibold text-white bg-green-600 hover:bg-green-700 transition px-2.5 py-1.5 rounded-lg"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => setConfirmDeleteId(cat.id)}
                          className="text-xs font-semibold text-red-600 border border-red-200 hover:bg-red-50 transition px-2.5 py-1.5 rounded-lg"
                        >
                          Delete
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}

              {categories.length === 0 && (
                <tr>
                  <td colSpan={3} className="px-5 py-10 text-center text-sm text-gray-400">
                    No categories yet. Add one above.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile cards */}
        <div className="md:hidden divide-y divide-gray-100">
          {categories.map((cat) => (
            <div key={cat.id} className="p-4 flex flex-col gap-2">
              <div className="font-bold text-gray-900 text-sm">{cat.name}</div>
              <div className="text-xs text-gray-500">{cat.description}</div>

              <div className="flex gap-2 mt-1 flex-wrap">
                {confirmDeleteId === cat.id ? (
                  <>
                    <button
                      onClick={() => handleDelete(cat.id)}
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
                  <>
                    <button
                      onClick={() => setModal({ mode: "edit", category: cat })}
                      className="text-xs font-semibold text-gray-600 border border-gray-200 hover:bg-gray-50 transition px-2.5 py-1.5 rounded-lg"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => setConfirmDeleteId(cat.id)}
                      className="text-xs font-semibold text-red-600 border border-red-200 hover:bg-red-50 transition px-2.5 py-1.5 rounded-lg"
                    >
                      Delete
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}

          {categories.length === 0 && (
            <div className="py-10 text-center text-sm text-gray-400">
              No categories yet. Add one above.
            </div>
          )}
        </div>
      </section>

      {/* Add / Edit modal */}
      {modal && (
        <CategoryModal
          mode={modal.mode}
          initial={modal.category}
          onSave={handleSave}
          onClose={() => setModal(null)}
        />
      )}
    </div>
  );
}