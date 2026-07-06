import { useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import { CheckCircle2, Link2, MailCheck, X } from "lucide-react";
import { Card, PageHeader, EmptyState } from "../components/PageHeader";
import { useAppData } from "../context/AppDataContext";
import { formatThaiDateTime } from "../lib/mockData";

export function Delivery() {
  const { batches, patients, deliveryLinks, createDeliveryLink } = useAppData();
  const location = useLocation();
  const focusBatchId = (location.state as { focusBatchId?: string } | null)?.focusBatchId;

  const packagedBatches = useMemo(
    () =>
      batches.filter(
        (b) => b.status === "สำเร็จ" && patients.some((p) => p.batchId === b.id && p.status === "พร้อมส่งมอบ"),
      ),
    [batches, patients],
  );

  const [batchId, setBatchId] = useState(focusBatchId ?? packagedBatches[0]?.id ?? "");
  const [email, setEmail] = useState("claims@insurer.co.th");
  const [days, setDays] = useState(7);
  const [justCreated, setJustCreated] = useState<string | null>(null);
  const [viewingBatchId, setViewingBatchId] = useState<string | null>(null);

  function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!batchId) return;
    const link = createDeliveryLink(batchId, email, days);
    setJustCreated(link.token);
    setBatchId(packagedBatches.find((b) => b.id !== batchId)?.id ?? "");
  }

  return (
    <div>
      <PageHeader
        title="ส่งมอบเอกสาร"
        subtitle="สร้าง Token Link ที่จำกัดอายุการใช้งาน และจัดส่งให้บริษัทประกันปลายทางผ่านทางอีเมล"
      />

      <Card className="mb-6">
        <div className="border-b border-line-soft px-5 py-4">
          <h3 className="text-sm font-medium text-ink-700">สร้างลิงก์ดาวน์โหลด</h3>
        </div>
        {packagedBatches.length === 0 && !justCreated ? (
          <EmptyState title="ยังไม่มีชุดเอกสารที่จัดแพ็กเกจพร้อมส่งมอบ" hint="ทำใบสรุปจ่ายให้เสร็จสิ้นก่อนที่หน้าใบสรุปจ่าย" />
        ) : (
          <form onSubmit={handleCreate} className="grid grid-cols-1 gap-4 p-5 sm:grid-cols-4 sm:items-end">
            <div className="sm:col-span-1">
              <label className="mb-1.5 block text-xs font-medium text-ink-600">ชุดเอกสารที่จัดแพ็กเกจแล้ว</label>
              <select
                value={batchId}
                onChange={(e) => setBatchId(e.target.value)}
                className="w-full rounded-lg border border-line px-3 py-2.5 text-sm text-ink-800 focus:border-brand-500 focus:outline-none"
              >
                <option value="" disabled>
                  เลือกชุดเอกสาร
                </option>
                {packagedBatches.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.id} ({b.referenceNumber})
                  </option>
                ))}
              </select>
            </div>
            <div className="sm:col-span-2">
              <label className="mb-1.5 block text-xs font-medium text-ink-600">อีเมลบริษัทประกัน</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-lg border border-line px-3 py-2.5 text-sm text-ink-800 focus:border-brand-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-ink-600">อายุลิงก์ (วัน)</label>
              <input
                type="number"
                min={1}
                max={30}
                value={days}
                onChange={(e) => setDays(Number(e.target.value))}
                className="w-full rounded-lg border border-line px-3 py-2.5 text-sm text-ink-800 focus:border-brand-500 focus:outline-none"
              />
            </div>
            <div className="sm:col-span-4">
              <button
                type="submit"
                disabled={!batchId}
                className="flex items-center gap-2 rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-brand-700 disabled:opacity-40"
              >
                <Link2 size={15} /> สร้างลิงก์ดาวน์โหลด
              </button>
            </div>
          </form>
        )}

        {justCreated && (() => {
          const link = deliveryLinks.find((l) => l.token === justCreated);
          const batch = batches.find((b) => b.id === link?.batchId);
          const downloadUrl = `${window.location.origin}${window.location.pathname}#/insurer/login?token=${justCreated}`;
          return (
            <div className="mx-5 mb-5 rounded-lg border border-brand-200 bg-brand-50/40 p-5 text-sm animate-fade-in shadow-sm">
              <div className="flex items-center gap-2 font-medium text-brand-700 mb-4 pb-2 border-b border-brand-200/50">
                <MailCheck size={18} />
                สร้างลิงก์และส่งอีเมลสำเร็จ
              </div>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 text-ink-600">
                <div>
                  <span className="font-semibold text-ink-700">สถานะการจัดส่ง:</span>{" "}
                  <span className="text-status-ready-fg font-medium">ส่งอีเมลสำเร็จ (Email Sent)</span>
                </div>
                <div>
                  <span className="font-semibold text-ink-700">เลขที่อ้างอิงการจัดส่ง:</span>{" "}
                  <span className="font-mono bg-white border px-1.5 py-0.5 rounded text-xs">{batch?.referenceNumber ?? "-"}</span>
                </div>
                <div className="sm:col-span-2">
                  <span className="font-semibold text-ink-700">ลิงก์ดาวน์โหลด:</span>{" "}
                  <a
                    href={downloadUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="font-mono text-xs text-brand-600 hover:underline break-all"
                  >
                    {downloadUrl}
                  </a>
                </div>
                <div>
                  <span className="font-semibold text-ink-700">รหัสผ่านสำหรับเปิดไฟล์:</span>{" "}
                  <span className="font-mono bg-white border px-1.5 py-0.5 rounded text-xs">insurer2026</span>{" "}
                  <span className="text-xs text-ink-300">(Username: insurer_demo)</span>
                </div>
              </div>
            </div>
          );
        })()}
      </Card>

      <Card>
        <div className="border-b border-line-soft px-5 py-4">
          <h3 className="text-sm font-medium text-ink-700">ติดตามสถานะการส่งมอบ</h3>
        </div>
        {deliveryLinks.length === 0 ? (
          <EmptyState title="ยังไม่มีการสร้างลิงก์ส่งมอบ" />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-line-soft text-left text-xs text-ink-300">
                  <th className="px-5 py-3 font-medium">ชุดเอกสาร</th>
                  <th className="px-5 py-3 font-medium">อีเมลบริษัทประกัน</th>
                  <th className="px-5 py-3 font-medium">สถานะ</th>
                  <th className="px-5 py-3 font-medium">หมดอายุ</th>
                  <th className="px-5 py-3 font-medium">ความพยายามดาวน์โหลด</th>
                  <th className="px-5 py-3 font-medium">รายละเอียดเอกสาร</th>
                </tr>
              </thead>
              <tbody>
                {deliveryLinks.map((l) => {
                  const expired = new Date(l.expiresAt).getTime() < Date.now();
                  return (
                    <tr key={l.id} className="border-b border-line-soft last:border-0">
                      <td className="px-5 py-3 font-medium text-ink-700">{l.batchId}</td>
                      <td className="px-5 py-3 text-ink-600">{l.insurerEmail}</td>
                      <td className="px-5 py-3">
                        <span
                          className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-medium ${
                            expired
                              ? "bg-status-danger-bg text-status-danger-fg"
                              : "bg-status-ready-bg text-status-ready-fg"
                          }`}
                        >
                          {expired ? "หมดอายุ" : "ใช้งานได้"}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-ink-500">{formatThaiDateTime(l.expiresAt)}</td>
                      <td className="px-5 py-3 text-ink-600">
                        {l.attempts.length} ครั้ง
                        {l.attempts.length > 0 && (
                          <span className="ml-1 text-xs text-ink-300">
                            ({l.attempts.filter((a) => a.success).length} สำเร็จ)
                          </span>
                        )}
                      </td>
                      <td className="px-5 py-3">
                        <button
                          onClick={() => setViewingBatchId(l.batchId)}
                          className="flex w-fit items-center gap-1 text-xs font-medium text-brand-600 hover:underline"
                        >
                          ดูข้อมูล
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {viewingBatchId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 animate-fade-in">
          <div className="relative max-w-3xl w-full rounded-xl bg-white p-6 shadow-2xl flex flex-col max-h-[85vh]">
            <div className="mb-4 flex items-center justify-between border-b border-line-soft pb-3 shrink-0">
              <div>
                <h3 className="text-base font-semibold text-ink-800">รายละเอียดเอกสารที่ส่งมอบ</h3>
                <p className="text-xs text-ink-400 mt-0.5">ชุดเอกสาร: {viewingBatchId}</p>
              </div>
              <button
                onClick={() => setViewingBatchId(null)}
                className="rounded-lg p-1.5 text-ink-400 hover:bg-line-soft hover:text-ink-600 transition-colors"
              >
                <X size={18} />
              </button>
            </div>
            <div className="overflow-y-auto pr-1 py-1">
              {(() => {
                const b = batches.find((x) => x.id === viewingBatchId);
                const bps = patients.filter((p) => b?.hns.includes(p.hn));
                if (bps.length === 0) {
                  return <p className="text-sm text-ink-400 text-center py-4">ไม่พบข้อมูลผู้ป่วยในชุดเอกสารนี้</p>;
                }
                return (
                  <div className="overflow-x-auto rounded-lg border border-line-soft">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="border-b border-line-soft text-ink-400 bg-canvas/50">
                          <th className="px-4 py-3 font-semibold w-24">HN</th>
                          <th className="px-4 py-3 font-semibold w-40">ชื่อผู้ป่วย</th>
                          <th className="px-4 py-3 font-semibold">สถานะเอกสารที่จัดส่ง</th>
                        </tr>
                      </thead>
                      <tbody>
                        {bps.map((p) => {
                          return (
                            <tr key={p.hn} className="border-b border-line-soft last:border-0 hover:bg-canvas/30 transition-colors">
                              <td className="px-4 py-3 font-mono text-ink-600 align-middle">{p.hn}</td>
                              <td className="px-4 py-3 font-medium text-ink-800 align-middle">{p.name}</td>
                              <td className="px-4 py-3 align-middle">
                                <div className="flex flex-wrap gap-1.5 py-1">
                                  {p.documents.map((d) => (
                                    <span
                                      key={d.id}
                                      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium ${
                                        d.status === "ครบถ้วน"
                                          ? "bg-status-ready-bg text-status-ready-fg"
                                          : "bg-status-waiting-bg text-status-waiting-fg"
                                      }`}
                                    >
                                      {d.status === "ครบถ้วน" && <CheckCircle2 size={10} />}
                                      {d.kind}
                                    </span>
                                  ))}
                                  {p.documents.length === 0 && (
                                    <span className="text-ink-300 text-xs">ไม่มีเอกสาร</span>
                                  )}
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                );
              })()}
            </div>
            <div className="mt-6 flex justify-end border-t border-line-soft pt-4 shrink-0">
              <button
                onClick={() => setViewingBatchId(null)}
                className="rounded-lg border border-line bg-white px-4 py-2 text-xs font-medium text-ink-600 hover:bg-line-soft transition-colors"
              >
                ปิด
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
