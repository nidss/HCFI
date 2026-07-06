import { Outlet } from "react-router-dom";

export function PatientPortalLayout() {
  return (
    <div className="min-h-screen w-full bg-slate-950 flex items-center justify-center p-0 sm:p-8 md:p-12 bg-gradient-to-br from-slate-950 via-slate-900 to-brand-950 overflow-auto">
      {/* iPad Container Frame */}
      <div className="relative w-full h-screen sm:h-auto max-w-[1120px] bg-slate-900 rounded-none sm:rounded-[44px] p-0 sm:p-5 md:p-6 shadow-none sm:shadow-[0_30px_70px_-15px_rgba(0,0,0,0.9)] border-0 sm:border border-slate-800/80 flex flex-col items-center justify-center shrink-0">
        
        {/* Top Camera Notch (Only on Tablet/Desktop) */}
        <div className="hidden sm:flex absolute top-4 left-1/2 -translate-x-1/2 items-center gap-1.5 z-10">
          <div className="size-2 bg-slate-950 rounded-full border border-slate-800" />
          <div className="size-1 bg-blue-950 rounded-full" />
        </div>

        {/* Speaker Slot (Only on Tablet/Desktop) */}
        <div className="hidden sm:block absolute top-2.5 left-1/2 -translate-x-1/2 w-12 h-1 bg-slate-950 rounded-full opacity-40 z-10" />

        {/* iPad Screen Wrapper */}
        <div className="relative w-full h-full sm:h-auto sm:aspect-[4/3] bg-[#f6f8fb] rounded-none sm:rounded-[24px] overflow-hidden border-0 sm:border-[4px] border-slate-950 flex flex-col shadow-inner">
          <div className="absolute inset-0 flex flex-col overflow-hidden">
            <Outlet />
          </div>
        </div>

        {/* Bottom Home Indicator Bar (Only on Tablet/Desktop) */}
        <div className="hidden sm:block absolute bottom-2.5 left-1/2 -translate-x-1/2 w-32 h-1 bg-slate-950 rounded-full opacity-60 z-10" />
      </div>
    </div>
  );
}
