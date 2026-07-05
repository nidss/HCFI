import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Building2, Download, FileText, LogOut, ShieldAlert } from "lucide-react";
import { useAppData } from "../../context/AppDataContext";
import { formatCurrency, formatThaiDateTime } from "../../lib/mockData";

export function InsurerDownload() {
  const [params] = useSearchParams();
  const token = params.get("token") ?? "";
  const navigate = useNavigate();
  const { findDeliveryLinkByToken, patients, batches, recordDownloadAttempt } = useAppData();
  const [downloaded, setDownloaded] = useState(false);
  const [statuses, setStatuses] = useState<Record<string, "รอดำเนินการ" | "ตรวจสอบแล้ว" | "ตีกลับ">>(() => ({
    "HN 6604190": "ตรวจสอบแล้ว",
    "HN 6604484": "ตีกลับ",
    "HN 6604519": "รอดำเนินการ",
  }));

  const getStatus = (hn: string) => statuses[hn] || "รอดำเนินการ";

  const link = findDeliveryLinkByToken(token);
  const authed = typeof window !== "undefined" && sessionStorage.getItem("insurer_authed") === "1";
  const expired = link ? new Date(link.expiresAt).getTime() < Date.now() : false;
  const batch = link ? batches.find((b) => b.id === link.batchId) : undefined;
  const batchPatients = batch ? patients.filter((p) => batch.hns.includes(p.hn)) : [];

  useEffect(() => {
    if (!link || !authed) {
      navigate(`/insurer/login?token=${token}`, { replace: true });
    }
  }, [link, authed, navigate, token]);

  if (!link || !authed) return null;

  const pendingCount = batchPatients.filter((p) => getStatus(p.hn) === "รอดำเนินการ").length;
  const rejectedCount = batchPatients.filter((p) => getStatus(p.hn) === "ตีกลับ").length;
  const approvedCount = batchPatients.filter((p) => getStatus(p.hn) === "ตรวจสอบแล้ว").length;

  function handleDownload() {
    if (!batch) return;
    const lines = [
      `ClaimFlow — ชุดเอกสารเคลมประกัน`,
      `รหัสชุดเอกสาร: ${batch.id}`,
      `เลขใบสรุปจ่าย (ERP Reference): ${batch.referenceNumber}`,
      `มูลค่ารวม: ${formatCurrency(batch.totalValue)}`,
      ``,
      `รายชื่อผู้ป่วย:`,
      ...batchPatients.map((p) => `- ${p.hn} ${p.name} (${formatCurrency(p.claimValue)})`),
    ];
    const blob = new Blob([lines.join("\n")], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${batch.id}_package.txt`;
    a.click();
    URL.revokeObjectURL(url);
    recordDownloadAttempt(token, true);
    setDownloaded(true);
  }

  return (
    <div className="min-h-screen bg-canvas pb-12">
      <header className="flex items-center justify-between border-b border-line-soft bg-white px-6 py-4">
        <div className="flex items-center gap-2.5">
          <div className="flex size-9 items-center justify-center rounded-lg bg-indigo-600 text-white">
            <Building2 size={17} />
          </div>
          <button
            onClick={() => navigate("/insurer/overview")}
            className="text-sm font-medium text-ink-800 hover:text-brand-600 transition-colors"
          >
            ClaimFlow — พอร์ทัลบริษัทประกัน
          </button>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate("/insurer/overview")}
            className="text-xs font-semibold text-brand-600 hover:underline"
          >
            กลับหน้าภาพรวม
          </button>
          <button
            onClick={() => {
              sessionStorage.removeItem("insurer_authed");
              navigate("/insurer/login");
            }}
            className="flex items-center gap-1.5 text-sm text-ink-400 hover:text-ink-600"
          >
            <LogOut size={15} /> ออกจากระบบ
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-8 space-y-6">
        {expired ? (
          <div className="flex items-start gap-2 rounded-lg bg-status-danger-bg p-4 text-sm text-status-danger-fg">
            <ShieldAlert size={16} className="mt-0.5 shrink-0" />
            ลิงก์ดาวน์โหลดนี้หมดอายุแล้ว กรุณาติดต่อโรงพยาบาลเพื่อขอลิงก์ใหม่
          </div>
        ) : (
          <>
            {/* Header info */}
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="text-xs font-semibold text-brand-600 uppercase tracking-wide">ข้อมูลชุดเอกสารรับเข้า</p>
                <h1 className="text-2xl font-bold text-ink-800 mt-1">{batch?.id}</h1>
                <p className="text-xs text-ink-400 mt-1">
                  เลขใบสรุปจ่าย (ERP): <span className="font-mono">{batch?.referenceNumber}</span> · ลิงก์หมดอายุ: {formatThaiDateTime(link.expiresAt)}
                </p>
              </div>
              <div className="flex items-center gap-4 text-xs text-ink-500 bg-white border border-line-soft rounded-lg px-4 py-2.5 shadow-sm">
                <div>
                  <span className="text-ink-300">จำนวนครั้งที่ดาวน์โหลด:</span>{" "}
                  <span className="font-semibold text-ink-700">{link.attempts.filter((a) => a.success).length} ครั้ง</span>
                </div>
              </div>
            </div>

            {/* KPI Cards Section */}
            <div className="rounded-2xl bg-[#fafaf8] p-4 border border-line/60">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <StatCard
                  label="เอกสารรอดำเนินการวันนี้"
                  value={pendingCount}
                  pillLabel="รอตรวจสอบเคลม"
                  pillClass="bg-status-waiting-bg text-status-waiting-fg"
                />
                <StatCard
                  label="เอกสารตีกลับ"
                  value={rejectedCount}
                  pillLabel="ส่งคืนให้รพ.แก้ไข"
                  pillClass="bg-status-danger-bg text-status-danger-fg"
                />
                <StatCard
                  label="เอกสารตรวจสอบแล้ว"
                  value={approvedCount}
                  pillLabel="อนุมัติจ่ายเคลมสำเร็จ"
                  pillClass="bg-status-ready-bg text-status-ready-fg"
                  highlight
                />
              </div>
            </div>

            {/* Patients Table Card Section */}
            <div className="rounded-xl border border-line bg-white shadow-card overflow-hidden">
              <div className="flex flex-wrap items-center justify-between gap-4 border-b border-line-soft px-5 py-4">
                <h3 className="text-base font-medium text-ink-800">รายการเคลมผู้ป่วย</h3>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleDownload}
                    className="flex items-center gap-1.5 rounded-lg bg-brand-600 px-4 py-2 text-xs font-medium text-white hover:bg-brand-700 shadow-sm transition-colors"
                  >
                    <Download size={13} /> ดาวน์โหลดชุดเอกสาร (Package)
                  </button>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-line-soft text-left text-xs text-ink-300 bg-slate-50/50">
                      <th className="px-5 py-3.5 font-medium">HN</th>
                      <th className="px-5 py-3.5 font-medium">ชื่อผู้ป่วย</th>
                      <th className="px-5 py-3.5 font-medium">จำนวนเอกสาร</th>
                      <th className="px-5 py-3.5 font-medium">มูลค่าเคลม</th>
                      <th className="px-5 py-3.5 font-medium">สถานะ</th>
                      <th className="px-5 py-3.5 font-medium text-right">การดำเนินการ</th>
                    </tr>
                  </thead>
                  <tbody>
                    {batchPatients.map((p) => {
                      const status = getStatus(p.hn);
                      return (
                        <tr key={p.hn} className="border-b border-line-soft last:border-0 hover:bg-canvas/30 transition-colors">
                          <td className="px-5 py-4 font-mono text-ink-700">{p.hn}</td>
                          <td className="px-5 py-4 font-medium text-ink-800">{p.name}</td>
                          <td className="px-5 py-4 text-ink-600">{p.documents.length} ไฟล์</td>
                          <td className="px-5 py-4 font-medium text-ink-700">{formatCurrency(p.claimValue)}</td>
                          <td className="px-5 py-4">
                            <span
                              className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-medium ${
                                status === "ตรวจสอบแล้ว"
                                  ? "bg-status-ready-bg text-status-ready-fg"
                                  : status === "ตีกลับ"
                                  ? "bg-status-danger-bg text-status-danger-fg"
                                  : "bg-status-waiting-bg text-status-waiting-fg"
                              }`}
                            >
                              {status}
                            </span>
                          </td>
                          <td className="px-5 py-4 text-right">
                            <div className="flex justify-end gap-2">
                              {status === "รอดำเนินการ" ? (
                                <>
                                  <button
                                    onClick={() => setStatuses((prev) => ({ ...prev, [p.hn]: "ตรวจสอบแล้ว" }))}
                                    className="rounded-lg bg-status-ready-bg hover:bg-status-ready-bg/85 px-3 py-1.5 text-xs font-semibold text-status-ready-fg transition-colors"
                                  >
                                    อนุมัติ
                                  </button>
                                  <button
                                    onClick={() => setStatuses((prev) => ({ ...prev, [p.hn]: "ตีกลับ" }))}
                                    className="rounded-lg bg-status-danger-bg hover:bg-status-danger-bg/85 px-3 py-1.5 text-xs font-semibold text-status-danger-fg transition-colors"
                                  >
                                    ตีกลับ
                                  </button>
                                </>
                              ) : (
                                <button
                                  onClick={() => setStatuses((prev) => ({ ...prev, [p.hn]: "รอดำเนินการ" }))}
                                  className="rounded-lg border border-line bg-white hover:bg-line-soft px-3 py-1.5 text-xs font-medium text-ink-600 transition-colors shadow-sm"
                                >
                                  แก้ไขสถานะ
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {downloaded && (
                <div className="border-t border-line-soft bg-status-ready-bg/10 px-5 py-3 text-center text-xs text-status-ready-fg">
                  ดาวน์โหลดชุดเอกสารสำเร็จ ระบบได้บันทึกความพยายามลงใน Audit Log ของระบบโรงพยาบาลแล้ว
                </div>
              )}
            </div>
          </>
        )}
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
