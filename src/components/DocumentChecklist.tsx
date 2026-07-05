import { CheckCircle2, Circle } from "lucide-react";
import type { ClaimDocument } from "../lib/types";

export function DocumentChecklist({ documents }: { documents: ClaimDocument[] }) {
  if (documents.length === 0) {
    return (
      <div className="py-8 text-center text-xs text-ink-300">
        ยังไม่มีรายการเอกสาร (ผู้ป่วยใหม่ยังไม่ได้เข้ารับการรักษา)
      </div>
    );
  }
  return (
    <ul className="divide-y divide-line-soft">
      {documents.map((d) => (
        <li key={d.id} className="flex items-center gap-3 py-2.5">
          {d.status === "ครบถ้วน" ? (
            <CheckCircle2 size={18} className="shrink-0 text-status-ready-fg" />
          ) : (
            <Circle size={18} className="shrink-0 text-ink-300" />
          )}
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm text-ink-700">{d.kind}</p>
            <p className="truncate text-xs text-ink-300">
              {d.status === "ครบถ้วน" ? `${d.fileName} · ${d.source}` : "รอดำเนินการ"}
            </p>
          </div>
        </li>
      ))}
    </ul>
  );
}
