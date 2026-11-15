import { useState } from "react";
import { Link } from "react-router-dom";
import { Zap, MailCheck, ArrowLeft } from "lucide-react";
import { apiForgotPassword } from "../api/client";
import { Button, Field, Input } from "../components/ui";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const res = await apiForgotPassword(email.trim());
    setSent(res.message);
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-surface flex items-center justify-center px-6 py-12">
      <div className="w-full max-w-md animate-fade-in-up">
        <Link to="/" className="flex items-center gap-2.5 mb-8 justify-center">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500 to-violet-600">
            <Zap className="h-5 w-5 text-white" strokeWidth={2.5} />
          </div>
          <span className="font-bold text-lg text-navy-800">CareerReady AI</span>
        </Link>

        <div className="card p-7 sm:p-9">
          {sent ? (
            <div className="text-center py-6 animate-fade-in">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-success-50 text-success-600 mb-4">
                <MailCheck className="h-7 w-7" />
              </div>
              <h1 className="text-xl font-extrabold text-navy-800">Check your inbox</h1>
              <p className="text-sm text-navy-400 mt-2">{sent}</p>
              <Link to="/login" className="inline-flex items-center gap-2 mt-6 font-semibold text-brand-600 text-sm">
                <ArrowLeft className="h-4 w-4" /> Back to sign in
              </Link>
            </div>
          ) : (
            <>
              <h1 className="text-xl font-extrabold tracking-tight text-navy-800">Forgot your password?</h1>
              <p className="text-sm text-navy-400 mt-1.5">
                Enter the email registered to your account and we'll send you a reset link.
              </p>
              <form onSubmit={submit} className="mt-6 space-y-4">
                <Field label="Email address">
                  <Input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@university.edu"
                  />
                </Field>
                <Button type="submit" loading={loading} className="w-full py-3">
                  Send reset link
                </Button>
              </form>
              <Link
                to="/login"
                className="inline-flex items-center gap-2 mt-6 font-semibold text-brand-600 text-sm hover:text-brand-700"
              >
                <ArrowLeft className="h-4 w-4" /> Back to sign in
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
