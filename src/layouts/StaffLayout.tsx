import { useState } from "react";
import { Outlet } from "react-router-dom";
import { Sidebar } from "../components/Sidebar";
import { Topbar } from "../components/Topbar";

export function StaffLayout() {
  const [collapsed, setCollapsed] = useState(false);
  return (
    <div className="flex h-screen w-full overflow-hidden bg-canvas">
      <Sidebar collapsed={collapsed} onToggle={() => setCollapsed((c) => !c)} />
      <div className="flex min-w-0 flex-1 flex-col p-3 pl-1">
        <div className="flex-1 rounded-[16px] border border-line bg-white flex flex-col overflow-hidden shadow-sm">
          <Topbar />
          <main className="flex-1 overflow-y-auto bg-white">
            <div className="px-6 py-5">
              <Outlet />
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
