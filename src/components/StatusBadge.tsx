import type { ClaimStatus } from "../lib/types";
import { statusColor } from "../lib/mockData";

export function StatusBadge({ status }: { status: ClaimStatus }) {
  const c = statusColor[status];
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-semibold whitespace-nowrap ${c.bg} ${c.fg}`}
    >
      {status}
    </span>
  );
}

export function Pill({
  tone = "neutral",
  children,
}: {
  tone?: "neutral" | "success" | "warning" | "danger" | "brand";
  children: React.ReactNode;
}) {
  const tones: Record<string, string> = {
    neutral: "bg-line-soft text-ink-500",
    success: "bg-status-ready-bg text-status-ready-fg",
    warning: "bg-status-waiting-bg text-status-waiting-fg",
    danger: "bg-status-danger-bg text-status-danger-fg",
    brand: "bg-brand-50 text-brand-600",
  };
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-semibold whitespace-nowrap ${tones[tone]}`}>
      {children}
    </span>
  );
}
