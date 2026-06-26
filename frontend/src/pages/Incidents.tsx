import { useEffect, useState, useCallback } from "react";
import { Plus, AlertCircle, LogOut } from "lucide-react";
import Sidebar from "../components/Sidebar";
import StatsCards from "../components/StatsCards";
import FilterBar from "../components/FilterBar";
import IncidentTable from "../components/IncidentTable";
import TableSkeleton from "../components/TableSkeleton";
import Pagination from "../components/Pagination";
import CreateIncidentModal from "../components/CreateIncidentModal";
import IncidentDetailDrawer from "../components/IncidentDetailDrawer";
import ChatBot from "../components/ChatBot";
import useDebounce from "../hooks/useDebounce";
import { fetchIncidents, type ListParams } from "../api/incidents";
import { apiError } from "../api/client";
import { useAuth } from "../context/AuthContext";
import type { Incident, IncidentFilters, Pagination as PaginationType } from "../types";

const INITIAL_FILTERS: IncidentFilters = {
  search: "",
  severity: "",
  status: "",
  page: 1,
  pageSize: 5,
};

export default function Incidents() {
  const { user, logout } = useAuth();
  const [filters, setFilters] = useState<IncidentFilters>(INITIAL_FILTERS);
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [pagination, setPagination] = useState<PaginationType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const debouncedSearch = useDebounce(filters.search, 400);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // Send only non-empty params; server handles filter/search/pagination.
      const params: ListParams = {
        page: filters.page,
        pageSize: filters.pageSize,
        ...(debouncedSearch && { search: debouncedSearch }),
        ...(filters.severity && { severity: filters.severity }),
        ...(filters.status && { status: filters.status }),
      };
      const res = await fetchIncidents(params);
      setIncidents(res.data);
      setPagination(res.pagination);
    } catch (err) {
      setError(apiError(err));
    } finally {
      setLoading(false);
    }
  }, [filters.page, filters.pageSize, filters.severity, filters.status, debouncedSearch]);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <div className="flex min-h-screen">
      <Sidebar />

      <div className="flex min-w-0 flex-1 flex-col">
        {/* Top bar */}
        <header className="sticky top-0 z-30 flex items-center justify-between border-b border-white/10 bg-slate-950/70 px-5 py-4 backdrop-blur-xl sm:px-8">
          <div>
            <h1 className="text-xl font-bold text-white">Incidents</h1>
            <p className="text-xs text-slate-500">Welcome back, {user?.name}</p>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setShowCreate(true)} className="btn-primary">
              <Plus size={16} /> New Incident
            </button>
            <button onClick={logout} className="btn-ghost px-3 lg:hidden" title="Logout">
              <LogOut size={16} />
            </button>
          </div>
        </header>

        <main className="mx-auto w-full max-w-6xl flex-1 space-y-5 p-5 sm:p-8">
          <StatsCards incidents={incidents} total={pagination?.total ?? 0} />
          <FilterBar filters={filters} onChange={setFilters} />

          {error && (
            <div className="flex items-center gap-2 rounded-xl border border-rose-500/30 bg-rose-500/10 px-3.5 py-2.5 text-sm text-rose-300">
              <AlertCircle size={16} /> {error}
            </div>
          )}

          {loading ? (
            <TableSkeleton />
          ) : (
            <>
              <IncidentTable incidents={incidents} onSelect={setSelectedId} />
              <Pagination
                pagination={pagination}
                onPage={(page) => setFilters((f) => ({ ...f, page }))}
              />
            </>
          )}
        </main>
      </div>

      {showCreate && (
        <CreateIncidentModal
          onClose={() => setShowCreate(false)}
          onCreated={() => {
            setShowCreate(false);
            setFilters((f) => ({ ...f, page: 1 }));
            load();
          }}
        />
      )}

      {selectedId && (
        <IncidentDetailDrawer
          id={selectedId}
          onClose={() => setSelectedId(null)}
          onUpdated={load}
        />
      )}

      <ChatBot />
    </div>
  );
}
