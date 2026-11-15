import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Zap, Eye, EyeOff, ArrowRight } from "lucide-react";
import { useAuthStore } from "../store";
import { Button, Field, Input } from "../components/ui";

export default function Login() {
  const [email, setEmail] = useState("amina.yusuf@university.edu");
  const [password, setPassword] = useState("demo1234");
  const [show, setShow] = useState(false);
  const { login, loading, error, clearError } = useAuthStore();
  const navigate = useNavigate();

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    const ok = await login(email.trim(), password);
    if (ok) navigate("/dashboard");
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      {/* Left brand panel */}
      <div className="hidden lg:flex flex-col justify-between bg-navy-800 text-white p-12 relative overflow-hidden">
        <div className="absolute -top-32 -right-32 h-96 w-96 rounded-full bg-brand-600/25 blur-3xl" />
        <div className="absolute bottom-0 -left-20 h-80 w-80 rounded-full bg-violet-600/20 blur-3xl" />
        <Link to="/" className="relative flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500 to-violet-600">
            <Zap className="h-5 w-5" strokeWidth={2.5} />
          </div>
          <span className="font-bold text-lg">CareerReady AI</span>
        </Link>
        <div className="relative">
          <h2 className="text-3xl font-extrabold leading-snug tracking-tight">
            Know exactly which skills
            <br />
            stand between you and
            <br />
            <span className="text-brand-400">your dream career.</span>
          </h2>
          <p className="mt-4 text-navy-300 text-sm max-w-md leading-relaxed">
            NLP-powered resume parsing, transparent skill-gap scoring, ML career matching and personalized
            GenAI learning roadmaps — built for CS students.
          </p>
          <div className="mt-8 grid grid-cols-3 gap-4 max-w-md">
            {[
              ["10", "Skill categories"],
              ["12", "Career paths"],
              ["5", "Score factors"],
            ].map(([n, l]) => (
              <div key={l} className="rounded-xl bg-white/5 border border-white/10 px-3 py-3">
                <p className="text-xl font-extrabold text-brand-400">{n}</p>
                <p className="text-[11px] text-navy-300 mt-0.5">{l}</p>
              </div>
            ))}
          </div>
        </div>
        <p className="relative text-xs text-navy-400">© 2026 CareerReady AI · Senior Project</p>
      </div>

      {/* Right form */}
      <div className="flex items-center justify-center px-6 py-12 bg-surface">
        <div className="w-full max-w-md animate-fade-in-up">
          <Link to="/" className="lg:hidden flex items-center gap-2.5 mb-8 justify-center">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500 to-violet-600">
              <Zap className="h-4 w-4 text-white" strokeWidth={2.5} />
            </div>
            <span className="font-bold text-navy-800">CareerReady AI</span>
          </Link>
          <h1 className="text-2xl font-extrabold tracking-tight text-navy-800">Welcome back</h1>
          <p className="text-sm text-navy-400 mt-1.5">Sign in to continue your career readiness journey.</p>

          {error && (
            <div className="mt-5 rounded-xl bg-danger-50 border border-red-100 px-4 py-3 text-sm font-medium text-red-700 animate-fade-in">
              {error}
            </div>
          )}

          <form onSubmit={submit} className="mt-6 space-y-4">
            <Field label="Email address">
              <Input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@university.edu"
                autoComplete="email"
              />
            </Field>
            <Field label="Password">
              <div className="relative">
                <Input
                  type={show ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  className="pr-11"
                />
                <button
                  type="button"
                  onClick={() => setShow((s) => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-navy-400 hover:text-navy-600"
                  aria-label={show ? "Hide password" : "Show password"}
                >
                  {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </Field>
            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 text-navy-500">
                <input type="checkbox" defaultChecked className="h-4 w-4 rounded border-navy-300 text-brand-600 focus:ring-brand-500" />
                Remember me
              </label>
              <Link to="/forgot-password" className="font-semibold text-brand-600 hover:text-brand-700">
                Forgot password?
              </Link>
            </div>
            <Button type="submit" loading={loading} className="w-full py-3">
              Sign in <ArrowRight className="h-4 w-4" />
            </Button>
          </form>

          <p className="text-center text-sm text-navy-500 mt-6">
            New here?{" "}
            <Link to="/register" className="font-bold text-brand-600 hover:text-brand-700">
              Create an account
            </Link>
          </p>
          <p className="text-center text-xs text-navy-300 mt-4">
            Demo mode: any valid email + password (≥6 chars) works — backend fallback active.
          </p>
        </div>
      </div>
    </div>
  );
}
