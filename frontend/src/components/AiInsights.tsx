import { useState } from "react";
import { Sparkles, FileText, Search } from "lucide-react";
import { getSummary, getRootCause, type AiTextResult } from "../api/ai";
import { apiError } from "../api/client";

interface Props {
  incidentId: string;
}

type Kind = "summary" | "rootCause";

export default function AiInsights({ incidentId }: Props) {
  const [loading, setLoading] = useState<Kind | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<Partial<Record<Kind, AiTextResult>>>({});

  const run = async (kind: Kind) => {
    setLoading(kind);
    setError(null);
    try {
      const out = kind === "summary" ? await getSummary(incidentId) : await getRootCause(incidentId);
      setResults((r) => ({ ...r, [kind]: out }));
    } catch (err) {
      setError(apiError(err));
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="rounded-xl border border-brand-500/20 bg-brand-500/[0.04] p-4">
      <div className="mb-3 flex items-center gap-2">
        <Sparkles size={15} className="text-brand-400" />
        <span className="text-sm font-semibold text-slate-200">AI Insights</span>
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => run("summary")}
          disabled={loading !== null}
          className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium text-slate-200 transition hover:bg-white/10 disabled:opacity-50"
        >
          <FileText size={13} />
          {loading === "summary" ? "Summarizing…" : "Summarize"}
        </button>
        <button
          onClick={() => run("rootCause")}
          disabled={loading !== null}
          className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium text-slate-200 transition hover:bg-white/10 disabled:opacity-50"
        >
          <Search size={13} />
          {loading === "rootCause" ? "Analyzing…" : "Root-cause"}
        </button>
      </div>

      {error && <p className="mt-3 text-xs text-rose-300">{error}</p>}

      {(["summary", "rootCause"] as Kind[]).map((kind) => {
        const out = results[kind];
        if (!out) return null;
        return (
          <div key={kind} className="mt-3 rounded-lg border border-white/10 bg-slate-950/40 p-3">
            <p className="mb-1 text-[11px] uppercase tracking-wide text-slate-500">
              {kind === "summary" ? "Summary" : "Likely root causes"}
              <span className="ml-2 normal-case text-brand-300/70">
                {out.source === "fallback" ? "heuristic" : out.source}
              </span>
            </p>
            <p className="whitespace-pre-wrap text-sm leading-relaxed text-slate-300">
              {out.result}
            </p>
          </div>
        );
      })}
    </div>
  );
}
