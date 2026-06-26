import { Zap, LayoutDashboard, LogOut } from "lucide-react";
import { useAuth } from "../context/AuthContext";

export default function Sidebar() {
  const { user, logout } = useAuth();

  return (
    <aside className="hidden w-64 shrink-0 flex-col border-r border-white/10 bg-slate-950/60 p-5 backdrop-blur-xl lg:flex">
      <div className="mb-8 flex items-center gap-2.5">
        <div className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-brand-500 to-indigo-500 shadow-lg shadow-brand-500/30">
          <Zap size={18} className="text-white" />
        </div>
        <div>
          <p className="text-sm font-bold leading-tight text-white">IncidentIQ</p>
          <p className="text-[11px] text-slate-500">Incident Management</p>
        </div>
      </div>

      <nav className="flex-1 space-y-1">
        <a className="flex items-center gap-3 rounded-xl bg-white/5 px-3 py-2.5 text-sm font-medium text-white ring-1 ring-white/10">
          <LayoutDashboard size={18} className="text-brand-400" />
          Incidents
        </a>
      </nav>

      <div className="mt-auto space-y-3 border-t border-white/10 pt-4">
        <div className="flex items-center gap-3">
          <div className="grid h-9 w-9 place-items-center rounded-full bg-gradient-to-br from-brand-500 to-pink-500 text-sm font-semibold text-white">
            {user?.name?.charAt(0).toUpperCase() ?? "?"}
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-slate-200">{user?.name}</p>
            <p className="truncate text-xs text-slate-500">{user?.email}</p>
          </div>
        </div>
        <button onClick={logout} className="btn-ghost w-full">
          <LogOut size={16} /> Logout
        </button>
        <p className="text-center text-[11px] text-slate-600">Developed by Prashant Verma</p>
      </div>
    </aside>
  );
}
