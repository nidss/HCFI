import { Link } from "react-router-dom";

export function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-canvas text-center">
      <p className="text-4xl font-medium text-ink-800">404</p>
      <p className="text-sm text-ink-400">ไม่พบหน้าที่คุณต้องการ</p>
      <Link to="/" className="text-sm font-medium text-brand-600 hover:underline">
        กลับไปหน้าภาพรวม
      </Link>
    </div>
  );
}
