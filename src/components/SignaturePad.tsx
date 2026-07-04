import { useEffect, useRef, useState } from "react";
import { Eraser, TabletSmartphone, X } from "lucide-react";

interface SignaturePadProps {
  title: string;
  description: string;
  documentName: string;
  onCancel: () => void;
  onConfirm: () => void;
}

export function SignaturePad({ title, description, documentName, onCancel, onConfirm }: SignaturePadProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawing = useRef(false);
  const [hasSignature, setHasSignature] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const ratio = window.devicePixelRatio || 1;
    canvas.width = canvas.clientWidth * ratio;
    canvas.height = canvas.clientHeight * ratio;
    ctx.scale(ratio, ratio);
    ctx.lineWidth = 2.5;
    ctx.lineCap = "round";
    ctx.strokeStyle = "#152435";
  }, []);

  function pos(e: React.PointerEvent<HTMLCanvasElement>) {
    const rect = e.currentTarget.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  }

  function handleDown(e: React.PointerEvent<HTMLCanvasElement>) {
    drawing.current = true;
    const ctx = canvasRef.current?.getContext("2d");
    const { x, y } = pos(e);
    ctx?.beginPath();
    ctx?.moveTo(x, y);
  }

  function handleMove(e: React.PointerEvent<HTMLCanvasElement>) {
    if (!drawing.current) return;
    const ctx = canvasRef.current?.getContext("2d");
    const { x, y } = pos(e);
    ctx?.lineTo(x, y);
    ctx?.stroke();
    setHasSignature(true);
  }

  function handleUp() {
    drawing.current = false;
  }

  function clear() {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (canvas && ctx) ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasSignature(false);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink-900/50 p-4">
      <div className="w-full max-w-lg rounded-xl bg-white shadow-xl">
        <div className="flex items-start justify-between gap-3 border-b border-line-soft p-5">
          <div className="flex items-start gap-3">
            <div className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-600">
              <TabletSmartphone size={18} />
            </div>
            <div>
              <h3 className="text-base font-medium text-ink-800">{title}</h3>
              <p className="mt-0.5 text-sm text-ink-400">{description}</p>
            </div>
          </div>
          <button onClick={onCancel} className="rounded-md p-1 text-ink-300 hover:bg-line-soft">
            <X size={18} />
          </button>
        </div>

        <div className="space-y-3 p-5">
          <div className="flex items-center justify-between rounded-lg bg-canvas px-3 py-2 text-xs text-ink-500">
            <span>เอกสาร: {documentName}</span>
            <span className="text-ink-300">ลงนามผ่านหน้าจอ iPad</span>
          </div>

          <div className="relative rounded-lg border-2 border-dashed border-line bg-canvas">
            <canvas
              ref={canvasRef}
              className="h-48 w-full touch-none rounded-lg"
              onPointerDown={handleDown}
              onPointerMove={handleMove}
              onPointerUp={handleUp}
              onPointerLeave={handleUp}
            />
            {!hasSignature && (
              <p className="pointer-events-none absolute inset-0 flex items-center justify-center text-sm text-ink-300">
                ลงลายมือชื่อในกรอบนี้ด้วยนิ้วหรือปากกา
              </p>
            )}
          </div>

          <div className="flex items-center justify-between">
            <button
              onClick={clear}
              className="flex items-center gap-1.5 rounded-lg border border-line px-3 py-2 text-sm text-ink-500 hover:bg-line-soft"
            >
              <Eraser size={14} /> ล้างลายเซ็น
            </button>
            <p className="text-xs text-ink-300">
              รับรองตาม พ.ร.บ. ธุรกรรมทางอิเล็กทรอนิกส์ มาตรา 9
            </p>
          </div>
        </div>

        <div className="flex justify-end gap-2 border-t border-line-soft p-5">
          <button onClick={onCancel} className="rounded-lg border border-line px-4 py-2 text-sm font-medium text-ink-600 hover:bg-line-soft">
            ยกเลิก
          </button>
          <button
            onClick={onConfirm}
            disabled={!hasSignature}
            className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-40"
          >
            ยืนยันลายเซ็น
          </button>
        </div>
      </div>
    </div>
  );
}
