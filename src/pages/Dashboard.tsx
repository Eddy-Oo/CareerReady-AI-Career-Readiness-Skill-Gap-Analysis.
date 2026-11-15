import { Link } from "react-router-dom";
import {
  Trophy,
  Layers,
  CheckCircle2,
  XCircle,
  Sparkles,
  ArrowRight,
  FileSearch,
  TrendingUp,
} from "lucide-react";
import { Card, SectionHeader, Badge, ProgressBar, Button, EmptyState } from "../components/ui";
import {
  ReadinessGauge,
  SkillDistributionChart,
  SkillGapChart,
  TrendChart,
  CareerMatchChart,
} from "../components/charts";
import { useAnalysis } from "../hooks/useAnalysis";
import { useAnalysisStore, useAuthStore } from "../store";

export default function Dashboard() {
  const { analysis, career, gap, readiness, matches } = useAnalysis();
  const history = useAnalysisStore((s) => s.history);
  const profile = useAuthStore((s) => s.profile);
  const setToast = useAnalysisStore((s) => s.setToast);

  const completedPhases = Object.values(useAnalysisStore((s) => s.roadmapProgress)).filter(Boolean).length;

  const stats = [
    {
      label: "Career Readiness",
      value: readiness ? `${readiness.overall}%` : "—",
      icon: Trophy,
      tone: "bg-warning-50 text-warning-600",
      sub: career ? `for ${career.title}` : "Select a career",
    },
    {
      label: "Extracted Skills",
      value: analysis?.extractedSkills.length ?? 0,
      icon: Layers,
      tone: "bg-brand-50 text-brand-600",
      sub: `${analysis?.technicalSkills.length ?? 0} technical · ${analysis?.softSkills.length ?? 0} soft`,
    },
    {
      label: "Matched Skills",
      value: gap?.matchedSkills.length ?? 0,
      icon: CheckCircle2,
      tone: "bg-success-50 text-success-600",
      sub: gap ? `${gap.coverage}% coverage` : "—",
    },
    {
      label: "Missing Skills",
      value: gap?.missingSkills.length ?? 0,
      icon: XCircle,
      tone: "bg-danger-50 text-red-600",
      sub: gap ? `${gap.weakSkills.length} weak evidence` : "—",
    },
    {
      label: "Roadmap Completed",
      value: `${completedPhases}`,
      icon: Sparkles,
      tone: "bg-violet-50 text-violet-600",
      sub: "phases finished",
    },
  ];

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Welcome */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-brand-600">{greeting}, {profile.fullName.split(" ")[0]} 👋</p>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-navy-800 mt-0.5">
            Your career readiness overview
          </h1>
          <p className="text-sm text-navy-400 mt-1">
            {analysis
              ? `Last analysis: ${analysis.fileName} · ${new Date(analysis.analyzedAt).toLocaleDateString()}`
              : "Upload a resume to get started."}
          </p>
        </div>
        <div className="flex gap-2.5 no-print">
          <Link to="/resume-analyzer" className="btn-primary px-4 py-2.5">
            <FileSearch className="h-4 w-4" /> Analyze resume
          </Link>
          <Link to="/reports" className="btn-secondary px-4 py-2.5">
            View report <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {stats.map((s) => (
          <Card key={s.label} hover className="!p-4 sm:!p-5">
            <div className={`flex h-9 w-9 items-center justify-center rounded-xl ${s.tone}`}>
              <s.icon className="h-4.5 w-4.5" />
            </div>
            <p className="mt-3 text-2xl font-extrabold text-navy-800 tracking-tight">{s.value}</p>
            <p className="text-xs font-bold text-navy-600 mt-0.5">{s.label}</p>
            <p className="text-[11px] text-navy-400 mt-0.5 truncate">{s.sub}</p>
          </Card>
        ))}
      </div>

      {!career ? (
        <Card>
          <EmptyState
            icon={<TrendingUp className="h-6 w-6" />}
            title="No target career selected yet"
            description="Pick a career to unlock your skill-gap analysis, readiness score and personalized roadmap."
            action={
              <Link to="/careers" className="btn-primary px-5 py-2.5">
                Select a career <ArrowRight className="h-4 w-4" />
              </Link>
            }
          />
        </Card>
      ) : (
        <>
          {/* Readiness + charts row */}
          <div className="grid lg:grid-cols-3 gap-5">
            <Card className="lg:col-span-1">
              <SectionHeader
                title="Career readiness"
                subtitle={career.title}
                icon={<Trophy className="h-5 w-5" />}
              />
              <div className="flex justify-center py-2">
                <ReadinessGauge score={readiness?.overall ?? 0} />
              </div>
              <p className="text-[11px] text-navy-400 text-center leading-relaxed mt-2 px-2">
                {readiness?.disclaimer}
              </p>
              <div className="mt-4 space-y-2.5">
                {readiness?.breakdown.slice(0, 3).map((b) => (
                  <ProgressBar
                    key={b.key}
                    label={`${b.label} (${Math.round(b.weight * 100)}%)`}
                    value={b.score}
                    tone={b.score >= 70 ? "green" : b.score >= 45 ? "blue" : "amber"}
                  />
                ))}
              </div>
              <Link to="/skill-gap" className="mt-5 block text-center text-sm font-bold text-brand-600 hover:text-brand-700">
                Full score breakdown →
              </Link>
            </Card>

            <Card>
              <SectionHeader title="Technical skill distribution" subtitle="Skills by category on your resume" icon={<Layers className="h-5 w-5" />} />
              {analysis && analysis.technicalSkills.length > 0 ? (
                <SkillDistributionChart skills={analysis.extractedSkills} />
              ) : (
                <EmptyState title="No skills yet" description="Analyze a resume first." />
              )}
            </Card>

            <Card>
              <SectionHeader title="Skill gap visualization" subtitle={`${career.title} requirements`} icon={<GitCompareIcon />} />
              {gap ? <SkillGapChart gap={gap} /> : <EmptyState title="No gap data" />}
            </Card>
          </div>

          {/* Matches + trend row */}
          <div className="grid lg:grid-cols-2 gap-5">
            <Card>
              <SectionHeader
                title="Career matching comparison"
                subtitle="Top matches ranked by ML similarity engine"
                icon={<TrendingUp className="h-5 w-5" />}
                action={
                  <Link to="/career-matching" className="text-sm font-bold text-brand-600 hover:text-brand-700 no-print">
                    Details →
                  </Link>
                }
              />
              <CareerMatchChart matches={matches.slice(0, 5)} />
            </Card>

            <Card>
              <SectionHeader title="Readiness progress" subtitle="Your recent analysis history" icon={<TrendingUp className="h-5 w-5" />} />
              {history.length > 0 ? (
                <TrendChart history={history} />
              ) : (
                <EmptyState title="No history yet" description="Complete an analysis to start tracking." />
              )}
            </Card>
          </div>

          {/* Recent analyses */}
          <Card>
            <SectionHeader
              title="Recent resume analyses"
              subtitle="Your last analysis runs"
              icon={<FileSearch className="h-5 w-5" />}
              action={
                <Badge tone="blue">{history.length} total</Badge>
              }
            />
            <div className="overflow-x-auto -mx-2">
              <table className="w-full text-sm min-w-[640px]">
                <thead>
                  <tr className="text-left text-xs font-bold uppercase tracking-wider text-navy-400 border-b border-navy-100">
                    <th className="px-2 py-3">Date</th>
                    <th className="px-2 py-3">File</th>
                    <th className="px-2 py-3">Target career</th>
                    <th className="px-2 py-3">Matched</th>
                    <th className="px-2 py-3">Missing</th>
                    <th className="px-2 py-3 text-right">Readiness</th>
                  </tr>
                </thead>
                <tbody>
                  {history.map((h) => (
                    <tr key={h.id} className="border-b border-navy-50 hover:bg-navy-50/60 transition">
                      <td className="px-2 py-3.5 text-navy-500">{new Date(h.date).toLocaleDateString()}</td>
                      <td className="px-2 py-3.5 font-medium text-navy-700 max-w-[180px] truncate">{h.fileName}</td>
                      <td className="px-2 py-3.5 text-navy-600">{h.careerTitle}</td>
                      <td className="px-2 py-3.5"><Badge tone="green">{h.matched}</Badge></td>
                      <td className="px-2 py-3.5"><Badge tone="red">{h.missing}</Badge></td>
                      <td className="px-2 py-3.5 text-right">
                        <span className={`font-extrabold ${h.readiness >= 70 ? "text-success-600" : h.readiness >= 45 ? "text-brand-600" : "text-warning-600"}`}>
                          {h.readiness}%
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="mt-4 flex justify-end no-print">
              <Button variant="secondary" size="sm" onClick={() => setToast("Report export is available on the Career Report page.")}>
                Export history
              </Button>
            </div>
          </Card>
        </>
      )}
    </div>
  );
}

function GitCompareIcon() {
  return (
    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="5" cy="6" r="3" />
      <circle cx="19" cy="18" r="3" />
      <path d="M12 6h5a2 2 0 0 1 2 2v7M12 18H7a2 2 0 0 1-2-2V9" />
    </svg>
  );
}
