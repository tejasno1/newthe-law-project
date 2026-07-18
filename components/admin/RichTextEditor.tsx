"use client";

import { memo, useEffect, useRef, useState } from "react";
import type { ContentBlock } from "@/lib/blogs";
import {
  ImageIcon, Minus, Plus, Trash2, ChevronUp, ChevronDown, X,
  List, ListOrdered, Quote, Heading2,
} from "lucide-react";

// ── Internal type adds a stable identity key ─────────────────────────────────
type IBlock = ContentBlock & { _id: number };
let _c = 0;
const uid = () => ++_c;
const toI = (bs: ContentBlock[]): IBlock[] => bs.map(b => ({ ...b, _id: uid() }));
const toE = (bs: IBlock[]): ContentBlock[] => bs.map(({ _id, ...b }) => b);
const isTextType = (t: string) => ["paragraph", "heading", "quote"].includes(t);
const isListType = (t: string) => t === "bulleted" || t === "numbered";

// ── Contenteditable block — manages its own DOM ref ──────────────────────────
const EditableDiv = memo(function EditableDiv({
  html, placeholder, className, onHtmlChange, onEnter, onEmptyBackspace, onFocus, onRegister,
}: {
  html: string;
  placeholder: string;
  className: string;
  onHtmlChange: (h: string) => void;
  onEnter: () => void;
  onEmptyBackspace: () => void;
  onFocus: () => void;
  onRegister?: (el: HTMLDivElement | null) => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const tracked = useRef(html);

  // Set initial content once and register with parent
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.innerHTML = html;
    tracked.current = html;
    onRegister?.(el);
    return () => onRegister?.(null);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Sync external changes (e.g. block type conversion) when not focused
  useEffect(() => {
    const el = ref.current;
    if (!el || html === tracked.current || document.activeElement === el) return;
    el.innerHTML = html;
    tracked.current = html;
  }, [html]);

  return (
    <div
      ref={ref}
      contentEditable
      suppressContentEditableWarning
      data-placeholder={placeholder}
      className={`tlp-editable ${className}`}
      onFocus={onFocus}
      onInput={(e) => {
        const el = e.currentTarget;
        let h = el.innerHTML;
        // Normalize browser-inserted <br> on empty
        if (h === "<br>") { el.innerHTML = ""; h = ""; }
        tracked.current = h;
        onHtmlChange(h);
      }}
      onKeyDown={(e) => {
        if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); onEnter(); }
        if (e.key === "Backspace") {
          const h = e.currentTarget.innerHTML;
          if (h === "" || h === "<br>") { e.preventDefault(); onEmptyBackspace(); }
        }
      }}
    />
  );
});

