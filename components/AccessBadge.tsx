import { Sparkles, ShoppingBag } from "lucide-react";

type AccessType = "free" | "tlp_plus" | "one_time_purchase" | null;

const config: Record<
  NonNullable<AccessType>,
  { label: string; icon?: React.ReactNode; bg: string; text: string; border: string }
> = {
  free: {
    label: "Free",
    bg: "bg-emerald-500",
    text: "text-white",
    border: "",
  },
  tlp_plus: {
    label: "TLP Plus",
    icon: <Sparkles className="w-3 h-3" />,
    bg: "bg-primary-600",
    text: "text-white",
    border: "",
  },
  one_time_purchase: {
    label: "One Time Purchase",
    icon: <ShoppingBag className="w-3 h-3" />,
    bg: "bg-amber-500",
    text: "text-white",
    border: "",
  },
};

export default function AccessBadge({
  accessType,
  className = "",
}: {
  accessType: AccessType;
  className?: string;
}) {
  if (!accessType) return null;
  const { label, icon, bg, text } = config[accessType];

  return (
    <span
      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${bg} ${text} ${className}`}
    >
      {icon}
      {label}
    </span>
  );
}
