import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Building2, Download, FileText, LogOut, ShieldAlert, X, ArrowLeft, RotateCcw } from "lucide-react";
import { useAppData } from "../../context/AppDataContext";
import { formatCurrency, formatThaiDateTime } from "../../lib/mockData";

function getDocImage(kind: string): string {
  if (kind.includes("บัตรประชาชน")) {
    return "idcard.png";
  }
  if (kind.includes("Invoice") || kind.includes("ใบเสร็จรับเงิน")) {
    return "https://nidss.github.io/HCFI/example_docs/hospital_document_mockups_Page_13.jpg";
  }
  if (kind.includes("ใบรับรองแพทย์")) {
    return "https://nidss.github.io/HCFI/example_docs/hospital_document_mockups_Page_04.jpg";
  }
  if (kind.includes("ยินยอม")) {
    return "https://nidss.github.io/HCFI/example_docs/hospital_document_mockups_Page_05.jpg";
  }
  return "https://nidss.github.io/HCFI/example_docs/hospital_document_mockups_Page_06.jpg";
}

export function InsurerDownload() {
  const [params] = useSearchParams();
  const token = params.get("token") ?? "";
  const navigate = useNavigate();
  const { findDeliveryLinkByToken, patients, batches, recordDownloadAttempt } = useAppData();
  const [downloaded, setDownloaded] = useState(false);
  const [activePatientHn, setActivePatientHn] = useState<string | null>(null);
  const [viewingDoc, setViewingDoc] = useState<any | null>(null);
  const [rejectingDoc, setRejectingDoc] = useState<any | null>(null);
  const [docRejectReason, setDocRejectReason] = useState("");
  const [showConfirmApprove, setShowConfirmApprove] = useState(false);
  const [showConfirmReject, setShowConfirmReject] = useState(false);

  // Toast notification state
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Active tooltip state
  const [activeTooltipHn, setActiveTooltipHn] = useState<string | null>(null);

  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => setToastMessage(null), 4000);
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

  const [docReviews, setDocReviews] = useState<Record<string, { status: "อนุมัติแล้ว" | "ตีกลับ" | "รอดำเนินการ"; remark?: string }>>(() => {
    const initial: Record<string, { status: "อนุมัติแล้ว" | "ตีกลับ" | "รอดำเนินการ"; remark?: string }> = {};
    
    // For HN 6604190: all documents are approved
    const p190 = batchPatients.find(p => p.hn === "HN 6604190");
    if (p190) {
      p190.documents.forEach(d => {
        initial[d.id] = { status: "อนุมัติแล้ว" };
      });
    }

    // For HN 6604484: "สำเนาบัตรประชาชน" (or similar ID card document) is rejected, others are approved
    const p484 = batchPatients.find(p => p.hn === "HN 6604484");
    if (p484) {
      p484.documents.forEach(d => {
        if (d.kind.includes("บัตรประชาชน")) {
          initial[d.id] = { 
            status: "ตีกลับ", 
            remark: "เอกสารสแกนไม่ชัดเจน กรุณาสแกนบัตรประชาชนใหม่" 
          };
        } else {
          initial[d.id] = { status: "อนุมัติแล้ว" };
        }
      });
    }
    
    return initial;
  });

  if (!link || !authed) return null;

  const getPatientReview = (patientHn: string) => {
    const p = batchPatients.find(x => x.hn === patientHn);
    if (!p) return { status: "รอดำเนินการ" as const };
    
    const docs = p.documents;
    if (docs.length === 0) return { status: "รอดำเนินการ" as const };

    const docStatuses = docs.map(d => docReviews[d.id] || { status: "รอดำเนินการ" });
    const hasRejected = docStatuses.some(ds => ds.status === "ตีกลับ");
    const allApproved = docStatuses.every(ds => ds.status === "อนุมัติแล้ว");

    if (hasRejected) {
      const rejectedDocs = docs.filter(d => (docReviews[d.id]?.status === "ตีกลับ")).map(d => d.kind);
      const remarks = docs
        .filter(d => docReviews[d.id]?.status === "ตีกลับ" && docReviews[d.id]?.remark)
        .map(d => `${d.kind}: ${docReviews[d.id]?.remark}`)
        .join("; ");
      return {
        status: "ตีกลับ" as const,
        remark: remarks || "มีเอกสารถูกตีกลับ",
        rejectedDocs,
      };
    }

    if (allApproved) {
      return { status: "ตรวจสอบแล้ว" as const };
    }

    return { status: "รอดำเนินการ" as const };
  };

  const getStatusLabel = (p: any) => {
    const r = getPatientReview(p.hn);
    if (r.status !== "ตีกลับ") return r.status;
    const docs = r.rejectedDocs || [];
    if (docs.length === 0) return "ตีกลับ";
    if (docs.length === p.documents.length) return "ตีกลับทั้งหมด";
    if (docs.length === 1) return `ตีกลับ - ${docs[0]}`;
    return `ตีกลับ - ${docs[0]} +${docs.length - 1}`;
  };

  const getStatusTooltip = (p: any) => {
    const r = getPatientReview(p.hn);
    if (r.status !== "ตีกลับ") return undefined;
    const docs = r.rejectedDocs || [];
    if (docs.length === 0) return "ตีกลับ";
    return `เอกสารที่ตีกลับ:\n${docs.map((d) => `• ${d}`).join("\n")}`;
  };

  const pendingCount = batchPatients.filter((p) => getPatientReview(p.hn).status === "รอดำเนินการ").length;
  const rejectedCount = batchPatients.filter((p) => getPatientReview(p.hn).status === "ตีกลับ").length;
  const approvedCount = batchPatients.filter((p) => getPatientReview(p.hn).status === "ตรวจสอบแล้ว").length;

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
      {/* Custom Styles to make scrollbar always visible */}
      <style>{`
        .force-scrollbar {
          overflow-x: scroll !important;
        }
        .force-scrollbar::-webkit-scrollbar {
          height: 12px !important;
          display: block !important;
        }
        .force-scrollbar::-webkit-scrollbar-track {
          background: #e2e8f0 !important;
          border-radius: 999px !important;
        }
        .force-scrollbar::-webkit-scrollbar-thumb {
          background-color: #94a3b8 !important;
          border: 3px solid #e2e8f0 !important;
          border-radius: 999px !important;
        }
      `}</style>

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
        ) : activePatientHn ? (() => {
                const activePatient = batchPatients.find((p) => p.hn === activePatientHn);
                if (!activePatient) return null;
                return (
                  <div className="space-y-6">
                    {/* Back Button */}
                    <div className="flex items-center justify-between">
                      <button
                        onClick={() => setActivePatientHn(null)}
                        className="flex items-center gap-2 text-ink-500 hover:text-ink-900 transition-colors py-2 text-sm font-semibold font-['Prompt'] cursor-pointer"
                      >
                        <ArrowLeft size={16} />
                        <span>กลับไปหน้ารวมชุดเอกสาร</span>
                      </button>
                    </div>

                    {/* Patient Card */}
                    <div className="bg-white border border-line rounded-2xl p-6 shadow-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                      <div>
                        <span className="text-xs font-semibold text-brand-600 uppercase tracking-wide font-['Prompt']">
                          แฟ้มเอกสารผู้ป่วย
                        </span>
                        <h2 className="text-2xl font-bold text-ink-800 mt-1 font-['Prompt']">{activePatient.name}</h2>
                        <p className="text-xs text-ink-400 mt-1 font-['Prompt']">
                          HN: <span className="font-mono font-medium">{activePatient.hn}</span> · เลขบัตรประชาชน: {activePatient.nationalId.replace(/(\d{1})(\d{4})(\d{5})(\d{2})(\d{1})/, "$1-$2-$3-$4-$5")}
                        </p>
                      </div>
                      
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => {
                            const lines = [
                              `ดาวน์โหลดเอกสารทั้งหมดของคนไข้: ${activePatient.name} (${activePatient.hn})`,
                              `จำนวนเอกสาร: ${activePatient.documents.length} รายการ`,
                              ``,
                              ...activePatient.documents.map((d) => `- ${d.kind}: ${d.fileName} (${docReviews[d.id]?.status || "รอดำเนินการ"})`),
                            ];
                            const blob = new Blob([lines.join("\n")], { type: "text/plain;charset=utf-8" });
                            const url = URL.createObjectURL(blob);
                            const a = document.createElement("a");
                            a.href = url;
                            a.download = `documents_${activePatient.hn}.txt`;
                            a.click();
                            URL.revokeObjectURL(url);
                            setToastMessage(`ดาวน์โหลดเอกสารทั้งหมดของ ${activePatient.name} สำเร็จ`);
                          }}
                          className="flex items-center gap-1.5 rounded-lg border border-line bg-white hover:bg-line-soft px-3 py-2 text-xs font-semibold text-ink-600 transition-colors shadow-sm cursor-pointer font-['Prompt'] mr-2"
                        >
                          <Download size={13} />
                          <span>ดาวน์โหลดเอกสารทั้งหมด</span>
                        </button>
                        <div className="text-right">
                          <p className="text-[10px] font-semibold text-ink-400 uppercase font-['Prompt']">ยอดรวมค่าเคลม</p>
                          <p className="text-lg font-bold text-ink-800 font-['Prompt']">{formatCurrency(activePatient.claimValue)}</p>
                        </div>
                        <div className="border-l border-line-soft h-8 mx-2" />
                        <div>
                          <p className="text-[10px] font-semibold text-ink-400 uppercase mb-1 font-['Prompt']">สถานะแฟ้มเอกสาร</p>
                          {(() => {
                            const r = getPatientReview(activePatient.hn);
                            return (
                              <span
                                className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-medium font-['Prompt'] ${
                                  r.status === "ตรวจสอบแล้ว"
                                    ? "bg-status-ready-bg text-status-ready-fg"
                                    : r.status === "ตีกลับ"
                                    ? "bg-status-danger-bg text-status-danger-fg"
                                    : "bg-status-waiting-bg text-status-waiting-fg"
                                }`}
                              >
                                {r.status === "ตรวจสอบแล้ว" ? "อนุมัติแล้ว" : r.status === "ตีกลับ" ? "ตีกลับ" : "รอดำเนินการ"}
                              </span>
                            );
                          })()}
                        </div>
                      </div>
                    </div>

                    {/* Documents Table */}
                    <div className="rounded-xl border border-line bg-white shadow-card overflow-hidden">
                      <div className="border-b border-line-soft px-5 py-4 bg-slate-50/50">
                        <h3 className="text-sm font-semibold text-ink-800 font-['Prompt']">รายการเอกสารแนบเพื่อตรวจสอบเคลม</h3>
                      </div>
                      
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="border-b border-line-soft text-left text-xs text-ink-300 bg-slate-50/20">
                              <th className="px-5 py-3.5 font-medium font-['Prompt']">ชนิดเอกสาร</th>
                              <th className="px-5 py-3.5 font-medium font-['Prompt']">ชื่อไฟล์เอกสาร</th>
                              <th className="px-5 py-3.5 font-medium w-[140px] whitespace-nowrap font-['Prompt']">สถานะตรวจสอบ</th>
                              <th className="px-5 py-3.5 font-medium text-left font-['Prompt']">ความเห็นบริษัทประกัน (Remark)</th>
                              <th className="px-5 py-3.5 font-medium text-center w-[220px] font-['Prompt']">การดำเนินการ</th>
                            </tr>
                          </thead>
                          <tbody>
                            {activePatient.documents.map((doc) => {
                              const docReview = docReviews[doc.id] || { status: "รอดำเนินการ" };
                              return (
                                <tr key={doc.id} className="border-b border-line-soft last:border-0 hover:bg-canvas/30 transition-colors">
                                  <td className="px-5 py-4 font-medium text-ink-800 font-['Prompt']">{doc.kind}</td>
                                  <td className="px-5 py-4">
                                    <button
                                      onClick={() => setViewingDoc(doc)}
                                      className="text-brand-600 hover:text-brand-700 hover:underline text-xs font-semibold text-left cursor-pointer font-['Prompt']"
                                    >
                                      {doc.fileName}
                                    </button>
                                  </td>
                                  <td className="px-5 py-4 w-[140px] whitespace-nowrap">
                                    <span
                                      className={`inline-flex rounded-full px-2.5 py-0.5 text-[10px] font-bold font-['Prompt'] ${
                                        docReview.status === "อนุมัติแล้ว"
                                          ? "bg-status-ready-bg text-status-ready-fg"
                                          : docReview.status === "ตีกลับ"
                                          ? "bg-status-danger-bg text-status-danger-fg"
                                          : "bg-status-waiting-bg text-status-waiting-fg"
                                      }`}
                                    >
                                      {docReview.status}
                                    </span>
                                  </td>
                                  <td className="px-5 py-4 text-ink-500 max-w-[250px] truncate font-['Prompt']" title={docReview.remark}>
                                    {docReview.remark || "-"}
                                  </td>
                                  <td className="px-5 py-4 text-center">
                                    <div className="flex justify-center gap-2">
                                      {docReview.status === "รอดำเนินการ" ? (
                                        <>
                                          <button
                                            onClick={() => {
                                              setDocReviews((prev) => ({
                                                ...prev,
                                                [doc.id]: { status: "อนุมัติแล้ว" },
                                              }));
                                            }}
                                            className="px-3 py-1.5 rounded-lg bg-status-ready-bg hover:bg-status-ready-bg/85 text-xs font-semibold text-status-ready-fg transition-colors cursor-pointer font-['Prompt'] shadow-sm"
                                          >
                                            อนุมัติ
                                          </button>
                                          <button
                                            onClick={() => {
                                              setRejectingDoc(doc);
                                              setDocRejectReason("");
                                            }}
                                            className="px-3 py-1.5 rounded-lg bg-status-danger-bg hover:bg-status-danger-bg/85 text-xs font-semibold text-status-danger-fg transition-colors cursor-pointer font-['Prompt'] shadow-sm"
                                          >
                                            ตีกลับ
                                          </button>
                                        </>
                                      ) : (
                                        <button
                                          onClick={() => {
                                            setDocReviews((prev) => {
                                              const copy = { ...prev };
                                              delete copy[doc.id];
                                              return copy;
                                            });
                                          }}
                                          className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-line bg-white hover:bg-line-soft text-xs font-semibold text-ink-600 transition-colors shadow-sm cursor-pointer font-['Prompt']"
                                        >
                                          <RotateCcw size={11} />
                                          <span>แก้ไขสถานะ</span>
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
                    </div>

                    {/* Action Bar at the Bottom */}
                    <div className="flex justify-end gap-3 bg-slate-50 border border-line p-4 rounded-xl mt-6 shadow-sm">
                      <button
                        disabled={activePatient.documents.some((d) => docReviews[d.id]?.status !== "อนุมัติแล้ว")}
                        onClick={() => setShowConfirmApprove(true)}
                        className={`px-5 py-2.5 rounded-lg text-sm font-semibold transition-all cursor-pointer font-['Prompt'] shadow-sm ${
                          activePatient.documents.some((d) => docReviews[d.id]?.status !== "อนุมัติแล้ว")
                            ? "bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed shadow-none"
                            : "bg-status-ready-bg hover:bg-status-ready-bg/85 text-status-ready-fg border border-status-ready-fg/10"
                        }`}
                      >
                        อนุมัติรายการ
                      </button>
                      <button
                        onClick={() => setShowConfirmReject(true)}
                        className="px-5 py-2.5 rounded-lg bg-status-danger-bg hover:bg-status-danger-bg/85 text-sm font-semibold text-status-danger-fg border border-status-danger-fg/10 transition-all cursor-pointer font-['Prompt'] shadow-sm"
                      >
                        ส่งรายการตีกลับไปยังโรงพยาบาล
                      </button>
                    </div>
                  </div>
                );
              })()
            : (
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
                <div className="overflow-x-auto force-scrollbar pb-4">
                  <div className="rounded-xl border border-line bg-white shadow-card min-w-[1200px] overflow-hidden">
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

                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-line-soft text-left text-xs text-ink-300 bg-slate-50/50">
                          <th className="px-5 py-3.5 font-medium w-[140px] whitespace-nowrap">HN</th>
                          <th className="px-5 py-3.5 font-medium w-[180px]">ชื่อผู้ป่วย</th>
                          <th className="px-5 py-3.5 font-medium w-[120px]">จำนวนเอกสาร</th>
                          <th className="px-5 py-3.5 font-medium w-[120px]">มูลค่าเคลม</th>
                          <th className="px-5 py-3.5 font-medium w-[150px]">สถานะ</th>
                          <th className="px-5 py-3.5 font-medium text-left w-[180px]">การจัดการ</th>
                        </tr>
                      </thead>
                      <tbody>
                        {batchPatients.map((p) => {
                          const r = getPatientReview(p.hn);
                          const status = r.status;
                          return (
                            <tr
                              key={p.hn}
                              onClick={() => setActivePatientHn(p.hn)}
                              className="border-b border-line-soft last:border-0 hover:bg-canvas/30 hover:shadow-sm transition-all cursor-pointer"
                            >
                              <td className="px-5 py-4 font-mono text-ink-700 w-[140px] whitespace-nowrap">{p.hn}</td>
                              <td className="px-5 py-4 font-medium text-ink-800 w-[180px]">{p.name}</td>
                              <td className="px-5 py-4 text-ink-600 w-[120px]">{p.documents.length} ไฟล์</td>
                              <td className="px-5 py-4 font-medium text-ink-700 w-[120px]">{formatCurrency(p.claimValue)}</td>
                              <td className="px-5 py-4 align-middle w-[150px]">
                                <span
                                  className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-medium whitespace-nowrap ${
                                    status === "ตรวจสอบแล้ว"
                                      ? "bg-status-ready-bg text-status-ready-fg"
                                      : status === "ตีกลับ"
                                      ? "bg-status-danger-bg text-status-danger-fg"
                                      : "bg-status-waiting-bg text-status-waiting-fg"
                                  }`}
                                >
                                  {status === "ตรวจสอบแล้ว" ? "อนุมัติแล้ว" : status === "ตีกลับ" ? "ตีกลับ" : "รอดำเนินการ"}
                                </span>
                              </td>
                              <td className="px-5 py-4 text-left w-[180px]">
                                <span className="text-xs font-semibold text-brand-600 hover:text-brand-700 hover:underline">
                                  ตรวจสอบเอกสาร ({p.documents.length} ไฟล์) →
                                </span>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>

                    {downloaded && (
                      <div className="border-t border-line-soft bg-status-ready-bg/10 px-5 py-3 text-center text-xs text-status-ready-fg">
                        ดาวน์โหลดชุดเอกสารสำเร็จ ระบบได้บันทึกความพยายามลงใน Audit Log ของระบบโรงพยาบาลแล้ว
                      </div>
                    )}
                  </div>
                </div>
              </>
            )
        }
      </main>

      {/* View Document Modal */}
      {viewingDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="relative max-w-4xl w-full rounded-xl bg-white p-6 shadow-2xl animate-fade-in">
            <div className="mb-4 flex items-center justify-between border-b border-line-soft pb-3">
              <div>
                <h3 className="text-base font-semibold text-ink-800 font-['Prompt']">ตรวจสอบเอกสารเคลม</h3>
                <p className="text-xs text-ink-400 mt-0.5 font-['Prompt']">{viewingDoc.kind} ({viewingDoc.fileName})</p>
              </div>
              <button
                onClick={() => setViewingDoc(null)}
                className="rounded-lg p-1.5 text-ink-400 hover:bg-line-soft hover:text-ink-600 transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>
            
            <div className="flex justify-center bg-[#f6f8fb] rounded-lg p-4 border border-[#dbe3ec] overflow-auto max-h-[65vh]">
              <img
                src={getDocImage(viewingDoc.kind)}
                alt="Document Mockup"
                className="max-h-[60vh] rounded shadow-md object-contain"
              />
            </div>
            
            <div className="mt-5 flex justify-end border-t border-line-soft pt-4">
              <button
                onClick={() => setViewingDoc(null)}
                className="rounded-lg border border-line bg-white px-5 py-2.5 text-xs font-semibold text-ink-600 hover:bg-line-soft cursor-pointer font-['Prompt'] shadow-sm"
              >
                ปิดหน้าต่าง
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reject Document Modal */}
      {rejectingDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="relative max-w-md w-full rounded-xl bg-white p-6 shadow-2xl animate-fade-in">
            <div className="mb-4 flex items-center justify-between border-b border-line-soft pb-3">
              <div>
                <h3 className="text-base font-semibold text-ink-800 font-['Prompt']">ระบุเหตุผลการตีกลับเอกสาร</h3>
                <p className="text-xs text-ink-400 mt-0.5 font-['Prompt']">{rejectingDoc.kind}</p>
              </div>
              <button
                onClick={() => setRejectingDoc(null)}
                className="rounded-lg p-1.5 text-ink-400 hover:bg-line-soft hover:text-ink-600 transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>
            
            <div className="space-y-3">
              <label className="block text-xs font-semibold text-ink-600 font-['Prompt']">รายละเอียดเหตุผลการปฏิเสธ / ตีกลับ</label>
              <textarea
                value={docRejectReason}
                onChange={(e) => setDocRejectReason(e.target.value)}
                placeholder="กรุณาระบุรายละเอียด เช่น สำเนาไม่ชัดเจน ลายเซ็นไม่ตรงกับบัตรประชาชน หรือ ข้อมูลตัวเลขผิดพลาด..."
                rows={4}
                className="w-full rounded-lg border border-line px-3.5 py-2.5 text-xs text-ink-800 placeholder:text-ink-300 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 font-['Prompt']"
              />
            </div>
            
            <div className="mt-6 flex justify-end gap-3 border-t border-line-soft pt-4">
              <button
                onClick={() => setRejectingDoc(null)}
                className="rounded-lg border border-line bg-white px-4 py-2 text-xs font-semibold text-ink-600 hover:bg-line-soft cursor-pointer font-['Prompt']"
              >
                ยกเลิก
              </button>
              <button
                onClick={() => {
                  setDocReviews((prev) => ({
                    ...prev,
                    [rejectingDoc.id]: {
                      status: "ตีกลับ",
                      remark: docRejectReason.trim() || "เอกสารไม่ผ่านเงื่อนไข",
                    },
                  }));
                  setRejectingDoc(null);
                }}
                className="rounded-lg bg-status-danger-bg hover:bg-status-danger-bg/85 text-xs font-semibold text-status-danger-fg px-4 py-2 shadow-sm transition-colors cursor-pointer font-['Prompt']"
              >
                ยืนยันการตีกลับ
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirm Approve Modal */}
      {showConfirmApprove && activePatientHn && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="relative max-w-sm w-full rounded-xl bg-white p-6 shadow-2xl animate-fade-in text-center animate-fade-in">
            <h3 className="text-base font-semibold text-ink-800 font-['Prompt'] mb-2">ยืนยันอนุมัติรายการเคลม</h3>
            <p className="text-xs text-ink-400 mb-6 font-['Prompt'] text-left leading-relaxed">
              คุณต้องการยืนยันการอนุมัติการเคลมประกันของคนไข้รายนี้และส่งข้อมูลไปยังโรงพยาบาลใช่หรือไม่?
            </p>
            
            <div className="flex justify-center gap-3">
              <button
                onClick={() => setShowConfirmApprove(false)}
                className="rounded-lg border border-line bg-white px-4 py-2 text-xs font-semibold text-ink-600 hover:bg-line-soft cursor-pointer font-['Prompt']"
              >
                ยกเลิก
              </button>
              <button
                onClick={() => {
                  const p = batchPatients.find((x) => x.hn === activePatientHn);
                  if (p) {
                    p.documents.forEach((d) => {
                      if (!docReviews[d.id] || docReviews[d.id].status === "รอดำเนินการ") {
                        setDocReviews((prev) => ({
                          ...prev,
                          [d.id]: { status: "อนุมัติแล้ว" },
                        }));
                      }
                    });
                  }
                  setShowConfirmApprove(false);
                  setToastMessage("ส่งรายการอนุมัติไปยังโรงพยาบาลสำเร็จ");
                }}
                className="rounded-lg bg-status-ready-bg hover:bg-status-ready-bg/85 text-xs font-semibold text-status-ready-fg px-4 py-2 shadow-sm cursor-pointer font-['Prompt']"
              >
                ยืนยันอนุมัติ
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirm Reject Modal */}
      {showConfirmReject && activePatientHn && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="relative max-w-sm w-full rounded-xl bg-white p-6 shadow-2xl animate-fade-in text-center animate-fade-in">
            <h3 className="text-base font-semibold text-ink-800 font-['Prompt'] mb-2">ยืนยันส่งรายการตีกลับ</h3>
            <p className="text-xs text-ink-400 mb-6 font-['Prompt'] text-left leading-relaxed">
              คุณต้องการส่งรายการเอกสารที่ถูกปฏิเสธ/ตีกลับทั้งหมดไปยังโรงพยาบาลเพื่อทำการแก้ไขใช่หรือไม่?
            </p>
            
            <div className="flex justify-center gap-3">
              <button
                onClick={() => setShowConfirmReject(false)}
                className="rounded-lg border border-line bg-white px-4 py-2 text-xs font-semibold text-ink-600 hover:bg-line-soft cursor-pointer font-['Prompt']"
              >
                ยกเลิก
              </button>
              <button
                onClick={() => {
                  setShowConfirmReject(false);
                  setToastMessage("ส่งรายการตีกลับไปยังโรงพยาบาลสำเร็จ");
                }}
                className="rounded-lg bg-status-danger-bg hover:bg-status-danger-bg/85 text-xs font-semibold text-status-danger-fg px-4 py-2 shadow-sm cursor-pointer font-['Prompt']"
              >
                ยืนยันส่งตีกลับ
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toastMessage && (
        <>
          <style>{`
            @keyframes slide-in-right {
              from {
                transform: translateX(120%);
                opacity: 0;
              }
              to {
                transform: translateX(0);
                opacity: 1;
              }
            }
            .animate-slide-in-right {
              animation: slide-in-right 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
            }
          `}</style>
          <div className="fixed top-6 right-6 z-[60] flex items-center justify-between gap-4 rounded-xl bg-status-ready-bg border border-status-ready-fg/30 p-5 text-sm font-semibold text-status-ready-fg shadow-2xl animate-slide-in-right max-w-sm w-80 font-['Prompt']">
            <div className="flex items-center gap-2.5">
              <span className="inline-block size-2 rounded-full bg-status-ready-fg animate-pulse shrink-0" />
              <span>{toastMessage}</span>
            </div>
            <button
              onClick={() => setToastMessage(null)}
              className="rounded-lg p-1 text-status-ready-fg/70 hover:bg-status-ready-fg/10 hover:text-status-ready-fg transition-colors shrink-0 cursor-pointer"
            >
              <X size={16} />
            </button>
          </div>
        </>
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
