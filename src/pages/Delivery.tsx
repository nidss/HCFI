import { useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import { ExternalLink, Link2, MailCheck } from "lucide-react";
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
          <h3 className="text-sm font-semibold text-ink-700">สร้างลิงก์ดาวน์โหลด</h3>
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
                className="flex items-center gap-2 rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-40"
              >
                <Link2 size={15} /> สร้างลิงก์ดาวน์โหลด
              </button>
            </div>
          </form>
        )}

        {justCreated && (
          <div className="mx-5 mb-5 flex items-center gap-2 rounded-lg bg-status-ready-bg px-4 py-3 text-sm text-status-ready-fg">
            <MailCheck size={16} />
            สร้างลิงก์และส่งอีเมลแจ้งบริษัทประกันเรียบร้อยแล้ว
          </div>
        )}
      </Card>

      <Card>
        <div className="border-b border-line-soft px-5 py-4">
          <h3 className="text-sm font-semibold text-ink-700">ติดตามสถานะการส่งมอบ</h3>
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
                  <th className="px-5 py-3 font-medium">พอร์ทัลบริษัทประกัน</th>
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
                          className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold ${
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
                        <a
                          href={`#/insurer/login?token=${l.token}`}
                          target="_blank"
                          rel="noreferrer"
                          className="flex w-fit items-center gap-1 text-xs font-medium text-brand-600 hover:underline"
                        >
                          เปิดพอร์ทัล <ExternalLink size={12} />
                        </a>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
