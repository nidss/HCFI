import { useEffect, useRef, useState } from "react";
import { Check, IdCard, Loader2, PenLine, ScanLine, Search, UserRound, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Card, PageHeader } from "../components/PageHeader";
import { DocumentChecklist } from "../components/DocumentChecklist";
import { FileDrop } from "../components/FileDrop";
import { SignaturePad } from "../components/SignaturePad";
import { useAppData } from "../context/AppDataContext";
import { formatThaiDate } from "../lib/mockData";

export function Reception() {
  const { patients, findPatientByNationalId, logSisSearch, signConsent, uploadDocument } = useAppData();
  const navigate = useNavigate();
  const [nationalId, setNationalId] = useState("");
  const [searching, setSearching] = useState(false);
  const [searched, setSearched] = useState(false);
  const [resultHn, setResultHn] = useState<string | null>(null);
  const [showSignature, setShowSignature] = useState(false);
  const [scannedFile, setScannedFile] = useState<string | null>(null);
  const [showIdCardModal, setShowIdCardModal] = useState(false);
  const [uploadedPreviews, setUploadedPreviews] = useState<Record<string, string>>({});
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => setToastMessage(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [toastMessage]);

  const result = resultHn ? patients.find((p) => p.hn === resultHn) : undefined;

  const hasIdCard = result?.documents.some((d) => d.kind === "สำเนาบัตรประชาชน" || d.kind === "สำเนาบัตรประชาชนหรือบัตรพนักงานลงนามโดยผู้ป่วย") ?? false;
  const previewSrc = result
    ? uploadedPreviews[result.hn]
      ? uploadedPreviews[result.hn]
      : (result.nationalId === "0000000000000"
          ? "A4-signed.png"
          : (hasIdCard ? "idcard.png" : null)
        )
    : null;

  function handlePhotoUpload(file: File) {
    if (!result) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      setUploadedPreviews((prev) => ({
        ...prev,
        [result.hn]: dataUrl,
      }));
    };
    reader.readAsDataURL(file);
    setScannedFile(file.name);
    uploadDocument(result.hn, "สำเนาบัตรประชาชนหรือบัตรพนักงานลงนามโดยผู้ป่วย", file.name);
  }

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (nationalId.replace(/\s/g, "").length !== 13) return;
    setSearching(true);
    setSearched(false);
    setTimeout(() => {
      const found = findPatientByNationalId(nationalId);
      logSisSearch(nationalId, !!found);
      setResultHn(found?.hn ?? null);
      setSearched(true);
      setSearching(false);
    }, 700);
  }

  return (
    <div>
      <PageHeader
        title="แผนกลงทะเบียน"
        subtitle="ค้นหาผู้ป่วยจากระบบ HIS ด้วยเลขบัตรประชาชน และตรวจสอบเอกสารเบื้องต้นก่อนพบแพทย์"
      />

      <Card className="mb-6">
        <form onSubmit={handleSearch} className="flex flex-wrap items-end gap-4 p-5">
          <div className="w-full max-w-xs">
            <label className="mb-1.5 block text-xs font-medium text-ink-600">เลขบัตรประชาชน 13 หลัก</label>
            <input
              value={nationalId}
              onChange={(e) => setNationalId(e.target.value.replace(/[^0-9]/g, "").slice(0, 13))}
              placeholder="เช่น 1100701234561"
              className="w-full rounded-lg border border-line px-3.5 py-2.5 text-sm text-ink-800 placeholder:text-ink-300 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
            />
          </div>
          <button
            type="submit"
            disabled={searching || nationalId.length !== 13}
            className="flex items-center gap-2 rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-brand-700 disabled:opacity-40"
          >
            {searching ? <Loader2 size={16} className="animate-spin" /> : <Search size={16} />}
            ค้นหาจากระบบ HIS
          </button>
          <p className="w-full text-xs text-ink-300">
            เชื่อมต่อกับระบบ HIS (DXC) แบบอ่านอย่างเดียว เนื่องจากระบบเดิมไม่มี API สำหรับเชื่อมต่อโดยตรง
          </p>
        </form>
      </Card>

      {searched && !result && (
        <Card className="p-8 text-center">
          <p className="text-sm font-medium text-ink-500">ไม่พบข้อมูลผู้ป่วยจากระบบ HIS</p>
          <p className="mt-1 text-xs text-ink-300">
            ลองใช้เลขบัตรประชาชนตัวอย่าง 1100701234561 – 1100701234575
          </p>
        </Card>
      )}

      {result && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <Card className="lg:col-span-2">
            <div className="flex items-center gap-4 border-b border-line-soft p-5">
              <div className="flex size-14 shrink-0 items-center justify-center rounded-full bg-brand-50 text-brand-600">
                <UserRound size={26} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-lg font-medium text-ink-800">{result.name}</p>
                <p className="text-sm text-ink-400">
                  {result.hn} · เข้ารับบริการ {formatThaiDate(result.visitDate)}
                </p>
              </div>
              <span className="rounded-full bg-status-ready-bg px-3 py-1 text-xs font-medium text-status-ready-fg">
                พบข้อมูลจาก HIS
              </span>
            </div>

            <div className="grid grid-cols-1 gap-5 p-5 sm:grid-cols-2">
              <div>
                <p className="mb-1 text-xs font-medium text-ink-400">เลขบัตรประชาชน</p>
                <p className="text-sm text-ink-700">
                  {result.nationalId.replace(/(\d{1})(\d{4})(\d{5})(\d{2})(\d{1})/, "$1-$2-$3-$4-$5")}
                </p>
              </div>
              <div>
                <p className="mb-1 text-xs font-medium text-ink-400">มูลค่าเคลมเบื้องต้น</p>
                <p className="text-sm text-ink-700">{result.claimValue ? `฿${result.claimValue.toLocaleString()}` : "รอประเมิน"}</p>
              </div>
            </div>

            <div className="space-y-3 border-t border-line-soft p-5">
              <p className="text-sm font-medium text-ink-700">รูปภาพบัตรประชาชน</p>
              
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragOver(true);
                }}
                onDragLeave={() => setDragOver(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setDragOver(false);
                  const file = e.dataTransfer.files?.[0];
                  if (file) {
                    handlePhotoUpload(file);
                  }
                }}
                onClick={() => fileInputRef.current?.click()}
                className={`flex cursor-pointer flex-col items-center justify-center gap-4 rounded-lg border-2 border-dashed text-center transition-colors p-6 ${
                  dragOver ? "border-brand-500 bg-brand-50" : "border-line hover:border-brand-300 hover:bg-canvas"
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      handlePhotoUpload(file);
                    }
                    e.target.value = "";
                  }}
                />

                {previewSrc ? (
                  <div className="flex flex-col items-center gap-3">
                    <div className="text-xs font-medium text-ink-500">
                      {uploadedPreviews[result.hn] 
                        ? "ภาพถ่ายบัตรประชาชน (อัปโหลดใหม่)" 
                        : (result.nationalId === "0000000000000" 
                            ? "ภาพถ่ายบัตรประชาชน (ส่งโดยฝ่ายประชาสัมพันธ์)" 
                            : "ภาพถ่ายบัตรประชาชน"
                          )
                      }
                    </div>
                    
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowIdCardModal(true);
                      }}
                      className="group relative overflow-hidden rounded-lg border border-line bg-white p-1 hover:border-brand-500 hover:ring-1 hover:ring-brand-500 transition-all shadow-sm block"
                    >
                      <img
                        src={previewSrc}
                        alt="ID Card Thumbnail"
                        className="h-28 w-auto rounded object-contain"
                      />
                      <div className="absolute inset-0 flex items-center justify-center bg-ink-900/40 opacity-0 group-hover:opacity-100 transition-opacity">
                        <span className="rounded bg-white/95 px-2.5 py-1 text-[11px] font-medium text-ink-700 shadow-sm">
                          คลิกเพื่อดูรูปขยาย
                        </span>
                      </div>
                    </button>
                    
                    <p className="text-xs text-ink-400">
                      ลากไฟล์ภาพบัตรประชาชนใหม่มาวาง หรือคลิกที่นี่เพื่อเลือกไฟล์ใหม่
                    </p>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-2">
                    <div className="rounded-full bg-brand-50 p-3 text-brand-600">
                      <ScanLine size={24} />
                    </div>
                    <p className="text-sm font-medium text-ink-600">
                      {scannedFile ?? "ลากไฟล์ภาพบัตรประชาชนมาวาง หรือคลิกเพื่ออัปโหลด"}
                    </p>
                    <p className="text-xs text-ink-300">
                      รองรับไฟล์ภาพ .jpg, .jpeg, .png
                    </p>
                  </div>
                )}
              </div>
            </div>

            {result.nationalId === "0000000000000" && (
              <div className="flex items-center justify-end gap-3 border-t border-line-soft p-5">
                {result.consentSigned ? (
                  <button
                    type="button"
                    onClick={() => {
                      setToastMessage("ส่งข้อมูลไปที่ iPad เรียบร้อยแล้ว");
                    }}
                    className="flex items-center gap-1.5 rounded-lg border border-status-ready-fg bg-status-ready-bg/10 px-5 py-2.5 text-sm font-medium text-status-ready-fg hover:bg-status-ready-bg/20 transition-colors shadow-sm"
                  >
                    <Check size={16} />
                    ลงลายมือชื่อบน iPad เรียบร้อยแล้ว
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      setToastMessage("ส่งข้อมูลไปที่ iPad เรียบร้อยแล้ว");
                      // Simulating iPad signature completion for a seamless mock experience
                      setTimeout(() => {
                        signConsent(result.hn);
                      }, 2000);
                    }}
                    className="flex items-center gap-1.5 rounded-lg border border-brand-200 bg-brand-50 px-5 py-2.5 text-sm font-medium text-brand-700 hover:bg-brand-100 transition-colors shadow-sm"
                  >
                    <PenLine size={16} />
                    ลงลายมือชื่อบน iPad
                  </button>
                )}
                
                <button
                  type="button"
                  onClick={() => {
                    navigate("/cashier", { state: { hn: result.hn, name: result.name } });
                  }}
                  className="flex items-center gap-1.5 rounded-lg bg-brand-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-brand-700 transition-colors shadow-sm"
                >
                  ไปยังขั้นตอนต่อไป
                </button>
              </div>
            )}
          </Card>

          <Card>
            <div className="flex items-center gap-2 border-b border-line-soft p-4">
              <IdCard size={16} className="text-ink-400" />
              <h3 className="text-sm font-medium text-ink-700">สถานะเอกสารของผู้ป่วย</h3>
            </div>
            <div className="px-4">
              <DocumentChecklist documents={result.documents} />
            </div>
          </Card>
        </div>
      )}

      {showSignature && result && (
        <SignaturePad
          title="ลงนามใบยินยอมเปิดเผยข้อมูล"
          description={`ผู้ป่วย: ${result.name} (${result.hn})`}
          documentName="ใบยินยอมเปิดเผยข้อมูลส่วนบุคคล (PDPA)"
          onCancel={() => setShowSignature(false)}
          onConfirm={() => {
            signConsent(result.hn);
            setShowSignature(false);
          }}
        />
      )}

      {showIdCardModal && result && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="relative max-w-xl w-full rounded-xl bg-white p-6 shadow-2xl animate-fade-in">
            <div className="mb-4 flex items-center justify-between border-b border-line-soft pb-3">
              <h3 className="text-base font-semibold text-ink-800">ภาพถ่ายบัตรประชาชน (ส่งโดยฝ่ายประชาสัมพันธ์)</h3>
              <button
                onClick={() => setShowIdCardModal(false)}
                className="rounded-lg p-1.5 text-ink-400 hover:bg-line-soft hover:text-ink-600 transition-colors"
              >
                <X size={18} />
              </button>
            </div>
            <div className="flex justify-center bg-canvas rounded-lg p-4">
              <img
                src={previewSrc || "idcard.png"}
                alt="ID Card Scan"
                className="max-h-[60vh] rounded shadow-md object-contain"
              />
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
          <div className="fixed top-6 right-6 z-[60] flex items-center justify-between gap-4 rounded-xl bg-status-ready-bg border border-status-ready-fg/30 p-5 text-sm font-semibold text-status-ready-fg shadow-2xl animate-slide-in-right max-w-sm w-80">
            <div className="flex items-center gap-2.5">
              <span className="inline-block size-2 rounded-full bg-status-ready-fg animate-pulse shrink-0" />
              <span>{toastMessage}</span>
            </div>
            <button
              onClick={() => setToastMessage(null)}
              className="rounded-lg p-1 text-status-ready-fg/70 hover:bg-status-ready-fg/10 hover:text-status-ready-fg transition-colors shrink-0"
            >
              <X size={16} />
            </button>
          </div>
        </>
      )}
    </div>
  );
}
