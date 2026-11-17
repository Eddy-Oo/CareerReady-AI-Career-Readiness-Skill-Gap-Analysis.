import { Link } from "react-router-dom";
import {
  GitCompareArrows,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Info,
  ArrowRight,
  Target,
  Trophy,
} from "lucide-react";
import { Card, SectionHeader, Badge, ProgressBar, EmptyState, Button } from "../components/ui";
import { SkillGapChart, ReadinessGauge, ReadinessBreakdownChart, ExistingVsRequiredChart } from "../components/charts";
import { useAnalysis } from "../hooks/useAnalysis";
import { useAnalysisStore } from "../store";

export default function SkillGapAnalysis() {
  const { career, gap, readiness, analysis } = useAnalysis();
  const setToast = useAnalysisStore((s) => s.setToast);

  if (!career || !gap || !readiness || !analysis) {
    return (
      <div className="animate-fade-in">
        <Card>
          <EmptyState
            icon={<Target className="h-6 w-6" />}
            title="Select a career first"
            description="The skill-gap analysis compares your extracted resume skills with your chosen career's requirements."
            action={
              <Link to="/careers" className="btn-primary px-5 py-2.5">
                Choose career <ArrowRight className="h-4 w-4" />
              </Link>
            }
          />
        </Card>
      </div>
    );
  }

  const toneFor = (score: number) => (score >= 70 ? "green" : score >= 45 ? "blue" : "amber") as "green" | "blue" | "amber";

  return (
    <div className="space-y-6 animate-fade-in">
      <SectionHeader
        title="AI Skill Gap Analysis"
        subtitle={`Comparing your resume against ${career.title} requirements — matched, missing and weak-evidence skills.`}
        icon={<GitCompareArrows className="h-5 w-5" />}
        action={
          <Badge tone="blue">
            <Target className="h-3 w-3" /> {career.title}
          </Badge>
        }
      />

      {/* Top overview */}
      <div className="grid lg:grid-cols-3 gap-5">
        <Card className="lg:col-span-1 flex flex-col items-center justify-center">
          <p className="text-xs font-bold uppercase tracking-wider text-navy-400 mb-2">Requirement coverage</p>
          <ReadinessGauge score={gap.coverage} size={170} />
          <p className="text-sm text-navy-500 mt-2 text-center px-4">
            {gap.matchedSkills.length} of {gap.matchedSkills.length + gap.missingSkills.length} required skills found
          </p>
        </Card>

        <Card>
          <SectionHeader title="Gap distribution" icon={<GitCompareArrows className="h-5 w-5" />} />
          <SkillGapChart gap={gap} />
        </Card>

        <Card>
          <SectionHeader title="Existing vs required" subtitle="Side-by-side comparison" icon={<Info className="h-5 w-5" />} />
          <ExistingVsRequiredChart
            existing={analysis.extractedSkills.map((s) => s.name)}
            required={[...career.requiredTechnicalSkills, ...career.requiredSoftSkills]}
          />
        </Card>
      </div>

      {/* Matched / Missing / Weak */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 items-stretch">
        <Card className="!border-success-100 min-w-0 h-full overflow-hidden flex flex-col">
          <div className="flex items-center gap-2.5 mb-4">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-success-50 text-success-600">
              <CheckCircle2 className="h-4.5 w-4.5" />
            </div>
            <div>
              <h3 className="font-bold text-navy-800 text-sm">Matched skills</h3>
              <p className="text-xs text-navy-400">Already evidenced on your resume</p>
            </div>
            <span className="ml-auto text-2xl font-extrabold text-success-600">{gap.matchedSkills.length}</span>
          </div>
          <div className="min-w-0 w-full rounded-xl border border-success-100 bg-success-50/40 p-3 flex flex-wrap content-start gap-1.5 flex-1">
            {gap.matchedSkills.length === 0 && <p className="text-sm text-navy-400">No matches yet.</p>}
            {gap.matchedSkills.map((s) => (
              <span key={s} className="max-w-full break-words rounded-lg bg-white border border-success-200 px-2.5 py-1.5 text-xs font-bold text-success-700">
                {s}
              </span>
            ))}
            {gap.technicalMatched.length > 0 && (
              <p className="w-full mt-3 pt-3 border-t border-success-200 text-xs text-navy-500 break-words">
                Technical: {gap.technicalMatched.join(", ")}
              </p>
            )}
          </div>
        </Card>

        <Card className="!border-red-100 min-w-0 h-full overflow-hidden flex flex-col">
          <div className="flex items-center gap-2.5 mb-4">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-danger-50 text-red-600">
              <XCircle className="h-4.5 w-4.5" />
            </div>
            <div>
              <h3 className="font-bold text-navy-800 text-sm">Missing skills</h3>
              <p className="text-xs text-navy-400">Required but not detected</p>
            </div>
            <span className="ml-auto text-2xl font-extrabold text-red-600">{gap.missingSkills.length}</span>
          </div>
          <div className="min-w-0 w-full rounded-xl border border-red-100 bg-red-50/40 p-3 flex flex-wrap content-start gap-1.5 flex-1">
            {gap.missingSkills.length === 0 && (
              <p className="text-sm font-medium text-success-600">Nothing missing — all requirements covered! 🎉</p>
            )}
            {gap.missingSkills.map((s) => (
              <span key={s} className="max-w-full break-words rounded-lg bg-white border border-red-200 px-2.5 py-1.5 text-xs font-bold text-red-700">
                {s}
              </span>
            ))}
            {gap.technicalMissing.length > 0 && (
              <p className="w-full mt-3 pt-3 border-t border-red-200 text-xs text-navy-500 break-words">
                Focus first: {gap.technicalMissing.slice(0, 4).join(", ")}
              </p>
            )}
          </div>
        </Card>

        <Card className="!border-warning-100 min-w-0 h-full overflow-hidden flex flex-col">
          <div className="flex items-center gap-2.5 mb-4">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-warning-50 text-warning-600">
              <AlertTriangle className="h-4.5 w-4.5" />
            </div>
            <div>
              <h3 className="font-bold text-navy-800 text-sm">Weak skills</h3>
              <p className="text-xs text-navy-400">Listed, but thin evidence</p>
            </div>
            <span className="ml-auto text-2xl font-extrabold text-warning-600">{gap.weakSkills.length}</span>
          </div>
          <div className="min-w-0 w-full rounded-xl border border-warning-100 bg-warning-50/30 p-3 space-y-2.5 flex-1">
            {gap.weakSkills.length === 0 ? (
              <p className="text-sm text-navy-500">
                No weak-evidence skills detected — all matched skills have supporting context (multiple mentions,
                projects or experience).
              </p>
            ) : (
              gap.weakSkills.map((w) => (
                <div key={w.name} className="min-w-0 rounded-xl bg-white border border-warning-200 px-3.5 py-2.5 break-words">
                  <p className="text-xs font-bold text-warning-600">{w.name}</p>
                  <p className="text-[11px] text-navy-500 mt-1 leading-relaxed">{w.reason}</p>
                </div>
              ))
            )}
          </div>
        </Card>
      </div>

      {/* Readiness score detail */}
      <Card>
        <SectionHeader
          title="Career readiness score"
          subtitle="Five weighted factors — every point is explained"
          icon={<Trophy className="h-5 w-5" />}
          action={
            <Badge tone={toneFor(readiness.overall) === "green" ? "green" : toneFor(readiness.overall) === "blue" ? "blue" : "amber"}>
              Overall {readiness.overall}%
            </Badge>
          }
        />
        <div className="grid lg:grid-cols-2 gap-8 items-start">
          <div>
            <ReadinessBreakdownChart result={readiness} />
            <div className="mt-4 rounded-xl bg-navy-50 border border-navy-100 px-4 py-3 flex items-start gap-2.5">
              <Info className="h-4 w-4 text-navy-400 shrink-0 mt-0.5" />
              <p className="text-xs text-navy-500 leading-relaxed">{readiness.disclaimer}</p>
            </div>
          </div>
          <div className="space-y-4">
            {readiness.breakdown.map((b) => (
              <div key={b.key} className="rounded-xl border border-navy-100 p-4">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-bold text-navy-800">
                    {b.label}
                    <span className="ml-2 text-[11px] font-bold text-navy-300">weight {Math.round(b.weight * 100)}%</span>
                  </p>
                  <span className={`text-lg font-extrabold ${b.score >= 70 ? "text-success-600" : b.score >= 45 ? "text-brand-600" : "text-warning-600"}`}>
                    {b.score}%
                  </span>
                </div>
                <ProgressBar value={b.score} tone={toneFor(b.score)} />
                <p className="text-xs text-navy-400 mt-2 leading-relaxed">{b.explanation}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="mt-6 flex flex-wrap justify-end gap-2.5 no-print">
          <Button variant="secondary" onClick={() => setToast("Tip: re-run the analyzer after adding new skills to refresh this gap.")}>
            Refresh tips
          </Button>
          <Link to="/career-matching" className="btn-primary px-5 py-2.5">
            See career matches <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </Card>
    </div>
  );
}