// ── Main block editor ─────────────────────────────────────────────────────────
export default function RichTextEditor({
  content,
  onChange,
  onImageUpload,
}: {
  content: ContentBlock[];
  onChange: (b: ContentBlock[]) => void;
  onImageUpload?: (f: File) => Promise<string>;
}) {
  const [blocks, setBlocks] = useState<IBlock[]>(() =>
    toI(content.length ? content : [{ type: "paragraph", text: "" }])
  );
  const [activeId, setActiveId] = useState<number | null>(null);
  const [imgUrls, setImgUrls] = useState<Record<number, string>>({});
  const [uploading, setUploading] = useState<number | null>(null);
  const [uploadErr, setUploadErr] = useState("");

  const fileRef = useRef<HTMLInputElement>(null);
  const uploadTarget = useRef<number | null>(null);
  const blockEls = useRef<Map<number, HTMLDivElement>>(new Map());
  const focusNextId = useRef<number | null>(null);

  // Focus pending block after render
  useEffect(() => {
    if (focusNextId.current !== null) {
      const el = blockEls.current.get(focusNextId.current);
      if (el) { el.focus(); focusNextId.current = null; }
    }
  });

  const push = (next: IBlock[]) => { setBlocks(next); onChange(toE(next)); };
  const upd = (id: number, patch: Partial<ContentBlock>) =>
    push(blocks.map(b => b._id === id ? { ...b, ...patch } : b));

  const addAfter = (afterId: number, type: ContentBlock["type"] = "paragraph") => {
    const idx = blocks.findIndex(b => b._id === afterId);
    const nb: IBlock = {
      _id: uid(), type, text: "",
      items: isListType(type) ? [""] : undefined,
    };
    const next = [...blocks];
    next.splice(idx + 1, 0, nb);
    push(next);
    setActiveId(nb._id);
    focusNextId.current = nb._id;
  };

  const remove = (id: number) => {
    if (blocks.length === 1) {
      const only = blocks[0];
      push([{ _id: only._id, type: "paragraph", text: "" }]);
      return;
    }
    const idx = blocks.findIndex(b => b._id === id);
    const next = blocks.filter(b => b._id !== id);
    push(next);
    const prevId = next[Math.max(0, idx - 1)]?._id;
    if (prevId) { setActiveId(prevId); focusNextId.current = prevId; }
  };

  const move = (id: number, dir: "up" | "down") => {
    const idx = blocks.findIndex(b => b._id === id);
    const ti = dir === "up" ? idx - 1 : idx + 1;
    if (ti < 0 || ti >= blocks.length) return;
    const next = [...blocks];
    [next[idx], next[ti]] = [next[ti], next[idx]];
    push(next);
  };

  const changeType = (id: number, type: ContentBlock["type"]) => {
    const b = blocks.find(b => b._id === id)!;
    let patch: Partial<ContentBlock>;
    if (isListType(type)) {
      patch = { type, items: b.text ? [b.text] : b.items ?? [""], text: undefined };
    } else if (type === "image" || type === "divider") {
      patch = { type, text: undefined, items: undefined };
    } else {
      patch = { type, text: b.items?.join("\n") ?? b.text ?? "", items: undefined };
    }
    upd(id, patch);
  };

  // Toolbar formatting — onMouseDown + preventDefault keeps selection in contenteditable
  const fmt = (cmd: string) => {
    document.execCommand(cmd, false);
    if (activeId !== null) {
      const el = blockEls.current.get(activeId);
      if (el) upd(activeId, { text: el.innerHTML });
    }
  };

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    const id = uploadTarget.current;
    if (!file || id === null || !onImageUpload) return;
    setUploading(id);
    setUploadErr("");
    try {
      const url = await onImageUpload(file);
      upd(id, { src: url });
    } catch (err: unknown) {
      setUploadErr(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(null);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  const textCls = (b: IBlock) => {
    if (b.type === "heading") {
      const sz: Record<number, string> = { 1: "text-3xl", 2: "text-2xl", 3: "text-xl", 4: "text-lg" };
      return `font-bold text-gray-900 ${sz[b.level ?? 2]}`;
    }
    if (b.type === "quote") return "border-l-4 border-[#4d65ff] pl-4 italic text-gray-600";
    return "text-gray-800 leading-relaxed";
  };

  const register = (id: number) => (el: HTMLDivElement | null) => {
    if (el) blockEls.current.set(id, el);
    else blockEls.current.delete(id);
  };

  return (
    <div className="border border-gray-200 rounded-xl bg-white">
      {/* ── Toolbar ── */}
      <div className="flex flex-wrap items-center gap-1 px-3 py-2 bg-gray-50 border-b border-gray-100 rounded-t-xl sticky top-0 z-10">
        {/* Inline formatting */}
        {[
          { cmd: "bold",      label: "B",  cls: "font-bold",  title: "Bold · Ctrl+B" },
          { cmd: "italic",    label: "I",  cls: "italic font-serif",     title: "Italic · Ctrl+I" },
          { cmd: "underline", label: "U",  cls: "underline",  title: "Underline · Ctrl+U" },
        ].map(({ cmd, label, cls, title }) => (
          <button key={cmd} type="button" title={title}
            onMouseDown={(e) => { e.preventDefault(); fmt(cmd); }}
            className={`w-7 h-7 flex items-center justify-center rounded text-sm text-gray-600 hover:bg-gray-200 hover:text-gray-900 transition-colors ${cls}`}
          >{label}</button>
        ))}

        <span className="w-px h-5 bg-gray-200 mx-0.5 flex-shrink-0" />
        <span className="text-xs text-gray-400 mr-0.5">Insert:</span>

        {([
          { type: "heading"  as ContentBlock["type"], icon: <Heading2 className="w-3.5 h-3.5" />,    title: "Heading" },
          { type: "quote"    as ContentBlock["type"], icon: <Quote className="w-3.5 h-3.5" />,       title: "Quote" },
          { type: "bulleted" as ContentBlock["type"], icon: <List className="w-3.5 h-3.5" />,        title: "Bullet list" },
          { type: "numbered" as ContentBlock["type"], icon: <ListOrdered className="w-3.5 h-3.5" />, title: "Numbered list" },
        ]).map(({ type, icon, title }) => (
          <button key={type} type="button" title={title}
            onMouseDown={(e) => {
              e.preventDefault();
              addAfter(activeId ?? blocks[blocks.length - 1]._id, type);
            }}
            className="w-7 h-7 flex items-center justify-center rounded text-gray-600 hover:bg-gray-200 hover:text-gray-900 transition-colors"
          >{icon}</button>
        ))}

        <button type="button" title="Insert image"
          onMouseDown={(e) => { e.preventDefault(); addAfter(activeId ?? blocks[blocks.length - 1]._id, "image"); }}
          className="w-7 h-7 flex items-center justify-center rounded text-gray-600 hover:bg-gray-200 transition-colors"
        ><ImageIcon className="w-3.5 h-3.5" /></button>

        <button type="button" title="Insert divider"
          onMouseDown={(e) => { e.preventDefault(); addAfter(activeId ?? blocks[blocks.length - 1]._id, "divider"); }}
          className="w-7 h-7 flex items-center justify-center rounded text-gray-600 hover:bg-gray-200 transition-colors"
        ><Minus className="w-3.5 h-3.5" /></button>
      </div>

      {/* Hidden file input */}
      <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp,image/gif"
        className="hidden" onChange={handleFile} />

      {/* ── Block list ── */}
      <div className="p-3 space-y-0.5 min-h-[400px]">
        {blocks.map((block, idx) => (
          <div
            key={block._id}
            className={`group relative flex gap-2 rounded-lg px-2 py-1.5 transition-colors ${
              activeId === block._id ? "bg-blue-50/50" : "hover:bg-gray-50/80"
            }`}
          >
            {/* Side controls */}
            <div className="flex flex-col items-center opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 mt-1.5">
              <button type="button" onClick={() => move(block._id, "up")} disabled={idx === 0}
                className="p-0.5 text-gray-300 hover:text-gray-600 disabled:opacity-0 rounded">
                <ChevronUp className="w-3.5 h-3.5" />
              </button>
              <button type="button" onClick={() => remove(block._id)}
                className="p-0.5 text-gray-300 hover:text-red-500 rounded">
                <Trash2 className="w-3.5 h-3.5" />
              </button>
              <button type="button" onClick={() => move(block._id, "down")} disabled={idx === blocks.length - 1}
                className="p-0.5 text-gray-300 hover:text-gray-600 disabled:opacity-0 rounded">
                <ChevronDown className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Block body */}
            <div className="flex-1 min-w-0">
              {/* Type + level picker for active block */}
              {activeId === block._id && block.type !== "divider" && (
                <div className="flex items-center gap-2 mb-1">
                  <select
                    value={block.type}
                    onChange={(e) => changeType(block._id, e.target.value as ContentBlock["type"])}
                    className="text-xs text-gray-400 bg-transparent border-0 outline-none cursor-pointer hover:text-[#4d65ff]"
                  >
                    <option value="paragraph">Text</option>
                    <option value="heading">Heading</option>
                    <option value="quote">Quote</option>
                    <option value="bulleted">Bullet list</option>
                    <option value="numbered">Numbered list</option>
                    <option value="image">Image</option>
                    <option value="divider">Divider</option>
                  </select>
                  {block.type === "heading" && (
                    <div className="flex gap-0.5">
                      {([1, 2, 3, 4] as const).map(l => (
                        <button key={l} type="button" onClick={() => upd(block._id, { level: l })}
                          className={`text-xs px-1.5 py-0.5 rounded font-bold transition-colors ${
                            (block.level ?? 2) === l ? "bg-[#4d65ff] text-white" : "text-gray-400 hover:bg-gray-100"
                          }`}
                        >H{l}</button>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* ── Text block ── */}
              {isTextType(block.type) && (
                <EditableDiv
                  html={block.text ?? ""}
                  placeholder={
                    block.type === "heading" ? "Heading…"
                    : block.type === "quote" ? "Quote…"
                    : "Write something…"
                  }
                  className={textCls(block)}
                  onHtmlChange={(h) => upd(block._id, { text: h })}
                  onEnter={() => addAfter(block._id)}
                  onEmptyBackspace={() => remove(block._id)}
                  onFocus={() => setActiveId(block._id)}
                  onRegister={register(block._id)}
                />
              )}

              {/* ── List block ── */}
              {isListType(block.type) && (
                <div className="space-y-0.5" onClick={() => setActiveId(block._id)}>
                  {(block.items ?? [""]).map((item, ii) => (
                    <div key={ii} className="flex items-center gap-2">
                      <span className="text-gray-400 text-sm flex-shrink-0 w-5 text-right select-none">
                        {block.type === "numbered" ? `${ii + 1}.` : "•"}
                      </span>
                      <input
                        type="text"
                        value={item}
                        onChange={(e) => {
                          const items = [...(block.items ?? [])];
                          items[ii] = e.target.value;
                          upd(block._id, { items });
                        }}
                        onFocus={() => setActiveId(block._id)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            const items = [...(block.items ?? [])];
                            items.splice(ii + 1, 0, "");
                            upd(block._id, { items });
                          }
                          if (e.key === "Backspace" && item === "" && (block.items ?? []).length > 1) {
                            e.preventDefault();
                            upd(block._id, { items: (block.items ?? []).filter((_, i) => i !== ii) });
                          }
                        }}
                        placeholder={`Item ${ii + 1}`}
                        className="flex-1 text-sm text-gray-800 outline-none bg-transparent placeholder-gray-300 py-0.5"
                      />
                      {(block.items ?? []).length > 1 && (
                        <button type="button"
                          onClick={() => upd(block._id, { items: (block.items ?? []).filter((_, i) => i !== ii) })}
                          className="text-gray-200 hover:text-red-400 opacity-0 group-hover:opacity-100 flex-shrink-0 transition-opacity">
                          <X className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  ))}
                  <button type="button"
                    onClick={() => upd(block._id, { items: [...(block.items ?? []), ""] })}
                    className="flex items-center gap-1 text-xs text-gray-400 hover:text-[#4d65ff] mt-1 ml-7 transition-colors">
                    <Plus className="w-3 h-3" /> Add item
                  </button>
                </div>
              )}

              {/* ── Image block ── */}
              {block.type === "image" && (
                <div className="space-y-2 py-1" onClick={() => setActiveId(block._id)}>
                  {block.src ? (
                    <div className="relative group/img">
                      <img src={block.src} alt={block.alt ?? ""}
                        className="max-w-full rounded-xl max-h-72 object-contain" />
                      <button type="button" onClick={() => upd(block._id, { src: "" })}
                        className="absolute top-2 right-2 p-1 bg-black/60 text-white rounded-md hover:bg-black/80 opacity-0 group-hover/img:opacity-100 transition-opacity">
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : (
                    <div className="border-2 border-dashed border-gray-200 rounded-xl p-6 text-center">
                      <ImageIcon className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                      <div className="space-y-3">
                        {onImageUpload && (
                          <button type="button"
                            disabled={uploading === block._id}
                            onClick={() => { uploadTarget.current = block._id; fileRef.current?.click(); }}
                            className="px-4 py-2 bg-[#4d65ff] text-white text-sm rounded-xl hover:bg-indigo-700 transition-colors disabled:opacity-60"
                          >
                            {uploading === block._id ? "Uploading…" : "Upload image"}
                          </button>
                        )}
                        <div className="flex items-center gap-2 text-xs text-gray-300">
                          <span className="flex-1 h-px bg-gray-100" />or paste URL<span className="flex-1 h-px bg-gray-100" />
                        </div>
                        <div className="flex gap-2 max-w-sm mx-auto">
                          <input type="url" placeholder="https://example.com/photo.jpg"
                            value={imgUrls[block._id] ?? ""}
                            onChange={(e) => setImgUrls(p => ({ ...p, [block._id]: e.target.value }))}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                const v = imgUrls[block._id]?.trim();
                                if (v) { upd(block._id, { src: v }); setImgUrls(p => ({ ...p, [block._id]: "" })); }
                              }
                            }}
                            className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-[#4d65ff]"
                          />
                          <button type="button"
                            onClick={() => {
                              const v = imgUrls[block._id]?.trim();
                              if (v) { upd(block._id, { src: v }); setImgUrls(p => ({ ...p, [block._id]: "" })); }
                            }}
                            className="px-3 py-2 bg-[#4d65ff] text-white rounded-lg text-sm hover:bg-indigo-700 transition-colors"
                          >Add</button>
                        </div>
                        {uploadErr && uploading === null && (
                          <p className="text-xs text-red-500 mt-1">{uploadErr}</p>
                        )}
                      </div>
                    </div>
                  )}
                  <input type="text" value={block.alt ?? ""}
                    onChange={(e) => upd(block._id, { alt: e.target.value })}
                    placeholder="Alt text (good for SEO and accessibility)"
                    className="w-full px-3 py-1.5 border border-gray-200 rounded-lg text-sm text-gray-600 outline-none focus:border-[#4d65ff] transition-colors"
                  />
                </div>
              )}

              {/* ── Divider block ── */}
              {block.type === "divider" && (
                <div className="py-3 cursor-default" onClick={() => setActiveId(block._id)}>
                  <hr className="border-gray-300" />
                </div>
              )}

              {/* ── Legacy HTML block (from old TipTap saves) ── */}
              {block.type === "html" && (
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl"
                  onClick={() => setActiveId(block._id)}>
                  <p className="text-xs font-semibold text-amber-700 uppercase tracking-wide mb-2">
                    Legacy rich-text block
                  </p>
                  <div className="text-sm text-gray-700 line-clamp-4 blog-html-content"
                    dangerouslySetInnerHTML={{ __html: block.html ?? "" }} />
                  <button type="button"
                    onClick={() => upd(block._id, { type: "paragraph", text: block.html ?? "", html: undefined })}
                    className="mt-2 text-xs text-[#4d65ff] hover:underline"
                  >Convert to text block →</button>
                </div>
              )}
            </div>
          </div>
        ))}

        {/* Add block */}
        <button type="button"
          onClick={() => addAfter(activeId ?? blocks[blocks.length - 1]._id)}
          className="w-full mt-3 py-3 text-sm text-gray-300 hover:text-[#4d65ff] flex items-center justify-center gap-2 rounded-xl hover:bg-gray-50 border-2 border-dashed border-gray-100 hover:border-[#4d65ff]/20 transition-colors"
        >
          <Plus className="w-4 h-4" /> Add block
        </button>
      </div>
    </div>
  );
}
