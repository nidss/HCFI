import { AlertTriangle, CheckCircle2, Database, FolderCog, Landmark, ShieldCheck } from "lucide-react";
import { Card, PageHeader } from "../components/PageHeader";

const integrations = [
  {
    icon: Database,
    name: "HIS — ระบบ SIS (DXC)",
    description: "ระบบเดิม ไม่มี API เชื่อมต่อโดยตรง ใช้วิธีอ่านค่าผ่านการพิมพ์ไฟล์ (Ctrl+P) และดึงข้อมูลด้วยการค้นหาแบบแมนนวล",
    status: "เชื่อมต่อแบบจำกัด",
    tone: "warning" as const,
  },
  {
    icon: Landmark,
    name: "ERP — NetSuite",
    description: "เชื่อมต่อผ่าน REST API เพื่อส่งชุดเอกสารและขอรับเลขใบสรุปจ่าย (Reference Number)",
    status: "เชื่อมต่อสำเร็จ",
    tone: "success" as const,
  },
  {
    icon: FolderCog,
    name: "Storage / e-Document (Share Drive)",
    description: "จัดเก็บไฟล์ Invoice, เอกสารเคลม และไฟล์ Package รวมสำหรับส่งมอบให้บริษัทประกัน",
    status: "เชื่อมต่อสำเร็จ",
    tone: "success" as const,
  },
];

const toneClasses: Record<string, string> = {
  success: "bg-status-ready-bg text-status-ready-fg",
  warning: "bg-status-waiting-bg text-status-waiting-fg",
};

export function Settings() {
  return (
    <div>
      <PageHeader title="การตั้งค่า" subtitle="สถานะการเชื่อมต่อระบบและนโยบายความปลอดภัยของ ClaimFlow" />

      <Card className="mb-6">
        <div className="border-b border-line-soft px-5 py-4">
          <h3 className="text-sm font-semibold text-ink-700">การเชื่อมต่อระบบ (System Integrations)</h3>
        </div>
        <ul className="divide-y divide-line-soft">
          {integrations.map((i) => (
            <li key={i.name} className="flex items-start gap-4 p-5">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-canvas text-ink-500">
                <i.icon size={18} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-ink-800">{i.name}</p>
                <p className="mt-0.5 text-sm text-ink-400">{i.description}</p>
              </div>
              <span className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-semibold ${toneClasses[i.tone]}`}>
                {i.status}
              </span>
            </li>
          ))}
        </ul>
      </Card>

      <Card className="mb-6">
        <div className="border-b border-line-soft px-5 py-4">
          <h3 className="text-sm font-semibold text-ink-700">ความปลอดภัยและการปฏิบัติตามกฎหมาย</h3>
        </div>
        <div className="space-y-4 p-5">
          <div className="flex gap-3">
            <ShieldCheck size={18} className="mt-0.5 shrink-0 text-brand-600" />
            <div>
              <p className="text-sm font-medium text-ink-700">KYC & Authentication สำหรับบริษัทประกัน</p>
              <p className="mt-0.5 text-sm text-ink-400">
                เจ้าหน้าที่บริษัทประกันต้อง Log-in ด้วย Username และ Password ก่อนเข้าถึงลิงก์ดาวน์โหลดเอกสารเสมอ
              </p>
            </div>
          </div>
          <div className="flex gap-3">
            <CheckCircle2 size={18} className="mt-0.5 shrink-0 text-brand-600" />
            <div>
              <p className="text-sm font-medium text-ink-700">การลงลายมือชื่ออิเล็กทรอนิกส์</p>
              <p className="mt-0.5 text-sm text-ink-400">
                การเซ็นผ่านหน้าจอ iPad โดยตรง (ไม่ใช้ใบรับรองอิเล็กทรอนิกส์ CA) สอดคล้องกับ พ.ร.บ. ว่าด้วยธุรกรรมทางอิเล็กทรอนิกส์ มาตรา 9
              </p>
            </div>
          </div>
          <div className="flex gap-3">
            <AlertTriangle size={18} className="mt-0.5 shrink-0 text-status-waiting-fg" />
            <div>
              <p className="text-sm font-medium text-ink-700">Audit Logging</p>
              <p className="mt-0.5 text-sm text-ink-400">
                บันทึกทุกการทำรายการ พร้อมหมายเลข IP, ผู้ใช้งาน และสถานะความสำเร็จ ดูรายละเอียดทั้งหมดได้ที่หน้า Audit Log
              </p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
