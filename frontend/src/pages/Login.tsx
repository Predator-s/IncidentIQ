import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AlertCircle, Zap } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { apiError } from "../api/client";
import AuthShell from "../components/AuthShell";
import PasswordInput from "../components/PasswordInput";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim()))
      return setError("Enter a valid email address");
    if (!form.password) return setError("Password is required");

    setLoading(true);
    try {
      await login(form.email, form.password);
      navigate("/");
    } catch (err) {
      setError(apiError(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell>
      <div className="mb-8 lg:hidden">
        <div className="mb-2 inline-grid h-11 w-11 place-items-center rounded-xl bg-gradient-to-br from-brand-500 to-indigo-500">
          <Zap size={22} className="text-white" />
        </div>
      </div>
      <h2 className="text-2xl font-bold text-white">Welcome back</h2>
      <p className="mt-1 text-sm text-slate-400">Sign in to your IncidentIQ account</p>

      {error && (
        <div className="mt-5 flex items-center gap-2 rounded-xl border border-rose-500/30 bg-rose-500/10 px-3.5 py-2.5 text-sm text-rose-300">
          <AlertCircle size={16} /> {error}
        </div>
      )}

      <form onSubmit={submit} className="mt-6 space-y-4">
        <div>
          <label className="label">Email</label>
          <input
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            placeholder="you@company.com"
            className="input"
          />
        </div>
        <div>
          <label className="label">Password</label>
          <PasswordInput
            value={form.password}
            onChange={(password) => setForm({ ...form, password })}
            autoComplete="current-password"
          />
        </div>
        <button type="submit" disabled={loading} className="btn-primary w-full">
          {loading ? "Signing in…" : "Sign In"}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-slate-400">
        No account?{" "}
        <Link to="/register" className="font-medium text-brand-400 hover:text-brand-300">
          Create one
        </Link>
      </p>

      <p className="mt-4 rounded-lg border border-white/10 bg-white/5 p-3 text-center text-xs text-slate-500">
        Demo: <span className="text-slate-300">admin@incidentiq.dev</span> / <span className="text-slate-300">password123</span>
      </p>
    </AuthShell>
  );
}
