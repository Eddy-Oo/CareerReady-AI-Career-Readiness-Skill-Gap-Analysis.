import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Zap, GraduationCap } from "lucide-react";
import { useAuthStore } from "../store";
import { Button, Field, Input, Select } from "../components/ui";

export default function Register() {
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    password: "",
    university: "",
    degree: "B.Sc. Computer Science",
    graduationYear: "2026",
  });
  const { register, loading, error, clearError } = useAuthStore();
  const navigate = useNavigate();

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    const ok = await register(form);
    if (ok) navigate("/dashboard");
  };

  return (
    <div className="min-h-screen bg-surface flex items-center justify-center px-6 py-12">
      <div className="w-full max-w-lg animate-fade-in-up">
        <Link to="/" className="flex items-center gap-2.5 mb-8 justify-center">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500 to-violet-600">
            <Zap className="h-5 w-5 text-white" strokeWidth={2.5} />
          </div>
          <span className="font-bold text-lg text-navy-800">CareerReady AI</span>
        </Link>

        <div className="card p-7 sm:p-9">
          <div className="flex items-center gap-3 mb-1">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-50 text-violet-600">
              <GraduationCap className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-xl font-extrabold tracking-tight text-navy-800">Student registration</h1>
              <p className="text-sm text-navy-400">Create your free career readiness account.</p>
            </div>
          </div>

          {error && (
            <div className="mt-5 rounded-xl bg-danger-50 border border-red-100 px-4 py-3 text-sm font-medium text-red-700">
              {error}
            </div>
          )}

          <form onSubmit={submit} className="mt-6 space-y-4">
            <Field label="Full name">
              <Input required value={form.fullName} onChange={set("fullName")} placeholder="Amina Yusuf" />
            </Field>
            <div className="grid sm:grid-cols-2 gap-4">
              <Field label="Email address">
                <Input type="email" required value={form.email} onChange={set("email")} placeholder="you@university.edu" />
              </Field>
              <Field label="Password" hint="Minimum 6 characters">
                <Input
                  type="password"
                  required
                  minLength={6}
                  value={form.password}
                  onChange={set("password")}
                  placeholder="••••••••"
                />
              </Field>
            </div>
            <Field label="University">
              <Input required value={form.university} onChange={set("university")} placeholder="State University" />
            </Field>
            <div className="grid sm:grid-cols-2 gap-4">
              <Field label="Degree">
                <Select value={form.degree} onChange={set("degree")}>
                  {[
                    "B.Sc. Computer Science",
                    "B.Sc. Information Technology",
                    "B.Tech Software Engineering",
                    "B.Sc. Data Science",
                    "M.Sc. Computer Science",
                    "Other",
                  ].map((d) => (
                    <option key={d}>{d}</option>
                  ))}
                </Select>
              </Field>
              <Field label="Graduation year">
                <Select value={form.graduationYear} onChange={set("graduationYear")}>
                  {["2026", "2027", "2028", "2029", "2030"].map((y) => (
                    <option key={y}>{y}</option>
                  ))}
                </Select>
              </Field>
            </div>
            <Button type="submit" loading={loading} className="w-full py-3">
              Create account
            </Button>
          </form>

          <p className="text-center text-sm text-navy-500 mt-6">
            Already registered?{" "}
            <Link to="/login" className="font-bold text-brand-600 hover:text-brand-700">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
