import { useState } from "react";
import { IdCard, Loader2, PenLine, ScanLine, Search, UserRound } from "lucide-react";
import { Card, PageHeader } from "../components/PageHeader";
import { DocumentChecklist } from "../components/DocumentChecklist";
import { FileDrop } from "../components/FileDrop";
import { SignaturePad } from "../components/SignaturePad";
import { useAppData } from "../context/AppDataContext";
import { formatThaiDate } from "../lib/mockData";

export function Reception() {
  const { patients, findPatientByNationalId, logSisSearch, signConsent, uploadDocument } = useAppData();
  const [nationalId, setNationalId] = useState("");
  const [searching, setSearching] = useState(false);
  const [searched, setSearched] = useState(false);
  const [resultHn, setResultHn] = useState<string | null>(null);
  const [showSignature, setShowSignature] = useState(false);
  const [scannedFile, setScannedFile] = useState<string | null>(null);

  const result = resultHn ? patients.find((p) => p.hn === resultHn) : undefined;

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
        title="แผนกต้อนรับ"
        subtitle="ค้นหาผู้ป่วยจากระบบ SIS ด้วยเลขบัตรประชาชน และตรวจสอบเอกสารเบื้องต้นก่อนพบแพทย์"
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
            ค้นหาจากระบบ SIS
          </button>
          <p className="w-full text-xs text-ink-300">
            เชื่อมต่อกับระบบ HIS (SIS ของ DXC) แบบอ่านอย่างเดียว เนื่องจากระบบเดิมไม่มี API สำหรับเชื่อมต่อโดยตรง
          </p>
        </form>
      </Card>

      {searched && !result && (
        <Card className="p-8 text-center">
          <p className="text-sm font-medium text-ink-500">ไม่พบข้อมูลผู้ป่วยจากระบบ SIS</p>
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
                พบข้อมูลจาก SIS
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

            {result.nationalId === "0000000000000" ? (
              <div className="border-t border-line-soft p-5">
                <div className="flex items-center gap-3 rounded-lg bg-status-ready-bg/20 border border-status-ready-fg/20 px-4 py-3.5 text-sm text-status-ready-fg">
                  <div className="font-semibold">บัตรประชาชน:</div>
                  <div>ได้รับข้อมูลภาพถ่ายเรียบร้อยแล้วจากฝ่ายประชาสัมพันธ์</div>
                </div>
              </div>
            ) : (
              <div className="space-y-3 border-t border-line-soft p-5">
                <p className="text-sm font-medium text-ink-700">สแกนบัตรประชาชนเข้าสู่ระบบ</p>
                <FileDrop
                  compact
                  label={scannedFile ?? "ลากไฟล์ภาพบัตรประชาชนมาวาง หรือคลิกเพื่อสแกน"}
                  hint="รองรับ .jpg, .jpeg, .png จากเครื่องสแกนบัตรหรือกล้อง Tablet"
                  accept="image/*"
                  onFiles={(files) => {
                    const name = files[0]?.name ?? "id_card_scan.jpg";
                    setScannedFile(name);
                    uploadDocument(result.hn, "สำเนาบัตรประชาชน", name);
                  }}
                />
              </div>
            )}

            <div className="flex items-center justify-between border-t border-line-soft p-5">
              <div className="flex items-center gap-2 text-sm text-ink-600">
                <ScanLine size={16} className="text-ink-300" />
                ใบยินยอมเปิดเผยข้อมูลส่วนบุคคล (PDPA)
              </div>
              <button
                onClick={() => setShowSignature(true)}
                disabled={result.consentSigned}
                className="flex items-center gap-1.5 rounded-lg bg-ink-800 px-3.5 py-2 text-sm font-medium text-white hover:bg-ink-900 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <PenLine size={15} />
                {result.consentSigned ? "ลงนามแล้ว" : "ลงนามผ่าน iPad"}
              </button>
            </div>
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
    </div>
  );
}
