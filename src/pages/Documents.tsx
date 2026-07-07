import { useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import { LayoutGrid, Rows3, Search } from "lucide-react";
import { PageHeader, Card } from "../components/PageHeader";
import { StatusBadge } from "../components/StatusBadge";
import { PatientDrawer } from "../components/PatientDrawer";
import { useAppData } from "../context/AppDataContext";
import { formatCurrency, formatThaiDate } from "../lib/mockData";
import type { ClaimStatus } from "../lib/types";

const statusColumns: ClaimStatus[] = [
  "ตีกลับ",
  "เอกสารไม่ครบ",
  "รอเซ็นยินยอม",
  "พร้อมเบิก",
  "รอเลข ERP",
  "พร้อมส่งมอบ",
  "ส่งมอบแล้ว",
];

export function Documents() {
  const { patients } = useAppData();
  const location = useLocation();
  const [view, setView] = useState<"table" | "kanban">("table");
  const [query, setQuery] = useState("");
  const [selectedHn, setSelectedHn] = useState<string | null>(
    (location.state as { focusHn?: string } | null)?.focusHn ?? null,
  );

  useEffect(() => {
    const focusHn = (location.state as { focusHn?: string } | null)?.focusHn;
    if (focusHn) setSelectedHn(focusHn);
  }, [location.state]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return patients;
    return patients.filter((p) => p.hn.toLowerCase().includes(q) || p.name.toLowerCase().includes(q));
  }, [patients, query]);

  const selectedPatient = selectedHn ? patients.find((p) => p.hn === selectedHn) : undefined;

  return (
    <div>
      <PageHeader
        title="จัดการเอกสาร"
        subtitle="ติดตามความครบถ้วนของเอกสารเคลมของผู้ป่วยแต่ละราย"
        action={
          <div className="flex overflow-hidden rounded-lg border border-line">
            <button
              onClick={() => setView("table")}
              className={`flex items-center gap-1.5 px-3 py-2 text-sm ${
                view === "table" ? "bg-brand-600 text-white" : "bg-white text-ink-500 hover:bg-line-soft"
              }`}
            >
              <Rows3 size={15} /> รายการ
            </button>
            <button
              onClick={() => setView("kanban")}
              className={`flex items-center gap-1.5 px-3 py-2 text-sm ${
                view === "kanban" ? "bg-brand-600 text-white" : "bg-white text-ink-500 hover:bg-line-soft"
              }`}
            >
              <LayoutGrid size={15} /> กลุ่มสถานะ
            </button>
          </div>
        }
      />

      <div className="mb-4 flex items-center justify-between">
        <div className="relative max-w-xs flex-1">
          <Search size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-300" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="ค้นหา HN หรือชื่อผู้ป่วย..."
            className="w-full rounded-lg border border-line py-2 pl-9 pr-3 text-sm text-ink-800 placeholder:text-ink-300 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
          />
        </div>
        <span className="text-sm text-ink-400">{filtered.length} รายการ</span>
      </div>

      {view === "table" ? (
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-line-soft text-left text-xs text-ink-300">
                  <th className="px-5 py-3 font-medium">HN</th>
                  <th className="px-5 py-3 font-medium">ชื่อผู้ป่วย</th>
                  <th className="px-5 py-3 font-medium">วันที่เข้ารับบริการ</th>
                  <th className="px-5 py-3 font-medium">บริษัทประกัน</th>
                  <th className="px-5 py-3 font-medium">ขั้นตอน</th>
                  <th className="px-5 py-3 font-medium">มูลค่าเคลม</th>
                  <th className="px-5 py-3 font-medium">สถานะ</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((p) => (
                  <tr
                    key={p.hn}
                    onClick={() => setSelectedHn(p.hn)}
                    className="cursor-pointer border-b border-line-soft last:border-0 hover:bg-canvas"
                  >
                    <td className="px-5 py-3 font-medium text-ink-700">{p.hn}</td>
                    <td className="px-5 py-3 text-ink-600">{p.name}</td>
                    <td className="px-5 py-3 text-ink-500">{formatThaiDate(p.visitDate)}</td>
                    <td className="px-5 py-3">
                      <div className="flex flex-wrap gap-1">
                        {p.insurers && p.insurers.length > 0 ? (
                          p.insurers.map((ins) => (
                            <span
                              key={ins}
                              className="inline-block rounded bg-brand-50 border border-brand-100 text-brand-700 text-[10px] font-bold px-1.5 py-0.5"
                            >
                              {ins}
                            </span>
                          ))
                        ) : (
                          <span className="text-xs text-ink-300">-</span>
                        )}
                      </div>
                    </td>
                    <td className="px-5 py-3">
                      {p.stage > 0 ? (
                        <span className="rounded-md bg-line-soft px-2 py-1 text-xs font-medium text-ink-500">
                          STAGE {p.stage}
                        </span>
                      ) : (
                        <span className="text-xs text-ink-300">ยังไม่เข้ารักษา</span>
                      )}
                    </td>
                    <td className="px-5 py-3 text-ink-600">{formatCurrency(p.claimValue)}</td>
                    <td className="px-5 py-3">
                      <StatusBadge status={p.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-7">
          {statusColumns.map((status) => {
            const items = filtered.filter((p) => p.status === status);
            return (
              <div key={status} className="min-w-0">
                <div className="mb-2 flex items-center justify-between px-1">
                  <StatusBadge status={status} />
                  <span className="text-xs text-ink-300">{items.length}</span>
                </div>
                <div className="space-y-2">
                  {items.map((p) => (
                    <button
                      key={p.hn}
                      onClick={() => setSelectedHn(p.hn)}
                      className="w-full rounded-lg border border-line bg-white p-3 text-left shadow-card hover:border-brand-300"
                    >
                      <p className="truncate text-xs font-medium text-ink-700">{p.hn}</p>
                      <p className="truncate text-sm text-ink-600">{p.name}</p>
                    </button>
                  ))}
                  {items.length === 0 && (
                    <p className="rounded-lg border border-dashed border-line-soft px-3 py-4 text-center text-xs text-ink-300">
                      ไม่มีรายการ
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {selectedPatient && <PatientDrawer patient={selectedPatient} onClose={() => setSelectedHn(null)} />}
    </div>
  );
}
