import { useRef, useState } from "react";
import { UploadCloud } from "lucide-react";

export function FileDrop({
  label,
  hint,
  accept,
  onFiles,
  compact,
}: {
  label: string;
  hint?: string;
  accept?: string;
  onFiles: (files: FileList) => void;
  compact?: boolean;
}) {
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        setDragOver(true);
      }}
      onDragLeave={() => setDragOver(false)}
      onDrop={(e) => {
        e.preventDefault();
        setDragOver(false);
        if (e.dataTransfer.files.length) onFiles(e.dataTransfer.files);
      }}
      onClick={() => inputRef.current?.click()}
      className={`flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed text-center transition-colors ${
        compact ? "px-4 py-6" : "px-6 py-10"
      } ${dragOver ? "border-brand-500 bg-brand-50" : "border-line hover:border-brand-300 hover:bg-canvas"}`}
    >
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        multiple
        className="hidden"
        onChange={(e) => {
          if (e.target.files?.length) onFiles(e.target.files);
          e.target.value = "";
        }}
      />
      <UploadCloud size={compact ? 22 : 28} className="text-ink-300" />
      <p className="text-sm font-medium text-ink-600">{label}</p>
      {hint && <p className="text-xs text-ink-300">{hint}</p>}
    </div>
  );
}
