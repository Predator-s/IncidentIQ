import { useState, type FormEvent } from "react";
import { X, AlertCircle, Sparkles } from "lucide-react";
import { createIncident } from "../api/incidents";
import { recommendSeverity } from "../api/ai";
import { apiError } from "../api/client";
import { useToast } from "../context/ToastContext";
import { SEVERITIES, type Incident, type Severity } from "../types";

interface Props {
  onClose: () => void;
  onCreated: (incident: Incident) => void;
}

export default function CreateIncidentModal({ onClose, onCreated }: Props) {
  const { toast } = useToast();
  const [form, setForm] = useState<{ title: string; description: string; severity: Severity }>({
    title: "",
    description: "",
    severity: "MEDIUM",
  });
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [suggesting, setSuggesting] = useState(false);
  const [aiReason, setAiReason] = useState<string | null>(null);

  const suggestSeverity = async () => {
    if (form.title.trim().length < 3 || form.description.trim().length < 5) {
      return setError("Add a title and description first, then let AI suggest a severity");
    }
    setError(null);
    setSuggesting(true);
    try {
      const out = await recommendSeverity(form.title, form.description);
      setForm((f) => ({ ...f, severity: out.severity }));
      setAiReason(
        `${out.reason}${out.source === "fallback" ? " (heuristic)" : ` · ${out.source}`}`
      );
    } catch (err) {
      setError(apiError(err));
    } finally {
      setSuggesting(false);
    }
  };

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    if (form.title.trim().length < 3) return setError("Title must be at least 3 characters");
    if (form.description.trim().length < 5)
      return setError("Description must be at least 5 characters");

    setSaving(true);
    try {
      const created = await createIncident(form);
      toast("Incident created", "success");
      onCreated(created);
    } catch (err) {
      setError(apiError(err));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
    >
      <div
        className="card w-full max-w-lg p-6 animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-white">Create Incident</h2>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-300">
            <X size={20} />
          </button>
        </div>

        {error && (
          <div className="mb-4 flex items-center gap-2 rounded-xl border border-rose-500/30 bg-rose-500/10 px-3.5 py-2.5 text-sm text-rose-300">
            <AlertCircle size={16} /> {error}
          </div>
        )}

        <form onSubmit={submit} className="space-y-4">
          <div>
            <label className="label">Title</label>
            <input
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="Short summary of the incident"
              className="input"
              autoFocus
            />
          </div>
          <div>
            <label className="label">Description</label>
            <textarea
              rows={4}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="What happened? Impact, scope, anything useful…"
              className="input resize-none"
            />
          </div>
          <div>
            <div className="mb-1.5 flex items-center justify-between">
              <label className="label mb-0">Severity</label>
              <button
                type="button"
                onClick={suggestSeverity}
                disabled={suggesting}
                className="inline-flex items-center gap-1.5 rounded-lg border border-brand-500/30 bg-brand-500/10 px-2.5 py-1 text-xs font-medium text-brand-300 transition hover:bg-brand-500/20 disabled:opacity-50"
              >
                <Sparkles size={13} />
                {suggesting ? "Thinking…" : "Suggest with AI"}
              </button>
            </div>
            <select
              value={form.severity}
              onChange={(e) => setForm({ ...form, severity: e.target.value as Severity })}
              className="input"
            >
              {SEVERITIES.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
            {aiReason && (
              <p className="mt-1.5 flex items-start gap-1.5 text-xs text-brand-300/80">
                <Sparkles size={12} className="mt-0.5 shrink-0" /> {aiReason}
              </p>
            )}
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={onClose} className="btn-ghost">
              Cancel
            </button>
            <button type="submit" disabled={saving} className="btn-primary">
              {saving ? "Creating…" : "Create Incident"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
