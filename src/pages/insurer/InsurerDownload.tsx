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

  const link = findDeliveryLinkByToken(token);
  const authed = typeof window !== "undefined" && sessionStorage.getItem(`authed:${token}`) === "1";
  const expired = link ? new Date(link.expiresAt).getTime() < Date.now() : false;
  const batch = link ? batches.find((b) => b.id === link.batchId) : undefined;
  const batchPatients = batch ? patients.filter((p) => batch.hns.includes(p.hn)) : [];

  useEffect(() => {
    if (!link || !authed) {
      navigate(`/insurer/login?token=${token}`, { replace: true });
    }
  }, [link, authed, navigate, token]);

  if (!link || !authed) return null;

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
    <div className="min-h-screen bg-canvas">
      <header className="flex items-center justify-between border-b border-line-soft bg-white px-6 py-4">
        <div className="flex items-center gap-2.5">
          <div className="flex size-9 items-center justify-center rounded-lg bg-brand-600 text-white">
            <Building2 size={17} />
          </div>
          <span className="text-sm font-medium text-ink-800">ClaimFlow — พอร์ทัลบริษัทประกัน</span>
        </div>
        <button
          onClick={() => {
            sessionStorage.removeItem(`authed:${token}`);
            navigate(`/insurer/login?token=${token}`);
          }}
          className="flex items-center gap-1.5 text-sm text-ink-400 hover:text-ink-600"
        >
          <LogOut size={15} /> ออกจากระบบ
        </button>
      </header>

      <main className="mx-auto max-w-2xl px-4 py-10">
        {expired ? (
          <div className="flex items-start gap-2 rounded-lg bg-status-danger-bg p-4 text-sm text-status-danger-fg">
            <ShieldAlert size={16} className="mt-0.5 shrink-0" />
            ลิงก์ดาวน์โหลดนี้หมดอายุแล้ว กรุณาติดต่อโรงพยาบาลเพื่อขอลิงก์ใหม่
          </div>
        ) : (
          <div className="rounded-xl border border-line bg-white shadow-card">
            <div className="border-b border-line-soft p-5">
              <p className="text-xs font-medium text-ink-400">รหัสชุดเอกสาร</p>
              <h1 className="text-xl font-medium text-ink-800">{batch?.id}</h1>
              <p className="mt-1 text-sm text-ink-500">
                เลขใบสรุปจ่าย (ERP): <span className="font-mono">{batch?.referenceNumber}</span>
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4 border-b border-line-soft p-5 text-sm">
              <div>
                <p className="text-xs text-ink-400">จำนวนผู้ป่วย</p>
                <p className="font-medium text-ink-700">{batchPatients.length} ราย</p>
              </div>
              <div>
                <p className="text-xs text-ink-400">มูลค่ารวม</p>
                <p className="font-medium text-ink-700">{formatCurrency(batch?.totalValue ?? 0)}</p>
              </div>
              <div>
                <p className="text-xs text-ink-400">ลิงก์หมดอายุ</p>
                <p className="font-medium text-ink-700">{formatThaiDateTime(link.expiresAt)}</p>
              </div>
              <div>
                <p className="text-xs text-ink-400">จำนวนครั้งที่ดาวน์โหลด</p>
                <p className="font-medium text-ink-700">{link.attempts.filter((a) => a.success).length} ครั้ง</p>
              </div>
            </div>

            <ul className="divide-y divide-line-soft p-2">
              {batchPatients.map((p) => (
                <li key={p.hn} className="flex items-center gap-3 px-3 py-2.5">
                  <FileText size={16} className="shrink-0 text-ink-300" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm text-ink-700">{p.hn} · {p.name}</p>
                    <p className="text-xs text-ink-300">{p.documents.length} เอกสาร · {formatCurrency(p.claimValue)}</p>
                  </div>
                </li>
              ))}
            </ul>

            <div className="border-t border-line-soft p-5">
              <button
                onClick={handleDownload}
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-brand-600 py-3 text-sm font-medium text-white hover:bg-brand-700"
              >
                <Download size={16} /> ดาวน์โหลดชุดเอกสาร (Package)
              </button>
              {downloaded && (
                <p className="mt-2 text-center text-xs text-status-ready-fg">
                  ดาวน์โหลดสำเร็จ ระบบได้บันทึกลง Audit Log แล้ว
                </p>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
