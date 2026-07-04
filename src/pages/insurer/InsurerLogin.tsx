import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Building2, Lock, ShieldAlert, User } from "lucide-react";
import { useAppData } from "../../context/AppDataContext";
import { genIp } from "../../lib/mockData";

const DEMO_USERNAME = "insurer_demo";
const DEMO_PASSWORD = "insurer2026";

export function InsurerLogin() {
  const [params] = useSearchParams();
  const token = params.get("token") ?? "";
  const navigate = useNavigate();
  const { findDeliveryLinkByToken, addAuditLog } = useAppData();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  const link = findDeliveryLinkByToken(token);
  const expired = link ? new Date(link.expiresAt).getTime() < Date.now() : false;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!link || expired) return;
    const ok = username === DEMO_USERNAME && password === DEMO_PASSWORD;
    addAuditLog({
      user: username || "(ไม่ระบุ)",
      action: "เข้าสู่ระบบพอร์ทัลบริษัทประกัน",
      target: link.batchId,
      ip: genIp(),
      status: ok ? "สำเร็จ" : "ไม่สำเร็จ",
      detail: ok ? "ล็อกอินสำเร็จก่อนเข้าถึงลิงก์ดาวน์โหลด" : "ล็อกอินไม่สำเร็จ Username หรือ Password ไม่ถูกต้อง",
    });
    if (ok) {
      sessionStorage.setItem(`authed:${token}`, "1");
      navigate(`/insurer/download?token=${token}`);
    } else {
      setError("Username หรือ Password ไม่ถูกต้อง");
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-canvas px-4">
      <div className="w-full max-w-sm rounded-xl border border-line bg-white p-6 shadow-card">
        <div className="mb-6 flex flex-col items-center text-center">
          <div className="mb-3 flex size-12 items-center justify-center rounded-xl bg-brand-600 text-white">
            <Building2 size={22} />
          </div>
          <h1 className="text-lg font-medium text-ink-800">พอร์ทัลบริษัทประกัน</h1>
          <p className="mt-1 text-sm text-ink-400">เข้าสู่ระบบเพื่อเข้าถึงเอกสารเคลมที่โรงพยาบาลจัดส่งให้</p>
        </div>

        {!token || !link ? (
          <div className="flex items-start gap-2 rounded-lg bg-status-danger-bg p-3 text-sm text-status-danger-fg">
            <ShieldAlert size={16} className="mt-0.5 shrink-0" />
            ลิงก์นี้ไม่ถูกต้องหรือถูกยกเลิกแล้ว กรุณาติดต่อโรงพยาบาลเพื่อขอลิงก์ใหม่
          </div>
        ) : expired ? (
          <div className="flex items-start gap-2 rounded-lg bg-status-danger-bg p-3 text-sm text-status-danger-fg">
            <ShieldAlert size={16} className="mt-0.5 shrink-0" />
            ลิงก์ดาวน์โหลดหมดอายุแล้ว กรุณาติดต่อโรงพยาบาลเพื่อขอลิงก์ใหม่
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="mb-1.5 block text-xs font-medium text-ink-600">Username</label>
              <div className="relative">
                <User size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-300" />
                <input
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full rounded-lg border border-line py-2.5 pl-9 pr-3 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
                  placeholder="insurer_demo"
                />
              </div>
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-ink-600">Password</label>
              <div className="relative">
                <Lock size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-300" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-lg border border-line py-2.5 pl-9 pr-3 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
                  placeholder="••••••••"
                />
              </div>
            </div>

            {error && <p className="text-xs font-medium text-status-danger-fg">{error}</p>}

            <button
              type="submit"
              className="w-full rounded-lg bg-brand-600 py-2.5 text-sm font-medium text-white hover:bg-brand-700"
            >
              เข้าสู่ระบบ
            </button>

            <p className="rounded-lg bg-canvas p-3 text-center text-xs text-ink-400">
              บัญชีทดสอบ: <span className="font-mono">{DEMO_USERNAME}</span> / <span className="font-mono">{DEMO_PASSWORD}</span>
            </p>
          </form>
        )}
      </div>
    </div>
  );
}
