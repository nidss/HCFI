import { useState } from "react";
import { UploadCloud, X } from "lucide-react";
import type { DocKind, Patient } from "../lib/types";
import { StatusBadge } from "./StatusBadge";
import { formatCurrency, formatThaiDate } from "../lib/mockData";
import { useAppData } from "../context/AppDataContext";

export function PatientDrawer({
  patient,
  insurer,
  onClose,
}: {
  patient: Patient;
  insurer?: string | null;
  onClose: () => void;
}) {
  const { uploadDocument } = useAppData();
  const [pendingKind, setPendingKind] = useState<DocKind | null>(null);

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-ink-900/40">
      <div className="h-full w-full max-w-xl overflow-y-auto bg-white shadow-xl animate-fade-in">
        <div className="flex items-start justify-between border-b border-line-soft p-5">
          <div>
            <p className="text-lg font-medium text-ink-800">{patient.name}</p>
            <p className="text-sm text-ink-400">
              {patient.hn} · เข้ารับบริการ {formatThaiDate(patient.visitDate)}
            </p>
          </div>
          <button onClick={onClose} className="rounded-md p-1 text-ink-300 hover:bg-line-soft">
            <X size={18} />
          </button>
        </div>

        <div className="flex items-center justify-between border-b border-line-soft p-5">
          <div className="flex gap-6">
            <div>
              <p className="text-xs text-ink-400">มูลค่าเคลม</p>
              <p className="text-sm font-medium text-ink-700">{formatCurrency(patient.claimValue)}</p>
            </div>
            <div>
              <p className="text-xs text-ink-400 mb-0.5">บริษัทประกัน</p>
              <div className="flex flex-wrap gap-1">
                {insurer ? (
                  <span className="inline-block rounded bg-brand-50 border border-brand-100 text-brand-700 text-[10px] font-bold px-1.5 py-0.5">
                    {insurer}
                  </span>
                ) : patient.insurers && patient.insurers.length > 0 ? (
                  patient.insurers.map((ins) => (
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
            </div>
          </div>
          <StatusBadge status={patient.status} />
        </div>

        <div className="p-5">
          <p className="mb-3 text-sm font-medium text-ink-700">รายการเอกสาร</p>
          {patient.documents.length === 0 ? (
            <p className="py-8 text-center text-xs text-ink-300 border border-dashed border-line-soft rounded-lg">
              ยังไม่มีรายการเอกสาร (ผู้ป่วยใหม่ยังไม่ได้เข้ารับการรักษา)
            </p>
          ) : (
            <ul className="space-y-2">
              {patient.documents.map((d) => (
                <li key={d.id} className="rounded-lg border border-line-soft p-3">
                  <div className="flex items-center justify-between gap-2">
                    <div className="min-w-0">
                      <p className="truncate text-sm text-ink-700">{d.kind}</p>
                      <p className="truncate text-xs text-ink-300">
                        {d.status === "ครบถ้วน"
                          ? `${d.fileName} · ${d.source}`
                          : d.status === "ตีกลับ"
                          ? "ถูกตีกลับโดยบริษัทประกัน - กรุณาอัปโหลดเอกสารที่แก้ไขแล้ว"
                          : "ยังไม่ได้รับเอกสาร"}
                      </p>
                      {d.status === "ตีกลับ" && (
                        <p className="text-xs text-status-danger-fg mt-0.5 font-medium">
                          เหตุผลที่ตีกลับคือ รายละเอียดของคนไข้ไม่ชัดเจนพอ
                        </p>
                      )}
                    </div>
                    {d.status === "ครบถ้วน" ? (
                      <span className="shrink-0 rounded-full bg-status-ready-bg px-2.5 py-1 text-[11px] font-medium text-status-ready-fg">
                        ครบถ้วน
                      </span>
                    ) : d.status === "ตีกลับ" && pendingKind !== d.kind ? (
                      <div className="flex items-center gap-2">
                        <span className="shrink-0 rounded-full bg-status-danger-bg px-2.5 py-1 text-[11px] font-medium text-status-danger-fg">
                          ตีกลับ
                        </span>
                        <button
                          onClick={() => setPendingKind(d.kind)}
                          className="flex shrink-0 items-center gap-1 rounded-lg border border-line px-2.5 py-1.5 text-xs font-medium text-ink-600 hover:bg-line-soft"
                        >
                          <UploadCloud size={13} /> อัปโหลดใหม่
                        </button>
                      </div>
                    ) : pendingKind === d.kind ? (
                      <button
                        onClick={() => setPendingKind(null)}
                        className="shrink-0 text-xs text-ink-400 hover:text-ink-600"
                      >
                        ยกเลิก
                      </button>
                    ) : (
                      <button
                        onClick={() => setPendingKind(d.kind)}
                        className="flex shrink-0 items-center gap-1 rounded-lg border border-line px-2.5 py-1.5 text-xs font-medium text-ink-600 hover:bg-line-soft"
                      >
                        <UploadCloud size={13} /> อัปโหลด
                      </button>
                    )}
                  </div>
                  {pendingKind === d.kind && d.status !== "ครบถ้วน" && (
                    <div className="mt-2">
                      <label className="flex cursor-pointer items-center justify-center gap-2 rounded-lg border-2 border-dashed border-line px-3 py-3 text-xs text-ink-400 hover:border-brand-300">
                        <UploadCloud size={14} />
                        ดึงไฟล์จากระบบ HIS แบบแมนนวล
                        <input
                          type="file"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              uploadDocument(patient.hn, d.kind, file.name);
                              setPendingKind(null);
                            }
                          }}
                        />
                      </label>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
