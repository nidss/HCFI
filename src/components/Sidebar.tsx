import { NavLink } from "react-router-dom";
import {
  Building2,
  ChevronsLeft,
  ChevronsRight,
  FileStack,
  FolderKanban,
  History,
  LayoutDashboard,
  Send,
  Settings,
  UserRoundPlus,
  Wallet,
} from "lucide-react";
import { useAppData } from "../context/AppDataContext";

const steps = [
  { n: 1, to: "/reception", label: "แผนกต้อนรับ", icon: UserRoundPlus },
  { n: 2, to: "/cashier", label: "ช่องชำระเงิน", icon: Wallet },
  { n: 3, to: "/documents", label: "จัดการเอกสาร", icon: FolderKanban, countStatus: "เอกสารไม่ครบ" as const },
  { n: 4, to: "/accounting", label: "ใบสรุปจ่าย", icon: FileStack },
  { n: 5, to: "/delivery", label: "ส่งมอบเอกสาร", icon: Send },
];

export function Sidebar({ collapsed, onToggle }: { collapsed: boolean; onToggle: () => void }) {
  const { patients } = useAppData();
  const incompleteCount = patients.filter((p) => p.status === "เอกสารไม่ครบ").length;

  return (
    <aside
      className={`h-full shrink-0 border-r border-line bg-[#fafbfc] transition-all duration-200 ${
        collapsed ? "w-[76px]" : "w-64"
      }`}
    >
      <div className="flex h-full flex-col">
        <div className="flex items-center gap-3 border-b border-line-soft p-3">
          <img src="/slogo.png" alt="Sikarin Hospital" className="size-10 shrink-0 object-contain" />
          {!collapsed && (
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-bold text-ink-900 leading-tight">โรงพยาบาลศิครินทร์</p>
              <p className="truncate text-[11px] text-ink-400 mt-0.5 leading-none">กรุงเทพฯ</p>
            </div>
          )}
          <button
            onClick={onToggle}
            className="shrink-0 rounded-md border border-line p-1 text-ink-400 hover:bg-line-soft bg-white shadow-sm transition-transform"
            aria-label="ย่อเมนู"
            title="ย่อเมนู"
          >
            {collapsed ? <ChevronsRight size={14} /> : <ChevronsLeft size={14} />}
          </button>
        </div>

        <nav className="flex-1 space-y-6 overflow-y-auto px-3 py-4">
          <div>
            {!collapsed && (
              <p className="mb-1.5 px-3 text-xs font-medium text-ink-300">งานหลัก</p>
            )}
            <NavItem to="/" icon={LayoutDashboard} label="ภาพรวม" collapsed={collapsed} exact />
          </div>

          <div>
            {!collapsed && (
              <p className="mb-2 flex items-center gap-1.5 px-3 text-xs font-medium text-ink-400">
                ขั้นตอนเคลม
              </p>
            )}
            <div className="space-y-1">
              {steps.map((s) => (
                <NavLink
                  key={s.to}
                  to={s.to}
                  className={({ isActive }) =>
                    `flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-colors ${
                      isActive ? "bg-brand-50 text-brand-600 font-semibold" : "text-ink-600 hover:bg-line-soft hover:text-ink-900"
                    }`
                  }
                >
                  {!collapsed && (
                    <span className="w-3 shrink-0 text-[11px] font-semibold text-ink-300">{s.n}</span>
                  )}
                  <s.icon size={18} className="shrink-0" />
                  {!collapsed && <span className="flex-1 truncate">{s.label}</span>}
                  {!collapsed && s.countStatus && incompleteCount > 0 && (
                    <span className="rounded-full bg-status-waiting-bg px-1.5 py-0.5 text-[11px] font-semibold text-status-waiting-fg">
                      {incompleteCount}
                    </span>
                  )}
                </NavLink>
              ))}
            </div>
          </div>

          <div>
            {!collapsed && <p className="mb-1.5 px-3 text-xs font-medium text-ink-300">ระบบ</p>}
            <NavItem to="/audit-log" icon={History} label="Audit Log" collapsed={collapsed} />
          </div>
        </nav>

        <div className="border-t border-line-soft p-3">
          <NavItem to="/settings" icon={Settings} label="การตั้งค่า" collapsed={collapsed} />
        </div>
      </div>
    </aside>
  );
}

function NavItem({
  to,
  icon: Icon,
  label,
  collapsed,
  exact,
}: {
  to: string;
  icon: typeof LayoutDashboard;
  label: string;
  collapsed: boolean;
  exact?: boolean;
}) {
  return (
    <NavLink
      to={to}
      end={exact}
      className={({ isActive }) =>
        `flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-colors ${
          isActive ? "bg-brand-50 text-brand-600 font-semibold" : "text-ink-600 hover:bg-line-soft hover:text-ink-900"
        }`
      }
      title={collapsed ? label : undefined}
    >
      <Icon size={18} className="shrink-0" />
      {!collapsed && <span className="truncate">{label}</span>}
    </NavLink>
  );
}
