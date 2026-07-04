import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2, PackageCheck, RefreshCw, Send } from "lucide-react";
import { Card, PageHeader, EmptyState } from "../components/PageHeader";
import { useAppData } from "../context/AppDataContext";
import { formatCurrency, formatThaiDate } from "../lib/mockData";

export function Accounting() {
  const { patients, batches, groupIntoBatch, sendBatchToErp } = useAppData();
  const navigate = useNavigate();
  const [selected, setSelected] = useState<string[]>([]);
  const [sendingId, setSendingId] = useState<string | null>(null);

  const readyPatients = useMemo(() => patients.filter((p) => p.status === "พร้อมเบิก"), [patients]);
  const selectedValue = readyPatients
    .filter((p) => selected.includes(p.hn))
    .reduce((sum, p) => sum + (p.claimValue ?? 0), 0);

  function toggle(hn: string) {
    setSelected((prev) => (prev.includes(hn) ? prev.filter((x) => x !== hn) : [...prev, hn]));
  }

  function handleGroup() {
    if (selected.length === 0) return;
    groupIntoBatch(selected);
    setSelected([]);
  }

  async function handleSend(batchId: string) {
    setSendingId(batchId);
    await sendBatchToErp(batchId);
    setSendingId(null);
  }

  return (
    <div>
      <PageHeader
        title="ใบสรุปจ่าย"
        subtitle="รวบรวมเอกสารของผู้ป่วยที่พร้อมเบิก ส่งไปยัง ERP เพื่อขอเลขใบสรุปจ่าย แล้วประทับเลขกลับเข้าระบบ"
      />

      <Card className="mb-6">
        <div className="flex items-center justify-between border-b border-line-soft px-5 py-4">
          <h3 className="text-sm font-medium text-ink-700">ผู้ป่วยที่พร้อมเบิก (เอกสารครบถ้วน)</h3>
          <button
            onClick={handleGroup}
            disabled={selected.length === 0}
            className="flex items-center gap-1.5 rounded-lg bg-brand-600 px-3.5 py-2 text-sm font-medium text-white hover:bg-brand-700 disabled:opacity-40"
          >
            <PackageCheck size={15} />
            รวบรวมเป็นชุดเอกสาร ({selected.length}
            {selected.length > 0 ? ` · ${formatCurrency(selectedValue)}` : ""})
          </button>
        </div>

        {readyPatients.length === 0 ? (
          <EmptyState title="ยังไม่มีผู้ป่วยที่พร้อมเบิก" />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-line-soft text-left text-xs text-ink-300">
                  <th className="w-10 px-5 py-3" />
                  <th className="px-5 py-3 font-medium">HN</th>
                  <th className="px-5 py-3 font-medium">ชื่อผู้ป่วย</th>
                  <th className="px-5 py-3 font-medium">มูลค่าเคลม</th>
                </tr>
              </thead>
              <tbody>
                {readyPatients.map((p) => (
                  <tr
                    key={p.hn}
                    onClick={() => toggle(p.hn)}
                    className="cursor-pointer border-b border-line-soft last:border-0 hover:bg-canvas"
                  >
                    <td className="px-5 py-3">
                      <input
                        type="checkbox"
                        checked={selected.includes(p.hn)}
                        onChange={() => toggle(p.hn)}
                        onClick={(e) => e.stopPropagation()}
                        className="size-4 accent-brand-600"
                      />
                    </td>
                    <td className="px-5 py-3 font-medium text-ink-700">{p.hn}</td>
                    <td className="px-5 py-3 text-ink-600">{p.name}</td>
                    <td className="px-5 py-3 text-ink-600">{formatCurrency(p.claimValue)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <Card>
        <div className="border-b border-line-soft px-5 py-4">
          <h3 className="text-sm font-medium text-ink-700">ชุดเอกสารทั้งหมด</h3>
        </div>

        {batches.length === 0 ? (
          <EmptyState title="ยังไม่มีชุดเอกสาร" />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-line-soft text-left text-xs text-ink-300">
                  <th className="px-5 py-3 font-medium">รหัสชุดเอกสาร</th>
                  <th className="px-5 py-3 font-medium">จำนวนผู้ป่วย</th>
                  <th className="px-5 py-3 font-medium">มูลค่ารวม</th>
                  <th className="px-5 py-3 font-medium">สถานะ</th>
                  <th className="px-5 py-3 font-medium">เลขใบสรุปจ่าย</th>
                  <th className="px-5 py-3 font-medium">สร้างเมื่อ</th>
                  <th className="px-5 py-3 font-medium">การดำเนินการ</th>
                </tr>
              </thead>
              <tbody>
                {batches.map((b) => (
                  <tr key={b.id} className="border-b border-line-soft last:border-0">
                    <td className="px-5 py-3 font-medium text-ink-700">{b.id}</td>
                    <td className="px-5 py-3 text-ink-600">{b.hns.length}</td>
                    <td className="px-5 py-3 text-ink-600">{formatCurrency(b.totalValue)}</td>
                    <td className="px-5 py-3">
                      <span
                        className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-medium ${
                          b.status === "สำเร็จ"
                            ? "bg-status-ready-bg text-status-ready-fg"
                            : b.status === "กำลังส่งไป ERP"
                              ? "bg-status-erp-bg text-status-erp-fg"
                              : "bg-status-neutral-bg text-status-neutral-fg"
                        }`}
                      >
                        {sendingId === b.id && <Loader2 size={11} className="animate-spin" />}
                        {b.status}
                      </span>
                    </td>
                    <td className="px-5 py-3 font-mono text-xs text-ink-600">{b.referenceNumber ?? "-"}</td>
                    <td className="px-5 py-3 text-ink-500">{formatThaiDate(b.createdAt)}</td>
                    <td className="px-5 py-3">
                      {b.status === "รอส่ง" && (
                        <button
                          onClick={() => handleSend(b.id)}
                          className="flex items-center gap-1.5 rounded-lg bg-ink-800 px-3 py-1.5 text-xs font-medium text-white hover:bg-ink-900"
                        >
                          <Send size={13} /> ส่งไปยัง ERP
                        </button>
                      )}
                      {b.status === "กำลังส่งไป ERP" && sendingId !== b.id && (
                        <button
                          onClick={() => handleSend(b.id)}
                          className="flex items-center gap-1.5 rounded-lg border border-line px-3 py-1.5 text-xs font-medium text-ink-600 hover:bg-line-soft"
                        >
                          <RefreshCw size={13} /> ตรวจสอบผล / ดึงเลขใบสรุปจ่าย
                        </button>
                      )}
                      {b.status === "สำเร็จ" && (
                        <button
                          onClick={() => navigate("/delivery", { state: { focusBatchId: b.id } })}
                          className="text-xs font-medium text-brand-600 hover:underline"
                        >
                          ไปที่ส่งมอบเอกสาร →
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
