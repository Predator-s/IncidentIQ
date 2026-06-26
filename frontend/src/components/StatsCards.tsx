import { AlertTriangle, CircleDot, Loader2, CheckCircle2 } from "lucide-react";
import type { Incident } from "../types";

interface Props {
  incidents: Incident[];
  total: number;
}

// Note: stats reflect the current page of results (lightweight, no extra API call).
export default function StatsCards({ incidents, total }: Props) {
  const open = incidents.filter((i) => i.status === "OPEN").length;
  const inProgress = incidents.filter((i) => i.status === "IN_PROGRESS").length;
  const critical = incidents.filter((i) => i.severity === "CRITICAL").length;

  const cards = [
    { label: "Total (all)", value: total, icon: CircleDot, tint: "from-sky-500/20 text-sky-300" },
    { label: "Open", value: open, icon: AlertTriangle, tint: "from-amber-500/20 text-amber-300" },
    { label: "In Progress", value: inProgress, icon: Loader2, tint: "from-brand-500/20 text-brand-300" },
    { label: "Critical", value: critical, icon: CheckCircle2, tint: "from-rose-500/20 text-rose-300" },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
      {cards.map(({ label, value, icon: Icon, tint }) => (
        <div key={label} className="card flex items-center gap-3 p-4">
          <div className={`grid h-11 w-11 place-items-center rounded-xl bg-gradient-to-br to-transparent ${tint}`}>
            <Icon size={20} />
          </div>
          <div>
            <p className="text-2xl font-bold text-white">{value}</p>
            <p className="text-xs text-slate-400">{label}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
