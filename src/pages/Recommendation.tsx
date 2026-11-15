import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Sparkles,
  Map,
  Cpu,
  FolderKanban,
  CalendarDays,
  MessagesSquare,
  Compass,
  ArrowRight,
  RefreshCw,
  Loader2,
} from "lucide-react";
import { Card, SectionHeader, Badge, Button, EmptyState, Toast } from "../components/ui";
import { useAnalysis } from "../hooks/useAnalysis";
import { useAnalysisStore } from "../store";
import { apiRecommendations } from "../api/client";
import type { AIRecommendation } from "../types";

const TYPE_META: Record<AIRecommendation["type"], { icon: typeof Map; label: string; tone: string }> = {
  roadmap: { icon: Map, label: "Learning Roadmap", tone: "bg-brand-50 text-brand-600" },
  technology: { icon: Cpu, label: "Technology", tone: "bg-violet-50 text-violet-600" },
  project: { icon: FolderKanban, label: "Project Idea", tone: "bg-success-50 text-success-600" },
  study_plan: { icon: CalendarDays, label: "Study Plan", tone: "bg-warning-50 text-warning-600" },
  interview: { icon: MessagesSquare, label: "Interview Prep", tone: "bg-brand-50 text-brand-600" },
  career_advice: { icon: Compass, label: "Career Advice", tone: "bg-violet-50 text-violet-600" },
};

const PRIORITY_TONE = { high: "red", medium: "amber", low: "gray" } as const;

export default function Recommendations() {
  const { career, gap, readiness, analysis, profile } = useAnalysis();
  const setToast = useAnalysisStore((s) => s.setToast);
  const [recs, setRecs] = useState<AIRecommendation[]>([]);
  const [loading, setLoading] = useState(false);
  const [source, setSource] = useState<"backend" | "local">("local");

  const load = async () => {
    if (!career || !gap || !readiness || !analysis) return;
    setLoading(true);
    try {
      const res = await apiRecommendations({ career, gap, readiness, analysis, userProfile: profile });
      setRecs(res.recommendations);
      setSource(res.source);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [career?.id, analysis?.id]);

  if (!career || !gap || !readiness || !analysis) {
    return (
      <Card>
        <EmptyState
          icon={<Sparkles className="h-6 w-6" />}
          title="Complete an analysis first"
          description="AI recommendations are generated from your skill gaps, readiness results and target career."
          action={
            <Link to="/resume-analyzer" className="btn-primary px-5 py-2.5">
              Analyze resume <ArrowRight className="h-4 w-4" />
            </Link>
          }
        />
      </Card>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <SectionHeader
        title="Generative AI Recommendations"
        subtitle={`Personalized for ${profile.fullName} → ${career.title}: learning roadmap, technologies, projects, study plan, interview prep and career advice.`}
        icon={<Sparkles className="h-5 w-5" />}
        action={
          <div className="flex items-center gap-2">
            <Badge tone={source === "backend" ? "green" : "violet"}>
              {source === "backend" ? "GenAI API" : "On-device generator"}
            </Badge>
            <Button variant="secondary" size="sm" onClick={load} disabled={loading}>
              {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <RefreshCw className="h-3.5 w-3.5" />}
              Regenerate
            </Button>
          </div>
        }
      />

      {/* Context strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          ["Readiness", `${readiness.overall}%`],
          ["Missing skills", String(gap.missingSkills.length)],
          ["Matched skills", String(gap.matchedSkills.length)],
          ["Target career", career.title],
        ].map(([l, v]) => (
          <div key={l} className="rounded-xl border border-navy-100 bg-white px-4 py-3 shadow-card">
            <p className="text-[11px] font-bold uppercase tracking-wider text-navy-400">{l}</p>
            <p className="text-sm font-extrabold text-navy-800 mt-0.5 truncate">{v}</p>
          </div>
        ))}
      </div>

      {loading && recs.length === 0 ? (
        <Card>
          <div className="flex flex-col items-center py-14 gap-3">
            <Loader2 className="h-8 w-8 animate-spin text-violet-600" />
            <p className="text-sm font-semibold text-navy-500">Generating personalized recommendations…</p>
          </div>
        </Card>
      ) : recs.length === 0 ? (
        <Card>
          <EmptyState title="No recommendations yet" description="Click regenerate to build your plan." />
        </Card>
      ) : (
        <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-5">
          {recs.map((r, i) => {
            const meta = TYPE_META[r.type];
            return (
              <Card key={r.id} hover className="flex flex-col animate-fade-in-up" >
                <div style={{ animationDelay: `${i * 60}ms` }} className="flex items-start justify-between gap-3">
                  <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${meta.tone}`}>
                    <meta.icon className="h-5 w-5" />
                  </div>
                  <div className="flex flex-col items-end gap-1.5">
                    <Badge tone={PRIORITY_TONE[r.priority]}>
                      {r.priority} priority
                    </Badge>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-navy-300">{meta.label}</span>
                  </div>
                </div>
                <h3 className="mt-3.5 font-bold text-navy-800 leading-snug">{r.title}</h3>
                <p className="text-sm text-navy-500 mt-2 leading-relaxed flex-1">{r.body}</p>
              </Card>
            );
          })}
        </div>
      )}

      <Card className="flex flex-wrap items-center justify-between gap-4 bg-gradient-to-r from-violet-50 to-brand-50 !border-violet-100">
        <div>
          <h3 className="font-bold text-navy-800">Ready to act on these recommendations?</h3>
          <p className="text-sm text-navy-500 mt-0.5">Open your phased learning roadmap and start tracking progress.</p>
        </div>
        <Link to="/roadmap" className="btn-primary px-5 py-2.5">
          Open roadmap <ArrowRight className="h-4 w-4" />
        </Link>
      </Card>

      <Toast message={null} onClose={() => setToast(null)} />
    </div>
  );
}
