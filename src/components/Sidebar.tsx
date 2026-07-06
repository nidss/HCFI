import { NavLink } from "react-router-dom";
import {
  Building2,
  ChevronDown,
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
  { n: 1, to: "/reception", label: "แผนกลงทะเบียน", icon: UserRoundPlus },
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
      className={`h-full shrink-0 bg-[#f6f8fb] transition-all duration-200 ${
        collapsed ? "w-[76px]" : "w-64"
      }`}
    >
      <div className="flex h-full flex-col justify-between">
        <div className="flex flex-col">
          {/* Header Card */}
          <div className="p-3">
            {collapsed ? (
              <button
                onClick={onToggle}
                className="size-10 mx-auto flex items-center justify-center rounded-xl border border-line bg-white shadow-sm text-ink-400 hover:bg-line-soft transition-colors"
                aria-label="ขยายเมนู"
                title="ขยายเมนู"
              >
                <ChevronsRight size={16} />
              </button>
            ) : (
              <div className="bg-white border border-[#dbe3ec] rounded-xl px-3 py-[11px] shadow-sm flex items-center justify-between gap-2.5">
                <div className="flex items-center gap-2.5 min-w-0">
                  <img src="/slogo.png" alt="Sikarin Hospital" className="size-10 shrink-0 object-contain rounded-lg" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-ink-900 leading-tight">โรงพยาบาลศิครินทร์</p>
                    <p className="truncate text-[12px] text-[#99a1af] mt-0.5 leading-none">กรุงเทพฯ</p>
                  </div>
                </div>
                <button
                  onClick={onToggle}
                  className="shrink-0 rounded-lg border border-[#dbe3ec] p-1 text-ink-400 hover:bg-line-soft bg-white transition-colors"
                  aria-label="ย่อเมนู"
                  title="ย่อเมนู"
                >
                  <ChevronsLeft size={14} />
                </button>
              </div>
            )}
          </div>

          {/* Navigation Links */}
          <nav className="space-y-6 px-3 py-2 overflow-y-auto">
            {/* Section 1 */}
            <div>
              {!collapsed && (
                <p className="mb-1.5 px-3 text-[12px] font-medium text-[#99a1af]">งานหลัก</p>
              )}
              <NavItem to="/overview" icon={LayoutDashboard} label="ภาพรวม" collapsed={collapsed} exact />
            </div>

            {/* Section 2 */}
            <div>
              {!collapsed && (
                <p className="mb-1.5 px-3 text-[12px] font-medium text-[#99a1af] flex items-center gap-1">
                  <ChevronDown size={14} className="shrink-0 text-[#99a1af]" />
                  <span>ขั้นตอนเคลม</span>
                </p>
              )}
              <div className="space-y-1">
                {steps.map((s) => (
                  <NavLink
                    key={s.to}
                    to={s.to}
                    className={({ isActive }) =>
                      `flex items-center rounded-lg px-3 py-2 text-sm transition-colors ${
                        collapsed ? "justify-center" : "gap-2.5"
                      } ${
                        isActive ? "bg-[#d2f1e4]/70 text-[#054a3a] font-medium" : "text-[#4a5565] hover:bg-line-soft hover:text-ink-900"
                      }`
                    }
                    title={collapsed ? s.label : undefined}
                  >
                    {!collapsed && (
                      <span className="w-3 shrink-0 text-[12px] text-[#99a1af] text-center">{s.n}</span>
                    )}
                    <s.icon size={18} className="shrink-0" />
                    {!collapsed && <span className="flex-1 truncate">{s.label}</span>}
                    {!collapsed && s.countStatus && incompleteCount > 0 && (
                      <span className="rounded-full bg-[#fef3c6] px-1.5 py-0.5 text-[11px] font-medium text-[#bb4d00]">
                        {incompleteCount}
                      </span>
                    )}
                  </NavLink>
                ))}
              </div>
            </div>

            {/* Section 3 */}
            <div>
              {!collapsed && (
                <p className="mb-1.5 px-3 text-[12px] font-medium text-[#99a1af] flex items-center gap-1">
                  <ChevronDown size={14} className="shrink-0 text-[#99a1af]" />
                  <span>ระบบ</span>
                </p>
              )}
              <NavItem to="/audit-log" icon={History} label="Audit Log" collapsed={collapsed} />
            </div>
          </nav>
        </div>

        {/* Footer Link (Settings) */}
        <div className="p-3">
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
        `flex items-center rounded-lg px-3 py-2 text-sm transition-colors ${
          collapsed ? "justify-center" : "gap-2.5"
        } ${
          isActive ? "bg-[#d2f1e4]/70 text-[#054a3a] font-medium" : "text-[#4a5565] hover:bg-line-soft hover:text-ink-900"
        }`
      }
      title={collapsed ? label : undefined}
    >
      <Icon size={18} className="shrink-0" />
      {!collapsed && <span className="truncate">{label}</span>}
    </NavLink>
  );
}
