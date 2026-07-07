import { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Check, CheckCircle2, ChevronLeft, ChevronRight, Maximize2, PenTool, ShieldCheck, X, ZoomIn, ZoomOut } from "lucide-react";
import { useAppData } from "../../context/AppDataContext";

// Responsive touch-friendly HTML5 Canvas Signature Pad
function SignatureCanvas({ onSave, value }: { onSave: (url: string) => void; value: string }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [isEmpty, setIsEmpty] = useState(true);

  // Initialize canvas with smooth drawing context
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Reset canvas drawing style
    ctx.strokeStyle = "#0f172a"; // Slate-900
    ctx.lineWidth = 3.5;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    // If there is an existing value, clear and redraw (or if it's cleared, clear it)
    if (!value) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      setIsEmpty(true);
    }
  }, [value]);

  const getCoords = (e: any) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    let clientX, clientY;
    if (e.touches && e.touches.length > 0) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }

    return {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top) * scaleY,
    };
  };

  const startDrawing = (e: any) => {
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const { x, y } = getCoords(e);
    ctx.beginPath();
    ctx.moveTo(x, y);
    setIsDrawing(true);
    setIsEmpty(false);
  };

  const draw = (e: any) => {
    if (!isDrawing) return;
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const { x, y } = getCoords(e);
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    if (!isDrawing) return;
    setIsDrawing(false);
    const canvas = canvasRef.current;
    if (canvas) {
      onSave(canvas.toDataURL());
    }
  };

  const handleClear = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setIsEmpty(true);
    onSave("");
  };

  return (
    <div className="flex flex-col gap-2 w-full">
      <div className="relative border-2 border-dashed border-[#dbe3ec] hover:border-brand-300 bg-[#fafbfc] rounded-2xl overflow-hidden h-48 touch-none">
        <canvas
          ref={canvasRef}
          width={600}
          height={192}
          className="w-full h-full cursor-crosshair"
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
        />
        {isEmpty ? (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none text-ink-300 font-['Prompt'] text-sm gap-2">
            <PenTool size={16} />
            <span>กรุณาลงลายมือชื่อที่นี่</span>
          </div>
        ) : (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-3 bottom-3 flex items-center gap-1 bg-white border border-[#dbe3ec] px-3 py-1.5 rounded-lg text-xs font-medium text-ink-500 hover:bg-slate-50 shadow-sm transition-colors cursor-pointer"
          >
            <X size={12} />
            <span>ล้างลายเซ็น</span>
          </button>
        )}
      </div>
    </div>
  );
}

const exampleDocs = Array.from({ length: 23 }, (_, i) => {
  const pageNum = String(i + 3).padStart(2, "0");
  return `example_docs/hospital_document_mockups_Page_${pageNum}.jpg`;
});

