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
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");

  const stats = useMemo(() => {
    const pendingToday = patients.filter((p) => p.status === "เอกสารไม่ครบ" || p.status === "รอเซ็นยินยอม").length;
    const ready = patients.filter((p) => p.status === "พร้อมเบิก").length;
    const rejected = patients.filter((p) => p.status === "ตีกลับ").length;
    const delivered = patients.filter((p) => p.status === "ส่งมอบแล้ว");
    const deliveredValue = delivered.reduce((sum, p) => sum + (p.claimValue ?? 0), 0);
    return { pendingToday, ready, rejected, deliveredCount: delivered.length, deliveredValue };
  }, [patients]);

  const sorted = useMemo(
    () => [...patients].sort((a, b) => (a.visitDate < b.visitDate ? 1 : -1)),
    [patients],
  );

  const filteredPatients = useMemo(() => {
    let result = sorted;
    if (selectedStatus !== "all") {
      result = result.filter((p) => p.status === selectedStatus);
    }
    if (searchTerm.trim()) {
      const lower = searchTerm.toLowerCase();
      result = result.filter(
        (p) =>
          p.hn.toLowerCase().includes(lower) ||
          p.name.toLowerCase().includes(lower)
      );
    }
    return result;
  }, [sorted, searchTerm, selectedStatus]);

  const totalPages = Math.max(1, Math.ceil(filteredPatients.length / PAGE_SIZE));
  const pageItems = filteredPatients.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <div className="space-y-6">
      <PageHeader
        title="ภาพรวมระบบเคลมประกัน"
        subtitle="ติดตามสถานะเอกสารเคลมทั้งหมดตลอด 5 ขั้นตอน ตั้งแต่ลงทะเบียนผู้ป่วยจนถึงส่งมอบให้บริษัทประกัน"
      />

      {/* Stats Cards Section */}
      <div className="rounded-2xl bg-[#fafaf8] p-4 border border-line/60">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            label="เอกสารรอดำเนินการวันนี้"
            value={stats.pendingToday}
            pillLabel={`${stats.pendingToday} รายการรอ OCR/จับคู่`}
            pillClass="bg-status-waiting-bg text-status-waiting-fg"
          />
          <StatCard
            label="เอกสารตีกลับ"
            value={stats.rejected}
            pillLabel={`${stats.rejected} รายการส่งคืนให้แก้ไข`}
            pillClass="bg-status-danger-bg text-status-danger-fg"
          />
          <StatCard
            label="พร้อมเบิก (เอกสารครบ)"
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

      {/* Recent List Card Section */}
      <div className="rounded-2xl bg-[#fafaf8] p-4 border border-line/60">
        <Card>
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-line-soft px-5 py-4">
            <h3 className="text-base font-medium text-ink-800">รายการล่าสุด</h3>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setPage(1);
                }}
                placeholder="ค้นหา HN, ชื่อผู้ป่วย..."
                className="w-48 rounded-lg border border-line bg-white px-3 py-1.5 text-xs text-ink-800 placeholder:text-ink-300 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 transition-colors shadow-sm"
              />
              <select
                value={selectedStatus}
                onChange={(e) => {
                  setSelectedStatus(e.target.value);
                  setPage(1);
                }}
                className="rounded-lg border border-line bg-white px-3 py-1.5 text-xs font-medium text-ink-700 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 transition-colors shadow-sm cursor-pointer font-['Prompt']"
              >
                <option value="all">สถานะทั้งหมด</option>
                <option value="ตีกลับ">ตีกลับ</option>
                <option value="เอกสารไม่ครบ">เอกสารไม่ครบ</option>
                <option value="รอเซ็นยินยอม">รอเซ็นยินยอม</option>
                <option value="พร้อมเบิก">พร้อมเบิก</option>
                <option value="รอเลข ERP">รอเลข ERP</option>
                <option value="พร้อมส่งมอบ">พร้อมส่งมอบ</option>
                <option value="ส่งมอบแล้ว">ส่งมอบแล้ว</option>
                <option value="-">-</option>
              </select>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-line-soft text-left text-xs text-ink-300 bg-slate-50/50">
                  <th className="px-5 py-3.5 font-medium">HN</th>
                  <th className="px-5 py-3.5 font-medium">ชื่อผู้ป่วย</th>
                  <th className="px-5 py-3.5 font-medium">สถานะ</th>
                </tr>
              </thead>
              <tbody>
                {pageItems.length > 0 ? (
                  pageItems.map((p) => (
                    <tr
                      key={p.hn}
                      onClick={() => navigate("/documents", { state: { focusHn: p.hn } })}
                      className="cursor-pointer border-b border-line-soft last:border-0 hover:bg-canvas transition-colors"
                    >
                      <td className="px-5 py-3.5 font-medium text-ink-700">{p.hn}</td>
                      <td className="px-5 py-3.5 text-ink-600">{p.name}</td>
                      <td className="px-5 py-3.5">
                        <StatusBadge status={p.status} />
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={3} className="px-5 py-10 text-center text-xs text-ink-300">
                      ไม่พบข้อมูลผู้ป่วยตามคำค้นหา
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          <div className="flex items-center justify-between border-t border-line-soft px-5 py-4 text-xs text-ink-400 bg-slate-50/20">
            <span>
              แสดง {(page - 1) * PAGE_SIZE + 1}-{Math.min(page * PAGE_SIZE, filteredPatients.length)} จาก {filteredPatients.length} รายการ
            </span>
            <div className="flex items-center gap-2">
              <button
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
                className="rounded-lg border border-line bg-white px-3 py-1.5 font-medium text-ink-600 hover:bg-canvas disabled:opacity-40 disabled:hover:bg-white transition-colors shadow-sm"
              >
                &lt; ก่อนหน้า
              </button>
              <span className="px-2 font-medium text-ink-500">
                หน้า {page} / {totalPages}
              </span>
              <button
                disabled={page >= totalPages}
                onClick={() => setPage((p) => p + 1)}
                className="rounded-lg border border-line bg-white px-3 py-1.5 font-medium text-ink-600 hover:bg-canvas disabled:opacity-40 disabled:hover:bg-white transition-colors shadow-sm"
              >
                ถัดไป &gt;
              </button>
            </div>
          </div>
        </Card>
      </div>
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
      className={`rounded-xl border px-5 py-[18px] shadow-card transition-all duration-200 ${
        highlight ? "border-brand-500 bg-gradient-to-b from-brand-50 to-white" : "border-line bg-white"
      }`}
    >
      <p className="text-[11px] font-medium uppercase tracking-wide text-ink-500">{label}</p>
      <p className="mt-1.5 text-[30px] font-medium tracking-tight text-ink-800">{value}</p>
      <span className={`mt-2 inline-flex rounded-full px-2.5 py-1 text-[11px] font-medium ${pillClass}`}>
        {pillLabel}
      </span>
    </div>
  );
}
