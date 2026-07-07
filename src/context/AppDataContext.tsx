import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type {
  AuditLogEntry,
  Batch,
  ClaimDocument,
  DeliveryLink,
  DocKind,
  DownloadAttempt,
  InvoiceQueueItem,
  Patient,
} from "../lib/types";
import {
  createInitialAuditLog,
  createInitialBatches,
  createInitialDeliveryLinks,
  createInitialPatients,
  currentStaff,
  genIp,
  genToken,
} from "../lib/mockData";

interface AppDataApi {
  patients: Patient[];
  batches: Batch[];
  deliveryLinks: DeliveryLink[];
  auditLog: AuditLogEntry[];
  invoiceQueue: InvoiceQueueItem[];
  findPatientByNationalId: (nationalId: string) => Patient | undefined;
  findPatient: (hn: string) => Patient | undefined;
  logSisSearch: (nationalId: string, found: boolean) => void;
  signConsent: (hn: string) => void;
  submitInvoiceForOcr: (fileName: string, overrideHn?: string | null) => InvoiceQueueItem;
  confirmInvoiceMatch: (queueId: string, hn: string) => void;
  signInvoice: (hn: string) => void;
  uploadDocument: (hn: string, kind: DocKind, fileName: string) => void;
  groupIntoBatch: (hns: string[]) => Batch;
  sendBatchToErp: (batchId: string) => Promise<void>;
  createDeliveryLink: (batchId: string, insurerEmail: string, expiresInDays: number) => DeliveryLink;
  recordDownloadAttempt: (token: string, success: boolean) => void;
  findDeliveryLinkByToken: (token: string) => DeliveryLink | undefined;
  addAuditLog: (entry: Omit<AuditLogEntry, "id" | "timestamp"> & { timestamp?: string }) => void;
}

const AppDataContext = createContext<AppDataApi | null>(null);

function recomputeStatus(p: Patient): Patient["status"] {
  if (p.status === "-") return "-";
  if (p.status === "รอเลข ERP" || p.status === "พร้อมส่งมอบ" || p.status === "ส่งมอบแล้ว") {
    return p.status;
  }
  if (!p.consentSigned || !p.invoiceSigned) return "รอเซ็นยินยอม";
  const missing = p.documents.some((d) => d.status === "รอดำเนินการ");
  return missing ? "เอกสารไม่ครบ" : "พร้อมเบิก";
}

