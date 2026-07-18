"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  ChevronUp, ChevronDown, Eye, EyeOff, Trash2, Plus, Tag,
  BookOpen, GraduationCap, Scale, FileText, LayoutGrid,
  ClipboardList, Award, Briefcase, Globe, Users,
} from "lucide-react";
import {
  moveCategoryOrder,
  toggleCategoryActive,
  createCategory,
  deleteCategory,
} from "./actions";
import type { Category } from "@/lib/categories";

export const ICON_OPTIONS = [
  { value: "BookOpen",      label: "Book",           Icon: BookOpen },
  { value: "GraduationCap", label: "Graduation Cap", Icon: GraduationCap },
  { value: "Scale",         label: "Scale / Law",    Icon: Scale },
  { value: "FileText",      label: "Document",       Icon: FileText },
  { value: "LayoutGrid",    label: "Grid",           Icon: LayoutGrid },
  { value: "ClipboardList", label: "Clipboard",      Icon: ClipboardList },
  { value: "Award",         label: "Award",          Icon: Award },
  { value: "Briefcase",     label: "Briefcase",      Icon: Briefcase },
  { value: "Globe",         label: "Globe",          Icon: Globe },
  { value: "Users",         label: "Users",          Icon: Users },
];

export const ICON_MAP: Record<string, React.ElementType> = Object.fromEntries(
  ICON_OPTIONS.map(({ value, Icon }) => [value, Icon])
);

function resolveIcon(name: string): React.ElementType {
  return ICON_MAP[name] ?? BookOpen;
}

