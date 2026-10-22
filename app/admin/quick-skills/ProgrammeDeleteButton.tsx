"use client";

import { useState, useTransition } from "react";
import { Trash2, AlertTriangle, X } from "lucide-react";
import { deleteProgramme } from "@/app/admin/actions";

export default function ProgrammeDeleteButton({
  slug,
  title,
}: {
  slug: string;
  title: string;
}) {
  const [showModal, setShowModal] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleDelete() {
    setError(null);
    startTransition(async () => {
      const result = await deleteProgramme(slug);
      if (result.error) {
        setError(result.error);
      } else {
        setShowModal(false);
      }
    });
  }

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        title="Delete programme"
        className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
      >
        <Trash2 size={14} />
      </button>

      {showModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
          onClick={(e) => { if (e.target === e.currentTarget) setShowModal(false); }}
        >
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 relative">
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-4 right-4 p-1 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors"
            >
              <X size={16} />
            </button>

            <div className="w-11 h-11 bg-red-100 rounded-full flex items-center justify-center mb-4">
              <AlertTriangle size={20} className="text-red-600" />
            </div>

            <h2 className="text-lg font-bold text-gray-900 mb-1">Delete programme?</h2>
            <p className="text-sm text-gray-500 mb-1">You are about to permanently delete:</p>
            <p className="text-sm font-semibold text-gray-800 mb-4 bg-gray-50 rounded-lg px-3 py-2 border border-gray-100">
              {title}
            </p>
            <p className="text-xs text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2 mb-5">
              This cannot be undone. All programme data will be lost.
            </p>

            {error && <p className="text-xs text-red-600 mb-3">Error: {error}</p>}

            <div className="flex gap-2">
              <button
                onClick={() => setShowModal(false)}
                disabled={isPending}
                className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={isPending}
                className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-sm font-semibold transition-colors disabled:opacity-60 flex items-center justify-center gap-1.5"
              >
                <Trash2 size={13} />
                {isPending ? "Deleting…" : "Yes, delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
