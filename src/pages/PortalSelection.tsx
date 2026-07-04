import { useNavigate } from "react-router-dom";
import { Monitor, Tablet, ShieldAlert } from "lucide-react";

export function PortalSelection() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen w-full bg-[#f6f8fb] flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Decorative background blur blobs */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-[#d2f1e4]/40 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-brand-100/40 rounded-full blur-[120px] pointer-events-none" />

      <div className="w-full max-w-4xl flex flex-col items-center text-center z-10 mb-12">
        <div className="flex items-center gap-3 mb-4">
          <img src="https://raw.githubusercontent.com/nidss/HCFI/main/public/slogo.png" alt="Sikarin Logo" className="h-12 w-auto object-contain rounded-xl shadow-sm" />
          <h1 className="text-3xl font-medium tracking-tight text-ink-900 font-['Outfit']">
            Claim<span className="text-brand-600 font-normal">Flow</span>
          </h1>
        </div>
        <h2 className="text-2xl font-medium text-ink-800 font-['Prompt']">ยินดีต้อนรับสู่ระบบบริหารงานเคลม</h2>
        <p className="text-sm text-ink-400 mt-2 font-['Prompt'] max-w-md">
          ระบบจัดการเอกสารเรียกร้องค่ารักษาพยาบาลอัจฉริยะ โรงพยาบาลศิครินทร์ กรุณาเลือกสิทธิ์การเข้าใช้งานเพื่อดำเนินการต่อ
        </p>
      </div>

      <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-8 z-10">
        {/* Staff Portal Card */}
        <div 
          onClick={() => navigate("/overview")}
          className="group cursor-pointer bg-white border border-[#dbe3ec] hover:border-brand-500 rounded-2xl p-8 flex flex-col justify-between shadow-sm hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1.5"
        >
          <div>
            <div className="size-16 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center mb-6 group-hover:bg-brand-600 group-hover:text-white transition-all duration-300">
              <Monitor size={32} />
            </div>
            <h3 className="text-xl font-medium text-ink-800 font-['Prompt'] mb-3 group-hover:text-brand-600 transition-colors">
              ส่วนของพนักงานโรงพยาบาล (Desktop)
            </h3>
            <p className="text-sm text-ink-400 font-['Prompt'] leading-relaxed mb-6">
              ระบบแดชบอร์ดหลักสำหรับแผนกต้อนรับ การเงิน และตรวจสอบเอกสาร (Audit) 
              สำหรับติดตามคิวผู้ป่วย นำเข้าใบเสร็จ (Invoice) ด้วย OCR 
              ออกใบสรุปจ่ายเชื่อมต่อระบบ ERP และส่งเอกสารให้บริษัทประกันภัย
            </p>
          </div>
          <button className="w-full bg-[#f6f8fb] text-brand-600 font-medium py-3 px-4 rounded-xl group-hover:bg-brand-600 group-hover:text-white transition-all duration-300 font-['Prompt'] text-sm shadow-sm">
            เข้าพอร์ตัลผู้ปฏิบัติงาน
          </button>
        </div>

        {/* Patient Portal Card */}
        <div 
          onClick={() => navigate("/patient/select")}
          className="group cursor-pointer bg-white border border-[#dbe3ec] hover:border-brand-500 rounded-2xl p-8 flex flex-col justify-between shadow-sm hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1.5"
        >
          <div>
            <div className="size-16 rounded-xl bg-[#fff9db] text-[#d9480f] flex items-center justify-center mb-6 group-hover:bg-[#d9480f] group-hover:text-white transition-all duration-300">
              <Tablet size={32} />
            </div>
            <h3 className="text-xl font-medium text-ink-800 font-['Prompt'] mb-3 group-hover:text-[#d9480f] transition-colors">
              ส่วนของคนไข้ (iPad)
            </h3>
            <p className="text-sm text-ink-400 font-['Prompt'] leading-relaxed mb-6">
              หน้าจอสำหรับเครื่องแท็บเล็ต/iPad ประจำเคาน์เตอร์บริการ 
              เพื่อให้ผู้ป่วยตรวจทานข้อมูลส่วนตัว เซ็นยอมรับเงื่อนไขการเปิดเผยข้อมูลการรักษาพยาบาล 
              เซ็นรับรองสำเนาถูกต้องของบัตรประชาชน และรับทราบรายการค่ารักษา
            </p>
          </div>
          <button className="w-full bg-[#f6f8fb] text-[#d9480f] font-medium py-3 px-4 rounded-xl group-hover:bg-[#d9480f] group-hover:text-white transition-all duration-300 font-['Prompt'] text-sm shadow-sm">
            เข้าพอร์ตัลผู้ป่วย/แท็บเล็ต
          </button>
        </div>
      </div>

      {/* Info Warning Footer Banner */}
      <div className="mt-16 bg-white border border-[#dbe3ec] rounded-xl p-4 flex items-center gap-3 z-10 shadow-sm max-w-lg text-left">
        <ShieldAlert size={20} className="text-brand-500 shrink-0" />
        <p className="text-xs text-ink-400 font-['Prompt'] leading-relaxed">
          <strong>คำแนะนำด้านความปลอดภัย:</strong> สิทธิ์การใช้งานระบบจะถูกบันทึกผ่านทางเบราว์เซอร์นี้ หากเป็นการใช้งานเครื่องคอมพิวเตอร์สาธารณะกรุณาตรวจสอบระบบรักษาความปลอดภัยทุกครั้งเมื่อเสร็จงาน
        </p>
      </div>
    </div>
  );
}
