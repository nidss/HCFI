import type { ReactNode } from "react";
import { useLocation } from "react-router-dom";

const crumbs: Record<string, string> = {
  "/": "ภาพรวม",
  "/reception": "แผนกลงทะเบียน",
  "/cashier": "ช่องชำระเงิน",
  "/documents": "จัดการเอกสาร",
  "/accounting": "ใบสรุปจ่าย",
  "/delivery": "ส่งมอบเอกสาร",
  "/audit-log": "Audit Log",
  "/settings": "การตั้งค่า",
};

export function PageHeader({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle?: string;
  action?: ReactNode;
}) {
  const location = useLocation();
  const crumb = crumbs[location.pathname] ?? "";

  return (
    <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
      <div>
        {crumb && (
          <nav className="mb-2 flex items-center gap-1.5 text-xs text-[#99a1af]">
            <span className="font-medium text-ink-500">ClaimFlow</span>
            <span>/</span>
            <span className="font-medium text-[#364153]">{crumb}</span>
          </nav>
        )}
        <h1 className="text-2xl font-medium text-ink-900">{title}</h1>
        {subtitle && <p className="mt-1 text-sm text-ink-400">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

export function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div className={`rounded-lg border border-line bg-white shadow-card ${className}`}>{children}</div>
  );
}

export function EmptyState({ icon, title, hint }: { icon?: ReactNode; title: string; hint?: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 px-6 py-14 text-center">
      {icon && <div className="mb-1 text-ink-300">{icon}</div>}
      <p className="text-sm font-medium text-ink-500">{title}</p>
      {hint && <p className="text-xs text-ink-300">{hint}</p>}
    </div>
  );
}
