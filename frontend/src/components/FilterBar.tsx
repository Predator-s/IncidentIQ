import { Search } from "lucide-react";
import { SEVERITIES, STATUSES, type IncidentFilters } from "../types";

interface Props {
  filters: IncidentFilters;
  onChange: (next: IncidentFilters) => void;
}

export default function FilterBar({ filters, onChange }: Props) {
  const update = (patch: Partial<IncidentFilters>) =>
    onChange({ ...filters, ...patch, page: 1 });

  return (
    <div className="card flex flex-col gap-3 p-4 sm:flex-row sm:items-end">
      <div className="flex-1">
        <label className="label">Search</label>
        <div className="relative">
          <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            value={filters.search}
            onChange={(e) => update({ search: e.target.value })}
            placeholder="Search title or description…"
            className="input pl-9"
          />
        </div>
      </div>
      <div className="sm:w-40">
        <label className="label">Severity</label>
        <select
          value={filters.severity}
          onChange={(e) => update({ severity: e.target.value as IncidentFilters["severity"] })}
          className="input"
        >
          <option value="">All</option>
          {SEVERITIES.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </div>
      <div className="sm:w-44">
        <label className="label">Status</label>
        <select
          value={filters.status}
          onChange={(e) => update({ status: e.target.value as IncidentFilters["status"] })}
          className="input"
        >
          <option value="">All</option>
          {STATUSES.map((s) => (
            <option key={s} value={s}>{s.replace("_", " ")}</option>
          ))}
        </select>
      </div>
    </div>
  );
}
