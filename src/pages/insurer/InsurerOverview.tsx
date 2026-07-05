import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Building2, LogOut, ArrowRight } from "lucide-react";
import { Card, PageHeader } from "../../components/PageHeader";
import { useAppData } from "../../context/AppDataContext";
import { formatThaiDateTime } from "../../lib/mockData";

export function InsurerOverview() {
  const navigate = useNavigate();
  const { deliveryLinks, batches } = useAppData();
  const authed = typeof window !== "undefined" && sessionStorage.getItem("insurer_authed") === "1";

  useEffect(() => {
    if (!authed) {
      navigate("/insurer/login", { replace: true });
    }
  }, [authed, navigate]);

  if (!authed) return null;

  const totalLinks = deliveryLinks.length;
  const expiredCount = deliveryLinks.filter((l) => new Date(l.expiresAt).getTime() < Date.now()).length;
  const activeCount = totalLinks - expiredCount;

  return (
    <div className="min-h-screen bg-canvas pb-12">
      <header className="flex items-center justify-between border-b border-line-soft bg-white px-6 py-4">
        <div className="flex items-center gap-2.5">
          <div className="flex size-9 items-center justify-center rounded-lg bg-indigo-600 text-white">
            <Building2 size={17} />
          </div>
          <span className="text-sm font-medium text-ink-800">ClaimFlow — พอร์ทัลบริษัทประกัน</span>
        </div>
        <button
          onClick={() => {
            sessionStorage.removeItem("insurer_authed");
            navigate("/insurer/login");
          }}
          className="flex items-center gap-1.5 text-sm text-ink-400 hover:text-ink-600"
        >
          <LogOut size={15} /> ออกจากระบบ
        </button>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-8 space-y-6">
        <PageHeader
          title="ภาพรวมชุดเอกสารเคลมประกัน"
          subtitle="รายการชุดเอกสารเคลมทั้งหมดที่ส่งมาจากโรงพยาบาลศิครินทร์ ตรวจสอบรายละเอียดและจัดการสถานะการจ่ายเงินเคลม"
        />

        {/* Stats Cards Section */}
        <div className="rounded-2xl bg-[#fafaf8] p-4 border border-line/60">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <StatCard
              label="ชุดเอกสารที่ได้รับทั้งหมด"
              value={totalLinks}
              pillLabel="รายการทั้งหมดในระบบ"
              pillClass="bg-indigo-50 text-indigo-700"
            />
            <StatCard
              label="หมดอายุการดาวน์โหลด"
              value={expiredCount}
              pillLabel="จำเป็นต้องขอลิงก์ใหม่"
              pillClass="bg-status-danger-bg text-status-danger-fg"
            />
            <StatCard
              label="พร้อมเปิดพิจารณาเคลม"
              value={activeCount}
              pillLabel="ลิงก์ยังไม่หมดอายุ"
              pillClass="bg-status-ready-bg text-status-ready-fg"
              highlight
            />
          </div>
        </div>

        {/* Batches Table Card Section */}
        <div className="rounded-xl border border-line bg-white shadow-card overflow-hidden">
          <div className="border-b border-line-soft px-5 py-4">
            <h3 className="text-base font-medium text-ink-800">รายการชุดเอกสารเคลมจากโรงพยาบาล</h3>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-line-soft text-left text-xs text-ink-300 bg-slate-50/50">
                  <th className="px-5 py-3.5 font-medium">รหัสชุดเอกสาร</th>
                  <th className="px-5 py-3.5 font-medium">เลขใบสรุปจ่าย (ERP)</th>
                  <th className="px-5 py-3.5 font-medium">วันที่ส่งมอบ</th>
                  <th className="px-5 py-3.5 font-medium">หมดอายุ</th>
                  <th className="px-5 py-3.5 font-medium">สถานะลิงก์</th>
                  <th className="px-5 py-3.5 font-medium text-right">การดำเนินการ</th>
                </tr>
              </thead>
              <tbody>
                {deliveryLinks.map((l) => {
                  const batch = batches.find((b) => b.id === l.batchId);
                  const expired = new Date(l.expiresAt).getTime() < Date.now();
                  return (
                    <tr key={l.id} className="border-b border-line-soft last:border-0 hover:bg-canvas/30 transition-colors">
                      <td className="px-5 py-4 font-semibold text-brand-600">
                        <button
                          onClick={() => navigate(`/insurer/download?token=${l.token}`)}
                          className="hover:underline text-left font-mono"
                        >
                          {l.batchId}
                        </button>
                      </td>
                      <td className="px-5 py-4 font-mono text-ink-700">{batch?.referenceNumber ?? "-"}</td>
                      <td className="px-5 py-4 text-ink-600">{formatThaiDateTime(l.createdAt)}</td>
                      <td className="px-5 py-4 text-ink-500">{formatThaiDateTime(l.expiresAt)}</td>
                      <td className="px-5 py-4">
                        <span
                          className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-medium ${
                            expired
                              ? "bg-status-danger-bg text-status-danger-fg"
                              : "bg-status-ready-bg text-status-ready-fg"
                          }`}
                        >
                          {expired ? "หมดอายุ" : "ใช้งานได้"}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-right">
                        <button
                          onClick={() => navigate(`/insurer/download?token=${l.token}`)}
                          disabled={expired}
                          className="inline-flex items-center gap-1 text-xs font-semibold text-brand-600 hover:underline disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                          ตรวจสอบเอกสาร <ArrowRight size={13} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </main>
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
