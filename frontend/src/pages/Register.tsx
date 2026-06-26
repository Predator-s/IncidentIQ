import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AlertCircle, Zap } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { apiError } from "../api/client";
import AuthShell from "../components/AuthShell";
import PasswordInput from "../components/PasswordInput";
import { validatePassword, PASSWORD_HINT } from "../utils/password";

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    if (form.name.trim().length < 2) return setError("Name must be at least 2 characters");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim()))
      return setError("Enter a valid email address");
    const pwErr = validatePassword(form.password);
    if (pwErr) return setError(pwErr);

    setLoading(true);
    try {
      await register(form.name, form.email, form.password);
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
      <h2 className="text-2xl font-bold text-white">Create your account</h2>
      <p className="mt-1 text-sm text-slate-400">Start managing incidents in minutes</p>

      {error && (
        <div className="mt-5 flex items-center gap-2 rounded-xl border border-rose-500/30 bg-rose-500/10 px-3.5 py-2.5 text-sm text-rose-300">
          <AlertCircle size={16} /> {error}
        </div>
      )}

      <form onSubmit={submit} className="mt-6 space-y-4">
        <div>
          <label className="label">Full name</label>
          <input
            type="text"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="Jane Doe"
            className="input"
          />
        </div>
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
            autoComplete="new-password"
            placeholder="Create a strong password"
          />
          <p className="mt-1.5 text-xs text-slate-500">{PASSWORD_HINT}</p>
        </div>
        <button type="submit" disabled={loading} className="btn-primary w-full">
          {loading ? "Creating…" : "Create Account"}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-slate-400">
        Already have an account?{" "}
        <Link to="/login" className="font-medium text-brand-400 hover:text-brand-300">
          Sign in
        </Link>
      </p>
    </AuthShell>
  );
}
