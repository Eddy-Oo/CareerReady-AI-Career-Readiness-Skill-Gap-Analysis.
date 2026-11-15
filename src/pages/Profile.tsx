import { useState } from "react";
import { User, Save, GraduationCap, Sparkles, Plus, X } from "lucide-react";
import { Card, SectionHeader, Field, Input, Select, Button, Badge, Textarea, Toast } from "../components/ui";
import { useAuthStore, useAnalysisStore } from "../store";

const INTEREST_OPTIONS = [
  "Software Developer",
  "Frontend Developer",
  "Backend Developer",
  "Full Stack Developer",
  "Data Scientist",
  "Machine Learning Engineer",
  "AI Engineer",
  "Cybersecurity Analyst",
  "Cloud Engineer",
  "Mobile Application Developer",
  "Database Administrator",
  "UI/UX Designer",
];

const SKILL_SUGGESTIONS = [
  "Python", "Java", "JavaScript", "TypeScript", "React", "Node.js", "SQL", "PostgreSQL",
  "MongoDB", "Git", "Docker", "AWS", "Machine Learning", "NLP", "Flutter", "Linux",
];

export default function Profile() {
  const { profile, updateProfile } = useAuthStore();
  const setToast = useAnalysisStore((s) => s.setToast);
  const [form, setForm] = useState({ ...profile });
  const [newSkill, setNewSkill] = useState("");
  const [newInterest, setNewInterest] = useState("");
  const [saved, setSaved] = useState(false);

  const set = (k: keyof typeof form, v: unknown) => setForm((f) => ({ ...f, [k]: v }));

  const save = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile(form);
    setSaved(true);
    setToast("Profile updated successfully.");
    setTimeout(() => setSaved(false), 2500);
  };

  const addSkill = (s: string) => {
    const v = s.trim();
    if (v && !form.technicalSkills.includes(v)) set("technicalSkills", [...form.technicalSkills, v]);
    setNewSkill("");
  };

  const removeSkill = (s: string) => set("technicalSkills", form.technicalSkills.filter((x) => x !== s));

  const addInterest = () => {
    const v = newInterest.trim();
    if (v && !form.careerInterests.includes(v)) set("careerInterests", [...form.careerInterests, v]);
    setNewInterest("");
  };

  const initials = form.fullName.split(" ").map((p) => p[0]).slice(0, 2).join("").toUpperCase();

  return (
    <div className="space-y-6 animate-fade-in">
      <SectionHeader
        title="Student Profile"
        subtitle="Your profile feeds the AI engines — career interests, technical skills and experience level shape matching and recommendations."
        icon={<User className="h-5 w-5" />}
      />

      <div className="grid lg:grid-cols-3 gap-5 items-start">
        {/* Avatar card */}
        <Card className="text-center">
          <div
            className="mx-auto flex h-24 w-24 items-center justify-center rounded-3xl text-2xl font-extrabold text-white shadow-glow"
            style={{ background: form.avatarColor ?? "#2563EB" }}
          >
            {initials || "S"}
          </div>
          <h2 className="mt-4 font-bold text-navy-800">{form.fullName}</h2>
          <p className="text-sm text-navy-400">{form.email}</p>
          <div className="mt-3 flex flex-wrap justify-center gap-1.5">
            <Badge tone="blue">{form.degree}</Badge>
            <Badge tone="violet">Class of {form.graduationYear}</Badge>
          </div>
          <p className="text-xs text-navy-400 mt-4 leading-relaxed px-2">{form.bio}</p>
          <div className="mt-5 rounded-xl bg-navy-50 border border-navy-100 px-4 py-3 text-left">
            <p className="text-[11px] font-bold uppercase tracking-wider text-navy-400">Avatar color</p>
            <div className="mt-2 flex justify-center gap-2">
              {["#2563EB", "#7C3AED", "#16A34A", "#F59E0B", "#0EA5E9", "#EC4899"].map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => set("avatarColor", c)}
                  className={`h-7 w-7 rounded-full transition-transform ${form.avatarColor === c ? "ring-2 ring-offset-2 ring-navy-300 scale-110" : "hover:scale-110"}`}
                  style={{ background: c }}
                  aria-label={`Color ${c}`}
                />
              ))}
            </div>
          </div>
        </Card>

        {/* Main form */}
        <form onSubmit={save} className="lg:col-span-2 space-y-5">
          <Card>
            <SectionHeader title="Personal & academic details" icon={<GraduationCap className="h-5 w-5" />} />
            <div className="grid sm:grid-cols-2 gap-4">
              <Field label="Full name">
                <Input value={form.fullName} onChange={(e) => set("fullName", e.target.value)} required />
              </Field>
              <Field label="Email address">
                <Input type="email" value={form.email} onChange={(e) => set("email", e.target.value)} required />
              </Field>
              <Field label="University">
                <Input value={form.university} onChange={(e) => set("university", e.target.value)} />
              </Field>
              <Field label="Degree">
                <Input value={form.degree} onChange={(e) => set("degree", e.target.value)} />
              </Field>
              <Field label="Graduation year">
                <Select value={form.graduationYear} onChange={(e) => set("graduationYear", e.target.value)}>
                  {["2025", "2026", "2027", "2028", "2029", "2030"].map((y) => (
                    <option key={y}>{y}</option>
                  ))}
                </Select>
              </Field>
              <Field label="Experience level">
                <Select value={form.experienceLevel} onChange={(e) => set("experienceLevel", e.target.value)}>
                  <option value="beginner">Beginner (0–1 years)</option>
                  <option value="intermediate">Intermediate (1–3 years)</option>
                  <option value="advanced">Advanced (3+ years)</option>
                </Select>
              </Field>
            </div>
            <div className="mt-4">
              <Field label="Bio" hint="One or two sentences shown on your dashboard">
                <Textarea rows={3} value={form.bio ?? ""} onChange={(e) => set("bio", e.target.value)} />
              </Field>
            </div>
          </Card>

          <Card>
            <SectionHeader title="Career interests" subtitle="Used to boost matching scores for these paths" icon={<Sparkles className="h-5 w-5" />} />
            <div className="flex flex-wrap gap-2 mb-4">
              {form.careerInterests.map((c) => (
                <span key={c} className="inline-flex items-center gap-1.5 rounded-lg bg-violet-50 border border-violet-100 px-3 py-1.5 text-xs font-bold text-violet-700">
                  {c}
                  <button type="button" onClick={() => set("careerInterests", form.careerInterests.filter((x) => x !== c))} aria-label={`Remove ${c}`}>
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}
              {form.careerInterests.length === 0 && <p className="text-sm text-navy-400">No interests added yet.</p>}
            </div>
            <div className="flex gap-2">
              <Select value={newInterest} onChange={(e) => setNewInterest(e.target.value)} className="flex-1">
                <option value="">Add a career interest…</option>
                {INTEREST_OPTIONS.filter((o) => !form.careerInterests.includes(o)).map((o) => (
                  <option key={o} value={o}>{o}</option>
                ))}
              </Select>
              <Button type="button" variant="secondary" onClick={addInterest} disabled={!newInterest}>
                <Plus className="h-4 w-4" /> Add
              </Button>
            </div>
          </Card>

          <Card>
            <SectionHeader title="Technical skills" subtitle="Listed skills count as existing evidence in gap analysis" />
            <div className="flex flex-wrap gap-2 mb-4">
              {form.technicalSkills.map((s) => (
                <span key={s} className="inline-flex items-center gap-1.5 rounded-lg bg-brand-50 border border-brand-100 px-3 py-1.5 text-xs font-bold text-brand-700">
                  {s}
                  <button type="button" onClick={() => removeSkill(s)} aria-label={`Remove ${s}`}>
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <Input value={newSkill} onChange={(e) => setNewSkill(e.target.value)} placeholder="e.g. TensorFlow" className="flex-1"
                onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addSkill(newSkill); } }} />
              <Button type="button" variant="secondary" onClick={() => addSkill(newSkill)} disabled={!newSkill.trim()}>
                <Plus className="h-4 w-4" /> Add
              </Button>
            </div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-navy-400 mt-5 mb-2">Suggestions</p>
            <div className="flex flex-wrap gap-1.5">
              {SKILL_SUGGESTIONS.filter((s) => !form.technicalSkills.includes(s)).map((s) => (
                <button key={s} type="button" onClick={() => addSkill(s)}
                  className="rounded-md border border-dashed border-navy-200 px-2.5 py-1 text-[11px] font-semibold text-navy-400 hover:border-brand-400 hover:text-brand-600 transition">
                  + {s}
                </button>
              ))}
            </div>
          </Card>

          <div className="flex justify-end gap-3">
            {saved && <span className="inline-flex items-center gap-1.5 text-sm font-bold text-success-600 animate-fade-in"><Save className="h-4 w-4" /> Saved</span>}
            <Button type="submit" className="px-6 py-2.5">
              <Save className="h-4 w-4" /> Save profile
            </Button>
          </div>
        </form>
      </div>
      <Toast message={null} onClose={() => setToast(null)} />
    </div>
  );
}