export default function CategoriesClient({ categories }: { categories: Category[] }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [name, setName] = useState("");
  const [iconName, setIconName] = useState("BookOpen");
  const [addError, setAddError] = useState<string | null>(null);
  const [addPending, startAdd] = useTransition();

  const refresh = () => router.refresh();

  const handleMove = (id: number, dir: "up" | "down") => {
    startTransition(async () => {
      await moveCategoryOrder(id, dir);
      refresh();
    });
  };

  const handleToggle = (id: number, current: boolean) => {
    startTransition(async () => {
      await toggleCategoryActive(id, current);
      refresh();
    });
  };

  const handleDelete = (id: number, catName: string) => {
    if (!confirm(`Delete "${catName}"? Courses inside it are not affected.`)) return;
    startTransition(async () => {
      await deleteCategory(id);
      refresh();
    });
  };

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    setAddError(null);
    const fd = new FormData();
    fd.append("name", name);
    fd.append("icon_name", iconName);
    startAdd(async () => {
      const err = await createCategory(null, fd);
      if (err) { setAddError(err); return; }
      setName("");
      setIconName("BookOpen");
      refresh();
    });
  };

  const PreviewIcon = resolveIcon(iconName);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-gray-900">Course categories</h1>
        <p className="text-sm text-gray-500 mt-0.5">
          Control the order and visibility of category filter buttons on the courses page.
        </p>
      </div>

      {/* Add new */}
      <div className="bg-white rounded-2xl border border-gray-200 p-5">
        <h2 className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
          <Plus size={14} className="text-[#4d65ff]" /> Add new category
        </h2>
        <form onSubmit={handleAdd} className="flex flex-wrap gap-3 items-end">
          <div className="flex-1 min-w-[180px]">
            <label className="block text-xs font-medium text-gray-500 mb-1">Category name</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. CLAT UG"
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400"
              required
            />
          </div>
          <div className="min-w-[210px]">
            <label className="block text-xs font-medium text-gray-500 mb-1">Icon</label>
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center flex-shrink-0">
                <PreviewIcon className="w-5 h-5 text-indigo-600" />
              </div>
              <select
                value={iconName}
                onChange={(e) => setIconName(e.target.value)}
                className="flex-1 border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 bg-white"
              >
                {ICON_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>
          </div>
          <button
            type="submit"
            disabled={addPending}
            className="px-5 py-2.5 bg-[#4d65ff] hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl transition-colors disabled:opacity-50"
          >
            {addPending ? "Adding…" : "Add category"}
          </button>
        </form>
        {addError && <p className="mt-3 text-sm text-red-500">{addError}</p>}
      </div>

      {/* Category list */}
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        <div className="px-5 py-3.5 border-b border-gray-100 flex items-center gap-2">
          <Tag size={14} className="text-gray-400" />
          <span className="text-sm font-semibold text-gray-700">Category order</span>
          <span className="ml-auto text-xs text-gray-400">{categories.length} total</span>
        </div>

        {categories.length === 0 ? (
          <div className="py-12 text-center text-sm text-gray-400">
            No categories yet. Add one above.
          </div>
        ) : (
          <ul className={`divide-y divide-gray-50 transition-opacity ${pending ? "opacity-50 pointer-events-none" : ""}`}>
            {categories.map((cat, i) => {
              const Icon = resolveIcon(cat.icon_name);
              return (
                <li
                  key={cat.id}
                  className={`flex items-center gap-3 px-5 py-3.5 transition-colors ${!cat.is_active ? "bg-gray-50/70" : "hover:bg-gray-50/60"}`}
                >
                  {/* Rank badge */}
                  <span className="w-6 text-xs font-bold text-gray-300 text-center flex-shrink-0 select-none">
                    {i + 1}
                  </span>

                  {/* Icon */}
                  <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${cat.is_active ? "bg-indigo-50" : "bg-gray-100"}`}>
                    <Icon size={17} className={cat.is_active ? "text-indigo-600" : "text-gray-400"} />
                  </div>

                  {/* Name */}
                  <span className={`flex-1 text-sm font-semibold ${cat.is_active ? "text-gray-900" : "text-gray-400 line-through"}`}>
                    {cat.name}
                  </span>

                  {/* Icon name */}
                  <span className="hidden sm:inline text-[10px] text-gray-400 bg-gray-100 px-2 py-0.5 rounded font-mono">
                    {cat.icon_name}
                  </span>

                  {/* Status pill */}
                  <span className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full ${cat.is_active ? "bg-green-50 text-green-700" : "bg-gray-100 text-gray-400"}`}>
                    {cat.is_active ? "Visible" : "Hidden"}
                  </span>

                  {/* Actions */}
                  <div className="flex items-center gap-0.5 ml-1">
                    <button
                      onClick={() => handleMove(cat.id, "up")}
                      disabled={i === 0 || pending}
                      title="Move up"
                      className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-gray-100 disabled:opacity-20 disabled:cursor-not-allowed transition-colors"
                    >
                      <ChevronUp size={14} className="text-gray-500" />
                    </button>
                    <button
                      onClick={() => handleMove(cat.id, "down")}
                      disabled={i === categories.length - 1 || pending}
                      title="Move down"
                      className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-gray-100 disabled:opacity-20 disabled:cursor-not-allowed transition-colors"
                    >
                      <ChevronDown size={14} className="text-gray-500" />
                    </button>
                    <button
                      onClick={() => handleToggle(cat.id, cat.is_active)}
                      disabled={pending}
                      title={cat.is_active ? "Hide from website" : "Show on website"}
                      className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-gray-100 disabled:opacity-50 transition-colors"
                    >
                      {cat.is_active
                        ? <Eye size={14} className="text-green-600" />
                        : <EyeOff size={14} className="text-gray-400" />}
                    </button>
                    <button
                      onClick={() => handleDelete(cat.id, cat.name)}
                      disabled={pending}
                      title="Delete category"
                      className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-red-50 disabled:opacity-50 transition-colors"
                    >
                      <Trash2 size={14} className="text-red-400" />
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {/* Tip */}
      <div className="bg-amber-50 border border-amber-100 rounded-xl px-5 py-4 text-sm text-amber-800 leading-relaxed">
        <strong>Tip:</strong> The order here is exactly the order users see on the courses page.
        Hiding a category removes its filter button but never deletes courses assigned to it.
        Make sure the category name here exactly matches what is set in each course (e.g. <code className="bg-amber-100 px-1 rounded font-mono text-xs">CLAT PG</code>).
      </div>
    </div>
  );
}
