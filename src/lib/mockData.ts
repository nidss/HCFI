import type {
  AuditLogEntry,
  Batch,
  ClaimDocument,
  ClaimStatus,
  DeliveryLink,
  DocKind,
  Patient,
  StaffUser,
} from "./types";

export const currentStaff: StaffUser = {
  name: "สมหญิง รัตนกุล",
  role: "เจ้าหน้าที่การเงิน",
  username: "staff.mind",
};

let seq = 1;
function nextId(prefix: string): string {
  return `${prefix}-${String(seq++).padStart(4, "0")}`;
}

function doc(kind: DocKind, status: ClaimDocument["status"], source: ClaimDocument["source"], daysAgo: number): ClaimDocument {
  return {
    id: nextId("DOC"),
    kind,
    fileName: `${kind.replace(/[()]/g, "")}_${Math.floor(Math.random() * 9000 + 1000)}.pdf`,
    status,
    source,
    addedAt: relativeDate(daysAgo),
  };
}

export function relativeDate(daysAgo: number, hour = 9, minute = 0): string {
  const d = new Date(2026, 6, 4 - daysAgo, hour, minute);
  return d.toISOString();
}

export function formatThaiDateTime(iso: string): string {
  const d = new Date(iso);
  const thaiMonths = [
    "ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย.",
    "ก.ค.", "ส.ค.", "ก.ย.", "ต.ค.", "พ.ย.", "ธ.ค.",
  ];
  const day = d.getDate();
  const month = thaiMonths[d.getMonth()];
  const year = d.getFullYear() + 543;
  const hh = String(d.getHours()).padStart(2, "0");
  const mm = String(d.getMinutes()).padStart(2, "0");
  return `${day} ${month} ${year} ${hh}:${mm} น.`;
}

export function formatThaiDate(iso: string): string {
  return formatThaiDateTime(iso).split(" ").slice(0, 3).join(" ");
}

export function formatCurrency(value: number | null): string {
  if (value === null) return "-";
  return `฿${value.toLocaleString("th-TH")}`;
}

function buildDocuments(status: ClaimStatus, daysAgo: number): ClaimDocument[] {
  if (status === "-") return [];
  const idCard = doc("สำเนาบัตรประชาชน", "ครบถ้วน", "สแกนบัตร", daysAgo);
  const consent = doc(
    "ใบยินยอมเปิดเผยข้อมูล",
    status === "รอเซ็นยินยอม" ? "รอดำเนินการ" : "ครบถ้วน",
    "ลงนามดิจิทัล",
    daysAgo,
  );
  const invoice = doc(
    "ใบเสร็จรับเงิน (Invoice)",
    status === "รอเซ็นยินยอม" ? "รอดำเนินการ" : "ครบถ้วน",
    "OCR",
    daysAgo,
  );
  const medCert = doc(
    "ใบรับรองแพทย์",
    status === "เอกสารไม่ครบ" ? "รอดำเนินการ" : "ครบถ้วน",
    "อัปโหลดโดยเจ้าหน้าที่",
    daysAgo,
  );
  const summary = doc(
    "สรุปการรักษา",
    status === "เอกสารไม่ครบ" ? "รอดำเนินการ" : "ครบถ้วน",
    "อัปโหลดโดยเจ้าหน้าที่",
    daysAgo,
  );
  return [idCard, consent, invoice, medCert, summary];
}

interface SeedRow {
  hn: string;
  name: string;
  nationalId: string;
  daysAgo: number;
  stage: Patient["stage"];
  claimValue: number | null;
  status: ClaimStatus;
  batchId?: string;
  ocrConfidence?: number;
}

