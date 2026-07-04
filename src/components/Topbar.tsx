import { useState } from "react";
import { useLocation } from "react-router-dom";
import { ChevronDown, Search } from "lucide-react";
import { currentStaff } from "../lib/mockData";

const crumbs: Record<string, string> = {
  "/": "ภาพรวม",
  "/reception": "แผนกต้อนรับ",
  "/cashier": "ช่องชำระเงิน",
  "/documents": "จัดการเอกสาร",
  "/accounting": "ใบสรุปจ่าย",
  "/delivery": "ส่งมอบเอกสาร",
  "/audit-log": "Audit Log",
  "/settings": "การตั้งค่า",
};

export function Topbar() {
  const [query, setQuery] = useState("");
  const location = useLocation();
  const crumb = crumbs[location.pathname] ?? "";

  return (
    <header className="flex h-16 shrink-0 items-center gap-4 border-b border-line-soft bg-white px-6">
      <nav className="hidden shrink-0 items-center gap-1.5 text-sm text-ink-400 sm:flex">
        <span className="font-medium text-ink-600">ClaimFlow</span>
        <span>/</span>
        <span>{crumb}</span>
      </nav>
      <div className="relative ml-auto max-w-md flex-1">
        <Search size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-300" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="ค้นหา HN, ชื่อผู้ป่วย, เลขเคลม..."
          className="w-full rounded-lg border border-line bg-canvas py-2.5 pl-10 pr-3 text-sm text-ink-800 placeholder:text-ink-300 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
        />
      </div>
      <button className="flex shrink-0 items-center gap-2 rounded-lg border border-transparent px-2 py-1.5 hover:bg-line-soft">
        <div className="flex size-9 items-center justify-center rounded-full bg-brand-100 text-sm font-semibold text-brand-700">
          {currentStaff.name.charAt(0)}
        </div>
        <div className="hidden text-left sm:block">
          <p className="text-sm font-medium leading-tight text-ink-800">{currentStaff.name}</p>
          <p className="text-xs leading-tight text-ink-300">{currentStaff.role}</p>
        </div>
        <ChevronDown size={16} className="text-ink-300" />
      </button>
    </header>
  );
}
