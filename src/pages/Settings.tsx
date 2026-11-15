import { useState } from "react";
import { Settings as SettingsIcon, Bell, Shield, Database, Palette, Trash2, Save, CheckCircle2 } from "lucide-react";
import { Card, SectionHeader, Badge, Button, Field, Input, Select, Toast } from "../components/ui";
import { useAuthStore, useAnalysisStore } from "../store";
import { backendConfigured } from "../api/client";

function Toggle({ on, onChange, label, desc }: { on: boolean; onChange: (v: boolean) => void; label: string; desc: string }) {
  return (
    <div className="flex items-start justify-between gap-4 py-3.5 border-b border-navy-50 last:border-0">
      <div>
        <p className="text-sm font-bold text-navy-700">{label}</p>
        <p className="text-xs text-navy-400 mt-0.5 max-w-md">{desc}</p>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={on}
        onClick={() => onChange(!on)}
        className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${on ? "bg-brand-600" : "bg-navy-200"}`}
      >
        <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all ${on ? "left-[22px]" : "left-0.5"}`} />
      </button>
    </div>
  );
}

export default function SettingsPage() {
  const { user, profile, logout } = useAuthStore();
  const { setToast, history, roadmapProgress } = useAnalysisStore();
  const [prefs, setPrefs] = useState({
    emailAlerts: true,
    weeklyReport: true,
    productTips: false,
    autoAnalyze: true,
    darkCharts: false,
  });
  const [saved, setSaved] = useState(false);

  const save = () => {
    setSaved(true);
    setToast("Settings saved.");
    setTimeout(() => setSaved(false), 2200);
  };

  const clearData = () => {
    localStorage.removeItem("careeready-analysis");
    setToast("Local analysis data cleared. Reload to reset.");
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <SectionHeader
        title="Settings"
        subtitle="Manage notifications, data and integration preferences."
        icon={<SettingsIcon className="h-5 w-5" />}
      />

      <div className="grid lg:grid-cols-2 gap-5 items-start">
        <Card>
          <SectionHeader title="Notifications" icon={<Bell className="h-5 w-5" />} />
          <Toggle
            on={prefs.emailAlerts}
            onChange={(v) => setPrefs((p) => ({ ...p, emailAlerts: v }))}
            label="Email alerts"
            desc="Get notified when a new recommendation set is generated."
          />
          <Toggle
            on={prefs.weeklyReport}
            onChange={(v) => setPrefs((p) => ({ ...p, weeklyReport: v }))}
            label="Weekly readiness report"
            desc="A summary of your progress delivered every Monday."
          />
          <Toggle
            on={prefs.productTips}
            onChange={(v) => setPrefs((p) => ({ ...p, productTips: v }))}
            label="Product tips"
            desc="Occasional tips about new AI features."
          />
          <Toggle
            on={prefs.autoAnalyze}
            onChange={(v) => setPrefs((p) => ({ ...p, autoAnalyze: v }))}
            label="Auto-run gap analysis"
            desc="Automatically recompute skill gap after each resume upload."
          />
          <Toggle
            on={prefs.darkCharts}
            onChange={(v) => setPrefs((p) => ({ ...p, darkCharts: v }))}
            label="High-contrast charts"
            desc="Increase chart contrast for presentations and projectors."
          />
          <div className="mt-4 flex justify-end">
            <Button onClick={save} className="px-5 py-2.5">
              {saved ? <><CheckCircle2 className="h-4 w-4" /> Saved</> : <><Save className="h-4 w-4" /> Save preferences</>}
            </Button>
          </div>
        </Card>

        <div className="space-y-5">
          <Card>
            <SectionHeader title="Account" icon={<Shield className="h-5 w-5" />} />
            <div className="space-y-3 text-sm">
              <div className="flex justify-between border-b border-navy-50 pb-2.5">
                <span className="text-navy-400">Signed in as</span>
                <span className="font-semibold text-navy-700">{user?.email ?? profile.email}</span>
              </div>
              <div className="flex justify-between border-b border-navy-50 pb-2.5">
                <span className="text-navy-400">Account type</span>
                <Badge tone="violet">Student · Free</Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-navy-400">Session</span>
                <span className="font-semibold text-success-600">Active</span>
              </div>
            </div>
            <div className="mt-4">
              <Field label="Change password" hint="Demo mode — passwords are not stored in local fallback">
                <Input type="password" placeholder="••••••••" />
              </Field>
            </div>
            <div className="mt-4 flex gap-2.5">
              <Button variant="secondary" onClick={() => setToast("Password reset email sent (demo).")}>
                Update password
              </Button>
              <Button variant="danger" onClick={() => { logout(); window.location.href = "/login"; }}>
                Log out
              </Button>
            </div>
          </Card>

          <Card>
            <SectionHeader
              title="Backend & data"
              icon={<Database className="h-5 w-5" />}
              action={
                <Badge tone={backendConfigured ? "green" : "amber"}>
                  {backendConfigured ? "FastAPI connected" : "Local fallback mode"}
                </Badge>
              }
            />
            <p className="text-xs text-navy-500 leading-relaxed">
              {backendConfigured
                ? "VITE_API_BASE_URL is set — resume analysis, matching and GenAI recommendations call the FastAPI service."
                : "No backend configured. The app runs its deterministic NLP/ML fallback engines so the demo stays fully functional. Set VITE_API_BASE_URL to connect FastAPI."}
            </p>
            <div className="mt-3 rounded-xl bg-navy-800 text-navy-200 font-mono text-[11px] p-3.5 overflow-x-auto">
              <span className="text-success-400">GET</span>  /api/resume/analyze<br />
              <span className="text-success-400">POST</span> /api/analysis/skill-gap<br />
              <span className="text-success-400">POST</span> /api/matching/rank<br />
              <span className="text-success-400">POST</span> /api/recommendations<br />
              <span className="text-success-400">POST</span> /api/roadmap<br />
              <span className="text-success-400">POST</span> /api/job/analyze
            </div>
            <div className="mt-4 flex items-center justify-between rounded-xl bg-warning-50 border border-warning-100 px-4 py-3">
              <div>
                <p className="text-xs font-bold text-warning-600">Stored data</p>
                <p className="text-[11px] text-navy-500 mt-0.5">
                  {history.length} analyses · {Object.keys(roadmapProgress).length} roadmap toggles
                </p>
              </div>
              <Button variant="secondary" size="sm" onClick={clearData}>
                <Trash2 className="h-3.5 w-3.5" /> Clear
              </Button>
            </div>
          </Card>

          <Card>
            <SectionHeader title="Appearance" icon={<Palette className="h-5 w-5" />} />
            <div className="flex items-center gap-3">
              <div className="flex -space-x-2">
                {["#101828", "#2563EB", "#7C3AED", "#16A34A"].map((c) => (
                  <span key={c} className="h-7 w-7 rounded-full border-2 border-white shadow" style={{ background: c }} />
                ))}
              </div>
              <p className="text-xs text-navy-500">Navy · Blue · Purple · Green — locked to the CareerReady design system.</p>
            </div>
            <div className="mt-4">
              <Field label="Interface density">
                <Select defaultValue="comfortable">
                  <option value="comfortable">Comfortable</option>
                  <option value="compact">Compact</option>
                </Select>
              </Field>
            </div>
          </Card>
        </div>
      </div>
      <Toast message={null} onClose={() => setToast(null)} />
    </div>
  );
}
