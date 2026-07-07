import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Search, User, FileText, ChevronRight, PenTool } from "lucide-react";
import { useAppData } from "../../context/AppDataContext";

export function PatientSelect() {
  const navigate = useNavigate();
  const { patients } = useAppData();
  const [searchTerm, setSearchTerm] = useState("");

  const pendingPatients = useMemo(() => {
    // Return patients sorted: those who need signatures first
    return [...patients].sort((a, b) => {
      const aNeeds = !a.consentSigned || !a.invoiceSigned;
      const bNeeds = !b.consentSigned || !b.invoiceSigned;
      if (aNeeds && !bNeeds) return -1;
      if (!aNeeds && bNeeds) return 1;
      return a.hn.localeCompare(b.hn);
    });
  }, [patients]);

  const filtered = useMemo(() => {
    if (!searchTerm.trim()) return pendingPatients;
    const lower = searchTerm.toLowerCase();
    const cleanSearch = lower.replace(/[-\s]/g, "");
    return pendingPatients.filter(
      (p) =>
        p.name.toLowerCase().includes(lower) ||
        p.hn.toLowerCase().includes(lower) ||
        (p.nationalId && p.nationalId.replace(/[-\s]/g, "").includes(cleanSearch))
    );
  }, [pendingPatients, searchTerm]);

  return (
    <div className="h-full w-full bg-[#f6f8fb] flex flex-col p-6 sm:p-8 overflow-y-auto">
      {/* Top Header */}
      <div className="w-full max-w-4xl mx-auto flex items-center justify-between mb-8">
        <button
          onClick={() => navigate("/")}
          className="flex items-center gap-2 text-ink-500 hover:text-ink-900 transition-colors py-2"
        >
          <ArrowLeft size={18} />
          <span className="font-['Prompt'] text-sm font-medium">กลับหน้าหลัก</span>
        </button>

        <div className="flex items-center gap-2">
          <img src="slogo.png" alt="Hospital Logo" className="h-9 w-auto object-contain rounded-lg" />
          <h1 className="text-lg font-medium text-ink-800 font-['Prompt']">พอร์ตัลเซ็นเอกสารคนไข้ (iPad)</h1>
        </div>
      </div>

      {/* Main Container */}
      <div className="w-full max-w-4xl mx-auto flex-1 flex flex-col">
        {/* Banner */}
        <div className="bg-white border border-[#dbe3ec] rounded-2xl p-6 mb-6 shadow-sm flex items-start gap-4">
          <div className="p-3 bg-[#e2f1f0] text-[#0a5f5e] rounded-xl shrink-0">
            <PenTool size={24} />
          </div>
          <div>
            <h2 className="text-lg font-medium text-ink-900 font-['Prompt']">กรุณาเลือกรายชื่อเพื่อเซ็นรับรอง</h2>
            <p className="text-sm text-ink-400 font-['Prompt'] mt-1 leading-relaxed">
              กรุณาพิมพ์ค้นหาชื่อ หรือเลข HN หรือเลขประจำตัวประชาชน จากนั้นแตะที่แถบรายชื่อเพื่อทำการลงลายมือชื่อ
            </p>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative mb-6">
          <Search size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-ink-300 pointer-events-none" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="ค้นหาชื่อผู้ป่วย, นามสกุล, เลข HN หรือเลขประจำตัวประชาชน..."
            className="w-full bg-white border border-[#dbe3ec] rounded-2xl py-4 pl-12 pr-4 text-base text-ink-800 placeholder:text-ink-300 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100 shadow-sm transition-all"
          />
        </div>

        {/* Patient Grid / List */}
        <div className="flex-1 space-y-4">
          {filtered.length > 0 ? (
            filtered.map((p) => {
              const needsConsent = !p.consentSigned;
              const needsInvoice = !p.invoiceSigned;
              const completed = !needsConsent && !needsInvoice;

              return (
                <div
                  key={p.hn}
                  onClick={() => navigate(`/patient/sign/${p.hn}`)}
                  className={`bg-white border rounded-2xl p-5 flex items-center justify-between shadow-sm hover:shadow-md cursor-pointer transition-all duration-200 transform active:scale-[0.99] ${
                    completed ? "border-[#dbe3ec] opacity-75" : "border-[#ffbe7a] bg-[#fffcf8]/60 hover:border-brand-500"
                  }`}
                >
                  <div className="flex items-center gap-4 min-w-0 flex-1">
                    <div className={`p-3.5 rounded-xl shrink-0 ${
                      completed ? "bg-[#e2f1f0] text-[#0a5f5e]" : "bg-[#fff3c6] text-[#bb4d00]"
                    }`}>
                      <User size={22} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="text-base font-medium text-ink-800 font-['Prompt'] truncate">{p.name}</h3>
                        <span className="text-xs text-ink-300 bg-[#f6f8fb] px-2 py-0.5 rounded font-mono font-medium shrink-0">
                          {p.hn}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {needsConsent && (
                          <span className="inline-flex items-center gap-1 text-[11px] font-medium text-[#bb4d00] bg-[#fef3c6] px-2.5 py-0.5 rounded-full">
                            <FileText size={10} />
                            รอลงลายมือชื่อใบยินยอม (PDPA)
                          </span>
                        )}
                        {needsInvoice && (
                          <span className="inline-flex items-center gap-1 text-[11px] font-medium text-[#bb4d00] bg-[#fef3c6] px-2.5 py-0.5 rounded-full">
                            <FileText size={10} />
                            รอรับทราบค่ารักษาพยาบาล
                          </span>
                        )}
                        {completed && (
                          <span className="inline-flex items-center gap-1 text-[11px] font-medium text-[#0a5f5e] bg-[#d2f1e4] px-2.5 py-0.5 rounded-full">
                            ✓ เซ็นเอกสารครบถ้วนแล้ว
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0 ml-4">
                    {!completed ? (
                      <span className="hidden sm:inline-block text-xs font-medium text-brand-600 bg-brand-50 border border-brand-100 px-3 py-1.5 rounded-lg font-['Prompt']">
                        เริ่มเซ็นเอกสาร
                      </span>
                    ) : (
                      <span className="hidden sm:inline-block text-xs font-medium text-ink-300 px-3 py-1.5">
                        เสร็จสิ้น
                      </span>
                    )}
                    <ChevronRight size={18} className="text-ink-300" />
                  </div>
                </div>
              );
            })
          ) : (
            <div className="bg-white border border-[#dbe3ec] rounded-2xl py-12 text-center shadow-sm">
              <p className="text-sm text-ink-400 font-['Prompt']">ไม่พบรายชื่อผู้ป่วยที่ค้นหา</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
