import type { ReactNode } from "react";
import { Zap, ShieldCheck, Activity, Filter } from "lucide-react";

export default function AuthShell({ children }: { children: ReactNode }) {
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      {/* Brand / marketing panel */}
      <div className="relative hidden flex-col justify-between overflow-hidden border-r border-white/10 bg-gradient-to-br from-brand-600/20 via-slate-950 to-slate-950 p-12 lg:flex">
        <div className="flex items-center gap-2.5">
          <div className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-brand-500 to-indigo-500 shadow-lg shadow-brand-500/30">
            <Zap size={20} className="text-white" />
          </div>
          <span className="text-lg font-bold text-white">IncidentIQ</span>
        </div>

        <div className="space-y-6">
          <h1 className="max-w-md text-4xl font-bold leading-tight text-white">
            Track, triage, and resolve incidents — fast.
          </h1>
          <div className="space-y-4">
            {[
              { icon: Activity, text: "Real-time incident dashboard" },
              { icon: Filter, text: "Server-side filtering, search & pagination" },
              { icon: ShieldCheck, text: "JWT-secured, every endpoint protected" },
            ].map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-center gap-3 text-slate-300">
                <div className="grid h-9 w-9 place-items-center rounded-lg bg-white/5 ring-1 ring-white/10">
                  <Icon size={16} className="text-brand-400" />
                </div>
                {text}
              </div>
            ))}
          </div>
        </div>

        <p className="text-xs text-slate-500">
          © {new Date().getFullYear()} IncidentIQ · Developed by Prashant Verma
        </p>
      </div>

      {/* Form panel */}
      <div className="flex items-center justify-center p-6">
        <div className="w-full max-w-sm">
          {children}
          <p className="mt-8 text-center text-xs text-slate-600">
            Developed by Prashant Verma
          </p>
        </div>
      </div>
    </div>
  );
}
