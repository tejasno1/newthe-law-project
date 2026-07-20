"use client";

import { useActionState } from "react";
import { createMockTest } from "@/app/admin/actions";
import Link from "next/link";
import { ArrowLeft, ClipboardList } from "lucide-react";

const inputCls =
  "w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-gray-900 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#4d65ff]/30 focus:border-[#4d65ff] transition-colors bg-white";

export default function NewMockTestPage() {
  const [error, action, pending] = useActionState(createMockTest, null);

  return (
    <div className="max-w-lg">
      <Link
        href="/admin/mock-tests"
        className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 mb-6"
      >
        <ArrowLeft size={14} /> Back to Mock Tests
      </Link>

      <div className="bg-white border border-gray-200 rounded-2xl p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-9 h-9 bg-[#4d65ff]/10 rounded-xl flex items-center justify-center">
            <ClipboardList size={17} className="text-[#4d65ff]" />
          </div>
          <div>
            <h1 className="text-base font-bold text-gray-900">New Mock Test</h1>
            <p className="text-xs text-gray-400">You can fill in all details after creation</p>
          </div>
        </div>

        <form action={action} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Test Title *</label>
            <input
              name="title"
              type="text"
              required
              placeholder="e.g. CLAT 2024 Full Mock Test"
              className={inputCls}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Custom Slug <span className="text-gray-400 font-normal">(optional)</span>
            </label>
            <input
              name="slug"
              type="text"
              placeholder="e.g. clat-2024-mock-1 (auto-generated if blank)"
              className={inputCls}
            />
            <p className="text-xs text-gray-400 mt-1">Lowercase letters, numbers and hyphens only. Cannot be changed later.</p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={pending}
            className="w-full bg-[#4d65ff] hover:bg-[#3a52e8] disabled:opacity-60 text-white font-semibold py-2.5 rounded-xl text-sm transition-colors"
          >
            {pending ? "Creating…" : "Create Test →"}
          </button>
        </form>
      </div>
    </div>
  );
}