export function AppDataProvider({ children }: { children: ReactNode }) {
  const [patients, setPatients] = useState<Patient[]>(() => createInitialPatients());
  const [batches, setBatches] = useState<Batch[]>(() => createInitialBatches());
  const [deliveryLinks, setDeliveryLinks] = useState<DeliveryLink[]>(() => createInitialDeliveryLinks());
  const [auditLog, setAuditLog] = useState<AuditLogEntry[]>(() => createInitialAuditLog());
  const [invoiceQueue, setInvoiceQueue] = useState<InvoiceQueueItem[]>([]);

  const addAuditLog = useCallback<AppDataApi["addAuditLog"]>((entry) => {
    setAuditLog((prev) => [
      {
        id: `LOG-${Math.random().toString(36).slice(2, 9)}`,
        timestamp: entry.timestamp ?? new Date().toISOString(),
        ...entry,
      },
      ...prev,
    ]);
  }, []);

  const findPatient = useCallback(
    (hn: string) => patients.find((p) => p.hn === hn),
    [patients],
  );

  const findPatientByNationalId = useCallback(
    (nationalId: string) => patients.find((p) => p.nationalId === nationalId.replace(/\s/g, "")),
    [patients],
  );

  const logSisSearch = useCallback(
    (nationalId: string, found: boolean) => {
      addAuditLog({
        user: currentStaff.username.startsWith("staff") ? "reception.som" : currentStaff.username,
        action: "ค้นหาผู้ป่วย",
        target: found ? nationalId : `${nationalId} (ไม่พบ)`,
        ip: genIp(),
        status: found ? "สำเร็จ" : "ไม่สำเร็จ",
        detail: "ค้นหาด้วยเลขบัตรประชาชนจากระบบ HIS",
      });
    },
    [addAuditLog],
  );

  const signConsent = useCallback(
    (hn: string) => {
      setPatients((prev) =>
        prev.map((p) => {
          if (p.hn !== hn) return p;
          const updated: Patient = {
            ...p,
            consentSigned: true,
            documents: p.documents.map((d) =>
              d.kind === "ใบยินยอมเปิดเผยข้อมูล" ? { ...d, status: "ครบถ้วน" as const } : d,
            ),
          };
          updated.status = recomputeStatus(updated);
          return updated;
        }),
      );
      addAuditLog({
        user: "reception.som",
        action: "ลงลายมือชื่อดิจิทัล (ใบยินยอม)",
        target: hn,
        ip: genIp(),
        status: "สำเร็จ",
        detail: "ผู้ป่วยเซ็นยินยอมเปิดเผยข้อมูลผ่านหน้าจอ iPad",
      });
    },
    [addAuditLog],
  );

  const submitInvoiceForOcr = useCallback(
    (fileName: string, overrideHn?: string | null): InvoiceQueueItem => {
      const match = fileName.match(/(66\d{5})/);
      const guessedHn = overrideHn || (match ? `HN ${match[1]}` : null);
      let p = guessedHn ? patients.find((x) => x.hn === guessedHn) : undefined;

      // If no matching patient is found by HN, auto-match with the first candidate needing invoice signature
      if (!p) {
        p = patients.find(
          (x) =>
            x.documents.some(
              (d) => d.kind === "ใบเสร็จรับเงิน (Invoice)" && d.status === "รอดำเนินการ"
            )
        );
      }

      // If still not found, just pick the first patient who hasn't signed their invoice
      if (!p) {
        p = patients.find((x) => !x.invoiceSigned);
      }

      const confidence = p ? Math.floor(88 + Math.random() * 11) : null;
      const queueItem: InvoiceQueueItem = {
        id: `Q-${Math.random().toString(36).slice(2, 9)}`,
        fileName,
        matchedHn: p ? p.hn : null,
        patientName: p ? p.name : null,
        confidence,
        status: p ? "จับคู่สำเร็จ" : "ต้องตรวจสอบด้วยตนเอง",
        addedAt: new Date().toISOString(),
      };

      setInvoiceQueue((prev) => [queueItem, ...prev]);

      // If a patient was successfully matched, update their document status for invoice to "ครบถ้วน"
      if (p) {
        const targetHn = p.hn;
        setPatients((prev) =>
          prev.map((x) => {
            if (x.hn !== targetHn) return x;
            const updated: Patient = {
              ...x,
              documents: x.documents.map((d) =>
                d.kind === "ใบเสร็จรับเงิน (Invoice)" ? { ...d, status: "ครบถ้วน" as const, fileName } : d
              ),
            };
            updated.status = recomputeStatus(updated);
            return updated;
          })
        );
      }

      addAuditLog({
        user: "cashier.nok",
        action: "จับคู่ด้วย OCR",
        target: fileName,
        ip: genIp(),
        status: queueItem.matchedHn ? "สำเร็จ" : "ไม่สำเร็จ",
        detail: queueItem.matchedHn
          ? `OCR จับคู่ ${queueItem.matchedHn} (ความมั่นใจ ${queueItem.confidence}%)`
          : "ไม่พบเลข HN ในไฟล์ ต้องจับคู่ด้วยตนเอง",
      });
      return queueItem;
    },
    [addAuditLog, patients],
  );

  const confirmInvoiceMatch = useCallback(
    (queueId: string, hn: string) => {
      setInvoiceQueue((prev) =>
        prev.map((q) => (q.id === queueId ? { ...q, matchedHn: hn, status: "จับคู่สำเร็จ" as const } : q)),
      );
      setPatients((prev) =>
        prev.map((p) => {
          if (p.hn !== hn) return p;
          const updated: Patient = {
            ...p,
            documents: p.documents.map((d) =>
              d.kind === "ใบเสร็จรับเงิน (Invoice)" ? { ...d, status: "ครบถ้วน" as const } : d,
            ),
          };
          updated.status = recomputeStatus(updated);
          return updated;
        }),
      );
    },
    [],
  );

  const signInvoice = useCallback(
    (hn: string) => {
      setPatients((prev) =>
        prev.map((p) => {
          if (p.hn !== hn) return p;
          const updated: Patient = { ...p, invoiceSigned: true };
          updated.status = recomputeStatus(updated);
          return updated;
        }),
      );
      addAuditLog({
        user: "cashier.nok",
        action: "ลงลายมือชื่อดิจิทัล (รับรองใบเสร็จ)",
        target: hn,
        ip: genIp(),
        status: "สำเร็จ",
        detail: "ผู้ป่วยเซ็นรับรองความถูกต้องของ Invoice ผ่านหน้าจอ iPad",
      });
    },
    [addAuditLog],
  );

  const uploadDocument = useCallback(
    (hn: string, kind: DocKind, fileName: string) => {
      setPatients((prev) =>
        prev.map((p) => {
          if (p.hn !== hn) return p;
          const exists = p.documents.some((d) => d.kind === kind);
          const documents: ClaimDocument[] = exists
            ? p.documents.map((d) => (d.kind === kind ? { ...d, status: "ครบถ้วน" as const, fileName } : d))
            : [
                ...p.documents,
                {
                  id: `DOC-${Math.random().toString(36).slice(2, 9)}`,
                  kind,
                  fileName,
                  status: "ครบถ้วน" as const,
                  source: "อัปโหลดโดยเจ้าหน้าที่" as const,
                  addedAt: new Date().toISOString(),
                },
              ];
          const updated: Patient = { ...p, documents };
          updated.status = recomputeStatus(updated);
          return updated;
        }),
      );
      addAuditLog({
        user: currentStaff.username,
        action: "อัปโหลดเอกสารเพิ่มเติม",
        target: hn,
        ip: genIp(),
        status: "สำเร็จ",
        detail: `อัปโหลด "${kind}" (${fileName}) จากระบบ HIS แบบแมนนวล`,
      });
    },
    [addAuditLog],
  );

  const groupIntoBatch = useCallback(
    (hns: string[]): Batch => {
      const id = `BATCH-2026-${String(Math.floor(Math.random() * 9000 + 1000))}`;
      const totalValue = patients
        .filter((p) => hns.includes(p.hn))
        .reduce((sum, p) => sum + (p.claimValue ?? 0), 0);
      setPatients((prev) =>
        prev.map((p) =>
          hns.includes(p.hn) ? { ...p, batchId: id, status: "รอเลข ERP" as const, stage: 4 as const } : p,
        ),
      );
      const batch: Batch = {
        id,
        hns,
        totalValue,
        status: "รอส่ง",
        referenceNumber: null,
        createdAt: new Date().toISOString(),
      };
      setBatches((prev) => [batch, ...prev]);
      addAuditLog({
        user: currentStaff.username,
        action: "รวบรวมชุดเอกสาร",
        target: id,
        ip: genIp(),
        status: "สำเร็จ",
        detail: `รวบรวมผู้ป่วย ${hns.length} รายเป็นชุดเอกสารเพื่อทำใบสรุปจ่าย`,
      });
      return batch;
    },
    [addAuditLog, patients],
  );

  const sendBatchToErp = useCallback(
    async (batchId: string) => {
      setBatches((prev) => prev.map((b) => (b.id === batchId ? { ...b, status: "กำลังส่งไป ERP" as const } : b)));
      await new Promise((resolve) => setTimeout(resolve, 1400));
      const referenceNumber = `REF-NS-${Math.floor(10000 + Math.random() * 89999)}`;
      setBatches((prev) =>
        prev.map((b) => (b.id === batchId ? { ...b, status: "สำเร็จ" as const, referenceNumber } : b)),
      );
      setPatients((prev) =>
        prev.map((p) => (p.batchId === batchId ? { ...p, status: "พร้อมส่งมอบ" as const } : p)),
      );
      const batch = batches.find((b) => b.id === batchId);
      addAuditLog({
        user: currentStaff.username,
        action: "ส่งข้อมูลไปยัง ERP",
        target: batchId,
        ip: genIp(),
        status: "สำเร็จ",
        detail: `ส่งชุดเอกสาร ${batch?.hns.length ?? ""} รายการไปยัง ERP (NetSuite) และได้รับเลขใบสรุปจ่าย ${referenceNumber}`,
      });
    },
    [addAuditLog, batches],
  );

  const createDeliveryLink = useCallback(
    (batchId: string, insurerEmail: string, expiresInDays: number): DeliveryLink => {
      const now = new Date();
      const expires = new Date(now.getTime() + expiresInDays * 86400000);
      const link: DeliveryLink = {
        id: `DL-${Math.random().toString(36).slice(2, 9)}`,
        batchId,
        insurerEmail,
        token: genToken(),
        expiresInDays,
        createdAt: now.toISOString(),
        expiresAt: expires.toISOString(),
        emailSent: true,
        attempts: [],
      };
      setDeliveryLinks((prev) => [link, ...prev]);
      setPatients((prev) =>
        prev.map((p) => (p.batchId === batchId ? { ...p, status: "ส่งมอบแล้ว" as const, stage: 5 as const } : p)),
      );
      addAuditLog({
        user: currentStaff.username,
        action: "สร้างลิงก์ดาวน์โหลด",
        target: batchId,
        ip: genIp(),
        status: "สำเร็จ",
        detail: `สร้าง Token Link อายุ ${expiresInDays} วัน และส่งอีเมลแจ้ง ${insurerEmail}`,
      });
      return link;
    },
    [addAuditLog],
  );

  const findDeliveryLinkByToken = useCallback(
    (token: string) => deliveryLinks.find((l) => l.token === token),
    [deliveryLinks],
  );

  const recordDownloadAttempt = useCallback(
    (token: string, success: boolean) => {
      const attempt: DownloadAttempt = {
        timestamp: new Date().toISOString(),
        ip: genIp(),
        success,
      };
      setDeliveryLinks((prev) =>
        prev.map((l) => (l.token === token ? { ...l, attempts: [attempt, ...l.attempts] } : l)),
      );
      const link = deliveryLinks.find((l) => l.token === token);
      addAuditLog({
        user: "insurer.portal",
        action: "ดาวน์โหลดเอกสาร",
        target: link?.batchId ?? token,
        ip: attempt.ip,
        status: success ? "สำเร็จ" : "ไม่สำเร็จ",
        detail: success
          ? "บริษัทประกันดาวน์โหลดชุดเอกสารสำเร็จผ่านพอร์ทัล"
          : "พยายามดาวน์โหลดแต่ล็อกอินไม่สำเร็จ หรือลิงก์หมดอายุ",
      });
    },
    [addAuditLog, deliveryLinks],
  );

  const value = useMemo<AppDataApi>(
    () => ({
      patients,
      batches,
      deliveryLinks,
      auditLog,
      invoiceQueue,
      findPatientByNationalId,
      findPatient,
      logSisSearch,
      signConsent,
      submitInvoiceForOcr,
      confirmInvoiceMatch,
      signInvoice,
      uploadDocument,
      groupIntoBatch,
      sendBatchToErp,
      createDeliveryLink,
      recordDownloadAttempt,
      findDeliveryLinkByToken,
      addAuditLog,
    }),
    [
      patients,
      batches,
      deliveryLinks,
      auditLog,
      invoiceQueue,
      findPatientByNationalId,
      findPatient,
      logSisSearch,
      signConsent,
      submitInvoiceForOcr,
      confirmInvoiceMatch,
      signInvoice,
      uploadDocument,
      groupIntoBatch,
      sendBatchToErp,
      createDeliveryLink,
      recordDownloadAttempt,
      findDeliveryLinkByToken,
      addAuditLog,
    ],
  );

  return <AppDataContext.Provider value={value}>{children}</AppDataContext.Provider>;
}

export function useAppData(): AppDataApi {
  const ctx = useContext(AppDataContext);
  if (!ctx) throw new Error("useAppData must be used within AppDataProvider");
  return ctx;
}
