"use client";

import { useState, useRef } from "react";
import {
  getCourseLessonsAdmin,
  saveCourseLessonParts,
  createSignedVideoUploadUrl,
  uploadCourseResource,
  deleteCourseResource,
  type VideoPart,
} from "@/app/admin/actions";
import {
  Plus, Trash2, Upload, Save, Loader2, CheckCircle, AlertCircle,
  ChevronDown, ChevronRight, Video, FileText,
} from "lucide-react";

type LessonData = { title: string; parts: VideoPart[]; resources: { title: string; path: string }[] };
type ModuleData = { title: string; items: LessonData[] };

type SaveState = "idle" | "saving" | "saved" | "error";

const inputCls =
  "w-full px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#4d65ff]/30 focus:border-[#4d65ff] transition-colors bg-white";

export default function CourseVideoManager({
  courses,
}: {
  courses: { slug: string; title: string }[];
}) {
  const [courseSlug, setCourseSlug] = useState("");
  const [modules, setModules] = useState<ModuleData[]>([]);
  const [loading, setLoading] = useState(false);
  const [expandedModules, setExpandedModules] = useState<Set<number>>(new Set());
  const [saveStates, setSaveStates] = useState<Record<string, SaveState>>({});
  const [uploadingKey, setUploadingKey] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const pendingUploadTarget = useRef<{ mi: number; li: number; pi: number } | null>(null);

  // Resource upload state
  const resourceInputRef = useRef<HTMLInputElement>(null);
  const pendingResourceTarget = useRef<{ mi: number; li: number } | null>(null);
  const [pendingResourceTitle, setPendingResourceTitle] = useState("");
  const [resourceUploading, setResourceUploading] = useState<string | null>(null);

  async function handleCourseChange(slug: string) {
    setCourseSlug(slug);
    setModules([]);
    setSaveStates({});
    setExpandedModules(new Set());
    if (!slug) return;
    setLoading(true);
    try {
      const data = await getCourseLessonsAdmin(slug);
      setModules(data);
      setExpandedModules(new Set(data.map((_, i) => i)));
    } finally {
      setLoading(false);
    }
  }

  function updatePart(mi: number, li: number, pi: number, field: keyof Omit<VideoPart, "video_qualities">, value: string) {
    setModules((prev) => {
      const next = prev.map((mod, m) =>
        m !== mi ? mod : {
          ...mod,
          items: mod.items.map((item, l) =>
            l !== li ? item : {
              ...item,
              parts: item.parts.map((part, p) =>
                p !== pi ? part : { ...part, [field]: value }
              ),
            }
          ),
        }
      );
      return next;
    });
  }

  function addPart(mi: number, li: number) {
    setModules((prev) =>
      prev.map((mod, m) =>
        m !== mi ? mod : {
          ...mod,
          items: mod.items.map((item, l) =>
            l !== li ? item : {
              ...item,
              parts: [...item.parts, { label: `Part ${item.parts.length + 1}`, video_url: "" }],
            }
          ),
        }
      )
    );
  }

  function removePart(mi: number, li: number, pi: number) {
    setModules((prev) =>
      prev.map((mod, m) =>
        m !== mi ? mod : {
          ...mod,
          items: mod.items.map((item, l) =>
            l !== li ? item : {
              ...item,
              parts: item.parts.filter((_, p) => p !== pi),
            }
          ),
        }
      )
    );
  }

  async function handleSave(mi: number, li: number) {
    const key = `${mi}-${li}`;
    setSaveStates((s) => ({ ...s, [key]: "saving" }));
    const parts = modules[mi].items[li].parts.filter((p) => p.video_url.trim());
    const result = await saveCourseLessonParts(courseSlug, mi, li, parts);
    setSaveStates((s) => ({ ...s, [key]: result.error ? "error" : "saved" }));
    setTimeout(() => setSaveStates((s) => ({ ...s, [key]: "idle" })), 3000);
  }

  function triggerFileUpload(mi: number, li: number, pi: number) {
    pendingUploadTarget.current = { mi, li, pi };
    fileInputRef.current?.click();
  }

  async function handleFileSelected(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    const target = pendingUploadTarget.current;
    e.target.value = "";
    if (!file || !target || !courseSlug) return;

    const { mi, li, pi } = target;
    const key = `${mi}-${li}-${pi}`;
    setUploadingKey(key);
    setUploadProgress(0);

    try {
      const result = await createSignedVideoUploadUrl(courseSlug, file.name);
      if (result.error || !result.signedUrl || !result.publicUrl) {
        throw new Error(result.error ?? "Could not get upload URL");
      }

      await new Promise<void>((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.upload.onprogress = (ev) => {
          if (ev.lengthComputable) setUploadProgress(Math.round((ev.loaded / ev.total) * 100));
        };
        xhr.onload = () => (xhr.status < 300 ? resolve() : reject(new Error(`Upload failed: ${xhr.status}`)));
        xhr.onerror = () => reject(new Error("Network error during upload"));
        xhr.open("PUT", result.signedUrl!);
        xhr.setRequestHeader("x-upsert", "true");
        xhr.send(file);
      });

      updatePart(mi, li, pi, "video_url", result.publicUrl!);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploadingKey(null);
      setUploadProgress(0);
      pendingUploadTarget.current = null;
    }
  }

  function triggerResourceUpload(mi: number, li: number) {
    pendingResourceTarget.current = { mi, li };
    setPendingResourceTitle("");
    resourceInputRef.current?.click();
  }

  async function handleResourceSelected(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    const target = pendingResourceTarget.current;
    if (!file || !target || !courseSlug) return;

    const { mi, li } = target;
    const key = `res-${mi}-${li}`;
    const title = pendingResourceTitle.trim() || file.name.replace(/\.pdf$/i, "");
    setResourceUploading(key);
    const fd = new FormData();
    fd.append("file", file);
    const result = await uploadCourseResource(courseSlug, mi, li, title, fd);
    if (result.error) {
      alert(result.error);
    } else {
      // Refresh lesson data
      const data = await getCourseLessonsAdmin(courseSlug);
      setModules(data);
    }
    setResourceUploading(null);
    pendingResourceTarget.current = null;
  }

  async function handleDeleteResource(mi: number, li: number, path: string) {
    if (!confirm("Remove this resource?")) return;
    const key = `res-${mi}-${li}`;
    setResourceUploading(key);
    await deleteCourseResource(courseSlug, mi, li, path);
    const data = await getCourseLessonsAdmin(courseSlug);
    setModules(data);
    setResourceUploading(null);
  }

  const toggleModule = (mi: number) =>
    setExpandedModules((prev) => {
      const next = new Set(prev);
      next.has(mi) ? next.delete(mi) : next.add(mi);
      return next;
    });

  return (
    <div className="space-y-4">
      {/* Hidden file inputs */}
      <input
        ref={resourceInputRef}
        type="file"
        accept="application/pdf"
        className="hidden"
        onChange={handleResourceSelected}
      />
      <input
        ref={fileInputRef}
        type="file"
        accept="video/*"
        className="hidden"
        onChange={handleFileSelected}
      />

      {/* Course selector */}
      <div className="bg-white rounded-2xl border border-gray-200 p-5">
        <label className="block text-sm font-medium text-gray-700 mb-2">Select Course</label>
        <select
          value={courseSlug}
          onChange={(e) => handleCourseChange(e.target.value)}
          className={inputCls}
        >
          <option value="">— choose a course —</option>
          {courses.map((c) => (
            <option key={c.slug} value={c.slug}>{c.title}</option>
          ))}
        </select>
      </div>

      {loading && (
        <div className="flex items-center justify-center py-12 text-gray-400">
          <Loader2 className="w-5 h-5 animate-spin mr-2" /> Loading lessons…
        </div>
      )}

      {/* Modules */}
      {modules.map((mod, mi) => (
        <div key={mi} className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
          <button
            onClick={() => toggleModule(mi)}
            className="w-full flex items-center justify-between px-5 py-4 hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center gap-3">
              {expandedModules.has(mi)
                ? <ChevronDown className="w-4 h-4 text-gray-400" />
                : <ChevronRight className="w-4 h-4 text-gray-400" />}
              <p className="text-sm font-semibold text-gray-900">
                Module {mi + 1}: {mod.title}
              </p>
              <span className="text-xs text-gray-400">{mod.items.length} lessons</span>
            </div>
          </button>

          {expandedModules.has(mi) && (
            <div className="border-t border-gray-100 divide-y divide-gray-50">
              {mod.items.map((lesson, li) => {
                const key = `${mi}-${li}`;
                const saveState = saveStates[key] ?? "idle";

                return (
                  <div key={li} className="px-5 py-4 space-y-3">
                    {/* Lesson header */}
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex items-center gap-2 min-w-0">
                        <Video className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                        <p className="text-sm font-medium text-gray-800 truncate">
                          {li + 1}. {lesson.title}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <button
                          onClick={() => addPart(mi, li)}
                          className="flex items-center gap-1 text-xs font-medium text-[#4d65ff] hover:text-indigo-700 transition-colors"
                        >
                          <Plus className="w-3.5 h-3.5" /> Add Part
                        </button>
                        <button
                          onClick={() => handleSave(mi, li)}
                          disabled={saveState === "saving"}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-[#4d65ff] hover:bg-indigo-700 text-white rounded-lg text-xs font-medium transition-colors disabled:opacity-60"
                        >
                          {saveState === "saving" ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : saveState === "saved" ? (
                            <CheckCircle className="w-3.5 h-3.5" />
                          ) : saveState === "error" ? (
                            <AlertCircle className="w-3.5 h-3.5" />
                          ) : (
                            <Save className="w-3.5 h-3.5" />
                          )}
                          {saveState === "saving" ? "Saving…" : saveState === "saved" ? "Saved!" : saveState === "error" ? "Error" : "Save"}
                        </button>
                      </div>
                    </div>

                    {/* Parts */}
                    {lesson.parts.length === 0 && (
                      <p className="text-xs text-gray-400 pl-5">
                        No videos yet. Click &ldquo;Add Part&rdquo; to add a video.
                      </p>
                    )}

                    {lesson.parts.map((part, pi) => {
                      const uploadKey = `${mi}-${li}-${pi}`;
                      const isUploading = uploadingKey === uploadKey;

                      return (
                        <div key={pi} className="pl-5 space-y-2">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-semibold text-gray-500 w-14 flex-shrink-0">
                              Part {pi + 1}
                            </span>
                            <input
                              type="text"
                              value={part.label}
                              onChange={(e) => updatePart(mi, li, pi, "label", e.target.value)}
                              placeholder={`Part ${pi + 1}`}
                              className="w-32 px-2.5 py-1.5 border border-gray-200 rounded-lg text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#4d65ff]/30 focus:border-[#4d65ff]"
                            />
                            <button
                              onClick={() => removePart(mi, li, pi)}
                              className="p-1.5 text-gray-400 hover:text-red-500 transition-colors rounded"
                              title="Remove part"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          <div className="flex items-center gap-2 pl-16">
                            <input
                              type="url"
                              value={part.video_url}
                              onChange={(e) => updatePart(mi, li, pi, "video_url", e.target.value)}
                              placeholder="Paste video URL or upload below…"
                              className={inputCls + " text-xs"}
                            />
                            <button
                              onClick={() => triggerFileUpload(mi, li, pi)}
                              disabled={!!uploadingKey}
                              className="flex items-center gap-1.5 px-3 py-2 border border-gray-200 rounded-lg text-xs font-medium text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50 flex-shrink-0"
                            >
                              {isUploading ? (
                                <>
                                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                  {uploadProgress}%
                                </>
                              ) : (
                                <>
                                  <Upload className="w-3.5 h-3.5" />
                                  Upload
                                </>
                              )}
                            </button>
                          </div>

                          {isUploading && (
                            <div className="pl-16">
                              <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-[#4d65ff] rounded-full transition-all"
                                  style={{ width: `${uploadProgress}%` }}
                                />
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}

                    {/* Resources section */}
                    <div className="border-t border-gray-100 pt-3 mt-1 pl-5 space-y-2">
                      <div className="flex items-center justify-between">
                        <p className="text-xs font-semibold text-gray-500 flex items-center gap-1.5">
                          <FileText className="w-3 h-3" /> PDF Resources
                        </p>
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            placeholder="Resource title (optional)"
                            value={pendingResourceTarget.current?.mi === mi && pendingResourceTarget.current?.li === li ? pendingResourceTitle : ""}
                            onChange={(e) => setPendingResourceTitle(e.target.value)}
                            className="w-44 px-2 py-1 border border-gray-200 rounded-lg text-xs text-gray-900 focus:outline-none focus:ring-1 focus:ring-[#4d65ff]/40"
                          />
                          <button
                            onClick={() => triggerResourceUpload(mi, li)}
                            disabled={!!resourceUploading}
                            className="flex items-center gap-1 text-xs font-medium text-[#4d65ff] hover:text-indigo-700 transition-colors disabled:opacity-50"
                          >
                            {resourceUploading === `res-${mi}-${li}` ? (
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            ) : (
                              <Plus className="w-3.5 h-3.5" />
                            )}
                            Upload PDF
                          </button>
                        </div>
                      </div>

                      {lesson.resources.length === 0 && (
                        <p className="text-xs text-gray-400">No resources yet.</p>
                      )}

                      {lesson.resources.map((res) => (
                        <div key={res.path} className="flex items-center justify-between gap-3 py-1">
                          <div className="flex items-center gap-2 min-w-0">
                            <FileText className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                            <span className="text-xs text-gray-700 truncate">{res.title}</span>
                          </div>
                          <button
                            onClick={() => handleDeleteResource(mi, li, res.path)}
                            disabled={!!resourceUploading}
                            className="p-1 text-gray-400 hover:text-red-500 transition-colors flex-shrink-0"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      ))}

      {!loading && courseSlug && modules.length === 0 && (
        <p className="text-center text-gray-400 py-8">No modules found for this course.</p>
      )}
    </div>
  );
}
