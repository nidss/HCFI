import { useState } from "react";
import { ChevronDown, Search } from "lucide-react";
import { currentStaff } from "../lib/mockData";

export function Topbar() {
  const [query, setQuery] = useState("");

  return (
    <header className="flex h-16 shrink-0 items-center justify-between gap-4 border-b border-line-soft bg-white px-6">
      <div className="relative max-w-md flex-1">
        <Search size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-300" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="ค้นหา HN, ชื่อผู้ป่วย, เลขเคลม..."
          className="w-full rounded-lg border border-line bg-canvas py-2.5 pl-10 pr-3 text-sm text-ink-800 placeholder:text-ink-300 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
        />
      </div>
      <button className="flex shrink-0 items-center gap-2 rounded-lg border border-transparent px-2 py-1.5 hover:bg-line-soft">
        <div className="hidden text-right sm:block">
          <p className="text-sm font-medium leading-tight text-ink-800">{currentStaff.name}</p>
          <p className="text-xs leading-tight text-[#99a1af] mt-0.5">{currentStaff.role}</p>
        </div>
        <ChevronDown size={16} className="text-ink-300" />
      </button>
    </header>
  );
}
