import { useState } from "react";
import { useLocation } from "react-router-dom";
import { FileCheck2, PenLine, Receipt, X } from "lucide-react";
import { Card, PageHeader, EmptyState } from "../components/PageHeader";
import { FileDrop } from "../components/FileDrop";
import { SignaturePad } from "../components/SignaturePad";
import { useAppData } from "../context/AppDataContext";

export function Cashier() {
  const { patients, invoiceQueue, submitInvoiceForOcr, confirmInvoiceMatch, signInvoice } = useAppData();
  const location = useLocation();
  const state = location.state as { hn?: string; name?: string } | null;
  const [signingHn, setSigningHn] = useState<string | null>(null);
  const [viewingInvoiceHn, setViewingInvoiceHn] = useState<string | null>(null);

  const unmatchedCandidates = patients.filter((p) =>
    p.documents.some((d) => d.kind === "ใบเสร็จรับเงิน (Invoice)" && d.status === "รอดำเนินการ"),
  );

  return (
    <div>
      <PageHeader
        title="ช่องชำระเงิน"
        subtitle="จับไฟล์ Invoice ที่พิมพ์จาก HIS (Ctrl+P) เข้าสู่ Share Drive แล้วอ่านด้วย OCR เพื่อจับคู่ HN โดยอัตโนมัติ"
      />

      {state?.hn && state?.name && (
        <Card className="mb-6 bg-brand-50/50 border border-brand-200">
          <div className="p-5 flex items-center justify-between gap-4">
            <div>
              <p className="text-xs text-brand-600 font-medium uppercase tracking-wide">กำลังดำเนินการชำระเงินสำหรับผู้ป่วย</p>
              <p className="mt-1 text-lg font-medium text-ink-800">
                {state.name} <span className="text-sm font-normal text-ink-400">({state.hn})</span>
              </p>
            </div>
            <div className="rounded-full bg-brand-100 px-3 py-1 text-xs font-medium text-brand-700">
              คนไข้ส่งต่อสำเร็จ
            </div>
          </div>
        </Card>
      )}

      <Card className="mb-6">
        <div className="p-5">
          <p className="mb-3 text-sm font-medium text-ink-700">จับไฟล์ Invoice จาก Share Drive</p>
          <FileDrop
            label="ลากไฟล์ Invoice (PDF) ที่พิมพ์จาก HIS มาวาง หรือคลิกเพื่อเลือกไฟล์"
            hint="รองรับไฟล์ .pdf, .jpg, .jpeg, .png · ตั้งชื่อไฟล์ให้มีเลข HN เช่น invoice_6604302.pdf เพื่อให้ OCR จับคู่อัตโนมัติ"
            accept=".pdf,.jpg,.jpeg,.png"
            onFiles={(files) => {
              Array.from(files).forEach((f) => submitInvoiceForOcr(f.name, state?.hn));
            }}
          />
        </div>
      </Card>

      <Card>
        <div className="flex items-center gap-2 border-b border-line-soft px-5 py-4">
          <Receipt size={16} className="text-ink-400" />
          <h3 className="text-sm font-medium text-ink-700">รายการที่ประมวลผลในเซสชันนี้</h3>
        </div>

        {invoiceQueue.length === 0 ? (
          <EmptyState
            icon={<FileCheck2 size={32} />}
            title="ยังไม่มีไฟล์ที่ประมวลผล ลองอัปโหลด Invoice ด้านบน"
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-line-soft text-left text-xs text-ink-300">
                  <th className="px-5 py-3 font-medium">ไฟล์</th>
                  <th className="px-5 py-3 font-medium">HN ที่จับคู่</th>
                  <th className="px-5 py-3 font-medium">ผู้ป่วย</th>
                  <th className="px-5 py-3 font-medium">ความมั่นใจ OCR</th>
                  <th className="px-5 py-3 font-medium">สถานะ</th>
                  <th className="px-5 py-3 font-medium">การดำเนินการ</th>
                </tr>
              </thead>
              <tbody>
                {invoiceQueue.map((q) => {
                  const patient = q.matchedHn ? patients.find((p) => p.hn === q.matchedHn) : undefined;
                  return (
                    <tr key={q.id} className="border-b border-line-soft last:border-0">
                      <td className="max-w-[200px] truncate px-5 py-3 text-ink-600">{q.fileName}</td>
                      <td className="px-5 py-3 font-medium text-ink-700">{q.matchedHn ?? "-"}</td>
                      <td className="px-5 py-3 text-ink-600">{q.patientName ?? "-"}</td>
                      <td className="px-5 py-3 text-ink-600">{q.confidence ? `${q.confidence}%` : "-"}</td>
                      <td className="px-5 py-3">
                        <span
                          className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-medium ${
                            q.status === "จับคู่สำเร็จ"
                              ? "bg-status-ready-bg text-status-ready-fg"
                              : "bg-status-waiting-bg text-status-waiting-fg"
                          }`}
                        >
                          {q.status}
                        </span>
                      </td>
                      <td className="px-5 py-3">
                        {q.status === "ต้องตรวจสอบด้วยตนเอง" ? (
                          <select
                            defaultValue=""
                            onChange={(e) => e.target.value && confirmInvoiceMatch(q.id, e.target.value)}
                            className="rounded-lg border border-line px-2.5 py-1.5 text-xs text-ink-700 focus:border-brand-500 focus:outline-none"
                          >
                            <option value="" disabled>
                              เลือก HN ด้วยตนเอง
                            </option>
                            {unmatchedCandidates.map((p) => (
                              <option key={p.hn} value={p.hn}>
                                {p.hn} · {p.name}
                              </option>
                            ))}
                          </select>
                        ) : patient && !patient.invoiceSigned ? (
                          <button
                            onClick={() => setViewingInvoiceHn(patient.hn)}
                            className="flex items-center gap-1.5 rounded-lg bg-ink-800 px-3 py-1.5 text-xs font-medium text-white hover:bg-ink-900 shadow-sm"
                          >
                            ดูเอกสาร
                          </button>
                        ) : (
                          <span className="text-xs text-status-ready-fg">เซ็นรับรองแล้ว</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {signingHn && (
        <SignaturePad
          title="เซ็นรับรองใบเสร็จรับเงิน"
          description={patients.find((p) => p.hn === signingHn)?.name ?? signingHn}
          documentName="ใบเสร็จรับเงิน (Invoice)"
          onCancel={() => setSigningHn(null)}
          onConfirm={() => {
            signInvoice(signingHn);
            setSigningHn(null);
          }}
        />
      )}

      {viewingInvoiceHn && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="relative max-w-xl w-full rounded-xl bg-white p-6 shadow-2xl animate-fade-in">
            <div className="mb-4 flex items-center justify-between border-b border-line-soft pb-3">
              <h3 className="text-base font-semibold text-ink-800">ตรวจสอบใบเสร็จรับเงิน (Invoice)</h3>
              <button
                onClick={() => setViewingInvoiceHn(null)}
                className="rounded-lg p-1.5 text-ink-400 hover:bg-line-soft hover:text-ink-600 transition-colors"
              >
                <X size={18} />
              </button>
            </div>
            <div className="flex justify-center bg-canvas rounded-lg p-4">
              <img
                src="example-recipe.png"
                alt="Invoice Document"
                className="max-h-[60vh] rounded shadow-md object-contain"
              />
            </div>
            <div className="mt-5 flex justify-end gap-3 border-t border-line-soft pt-4">
              <button
                onClick={() => setViewingInvoiceHn(null)}
                className="rounded-lg border border-line px-4 py-2 text-xs font-medium text-ink-600 hover:bg-line-soft"
              >
                ปิด
              </button>
              <button
                onClick={() => {
                  const targetHn = viewingInvoiceHn;
                  setViewingInvoiceHn(null);
                  setSigningHn(targetHn);
                }}
                className="flex items-center gap-1.5 rounded-lg bg-brand-600 px-4 py-2 text-xs font-medium text-white hover:bg-brand-700 shadow-sm transition-colors"
              >
                <PenLine size={13} /> ลงนามรับรองเอกสาร
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
