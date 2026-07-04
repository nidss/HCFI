import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, Cpu, Database, ExternalLink, Info, Server } from "lucide-react";
import { PageHeader, Card } from "../components/PageHeader";
import { StatusBadge } from "../components/StatusBadge";
import { useAppData } from "../context/AppDataContext";

const PAGE_SIZE = 10;

export function Overview() {
  const { patients } = useAppData();
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");

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

  const filteredPatients = useMemo(() => {
    if (!searchTerm.trim()) return sorted;
    const lower = searchTerm.toLowerCase();
    return sorted.filter(
      (p) =>
        p.hn.toLowerCase().includes(lower) ||
        p.name.toLowerCase().includes(lower)
    );
  }, [sorted, searchTerm]);

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

      {/* Pipeline Section */}
      <Card>
        <div className="border-b border-line-soft px-5 py-4">
          <h3 className="text-base font-semibold text-ink-800">สถานะตามขั้นตอน (Pipeline)</h3>
        </div>
        <div className="p-5">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-5 md:divide-x divide-line-soft">
            <div className="flex flex-col px-2">
              <span className="text-[10px] font-bold text-ink-300 tracking-wider uppercase">STAGE 1</span>
              <span className="text-sm font-semibold text-ink-800 mt-1">แผนกต้อนรับ</span>
              <span className="text-xs text-ink-400 mt-0.5 leading-relaxed">ลงทะเบียน · เซ็นยินยอม</span>
            </div>
            <div className="flex flex-col px-2 md:pl-5">
              <span className="text-[10px] font-bold text-ink-300 tracking-wider uppercase">STAGE 2</span>
              <span className="text-sm font-semibold text-ink-800 mt-1">ช่องชำระเงิน</span>
              <span className="text-xs text-ink-400 mt-0.5 leading-relaxed">จับ Invoice · OCR จับคู่ HN</span>
            </div>
            <div className="flex flex-col px-2 md:pl-5">
              <span className="text-[10px] font-bold text-brand-600 tracking-wider uppercase">STAGE 3</span>
              <span className="text-sm font-semibold text-brand-600 mt-1">จัดการเอกสาร</span>
              <span className="text-xs text-ink-400 mt-0.5 leading-relaxed">ตรวจสอบความครบถ้วน</span>
            </div>
            <div className="flex flex-col px-2 md:pl-5">
              <span className="text-[10px] font-bold text-ink-300 tracking-wider uppercase">STAGE 4</span>
              <span className="text-sm font-semibold text-ink-800 mt-1">ใบสรุปจ่าย</span>
              <span className="text-xs text-ink-400 mt-0.5 leading-relaxed">รวมไฟล์ · ขอเลข ERP</span>
            </div>
            <div className="flex flex-col px-2 md:pl-5">
              <span className="text-[10px] font-bold text-ink-300 tracking-wider uppercase">STAGE 5</span>
              <span className="text-sm font-semibold text-ink-800 mt-1">ส่งมอบ</span>
              <span className="text-xs text-ink-400 mt-0.5 leading-relaxed">Token Link · อีเมล</span>
            </div>
          </div>
        </div>
      </Card>

      {/* System Integration Architecture Section */}
      <Card>
        <div className="flex items-center justify-between border-b border-line-soft px-5 py-4">
          <h3 className="text-base font-semibold text-ink-800">สถาปัตยกรรมเชื่อมต่อระบบ</h3>
          <button className="flex items-center gap-1 rounded border border-line bg-canvas px-2.5 py-1 text-xs font-medium text-ink-500 hover:bg-line-soft transition-colors shadow-sm">
            <span>Integration Map</span>
            <ExternalLink size={12} />
          </button>
        </div>
        <div className="p-5">
          <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
            {/* Block 1 */}
            <div className="flex-1 rounded-xl border border-dashed border-[#f5b87b] bg-[#fdf8f2] p-4 flex items-start gap-3">
              <div className="rounded-lg bg-[#fae3cc] p-2 text-[#b26a00] shrink-0">
                <Database size={20} />
              </div>
              <div className="min-w-0">
                <h4 className="text-sm font-bold text-[#8a5d3b] leading-snug">SIS / HIS (DXC)</h4>
                <p className="text-xs text-[#a07b5a] mt-1 leading-relaxed">ระบบเก่า · ไม่มี API · ใช้ Print-to-PDF + OCR</p>
              </div>
            </div>

            {/* Arrow 1 */}
            <div className="flex flex-col items-center justify-center shrink-0 text-center px-1">
              <span className="text-[10px] font-semibold text-ink-400 tracking-wide">Ctrl+P + Share Drive</span>
              <ArrowRight size={18} className="text-ink-300 mt-0.5 rotate-90 md:rotate-0" />
            </div>

            {/* Block 2 */}
            <div className="flex-1 rounded-xl border border-brand-500/20 bg-brand-50/20 p-4 flex items-start gap-3">
              <div className="rounded-lg bg-brand-100 p-2 text-brand-600 shrink-0">
                <Cpu size={20} />
              </div>
              <div className="min-w-0">
                <h4 className="text-sm font-bold text-brand-700 leading-snug">ClaimFlow</h4>
                <p className="text-xs text-brand-600 mt-1 leading-relaxed">OCR จับคู่ HN · จัดกลุ่ม · เซ็นดิจิทัล · ใบสรุปจ่าย</p>
              </div>
            </div>

            {/* Arrow 2 */}
            <div className="flex flex-col items-center justify-center shrink-0 text-center px-1">
              <span className="text-[10px] font-semibold text-ink-400 tracking-wide">REST API</span>
              <ArrowRight size={18} className="text-ink-300 mt-0.5 rotate-90 md:rotate-0" />
            </div>

            {/* Block 3 */}
            <div className="flex-1 rounded-xl border border-line bg-slate-50/80 p-4 flex items-start gap-3">
              <div className="rounded-lg bg-slate-200 p-2 text-slate-600 shrink-0">
                <Server size={20} />
              </div>
              <div className="min-w-0">
                <h4 className="text-sm font-bold text-slate-800 leading-snug">ERP (NetSuite)</h4>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">ส่งข้อมูล — รับเลขใบสรุปจ่าย (Reference No.)</p>
              </div>
            </div>
          </div>

          {/* Banner */}
          <div className="mt-5 flex items-start gap-2.5 rounded-lg border border-[#d2ebeb] bg-[#eef8f8] p-3.5 text-xs text-[#0a5f5e] shadow-sm">
            <Info size={16} className="shrink-0 mt-0.5 text-brand-500" />
            <p className="leading-relaxed">
              เนื่องจาก SIS ไม่มี API ระบบใช้วิธี <strong className="font-semibold">ดึงไฟล์ PDF ที่พิมพ์ (Ctrl+P)</strong> เข้าสู่ Share Drive แล้วใช้ OCR ดึงเลข HN เพื่อจับคู่เอกสารกับผู้ป่วยโดยอัตโนมัติ
            </p>
          </div>
        </div>
      </Card>

      {/* Recent List Card */}
      <Card>
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-line-soft px-5 py-4">
          <h3 className="text-base font-semibold text-ink-800">รายการล่าสุด</h3>
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
            <button className="rounded-lg border border-line bg-canvas px-3 py-1.5 text-xs font-semibold text-ink-600 hover:bg-line-soft transition-colors shadow-sm">
              Recent
            </button>
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
                    <td className="px-5 py-3.5 font-semibold text-ink-700">{p.hn}</td>
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
              className="rounded-lg border border-line bg-white px-3 py-1.5 font-semibold text-ink-600 hover:bg-canvas disabled:opacity-40 disabled:hover:bg-white transition-colors shadow-sm"
            >
              &lt; ก่อนหน้า
            </button>
            <span className="px-2 font-medium text-ink-500">
              หน้า {page} / {totalPages}
            </span>
            <button
              disabled={page >= totalPages}
              onClick={() => setPage((p) => p + 1)}
              className="rounded-lg border border-line bg-white px-3 py-1.5 font-semibold text-ink-600 hover:bg-canvas disabled:opacity-40 disabled:hover:bg-white transition-colors shadow-sm"
            >
              ถัดไป &gt;
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
      className={`rounded-xl border px-5 py-[18px] shadow-card transition-all duration-200 ${
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
