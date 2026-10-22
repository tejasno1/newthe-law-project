import { ShoppingBag } from "lucide-react";

type AccessType = "free" | "paid" | null;

const config: Record<
  NonNullable<AccessType>,
  { label: string; icon?: React.ReactNode; bg: string; text: string }
> = {
  free: {
    label: "Free",
    bg: "bg-emerald-500",
    text: "text-white",
  },
  paid: {
    label: "Paid",
    icon: <ShoppingBag className="w-3 h-3" />,
    bg: "bg-amber-500",
    text: "text-white",
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
