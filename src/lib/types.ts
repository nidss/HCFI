export type ClaimStatus =
  | "เอกสารไม่ครบ"
  | "รอเซ็นยินยอม"
  | "พร้อมเบิก"
  | "รอเลข ERP"
  | "พร้อมส่งมอบ"
  | "ส่งมอบแล้ว"
  | "-";

export type DocKind =
  | "สำเนาบัตรประชาชน"
  | "ใบเสร็จรับเงิน (Invoice)"
  | "ใบรับรองแพทย์"
  | "สรุปการรักษา"
  | "ใบยินยอมเปิดเผยข้อมูล"
  // Excel document list:
  | "ต้นฉบับใบวางบิล(NS)"
  | "ต้นฉบับใบแจ้งหนี้(DXC)"
  | "Service Charge Report(DXC)"
  | "หน้าใบเช็คสิทธิประกัน(จากลงทะเบียน)"
  | "หน้าใบยินยอมยอดจากบริษัท(จากแคชเชียร์)"
  | "เอกสารใบเคลม"
  | "สำเนาบัตรประชาชนหรือบัตรพนักงานลงนามโดยผู้ป่วย"
  | "สำเนาใบขับขี่"
  | "สำเนาบัตรประกัน"
  | "ใบรับรองแพทย์ลงนามโดยแพทย์"
  | "Drug and Material Charges Report(DXC)"
  | "เอกสารใบส่งตัวพนักงาน"
  | "สำเนารายงานประจำวันเกี่ยวกับคดี (สำนักงานตำรวจแห่งชาติ)"
  | "ประวัติการรักษา(DXC)"
  | "แบบ กท. 44"
  | "หนังสือรับรองของแพทย์ผู้รักษา (กท. 16 และ 16/1)"
  | "ต้นฉบับใบแจ้งหนี้(NS)"
  | "ใบสรุปยอดรายการตรวจสุขภาพและลงนามยืนยันโดยบริษัทคู่สัญญา"
  | "ใบสรุปยอดขายประจำเดือน";

export interface ClaimDocument {
  id: string;
  kind: DocKind;
  fileName: string;
  status: "ครบถ้วน" | "รอดำเนินการ";
  source: "สแกนบัตร" | "OCR" | "อัปโหลดโดยเจ้าหน้าที่" | "ลงนามดิจิทัล";
  addedAt: string;
}

export interface Patient {
  hn: string;
  name: string;
  nationalId: string;
  visitDate: string;
  stage: 0 | 1 | 2 | 3 | 4 | 5;
  claimValue: number | null;
  status: ClaimStatus;
  documents: ClaimDocument[];
  consentSigned: boolean;
  invoiceSigned: boolean;
  ocrConfidence?: number;
  batchId?: string;
}

export interface InvoiceQueueItem {
  id: string;
  fileName: string;
  matchedHn: string | null;
  patientName: string | null;
  confidence: number | null;
  status: "กำลังประมวลผล" | "จับคู่สำเร็จ" | "ต้องตรวจสอบด้วยตนเอง";
  addedAt: string;
}

export interface Batch {
  id: string;
  hns: string[];
  totalValue: number;
  status: "รอส่ง" | "กำลังส่งไป ERP" | "สำเร็จ";
  referenceNumber: string | null;
  createdAt: string;
}

export interface DownloadAttempt {
  timestamp: string;
  ip: string;
  success: boolean;
}

export interface DeliveryLink {
  id: string;
  batchId: string;
  insurerEmail: string;
  token: string;
  expiresInDays: number;
  createdAt: string;
  expiresAt: string;
  emailSent: boolean;
  attempts: DownloadAttempt[];
}

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  user: string;
  action: string;
  target: string;
  ip: string;
  status: "สำเร็จ" | "ไม่สำเร็จ";
  detail: string;
}

export interface StaffUser {
  name: string;
  role: string;
  username: string;
}
