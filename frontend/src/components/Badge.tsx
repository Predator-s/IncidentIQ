import type { Severity, Status } from "../types";

const SEVERITY_STYLES: Record<Severity, string> = {
  LOW: "bg-emerald-500/15 text-emerald-300 ring-emerald-500/30",
  MEDIUM: "bg-amber-500/15 text-amber-300 ring-amber-500/30",
  HIGH: "bg-orange-500/15 text-orange-300 ring-orange-500/30",
  CRITICAL: "bg-rose-500/15 text-rose-300 ring-rose-500/30",
};

const STATUS_STYLES: Record<Status, string> = {
  OPEN: "bg-sky-500/15 text-sky-300 ring-sky-500/30",
  IN_PROGRESS: "bg-brand-500/15 text-brand-300 ring-brand-500/30",
  RESOLVED: "bg-emerald-500/15 text-emerald-300 ring-emerald-500/30",
  CLOSED: "bg-slate-500/15 text-slate-400 ring-slate-500/30",
};

interface Props {
  kind: "severity" | "status";
  value: Severity | Status;
}

export default function Badge({ kind, value }: Props) {
  const styles =
    kind === "severity"
      ? SEVERITY_STYLES[value as Severity]
      : STATUS_STYLES[value as Status];
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${styles}`}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current opacity-80" />
      {value.replace("_", " ")}
    </span>
  );
}