export function PatientSign() {
  const { hn } = useParams<{ hn: string }>();
  const navigate = useNavigate();
  const { findPatient, signConsent, signInvoice } = useAppData();

  const patient = findPatient(hn ?? "");
  const [step, setStep] = useState(1);
  const [sigConsent, setSigConsent] = useState("");
  const [sigInvoice, setSigInvoice] = useState("");
  const [docPageIndex, setDocPageIndex] = useState(0);
  const [showFullScreenDoc, setShowFullScreenDoc] = useState(false);
  const [fullscreenZoomScale, setFullscreenZoomScale] = useState(0.95);

  const previewSrc = patient
    ? patient.nationalId === "0000000000000"
      ? "A4-signed.png"
      : "idcard.png"
    : null;

  // Redirect if patient not found
  useEffect(() => {
    if (!patient) {
      navigate("/patient/select");
    }
  }, [patient, navigate]);

  if (!patient) return null;

  // Generate dynamic medical expenses matching the patient's claim value
  const claimTotal = patient.claimValue ?? 8500;
  const roomCost = Math.round(claimTotal * 0.45);
  const medicineCost = Math.round(claimTotal * 0.3);
  const doctorCost = Math.round(claimTotal * 0.15);
  const serviceCost = claimTotal - roomCost - medicineCost - doctorCost;

  const handleNextStep = () => {
    if (step === 1) {
      // Execute the context action to sign consent form
      signConsent(patient.hn);
      // Move to Step 2 if patient needs invoice signature, otherwise jump to Success
      if (!patient.invoiceSigned) {
        setStep(2);
      } else {
        setStep(3);
      }
    } else if (step === 2) {
      // Execute context action to sign invoice
      signInvoice(patient.hn);
      setStep(3);
    }
  };

  return (
    <div className="h-full w-full bg-[#f6f8fb] flex flex-col p-6 sm:p-8 overflow-y-auto">
      {/* Top Header Bar */}
      <div className="w-full max-w-4xl mx-auto flex items-center justify-between mb-6">
        <button
          onClick={() => {
            if (step === 2) {
              setStep(1);
            } else if (step === 3) {
              navigate("/patient/select");
            } else {
              navigate("/patient/select");
            }
          }}
          className="flex items-center gap-2 text-ink-500 hover:text-ink-900 transition-colors py-2"
        >
          <ArrowLeft size={18} />
          <span className="font-['Prompt'] text-sm font-medium">
            {step === 3 ? "กลับไปพอร์ตัล" : "ย้อนกลับ"}
          </span>
        </button>

        <div className="flex items-center gap-2">
          <span className="text-xs font-medium font-mono px-2.5 py-1 bg-white border border-[#dbe3ec] text-ink-700 rounded-lg">
            {patient.hn}
          </span>
          <span className="text-sm font-medium text-ink-800 font-['Prompt']">{patient.name}</span>
        </div>
      </div>

      {/* Progress Stepper */}
      <div className="w-full max-w-xl mx-auto mb-8 px-4">
        <div className="flex items-center justify-between relative">
          <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-0.5 bg-[#dbe3ec] z-0" />
          <div
            className="absolute left-0 top-1/2 -translate-y-1/2 h-0.5 bg-brand-500 transition-all duration-300 z-0"
            style={{ width: step === 1 ? "0%" : step === 2 ? "50%" : "100%" }}
          />

          {/* Step 1 Bubble */}
          <div className="z-10 flex flex-col items-center">
            <div
              className={`size-10 rounded-full flex items-center justify-center font-medium text-sm border-2 transition-all ${
                step >= 1 ? "bg-brand-600 border-brand-600 text-white" : "bg-white border-[#dbe3ec] text-ink-300"
              }`}
            >
              {step > 1 ? <Check size={16} /> : "1"}
            </div>
            <span className="text-[11px] font-medium text-ink-600 font-['Prompt'] mt-1.5 bg-white px-2">บัตรประชาชน</span>
          </div>

          {/* Step 2 Bubble */}
          <div className="z-10 flex flex-col items-center">
            <div
              className={`size-10 rounded-full flex items-center justify-center font-medium text-sm border-2 transition-all ${
                step >= 2 ? "bg-brand-600 border-brand-600 text-white" : "bg-white border-[#dbe3ec] text-ink-300"
              }`}
            >
              {step > 2 ? <Check size={16} /> : "2"}
            </div>
            <span className="text-[11px] font-medium text-ink-600 font-['Prompt'] mt-1.5 bg-white px-2">ค่ารักษา</span>
          </div>

          {/* Step 3 Bubble */}
          <div className="z-10 flex flex-col items-center">
            <div
              className={`size-10 rounded-full flex items-center justify-center font-medium text-sm border-2 transition-all ${
                step === 3 ? "bg-brand-600 border-brand-600 text-white" : "bg-white border-[#dbe3ec] text-ink-300"
              }`}
            >
              3
            </div>
            <span className="text-[11px] font-medium text-ink-600 font-['Prompt'] mt-1.5 bg-white px-2">เสร็จสมบูรณ์</span>
          </div>
        </div>
      </div>

      {/* Wizard Content */}
      <div className="w-full max-w-2xl mx-auto flex-1 flex flex-col justify-center">
        {step === 1 && (
          <div className="bg-white border border-[#dbe3ec] rounded-3xl p-6 sm:p-8 shadow-sm flex flex-col">
            <h2 className="text-xl font-medium text-ink-950 font-['Prompt'] mb-1">ขั้นตอนที่ 1: รับรองสำเนาถูกต้องบัตรประชาชน</h2>
            <p className="text-xs text-ink-400 font-['Prompt'] mb-6">
              กรุณาเซ็นชื่อรับรองสำเนาถูกต้องด้านล่างรูปภาพ เพื่อใช้ประกอบคำขอเคลมประกันสุขภาพ
            </p>

            {/* ID Card Display Card */}
            <div className="border border-[#dbe3ec] rounded-2xl p-4 bg-slate-50 flex flex-col items-center mb-6">
              <div className="relative w-full max-w-md bg-white border border-[#dbe3ec] rounded-xl overflow-hidden shadow-sm flex flex-col">
                <img src={previewSrc || "/idcard.png"} alt="ID Card Copy" className="w-full h-auto object-cover" />
                <div className="border-t border-line-soft p-3.5 bg-slate-50/50 flex flex-col items-center text-center">
                  <p className="text-xs font-medium text-ink-800 font-['Prompt']">ลงลายมือชื่อรับรองสำเนาถูกต้อง</p>
                  <p className="text-[10px] text-ink-400 font-['Prompt'] mt-0.5">รับรองสำเนาเพื่อการเคลมของโรงพยาบาลศิครินทร์เท่านั้น</p>
                </div>
              </div>
            </div>

            {/* Signature Area */}
            <div className="space-y-3">
              <label className="block text-xs font-medium text-ink-600 font-['Prompt']">
                ลงนามรับรองสำเนาถูกต้อง (Signature)
              </label>
              <SignatureCanvas onSave={setSigConsent} value={sigConsent} />
            </div>

            {/* Actions */}
            <button
              disabled={!sigConsent}
              onClick={handleNextStep}
              className="mt-8 w-full bg-brand-600 text-white font-medium py-3.5 px-4 rounded-xl font-['Prompt'] text-sm hover:bg-brand-700 transition-colors shadow-sm disabled:opacity-50 flex items-center justify-center gap-1.5"
            >
              <span>บันทึกลายเซ็นและดำเนินการต่อ</span>
              <ChevronRight size={16} />
            </button>
          </div>
        )}

        {step === 2 && (
          <div className="bg-white border border-[#dbe3ec] rounded-3xl p-6 sm:p-8 shadow-sm flex flex-col">
            <h2 className="text-xl font-medium text-ink-950 font-['Prompt'] mb-1">
              {patient.claimValue !== null 
                ? "ขั้นตอนที่ 2: รับทราบค่ารักษาพยาบาล (Invoice)" 
                : "ขั้นตอนที่ 2: ตรวจสอบและรับรองเอกสารลงทะเบียน"
              }
            </h2>
            <p className="text-xs text-ink-400 font-['Prompt'] mb-6">
              {patient.claimValue !== null
                ? "กรุณาตรวจทานรายละเอียดค่ารักษา และเซ็นรับรองรับทราบยอดรวมค่าใช้จ่ายเพื่อนำไปเรียกเก็บตรงกับบริษัทประกัน"
                : "กรุณาตรวจทานรายละเอียดของชุดเอกสาร และลงนามรับรองความถูกต้องเพื่อยื่นเอกสารเข้าสู่ระบบ"
              }
            </p>

            {/* Expense Bill Display */}
            {patient.claimValue !== null && (
              <div className="border border-[#dbe3ec] rounded-2xl bg-slate-50 overflow-hidden mb-6 shadow-inner">
                <div className="bg-white border-b border-[#dbe3ec] p-4 flex items-center justify-between">
                  <span className="text-xs font-medium text-ink-800 font-['Prompt']">สรุปค่าใช้จ่ายการรักษาพยาบาล</span>
                  <span className="text-xs text-ink-400 font-mono font-medium">INV-{Math.floor(100000 + Math.random() * 900000)}</span>
                </div>
                <div className="p-4 sm:p-5 space-y-3.5 text-xs font-['Prompt']">
                  <div className="flex items-center justify-between text-ink-600">
                    <span>ค่าห้องและค่าอาหาร (Room & Board)</span>
                    <span className="font-medium text-ink-800">฿{roomCost.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center justify-between text-ink-600">
                    <span>ค่ายาและเวชภัณฑ์ (Medicine)</span>
                    <span className="font-medium text-ink-800">฿{medicineCost.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center justify-between text-ink-600">
                    <span>ค่าตรวจวินิจฉัย/ห้องแล็บ (Diagnostic/Lab)</span>
                    <span className="font-medium text-ink-800">฿{doctorCost.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center justify-between text-ink-600">
                    <span>ค่าธรรมเนียมแพทย์และบริการทางการแพทย์ (Doctor/Services)</span>
                    <span className="font-medium text-ink-800">฿{serviceCost.toLocaleString()}</span>
                  </div>
                  <div className="border-t border-[#dbe3ec] pt-3.5 flex items-center justify-between text-sm font-medium text-ink-950">
                    <span>ยอดค่ารักษาพยาบาลรวมทั้งสิ้น (Total Amount)</span>
                    <span className="text-brand-600 text-base">฿{claimTotal.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Document Paging Viewer (only for registration patients) */}
            {patient.claimValue === null && (
              <div className="mb-6">
                <label className="block text-xs font-semibold text-ink-600 font-['Prompt'] mb-2.5">
                  เอกสารลงทะเบียนคนไข้ (รวม {exampleDocs.length} หน้า)
                </label>
                <div className="relative border border-[#dbe3ec] rounded-2xl p-4 bg-slate-50 flex flex-col items-center">
                  {/* Document Container */}
                  <div className="relative w-full max-w-sm bg-white border border-[#dbe3ec] rounded-xl overflow-hidden shadow-sm flex flex-col items-center">
                    <img
                      src={exampleDocs[docPageIndex]}
                      alt={`Document Page ${docPageIndex + 3}`}
                      className="h-96 w-auto object-contain cursor-pointer"
                      onClick={() => setShowFullScreenDoc(true)}
                    />
                    
                    {/* Hover Full Screen Overlay Button */}
                    <button
                      type="button"
                      onClick={() => setShowFullScreenDoc(true)}
                      className="absolute top-3 right-3 bg-slate-900/80 hover:bg-slate-900 text-white rounded-lg p-2 shadow transition-colors flex items-center gap-1 text-xs font-['Prompt']"
                    >
                      <Maximize2 size={14} />
                      <span>เต็มจอ</span>
                    </button>
                  </div>

                  {/* Navigation Paging Controls */}
                  <div className="flex items-center justify-between w-full max-w-xs mt-4">
                    <button
                      type="button"
                      disabled={docPageIndex === 0}
                      onClick={() => setDocPageIndex((prev) => Math.max(0, prev - 1))}
                      className="rounded-lg border border-[#dbe3ec] bg-white p-2 text-ink-600 hover:bg-slate-50 disabled:opacity-30 transition-colors"
                    >
                      <ChevronLeft size={16} />
                    </button>
                    
                    <span className="text-xs font-medium text-ink-700 font-['Prompt']">
                      หน้า {docPageIndex + 3} / {exampleDocs.length + 2}
                    </span>

                    <button
                      type="button"
                      disabled={docPageIndex === exampleDocs.length - 1}
                      onClick={() => setDocPageIndex((prev) => Math.min(exampleDocs.length - 1, prev + 1))}
                      className="rounded-lg border border-[#dbe3ec] bg-white p-2 text-ink-600 hover:bg-slate-50 disabled:opacity-30 transition-colors"
                    >
                      <ChevronRight size={16} />
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Documents to Review List */}
            <div className="mb-6">
              <label className="block text-xs font-semibold text-ink-600 font-['Prompt'] mb-2.5">
                รายการเอกสารที่เกี่ยวข้องในระบบ (Documents in Claim Profile)
              </label>
              <div className="bg-[#fafbfc] border border-[#dbe3ec] rounded-2xl p-4 space-y-2.5">
                {patient.documents.map((d) => (
                  <div key={d.id} className="flex items-center justify-between text-xs font-['Prompt']">
                    <span className="text-ink-600 font-medium">{d.kind}</span>
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold ${
                        d.status === "ครบถ้วน"
                          ? "bg-[#d2f1e4] text-[#0a5f5e]"
                          : "bg-[#fef3c6] text-[#bb4d00]"
                      }`}
                    >
                      {d.status === "ครบถ้วน" ? "✓ ครบถ้วน" : "รอดำเนินการ"}
                    </span>
                  </div>
                ))}
                {patient.documents.length === 0 && (
                  <div className="text-center text-xs text-ink-300 py-2">ไม่มีเอกสารที่ต้องตรวจสอบ</div>
                )}
              </div>
            </div>

            {/* Signature Area */}
            <div className="space-y-3">
              <label className="block text-xs font-medium text-[#4a5565] font-['Prompt']">
                ลงนามรับทราบและยินยอมรับรองเอกสาร (Signature)
              </label>
              <SignatureCanvas onSave={setSigInvoice} value={sigInvoice} />
            </div>

            {/* Actions */}
            <button
              disabled={!sigInvoice}
              onClick={handleNextStep}
              className="mt-8 w-full bg-brand-600 text-white font-medium py-3.5 px-4 rounded-xl font-['Prompt'] text-sm hover:bg-brand-700 transition-colors shadow-sm disabled:opacity-50 flex items-center justify-center gap-1.5"
            >
              <span>ยืนยันข้อมูลและส่งเอกสารทั้งหมด</span>
              <Check size={16} />
            </button>
          </div>
        )}

        {step === 3 && (
          <div className="bg-white border border-[#dbe3ec] rounded-3xl p-8 shadow-sm flex flex-col items-center text-center">
            <div className="size-20 rounded-full bg-brand-50 text-brand-600 flex items-center justify-center mb-6 animate-bounce">
              <CheckCircle2 size={48} className="stroke-[2.5]" />
            </div>
            <h2 className="text-2xl font-medium text-ink-950 font-['Prompt'] mb-3">เซ็นรับรองเอกสารเสร็จสมบูรณ์!</h2>
            <p className="text-sm text-ink-400 font-['Prompt'] leading-relaxed max-w-md mb-8">
              ระบบได้ทำการบันทึกลายเซ็นดิจิทัลของ <strong className="font-medium text-ink-700">{patient.name}</strong> 
              ลงในสำเนาบัตรประชาชน และใบเสร็จรับเงินค่ารักษาพยาบาลเรียบร้อยแล้ว ข้อมูลจะถูกอัปเดตและแจ้งเตือนไปยังพนักงานการเงินทันที
            </p>

            <div className="w-full bg-[#f6f8fb] border border-[#dbe3ec] rounded-2xl p-4 flex items-center justify-center gap-2 mb-8">
              <ShieldCheck size={16} className="text-[#0a5f5e]" />
              <span className="text-xs font-medium text-[#0a5f5e] font-['Prompt']">
                เข้ารหัสลายเซ็นแบบดิจิทัลความปลอดภัยสูงเรียบร้อยแล้ว
              </span>
            </div>

            <button
              onClick={() => navigate("/patient/select")}
              className="w-full bg-brand-600 text-white font-medium py-3.5 px-4 rounded-xl font-['Prompt'] text-sm hover:bg-brand-700 transition-colors shadow-sm"
            >
              เสร็จสิ้น (กลับหน้าเลือกคนไข้)
            </button>
          </div>
        )}
      {showFullScreenDoc && (
        <div className="absolute inset-0 bg-white z-[9999] flex flex-col items-center justify-center p-5 sm:p-6 overflow-hidden rounded-none sm:rounded-[20px]">
          <div className="w-full flex items-center justify-between text-ink-800 mb-4 border-b border-line-soft pb-3">
            <span className="font-['Prompt'] text-sm font-semibold">
              เอกสารหน้าที่ {docPageIndex + 3} / {exampleDocs.length + 2}
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={docPageIndex === 0}
                onClick={() => setDocPageIndex((prev) => Math.max(0, prev - 1))}
                className="rounded-lg border border-line bg-white p-2 text-ink-600 hover:bg-slate-50 disabled:opacity-30 transition-colors cursor-pointer"
              >
                <ChevronLeft size={16} />
              </button>
              <button
                type="button"
                disabled={docPageIndex === exampleDocs.length - 1}
                onClick={() => setDocPageIndex((prev) => Math.min(exampleDocs.length - 1, prev + 1))}
                className="rounded-lg border border-line bg-white p-2 text-ink-600 hover:bg-slate-50 disabled:opacity-30 transition-colors cursor-pointer"
              >
                <ChevronRight size={16} />
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowFullScreenDoc(false);
                  setFullscreenZoomScale(0.95);
                }}
                className="rounded-lg border border-line bg-white p-2 text-ink-600 hover:bg-slate-50 transition-colors cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>
          </div>

          <div className="relative flex-1 w-full flex flex-col bg-slate-50/50 rounded-xl border border-line-soft overflow-hidden">
            {/* Zoom Controls */}
            <div className="absolute top-4 right-4 flex items-center gap-1 bg-white/95 border border-line-soft rounded-lg p-1.5 shadow-md z-10">
              <button
                type="button"
                onClick={() => setFullscreenZoomScale((prev) => Math.max(0.5, prev - 0.25))}
                className="rounded p-1 hover:bg-slate-100 text-ink-600 transition-colors cursor-pointer"
                title="Zoom Out"
              >
                <ZoomOut size={15} />
              </button>
              <span className="text-[11px] font-mono font-semibold text-ink-600 px-1 select-none">
                {Math.round(fullscreenZoomScale * 100)}%
              </span>
              <button
                type="button"
                onClick={() => setFullscreenZoomScale((prev) => Math.min(3, prev + 0.25))}
                className="rounded p-1 hover:bg-slate-100 text-ink-600 transition-colors cursor-pointer"
                title="Zoom In"
              >
                <ZoomIn size={15} />
              </button>
            </div>

            {/* Document Image Viewport */}
            <div className="flex-1 w-full overflow-auto flex items-start justify-center p-6 bg-slate-100">
              <img
                src={exampleDocs[docPageIndex]}
                alt={`Full Screen Page ${docPageIndex + 3}`}
                className="rounded shadow-md transition-all duration-150 origin-top"
                style={{
                  width: `${fullscreenZoomScale * 100}%`,
                  maxWidth: fullscreenZoomScale === 1 ? "100%" : "none",
                  height: "auto",
                }}
              />
            </div>
          </div>
        </div>
      )}
      </div>
    </div>
  );
}
