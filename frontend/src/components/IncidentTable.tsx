import { Inbox, ChevronRight } from "lucide-react";
import Badge from "./Badge";
import type { Incident } from "../types";

interface Props {
  incidents: Incident[];
  onSelect: (id: string) => void;
}

export default function IncidentTable({ incidents, onSelect }: Props) {
  if (!incidents.length) {
    return (
      <div className="card flex flex-col items-center gap-3 p-12 text-center">
        <div className="grid h-14 w-14 place-items-center rounded-2xl bg-white/5">
          <Inbox size={26} className="text-slate-500" />
        </div>
        <p className="font-medium text-slate-300">No incidents found</p>
        <p className="text-sm text-slate-500">Try adjusting your filters or create a new incident.</p>
      </div>
    );
  }

  return (
    <>
      {/* Mobile: stacked cards */}
      <ul className="space-y-3 md:hidden">
        {incidents.map((inc) => (
          <li
            key={inc.id}
            onClick={() => onSelect(inc.id)}
            className="card cursor-pointer p-4 transition active:scale-[0.99]"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="truncate font-medium text-slate-100">{inc.title}</p>
                <p className="mt-0.5 line-clamp-2 text-xs text-slate-500">{inc.description}</p>
              </div>
              <ChevronRight size={16} className="mt-1 shrink-0 text-slate-600" />
            </div>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <Badge kind="severity" value={inc.severity} />
              <Badge kind="status" value={inc.status} />
              <span className="ml-auto text-xs text-slate-500">
                {new Date(inc.createdAt).toLocaleDateString(undefined, {
                  month: "short",
                  day: "numeric",
                })}
              </span>
            </div>
          </li>
        ))}
      </ul>

      {/* Desktop: table */}
      <div className="card hidden overflow-hidden md:block">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="border-b border-white/10 text-left text-xs uppercase tracking-wide text-slate-500">
              <th className="px-5 py-3.5 font-medium">Incident</th>
              <th className="px-5 py-3.5 font-medium">Severity</th>
              <th className="px-5 py-3.5 font-medium">Status</th>
              <th className="hidden px-5 py-3.5 font-medium md:table-cell">Reporter</th>
              <th className="hidden px-5 py-3.5 font-medium lg:table-cell">Created</th>
              <th className="px-5 py-3.5" />
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {incidents.map((inc) => (
              <tr
                key={inc.id}
                onClick={() => onSelect(inc.id)}
                className="group cursor-pointer transition hover:bg-white/[0.03]"
              >
                <td className="max-w-xs px-5 py-4">
                  <p className="truncate font-medium text-slate-100">{inc.title}</p>
                  <p className="truncate text-xs text-slate-500">{inc.description}</p>
                </td>
                <td className="px-5 py-4"><Badge kind="severity" value={inc.severity} /></td>
                <td className="px-5 py-4"><Badge kind="status" value={inc.status} /></td>
                <td className="hidden px-5 py-4 text-slate-400 md:table-cell">
                  {inc.createdBy?.name ?? "—"}
                </td>
                <td className="hidden px-5 py-4 text-slate-500 lg:table-cell">
                  {new Date(inc.createdAt).toLocaleDateString(undefined, {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </td>
                <td className="px-5 py-4 text-right">
                  <ChevronRight
                    size={16}
                    className="ml-auto text-slate-600 transition group-hover:translate-x-0.5 group-hover:text-brand-400"
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
