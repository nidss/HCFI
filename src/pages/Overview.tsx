import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { PageHeader, Card } from "../components/PageHeader";
import { StatusBadge } from "../components/StatusBadge";
import { useAppData } from "../context/AppDataContext";

const PAGE_SIZE = 10;

export function Overview() {
  const { patients } = useAppData();
  const navigate = useNavigate();
  const [page, setPage] = useState(1);

  const stats = useMemo(() => {
    const pendingToday = patients.filter((p) => p.status === "เอกสารไม่ครบ" || p.status === "รอเซ็นยินยอม").length;
    const ready = patients.filter((p) => p.status === "พร้อมเบิก").length;
    const delivered = patients.filter((p) => p.status === "ส่งมอบแล้ว");
    const deliveredValue = delivered.reduce((sum, p) => sum + (p.claimValue ?? 0), 0);
    return { pendingToday, ready, deliveredCount: delivered.length, deliveredValue };
  }, [patients]);

  const sorted = useMemo(
    () => [...patients].sort((a, b) => (a.visitDate < b.visitDate ? 1 : -1)),
    [patients],
  );
  const totalPages = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE));
  const pageItems = sorted.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <div>
      <PageHeader
        title="ภาพรวมระบบเคลมประกัน"
        subtitle="ติดตามสถานะเอกสารเคลมทั้งหมดตลอด 5 ขั้นตอน ตั้งแต่ลงทะเบียนผู้ป่วยจนถึงส่งมอบให้บริษัทประกัน"
      />

      <div className="mb-6 rounded-2xl bg-[#fafaf8] p-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <StatCard
            label="เอกสารรอดำเนินการวันนี้"
            value={stats.pendingToday}
            pillLabel={`${stats.pendingToday} รายการรอ OCR/จับคู่`}
            pillClass="bg-status-waiting-bg text-status-waiting-fg"
          />
          <StatCard
            label="พร้อมเบิก (ครบเอกสาร)"
            value={stats.ready}
            pillLabel="พร้อมทำใบสรุปจ่าย"
            pillClass="bg-status-ready-bg text-status-ready-fg"
          />
          <StatCard
            label="ส่งมอบสำเร็จเดือนนี้"
            value={stats.deliveredCount}
            pillLabel={`มูลค่า ฿${Math.round(stats.deliveredValue / 1000)}K`}
            pillClass="bg-status-sent-bg text-status-sent-fg"
            highlight
          />
        </div>
      </div>

      <Card>
        <div className="flex items-center justify-between border-b border-line-soft px-5 py-4">
          <h3 className="text-base font-semibold text-ink-800">รายการล่าสุด</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-line-soft text-left text-xs text-ink-300">
                <th className="px-5 py-3 font-medium">HN</th>
                <th className="px-5 py-3 font-medium">ชื่อผู้ป่วย</th>
                <th className="px-5 py-3 font-medium">สถานะ</th>
              </tr>
            </thead>
            <tbody>
              {pageItems.map((p) => (
                <tr
                  key={p.hn}
                  onClick={() => navigate("/documents", { state: { focusHn: p.hn } })}
                  className="cursor-pointer border-b border-line-soft last:border-0 hover:bg-canvas"
                >
                  <td className="px-5 py-3 font-medium text-ink-700">{p.hn}</td>
                  <td className="px-5 py-3 text-ink-600">{p.name}</td>
                  <td className="px-5 py-3">
                    <StatusBadge status={p.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="flex items-center justify-between px-5 py-3 text-xs text-ink-400">
          <span>
            แสดง {(page - 1) * PAGE_SIZE + 1}-{Math.min(page * PAGE_SIZE, sorted.length)} จาก {sorted.length} รายการ
          </span>
          <div className="flex items-center gap-3">
            <button
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
              className="rounded-md border border-line px-2.5 py-1 disabled:opacity-40"
            >
              ก่อนหน้า
            </button>
            <span>
              หน้า {page} / {totalPages}
            </span>
            <button
              disabled={page >= totalPages}
              onClick={() => setPage((p) => p + 1)}
              className="rounded-md border border-line px-2.5 py-1 disabled:opacity-40"
            >
              ถัดไป
            </button>
          </div>
        </div>
      </Card>
    </div>
  );
}

function StatCard({
  label,
  value,
  pillLabel,
  pillClass,
  highlight,
}: {
  label: string;
  value: number;
  pillLabel: string;
  pillClass: string;
  highlight?: boolean;
}) {
  return (
    <div
      className={`rounded-lg border px-5 py-[18px] shadow-card ${
        highlight ? "border-brand-500 bg-gradient-to-b from-brand-50 to-white" : "border-line bg-white"
      }`}
    >
      <p className="text-[11px] font-semibold uppercase tracking-wide text-ink-500">{label}</p>
      <p className="mt-1.5 text-[30px] font-semibold tracking-tight text-ink-800">{value}</p>
      <span className={`mt-2 inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold ${pillClass}`}>
        {pillLabel}
      </span>
    </div>
  );
}
