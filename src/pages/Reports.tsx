import { useRef } from "react";
import { FileText, Printer, Download, ArrowRight, Trophy, Target, Sparkles, Layers } from "lucide-react";
import { Card, SectionHeader, Badge, Button, EmptyState, ProgressBar } from "../components/ui";
import { ReadinessGauge } from "../components/charts";
import { useAnalysis } from "../hooks/useAnalysis";
import { useAnalysisStore } from "../store";
import { Link } from "react-router-dom";

export default function Reports() {
  const { analysis, career, gap, readiness, matches, profile } = useAnalysis();
  const history = useAnalysisStore((s) => s.history);
  const setToast = useAnalysisStore((s) => s.setToast);
  const printRef = useRef<HTMLDivElement>(null);

  if (!analysis || !career || !gap || !readiness) {
    return (
      <Card>
        <EmptyState
          icon={<FileText className="h-6 w-6" />}
          title="Report not ready"
          description="Analyze a resume and select a career to generate your career readiness report."
          action={
            <Link to="/resume-analyzer" className="btn-primary px-5 py-2.5">
              Start analysis <ArrowRight className="h-4 w-4" />
            </Link>
          }
        />
      </Card>
    );
  }

  const date = new Date().toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" });

  return (
    <div className="space-y-6 animate-fade-in no-print">
      <SectionHeader
        title="Career Analysis Report"
        subtitle="A professional, exportable summary of your resume analysis, skill gap, readiness score, career matches and learning plan."
        icon={<FileText className="h-5 w-5" />}
        action={
          <div className="flex gap-2.5">
            <Button variant="secondary" onClick={() => setToast("Use your browser's Print → Save as PDF for export.")}>
              <Printer className="h-4 w-4" /> Print
            </Button>
            <Button
              onClick={() => {
                setToast("Preparing PDF — choose 'Save as PDF' in the print dialog.");
                setTimeout(() => window.print(), 350);
              }}
            >
              <Download className="h-4 w-4" /> Export PDF
            </Button>
          </div>
        }
      />

      <div ref={printRef} className="space-y-5 rounded-2xl">
        {/* Report header */}
        <div className="rounded-2xl bg-navy-800 text-white p-6 sm:p-8 relative overflow-hidden">
          <div className="absolute -top-14 -right-14 h-48 w-48 rounded-full bg-brand-500/25 blur-3xl" />
          <div className="relative flex flex-wrap items-start justify-between gap-6">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-brand-300">CareerReady AI · Official Report</p>
              <h2 className="text-2xl font-extrabold mt-1.5">Career Readiness Report</h2>
              <p className="text-sm text-navy-300 mt-1">
                Generated {date} · Analysis ID {analysis.id.slice(0, 8)}
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm font-bold">{profile.fullName}</p>
              <p className="text-xs text-navy-300">{profile.degree} · {profile.university}</p>
              <p className="text-xs text-navy-300">Graduating {profile.graduationYear}</p>
            </div>
          </div>
        </div>

        {/* Student info + readiness */}
        <div className="grid lg:grid-cols-3 gap-5">
          <Card>
            <SectionHeader title="Student information" icon={<Target className="h-5 w-5" />} />
            <dl className="space-y-2.5 text-sm">
              {[
                ["Full name", profile.fullName],
                ["Email", profile.email],
                ["University", profile.university],
                ["Degree", profile.degree],
                ["Graduation year", profile.graduationYear],
                ["Experience level", profile.experienceLevel],
                ["Career interests", profile.careerInterests.join(", ") || "—"],
              ].map(([k, v]) => (
                <div key={k} className="flex justify-between gap-4 border-b border-navy-50 pb-2">
                  <dt className="text-navy-400 font-medium">{k}</dt>
                  <dd className="text-navy-700 font-semibold text-right truncate">{v}</dd>
                </div>
              ))}
            </dl>
          </Card>

          <Card className="flex flex-col items-center justify-center">
            <SectionHeader title="Readiness score" icon={<Trophy className="h-5 w-5" />} />
            <ReadinessGauge score={readiness.overall} size={165} />
            <p className="text-[11px] text-navy-400 text-center mt-3 leading-relaxed">{readiness.disclaimer}</p>
          </Card>

          <Card>
            <SectionHeader title="Score factors" icon={<Layers className="h-5 w-5" />} />
            <div className="space-y-3.5">
              {readiness.breakdown.map((b) => (
                <ProgressBar
                  key={b.key}
                  label={`${b.label} (${Math.round(b.weight * 100)}%)`}
                  value={b.score}
                  tone={b.score >= 70 ? "green" : b.score >= 45 ? "blue" : "amber"}
                />
              ))}
            </div>
          </Card>
        </div>

        {/* Resume analysis */}
        <div className="grid lg:grid-cols-2 gap-5">
          <Card>
            <SectionHeader
              title="Resume analysis"
              subtitle={analysis.fileName}
              icon={<FileText className="h-5 w-5" />}
              action={<Badge tone={analysis.source === "backend" ? "green" : "violet"}>{analysis.source === "backend" ? "FastAPI NLP" : "Local NLP"}</Badge>}
            />
            <div className="grid grid-cols-3 gap-3 mb-4">
              {[
                [analysis.technicalSkills.length, "Technical skills"],
                [analysis.softSkills.length, "Soft skills"],
                [analysis.projects.length, "Projects"],
              ].map(([n, l]) => (
                <div key={String(l)} className="rounded-xl bg-navy-50 px-3 py-2.5 text-center">
                  <p className="text-xl font-extrabold text-navy-800">{n}</p>
                  <p className="text-[10px] font-bold text-navy-400">{l}</p>
                </div>
              ))}
            </div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-navy-400 mb-1.5">Extracted skills</p>
            <div className="flex flex-wrap gap-1.5 max-h-40 overflow-y-auto thin-scroll pr-1">
              {analysis.extractedSkills.map((s) => (
                <span key={s.name} className="rounded-md bg-brand-50 border border-brand-100 px-2 py-0.5 text-[11px] font-semibold text-brand-700">
                  {s.name}
                </span>
              ))}
            </div>
            {analysis.experiences.length > 0 && (
              <>
                <p className="text-[11px] font-bold uppercase tracking-wider text-navy-400 mt-4 mb-1.5">Experience</p>
                {analysis.experiences.map((e, i) => (
                  <p key={i} className="text-xs text-navy-600">
                    <strong>{e.title}</strong> — {e.organization} <span className="text-navy-300">({e.duration})</span>
                  </p>
                ))}
              </>
            )}
          </Card>

          <Card>
            <SectionHeader title={`Skill gap → ${career.title}`} icon={<Target className="h-5 w-5" />} action={<Badge tone="blue">{gap.coverage}% coverage</Badge>} />
            <div className="grid grid-cols-3 gap-3 mb-4">
              {[
                [gap.matchedSkills.length, "Matched", "text-success-600"],
                [gap.missingSkills.length, "Missing", "text-red-600"],
                [gap.weakSkills.length, "Weak", "text-warning-600"],
              ].map(([n, l, cls]) => (
                <div key={String(l)} className="rounded-xl bg-navy-50 px-3 py-2.5 text-center">
                  <p className={`text-xl font-extrabold ${cls}`}>{n}</p>
                  <p className="text-[10px] font-bold text-navy-400">{l}</p>
                </div>
              ))}
            </div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-navy-400 mb-1.5">Matched</p>
            <div className="flex flex-wrap gap-1.5">
              {gap.matchedSkills.map((s) => (
                <span key={s} className="rounded-md bg-success-50 border border-success-100 px-2 py-0.5 text-[11px] font-bold text-success-700">{s}</span>
              ))}
            </div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-navy-400 mt-3 mb-1.5">Missing</p>
            <div className="flex flex-wrap gap-1.5">
              {gap.missingSkills.length === 0 && <span className="text-xs font-semibold text-success-600">None 🎉</span>}
              {gap.missingSkills.map((s) => (
                <span key={s} className="rounded-md bg-danger-50 border border-red-100 px-2 py-0.5 text-[11px] font-bold text-red-700">{s}</span>
              ))}
            </div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-navy-400 mt-3 mb-1.5">Weak evidence</p>
            <div className="flex flex-wrap gap-1.5">
              {gap.weakSkills.length === 0 && <span className="text-xs text-navy-400">None detected</span>}
              {gap.weakSkills.map((w) => (
                <span key={w.name} className="rounded-md bg-warning-50 border border-warning-100 px-2 py-0.5 text-[11px] font-bold text-warning-600">{w.name}</span>
              ))}
            </div>
          </Card>
        </div>

        {/* Career matches */}
        <Card>
          <SectionHeader title="Career matching results" subtitle="Top 5 from the ML similarity engine" icon={<Sparkles className="h-5 w-5" />} />
          <div className="grid sm:grid-cols-2 xl:grid-cols-5 gap-3">
            {matches.slice(0, 5).map((m, i) => (
              <div key={m.careerId} className="rounded-xl border border-navy-100 p-4">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-extrabold text-navy-300">#{i + 1}</span>
                  <span className="text-lg font-extrabold text-brand-600">{m.score}%</span>
                </div>
                <p className="text-xs font-bold text-navy-700 mt-1.5 leading-tight">{m.careerTitle}</p>
                <div className="mt-2">
                  <ProgressBar value={m.score} height="h-1.5" showValue={false} />
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Learning recommendations summary */}
        <Card>
          <SectionHeader title="Learning recommendations" subtitle="From the generative recommendation engine" icon={<Sparkles className="h-5 w-5" />} />
          <div className="grid sm:grid-cols-2 gap-3">
            {[
              ["Phase 1 focus", gap.technicalMissing[0] ?? "Deepen existing skills"],
              ["Phase 2 focus", gap.technicalMissing[1] ?? "Portfolio projects"],
              ["Practice", "2–3 interview problems weekly + STAR stories"],
              ["Application goal", `Apply to ${career.title} roles after 70% readiness`],
            ].map(([k, v]) => (
              <div key={k} className="rounded-xl bg-navy-50 border border-navy-100 px-4 py-3">
                <p className="text-[11px] font-bold uppercase tracking-wider text-navy-400">{k}</p>
                <p className="text-sm font-semibold text-navy-700 mt-1">{v}</p>
              </div>
            ))}
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            <Link to="/recommendations" className="btn-secondary px-4 py-2 text-xs">Full AI recommendations →</Link>
            <Link to="/roadmap" className="btn-secondary px-4 py-2 text-xs">Learning roadmap →</Link>
          </div>
        </Card>

        {/* Analysis history */}
        <Card>
          <SectionHeader title="Analysis history" icon={<FileText className="h-5 w-5" />} />
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-[11px] font-bold uppercase tracking-wider text-navy-400 border-b border-navy-100">
                <th className="py-2.5 pr-3">Date</th>
                <th className="py-2.5 pr-3">Career</th>
                <th className="py-2.5 pr-3">Matched</th>
                <th className="py-2.5 pr-3">Missing</th>
                <th className="py-2.5 text-right">Readiness</th>
              </tr>
            </thead>
            <tbody>
              {history.map((h) => (
                <tr key={h.id} className="border-b border-navy-50">
                  <td className="py-2.5 pr-3 text-navy-500">{new Date(h.date).toLocaleDateString()}</td>
                  <td className="py-2.5 pr-3 font-semibold text-navy-700">{h.careerTitle}</td>
                  <td className="py-2.5 pr-3 text-success-600 font-bold">{h.matched}</td>
                  <td className="py-2.5 pr-3 text-red-600 font-bold">{h.missing}</td>
                  <td className="py-2.5 text-right font-extrabold text-navy-800">{h.readiness}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>

        <p className="text-center text-[11px] text-navy-300 pb-4">
          CareerReady AI — AI-Powered Career Readiness and Skill Gap Analysis System · Report generated for academic
          demonstration · Scores are readiness indices, not hiring probabilities.
        </p>
      </div>
    </div>
  );
}
