import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Building2, Download, FileText, LogOut, ShieldAlert, X } from "lucide-react";
import { useAppData } from "../../context/AppDataContext";
import { formatCurrency, formatThaiDateTime } from "../../lib/mockData";

export function InsurerDownload() {
  const [params] = useSearchParams();
  const token = params.get("token") ?? "";
  const navigate = useNavigate();
  const { findDeliveryLinkByToken, patients, batches, recordDownloadAttempt } = useAppData();
  const [downloaded, setDownloaded] = useState(false);
  interface ClaimReview {
    status: "รอดำเนินการ" | "ตรวจสอบแล้ว" | "ตีกลับ";
    remark?: string;
    rejectedDocs?: string[];
  }

  const [reviews, setReviews] = useState<Record<string, ClaimReview>>(() => ({
    "HN 6604190": { status: "ตรวจสอบแล้ว" },
    "HN 6604484": {
      status: "ตีกลับ",
      remark: "เอกสารสแกนไม่ชัดเจน กรุณาสแกนบัตรประชาชนใหม่",
      rejectedDocs: ["สำเนาบัตรประชาชน"],
    },
    "HN 6604519": { status: "รอดำเนินการ" },
  }));

  const getReview = (hn: string): ClaimReview => reviews[hn] || { status: "รอดำเนินการ" };

  const getStatusLabel = (p: any) => {
    const r = getReview(p.hn);
    if (r.status !== "ตีกลับ") return r.status;
    const docs = r.rejectedDocs || [];
    if (docs.length === 0) return "ตีกลับ";
    if (docs.length === p.documents.length) return "ตีกลับทั้งหมด";
    if (docs.length === 1) return `ตีกลับ - ${docs[0]}`;
    return `ตีกลับ - ${docs[0]} +${docs.length - 1}`;
  };

  // Reject modal states
  const [rejectingPatient, setRejectingPatient] = useState<any | null>(null);
  const [selectedDocs, setSelectedDocs] = useState<string[]>([]);
  const [rejectReason, setRejectReason] = useState("");

  // Toast notification state
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => setToastMessage(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toastMessage]);

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

  const pendingCount = batchPatients.filter((p) => getReview(p.hn).status === "รอดำเนินการ").length;
  const rejectedCount = batchPatients.filter((p) => getReview(p.hn).status === "ตีกลับ").length;
  const approvedCount = batchPatients.filter((p) => getReview(p.hn).status === "ตรวจสอบแล้ว").length;

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
                      <th className="px-5 py-3.5 font-medium">Remark</th>
                      <th className="px-5 py-3.5 font-medium">สถานะ</th>
                      <th className="px-5 py-3.5 font-medium text-right">การดำเนินการ</th>
                    </tr>
                  </thead>
                  <tbody>
                    {batchPatients.map((p) => {
                      const review = getReview(p.hn);
                      const status = review.status;
                      const statusLabel = getStatusLabel(p);
                      return (
                        <tr key={p.hn} className="border-b border-line-soft last:border-0 hover:bg-canvas/30 transition-colors">
                          <td className="px-5 py-4 font-mono text-ink-700">{p.hn}</td>
                          <td className="px-5 py-4 font-medium text-ink-800">{p.name}</td>
                          <td className="px-5 py-4 text-ink-600">{p.documents.length} ไฟล์</td>
                          <td className="px-5 py-4 font-medium text-ink-700">{formatCurrency(p.claimValue)}</td>
                          <td className="px-5 py-4 text-ink-500 max-w-[200px] truncate" title={review.remark}>
                            {review.remark || "-"}
                          </td>
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
                              {statusLabel}
                            </span>
                          </td>
                          <td className="px-5 py-4 text-right">
                            <div className="flex justify-end gap-2">
                              {status === "รอดำเนินการ" ? (
                                <>
                                  <button
                                    onClick={() => setReviews((prev) => ({ ...prev, [p.hn]: { status: "ตรวจสอบแล้ว" } }))}
                                    className="rounded-lg bg-status-ready-bg hover:bg-status-ready-bg/85 px-3 py-1.5 text-xs font-semibold text-status-ready-fg transition-colors"
                                  >
                                    อนุมัติ
                                  </button>
                                  <button
                                    onClick={() => {
                                      setRejectingPatient(p);
                                      setSelectedDocs([]);
                                      setRejectReason("");
                                    }}
                                    className="rounded-lg bg-status-danger-bg hover:bg-status-danger-bg/85 px-3 py-1.5 text-xs font-semibold text-status-danger-fg transition-colors"
                                  >
                                    ตีกลับ
                                  </button>
                                </>
                              ) : (
                                <button
                                  onClick={() => setReviews((prev) => ({ ...prev, [p.hn]: { status: "รอดำเนินการ" } }))}
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

      {/* Reject Modal */}
      {rejectingPatient && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="relative max-w-md w-full rounded-xl bg-white p-6 shadow-2xl animate-fade-in">
            <div className="mb-4 flex items-center justify-between border-b border-line-soft pb-3">
              <div>
                <h3 className="text-base font-semibold text-ink-800">ปฏิเสธ / ตีกลับเอกสารเคลม</h3>
                <p className="text-xs text-ink-400 mt-0.5">{rejectingPatient.name} ({rejectingPatient.hn})</p>
              </div>
              <button
                onClick={() => setRejectingPatient(null)}
                className="rounded-lg p-1.5 text-ink-400 hover:bg-line-soft hover:text-ink-600 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-4">
              {/* Document Selection */}
              <div>
                <label className="mb-2 block text-xs font-semibold text-ink-600">เลือกเอกสารที่มีปัญหา / ตีกลับ</label>
                <div className="space-y-2 rounded-lg border border-line p-3 max-h-40 overflow-y-auto">
                  {rejectingPatient.documents.map((d: any) => (
                    <label key={d.id} className="flex items-center gap-2 text-xs text-ink-700 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedDocs.includes(d.kind)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedDocs((prev) => [...prev, d.kind]);
                          } else {
                            setSelectedDocs((prev) => prev.filter((x) => x !== d.kind));
                          }
                        }}
                        className="rounded border-line text-brand-600 focus:ring-brand-500"
                      />
                      <span>{d.kind}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Reason Input */}
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-ink-600">ระบุเหตุผลในการตีกลับ</label>
                <textarea
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  placeholder="กรุณาระบุรายละเอียด เช่น ภาพถ่ายบัตรไม่ชัดเจน หรือ ข้อมูลส่วนลดไม่ถูกต้อง..."
                  rows={3}
                  className="w-full rounded-lg border border-line px-3 py-2 text-xs text-ink-800 placeholder:text-ink-300 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
                />
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3 border-t border-line-soft pt-4">
              <button
                onClick={() => setRejectingPatient(null)}
                className="rounded-lg border border-line bg-white px-4 py-2 text-xs font-medium text-ink-600 hover:bg-line-soft"
              >
                ยกเลิก
              </button>
              <button
                onClick={() => {
                  setReviews((prev) => ({
                    ...prev,
                    [rejectingPatient.hn]: {
                      status: "ตีกลับ",
                      remark: rejectReason.trim() || undefined,
                      rejectedDocs: selectedDocs.length > 0 ? selectedDocs : undefined,
                    },
                  }));
                  setRejectingPatient(null);
                  setToastMessage("ตีกลับเอกสารสำเร็จ");
                }}
                className="rounded-lg bg-[#fae8ff] px-4 py-2 text-xs font-semibold text-[#a21caf] hover:bg-[#f5d0fe] shadow-sm transition-colors"
              >
                ยืนยันการตีกลับ
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-[60] flex items-center gap-2 rounded-lg bg-status-ready-bg border border-status-ready-fg/30 px-4 py-3 text-xs font-semibold text-status-ready-fg shadow-lg animate-fade-in">
          <span className="inline-block size-1.5 rounded-full bg-status-ready-fg animate-pulse" />
          {toastMessage}
        </div>
      )}
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