const seedRows: SeedRow[] = [
  { hn: "HN 6604128", name: "ณัฐพงษ์ นามสกุล", nationalId: "1100701234561", daysAgo: 21, stage: 3, claimValue: 8000, status: "พร้อมเบิก", ocrConfidence: 94 },
  { hn: "HN 6603871", name: "ปิยะดา ศรีสุข", nationalId: "1100701234562", daysAgo: 20, stage: 3, claimValue: null, status: "เอกสารไม่ครบ" },
  { hn: "HN 6604256", name: "วิชัย เจริญพร", nationalId: "1100701234563", daysAgo: 19, stage: 4, claimValue: 10700, status: "รอเลข ERP", batchId: "BATCH-2026-0031" },
  { hn: "HN 6604190", name: "สุนิสา รุ่งเรือง", nationalId: "1100701234564", daysAgo: 18, stage: 5, claimValue: 12050, status: "ส่งมอบแล้ว", batchId: "BATCH-2026-0018" },
  { hn: "HN 6604302", name: "อรรถพล แสงทอง", nationalId: "1100701234565", daysAgo: 17, stage: 2, claimValue: null, status: "รอเซ็นยินยอม" },
  { hn: "HN 6604463", name: "กมลชนก พงษ์พันธุ์", nationalId: "1100701234566", daysAgo: 16, stage: 3, claimValue: 14750, status: "พร้อมเบิก" },
  { hn: "HN 6604470", name: "ธนากร วงศ์ษา", nationalId: "1100701234567", daysAgo: 15, stage: 3, claimValue: null, status: "เอกสารไม่ครบ" },
  { hn: "HN 6604477", name: "วราภรณ์ อินทร์แก้ว", nationalId: "1100701234568", daysAgo: 14, stage: 4, claimValue: 17450, status: "รอเลข ERP", batchId: "BATCH-2026-0031" },
  { hn: "HN 6604484", name: "สมชาย บุญมี", nationalId: "1100701234569", daysAgo: 13, stage: 5, claimValue: 18800, status: "ส่งมอบแล้ว", batchId: "BATCH-2026-0018" },
  { hn: "HN 6604491", name: "อรทัย ทองดี", nationalId: "1100701234570", daysAgo: 12, stage: 1, claimValue: null, status: "รอเซ็นยินยอม" },
  { hn: "HN 6604498", name: "ประภาส สายทอง", nationalId: "1100701234571", daysAgo: 11, stage: 3, claimValue: 21500, status: "พร้อมเบิก" },
  { hn: "HN 6604505", name: "รัตนา เพชรรัตน์", nationalId: "1100701234572", daysAgo: 10, stage: 3, claimValue: null, status: "เอกสารไม่ครบ" },
  { hn: "HN 6604512", name: "ชัยวัฒน์ มณีวรรณ", nationalId: "1100701234573", daysAgo: 9, stage: 3, claimValue: 24200, status: "พร้อมเบิก" },
  { hn: "HN 6604519", name: "ศิริพร ไชยวงศ์", nationalId: "1100701234574", daysAgo: 8, stage: 5, claimValue: 25550, status: "ส่งมอบแล้ว", batchId: "BATCH-2026-0018" },
  { hn: "HN 6604526", name: "เอกชัย สุขสวัสดิ์", nationalId: "1100701234575", daysAgo: 7, stage: 4, claimValue: 26900, status: "รอเลข ERP", batchId: "BATCH-2026-0031" },
  { hn: "HN 6604600", name: "สมฉวี มีความสุข", nationalId: "0000000000000", daysAgo: 0, stage: 0, claimValue: null, status: "-" },
];

export function createInitialPatients(): Patient[] {
  return seedRows.map((row) => ({
    hn: row.hn,
    name: row.name,
    nationalId: row.nationalId,
    visitDate: relativeDate(row.daysAgo),
    stage: row.stage,
    claimValue: row.claimValue,
    status: row.status,
    documents: buildDocuments(row.status, row.daysAgo),
    consentSigned: row.status !== "รอเซ็นยินยอม" && row.status !== "-",
    invoiceSigned: row.status !== "รอเซ็นยินยอม" && row.status !== "-",
    ocrConfidence: row.ocrConfidence,
    batchId: row.batchId,
  }));
}

