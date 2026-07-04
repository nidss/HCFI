import { useMemo, useState } from "react";
import { RadioTower, Search } from "lucide-react";
import { Card, PageHeader, EmptyState } from "../components/PageHeader";
import { useAppData } from "../context/AppDataContext";
import { formatThaiDateTime } from "../lib/mockData";

export function AuditLog() {
  const { auditLog } = useAppData();
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return auditLog;
    return auditLog.filter((e) =>
      [e.user, e.target, e.detail, e.action].some((v) => v.toLowerCase().includes(q)),
    );
  }, [auditLog, query]);

  return (
    <div>
      <PageHeader
        title="ประวัติการใช้งานระบบ (Audit Log)"
        subtitle="บันทึกการทำงานและการเข้าถึงเอกสารทุกรายการ พร้อมหมายเลข IP และสถานะการทำรายการ"
      />

      <Card>
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line-soft px-5 py-4">
          <div className="relative max-w-sm flex-1">
            <Search size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-300" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="ค้นหาผู้ใช้งาน / เป้าหมาย / รายละเอียด..."
              className="w-full rounded-lg border border-line py-2 pl-9 pr-3 text-sm text-ink-800 placeholder:text-ink-300 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
            />
          </div>
          <div className="flex items-center gap-1.5 text-xs text-ink-300">
            <RadioTower size={13} className="text-brand-500" />
            อัปเดตอัตโนมัติทุก 4 วินาที
          </div>
        </div>

        {filtered.length === 0 ? (
          <EmptyState title="ไม่พบรายการที่ค้นหา" />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-line-soft text-left text-xs text-ink-300">
                  <th className="px-5 py-3 font-medium">เวลา</th>
                  <th className="px-5 py-3 font-medium">ผู้ใช้งาน</th>
                  <th className="px-5 py-3 font-medium">การกระทำ</th>
                  <th className="px-5 py-3 font-medium">เป้าหมาย</th>
                  <th className="px-5 py-3 font-medium">IP</th>
                  <th className="px-5 py-3 font-medium">สถานะ</th>
                  <th className="px-5 py-3 font-medium">รายละเอียด</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((e) => (
                  <tr key={e.id} className="border-b border-line-soft last:border-0 align-top">
                    <td className="whitespace-nowrap px-5 py-3 text-ink-500">{formatThaiDateTime(e.timestamp)}</td>
                    <td className="whitespace-nowrap px-5 py-3 font-medium text-ink-700">{e.user}</td>
                    <td className="whitespace-nowrap px-5 py-3 text-ink-600">{e.action}</td>
                    <td className="whitespace-nowrap px-5 py-3 font-mono text-xs text-ink-600">{e.target}</td>
                    <td className="whitespace-nowrap px-5 py-3 font-mono text-xs text-ink-400">{e.ip}</td>
                    <td className="whitespace-nowrap px-5 py-3">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold ${
                          e.status === "สำเร็จ"
                            ? "bg-status-ready-bg text-status-ready-fg"
                            : "bg-status-danger-bg text-status-danger-fg"
                        }`}
                      >
                        {e.status}
                      </span>
                    </td>
                    <td className="min-w-[220px] px-5 py-3 text-ink-500">{e.detail}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
