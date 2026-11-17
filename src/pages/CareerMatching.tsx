import { useEffect } from "react";
import { Link } from "react-router-dom";
import { BarChart3, Sparkles, ArrowRight, Target, CheckCircle2, Info } from "lucide-react";
import { Card, SectionHeader, Badge, Button, EmptyState, ProgressBar } from "../components/ui";
import { CareerMatchChart } from "../components/charts";
import { useAnalysis } from "../hooks/useAnalysis";
import { getCareer, CAREERS } from "../data/careers";
import { useAnalysisStore, useAuthStore } from "../store";
import { apiMatchCareers } from "../api/client";

export default function CareerMatching() {
  const { matches, analysis, career, profile } = useAnalysis();
  const setToast = useAnalysisStore((s) => s.setToast);
  const user = useAuthStore((s) => s.user);

  useEffect(() => {
    if (!analysis || !user) return;
    apiMatchCareers({ analysis, userProfile: profile, careers: CAREERS }).catch((error) => {
      console.error("CAREER MATCH SAVE ERROR:", error);
      setToast(error instanceof Error ? `Could not save career matches: ${error.message}` : "Could not save career matches.");
    });
  }, [analysis, user, profile, setToast]);
  const selectCareer = useAnalysisStore((s) => s.selectCareer);

  if (!analysis) {
    return (
      <Card>
        <EmptyState
          icon={<BarChart3 className="h-6 w-6" />}
          title="No resume analyzed"
          description="Upload a resume first so the ML engine has data to rank careers."
          action={
            <Link to="/resume-analyzer" className="btn-primary px-5 py-2.5">
              Go to analyzer <ArrowRight className="h-4 w-4" />
            </Link>
          }
        />
      </Card>
    );
  }

  const top5 = matches.slice(0, 5);

  return (
    <div className="space-y-6 animate-fade-in">
      <SectionHeader
        title="Machine Learning Career Matching"
        subtitle="TF-IDF vectorization + cosine similarity over your resume and 12 career profiles, blended with skill-coverage re-ranking — your top five paths with explanations."
        icon={<BarChart3 className="h-5 w-5" />}
        action={
          <Badge tone="violet">
            <Sparkles className="h-3 w-3" /> scikit-learn pipeline
          </Badge>
        }
      />

      {/* Top match hero */}
      {top5[0] && (
        <div className="rounded-2xl bg-gradient-to-r from-navy-800 via-navy-700 to-brand-900 p-6 sm:p-8 text-white relative overflow-hidden">
          <div className="absolute -top-16 -right-16 h-56 w-56 rounded-full bg-brand-500/25 blur-3xl" />
          <div className="relative flex flex-wrap items-center justify-between gap-6">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-brand-300">Best career match</p>
              <h2 className="mt-1.5 text-2xl sm:text-3xl font-extrabold tracking-tight">{top5[0].careerTitle}</h2>
              <p className="text-sm text-navy-300 mt-2 max-w-xl leading-relaxed">{top5[0].explanation}</p>
              <div className="mt-3.5 flex flex-wrap gap-1.5">
                {top5[0].sharedSkills.slice(0, 6).map((s) => (
                  <span key={s} className="rounded-lg bg-white/10 border border-white/15 px-2.5 py-1 text-[11px] font-bold">
                    {s}
                  </span>
                ))}
              </div>
            </div>
            <div className="text-center">
              <div className="relative h-28 w-28">
                <svg viewBox="0 0 100 100" className="h-full w-full -rotate-90">
                  <circle cx="50" cy="50" r="42" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="10" />
                  <circle
                    cx="50"
                    cy="50"
                    r="42"
                    fill="none"
                    stroke="#60A5FA"
                    strokeWidth="10"
                    strokeLinecap="round"
                    strokeDasharray={`${(top5[0].score / 100) * 264} 264`}
                    className="transition-all duration-1000"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-2xl font-extrabold">{top5[0].score}%</span>
                  <span className="text-[10px] font-bold text-navy-300 uppercase">match</span>
                </div>
              </div>
              <Button
                variant="secondary"
                className="mt-3 min-h-11 w-full !border-2 !border-white !bg-white !text-navy-900 shadow-md hover:!bg-brand-50"
                size="md"
                type="button"
                aria-pressed={career?.id === top5[0].careerId}
                onClick={() => {
                  selectCareer(top5[0].careerId);
                  setToast(`Target career set to ${top5[0].careerTitle}`);
                }}
              >
                <Target className="h-4 w-4" />
                {career?.id === top5[0].careerId ? "Target selected" : "Set as target"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Chart */}
      <Card>
        <SectionHeader title="Top 5 matching career paths" subtitle="Ranked by similarity score" icon={<Target className="h-5 w-5" />} />
        <CareerMatchChart matches={top5} />
      </Card>

      {/* Explanation cards */}
      <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-5">
        {top5.map((m, i) => {
          const c = getCareer(m.careerId);
          const isTarget = career?.id === m.careerId;
          return (
            <Card key={m.careerId} hover className={`flex flex-col ${isTarget ? "!border-brand-500 ring-2 ring-brand-100" : ""}`}>
              <div className="flex items-center justify-between">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-navy-800 text-white text-xs font-extrabold">
                  #{i + 1}
                </span>
                {isTarget ? (
                  <Badge tone="green"><CheckCircle2 className="h-3 w-3" /> Target</Badge>
                ) : (
                  <Badge tone="blue">{m.score}%</Badge>
                )}
              </div>
              <h3 className="mt-3 font-bold text-navy-800">{m.careerTitle}</h3>
              <div className="mt-2.5">
                <ProgressBar value={m.score} tone={m.score >= 70 ? "green" : m.score >= 45 ? "blue" : "amber"} />
              </div>
              <p className="text-xs text-navy-500 mt-3 leading-relaxed flex-1">{m.explanation}</p>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {m.sharedSkills.slice(0, 5).map((s) => (
                  <span key={s} className="rounded-md bg-success-50 border border-success-100 px-2 py-0.5 text-[10px] font-bold text-success-700">
                    {s}
                  </span>
                ))}
                {m.sharedSkills.length === 0 && (
                  <span className="text-[11px] text-navy-300 font-semibold">No shared skills yet</span>
                )}
              </div>
              <div className="mt-4 grid gap-2">
                <Button
                  variant={isTarget ? "secondary" : "primary"}
                  size="md"
                  type="button"
                  className={`min-h-11 w-full border-2 ${isTarget ? "!border-success-500 !bg-success-50 !text-success-800 hover:!bg-success-100" : "!border-brand-700 !bg-brand-700 !text-white hover:!bg-brand-800"}`}
                  aria-pressed={isTarget}
                  onClick={() => {
                    selectCareer(m.careerId);
                    setToast(`Target career set to ${m.careerTitle}`);
                  }}
                >
                  {isTarget ? <CheckCircle2 className="h-4 w-4" /> : <Target className="h-4 w-4" />}
                  {isTarget ? "Target selected" : "Set as target"}
                </Button>
                {c && (
                  <Link
                    to="/skill-gap"
                    onClick={() => selectCareer(m.careerId)}
                    className="inline-flex min-h-10 w-full items-center justify-center gap-2 rounded-xl border border-navy-200 bg-white px-4 py-2 text-sm font-semibold text-navy-700 transition hover:border-brand-300 hover:bg-brand-50 hover:text-brand-700"
                  >
                    Analyze skill gap <ArrowRight className="h-4 w-4" />
                  </Link>
                )}
              </div>
            </Card>
          );
        })}
      </div>

      {/* Methodology */}
      <Card className="bg-navy-800 !border-0 text-navy-200">
        <div className="flex items-start gap-3">
          <Info className="h-5 w-5 text-brand-400 shrink-0 mt-0.5" />
          <div>
            <h3 className="font-bold text-white text-sm">How the matching model works</h3>
            <p className="text-xs leading-relaxed mt-1.5 text-navy-300">
              1) Your resume + profile are tokenized and stopword-filtered. 2) TF-IDF weighting is computed across the
              document corpus (your document + 12 career profiles). 3) Cosine similarity produces a raw score. 4) A
              skill-coverage term re-ranks results (stand-in for the sentence-transformer semantic layer in the
              FastAPI service). Final score = 55% semantic similarity + 40% skill coverage + 5% interest alignment.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}