export function createInitialBatches(): Batch[] {
  return [
    {
      id: "BATCH-2026-0031",
      hns: ["HN 6604256", "HN 6604477", "HN 6604526"],
      totalValue: 10700 + 17450 + 26900,
      status: "กำลังส่งไป ERP",
      referenceNumber: null,
      createdAt: relativeDate(2, 15, 40),
    },
    {
      id: "BATCH-2026-0018",
      hns: ["HN 6604190", "HN 6604484", "HN 6604519"],
      totalValue: 12050 + 18800 + 25550,
      status: "สำเร็จ",
      referenceNumber: "REF-NS-88213",
      createdAt: relativeDate(3, 10, 5),
    },
  ];
}

export function createInitialDeliveryLinks(): DeliveryLink[] {
  return [
    {
      id: "DL-0001",
      batchId: "BATCH-2026-0018",
      insurerEmail: "claims@insurer.co.th",
      token: "tok_9f21ac3e8b4d",
      expiresInDays: 7,
      createdAt: relativeDate(1, 8, 5),
      expiresAt: relativeDate(-6, 8, 5),
      emailSent: true,
      attempts: [
        { timestamp: relativeDate(1, 9, 30), ip: "58.11.20.4", success: true },
      ],
    },
  ];
}

export function createInitialAuditLog(): AuditLogEntry[] {
  return [
    {
      id: nextId("LOG"),
      timestamp: relativeDate(1, 8, 5),
      user: "staff.mind",
      action: "สร้างลิงก์ดาวน์โหลด",
      target: "PKG-2026-0018",
      ip: "1.47.200.83",
      status: "สำเร็จ",
      detail: "สร้าง Token Link อายุ 7 วัน",
    },
    {
      id: nextId("LOG"),
      timestamp: relativeDate(2, 15, 40),
      user: "staff.mind",
      action: "ส่งข้อมูลไปยัง ERP",
      target: "BATCH-2026-0031",
      ip: "1.47.200.83",
      status: "สำเร็จ",
      detail: "ส่งชุดเอกสาร 3 รายการไปยัง ERP (NetSuite) สำเร็จ",
    },
    {
      id: nextId("LOG"),
      timestamp: relativeDate(3, 9, 20),
      user: "cashier.nok",
      action: "จับคู่ด้วย OCR",
      target: "invoice_6604128.pdf",
      ip: "202.28.180.5",
      status: "สำเร็จ",
      detail: "OCR จับคู่ HN 6604128 (ความมั่นใจ 94%)",
    },
    {
      id: nextId("LOG"),
      timestamp: relativeDate(3, 9, 12),
      user: "reception.som",
      action: "ค้นหาผู้ป่วย",
      target: "HN 6604128",
      ip: "203.150.34.12",
      status: "สำเร็จ",
      detail: "ค้นหาด้วยเลขบัตรประชาชนจากระบบ SIS",
    },
  ];
}

export const statusColor: Record<ClaimStatus, { bg: string; fg: string }> = {
  "เอกสารไม่ครบ": { bg: "bg-status-waiting-bg", fg: "text-status-waiting-fg" },
  "รอเซ็นยินยอม": { bg: "bg-status-neutral-bg", fg: "text-status-neutral-fg" },
  "พร้อมเบิก": { bg: "bg-status-ready-bg", fg: "text-status-ready-fg" },
  "รอเลข ERP": { bg: "bg-status-erp-bg", fg: "text-status-erp-fg" },
  "พร้อมส่งมอบ": { bg: "bg-indigo-100", fg: "text-indigo-700" },
  "ส่งมอบแล้ว": { bg: "bg-status-sent-bg", fg: "text-status-sent-fg" },
  "-": { bg: "bg-line-soft", fg: "text-ink-400" },
};

export function genToken(): string {
  return "tok_" + Math.random().toString(16).slice(2, 14);
}

export function genIp(): string {
  return `${rnd(1, 223)}.${rnd(0, 255)}.${rnd(0, 255)}.${rnd(1, 254)}`;
}

function rnd(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
