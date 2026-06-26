import { useEffect, useState } from "react";
import { X, Clock, User, AlertCircle } from "lucide-react";
import Badge from "./Badge";
import AiInsights from "./AiInsights";
import { fetchIncident, updateIncidentStatus } from "../api/incidents";
import { apiError } from "../api/client";
import { useToast } from "../context/ToastContext";
import { STATUSES, type Incident, type Status } from "../types";

interface Props {
  id: string;
  onClose: () => void;
  onUpdated: (incident: Incident) => void;
}

export default function IncidentDetailDrawer({ id, onClose, onUpdated }: Props) {
  const { toast } = useToast();
  const [incident, setIncident] = useState<Incident | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let active = true;
    fetchIncident(id)
      .then((data) => active && setIncident(data))
      .catch((err) => active && setError(apiError(err)));
    return () => {
      active = false;
    };
  }, [id]);

  const changeStatus = async (status: Status) => {
    setSaving(true);
    setError(null);
    try {
      const updated = await updateIncidentStatus(id, status);
      setIncident(updated);
      onUpdated(updated);
      toast(`Status updated to ${status.replace("_", " ")}`, "success");
    } catch (err) {
      setError(apiError(err));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm animate-fade-in" onClick={onClose}>
      <div
        className="h-full w-full max-w-md overflow-y-auto border-l border-white/10 bg-slate-900/95 p-6 shadow-2xl backdrop-blur-xl animate-slide-in-right"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-white">Incident Details</h2>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-300">
            <X size={20} />
          </button>
        </div>

        {error && (
          <div className="mb-4 flex items-center gap-2 rounded-xl border border-rose-500/30 bg-rose-500/10 px-3.5 py-2.5 text-sm text-rose-300">
            <AlertCircle size={16} /> {error}
          </div>
        )}

        {!incident ? (
          <div className="space-y-4">
            <div className="skeleton h-7 w-3/4" />
            <div className="skeleton h-5 w-40" />
            <div className="skeleton h-24 w-full" />
          </div>
        ) : (
          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-bold leading-snug text-white">{incident.title}</h3>
              <div className="mt-3 flex flex-wrap gap-2">
                <Badge kind="severity" value={incident.severity} />
                <Badge kind="status" value={incident.status} />
              </div>
            </div>

            <div>
              <p className="label">Description</p>
              <p className="whitespace-pre-wrap rounded-xl border border-white/10 bg-white/5 p-3.5 text-sm leading-relaxed text-slate-300">
                {incident.description}
              </p>
            </div>

            <AiInsights incidentId={incident.id} />

            <div className="space-y-2.5 rounded-xl border border-white/10 bg-white/5 p-4 text-sm">
              <div className="flex items-center gap-2 text-slate-400">
                <User size={14} />
                <span>Reported by</span>
                <span className="ml-auto font-medium text-slate-200">{incident.createdBy?.name}</span>
              </div>
              <div className="flex items-center gap-2 text-slate-400">
                <User size={14} />
                <span>Last updated by</span>
                <span className="ml-auto font-medium text-slate-200">{incident.updatedBy?.name}</span>
              </div>
              <div className="flex items-center gap-2 text-slate-400">
                <Clock size={14} />
                <span>Created</span>
                <span className="ml-auto text-slate-300">{new Date(incident.createdAt).toLocaleString()}</span>
              </div>
              <div className="flex items-center gap-2 text-slate-400">
                <Clock size={14} />
                <span>Updated</span>
                <span className="ml-auto text-slate-300">{new Date(incident.updatedAt).toLocaleString()}</span>
              </div>
            </div>

            <div>
              <label className="label">Update Status</label>
              <select
                value={incident.status}
                disabled={saving}
                onChange={(e) => changeStatus(e.target.value as Status)}
                className="input"
              >
                {STATUSES.map((s) => (
                  <option key={s} value={s}>{s.replace("_", " ")}</option>
                ))}
              </select>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
