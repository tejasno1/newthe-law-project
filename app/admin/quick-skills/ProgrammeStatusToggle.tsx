"use client";

import { useState, useTransition } from "react";
import { updateProgramme } from "@/app/admin/actions";

export default function ProgrammeStatusToggle({
  slug,
  initialValue,
}: {
  slug: string;
  initialValue: boolean;
}) {
  const [isComingSoon, setIsComingSoon] = useState(initialValue);
  const [isPending, startTransition] = useTransition();

  function toggle() {
    const next = !isComingSoon;
    setIsComingSoon(next);
    startTransition(async () => {
      const result = await updateProgramme(slug, { is_coming_soon: next });
      if (result.error) setIsComingSoon(!next);
    });
  }

  const isLive = !isComingSoon;

  return (
    <button
      onClick={toggle}
      disabled={isPending}
      title={isLive ? "Live — click to set Coming Soon" : "Coming Soon — click to set Live"}
      className="flex items-center gap-2 group disabled:opacity-60"
    >
      {/* Track */}
      <span
        className={`relative inline-flex h-5 w-9 flex-shrink-0 rounded-full border-2 transition-colors duration-200 ease-in-out ${
          isLive ? "bg-green-500 border-green-500" : "bg-gray-300 border-gray-300"
        }`}
      >
        {/* Thumb */}
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform duration-200 ease-in-out ${
            isLive ? "translate-x-4" : "translate-x-0"
          }`}
        />
      </span>
      <span className={`text-xs font-semibold ${isLive ? "text-green-700" : "text-gray-400"}`}>
        {isPending ? "…" : isLive ? "Live" : "Soon"}
      </span>
    </button>
  );
}
