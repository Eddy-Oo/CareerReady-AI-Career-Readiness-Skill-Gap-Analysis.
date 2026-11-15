import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Map,
  CheckCircle2,
  Circle,
  Clock,
  BookOpen,
  ArrowRight,
  Loader2,
  Target,
  ExternalLink,
} from "lucide-react";
import { Card, SectionHeader, Badge, Button, ProgressBar, EmptyState } from "../components/ui";
import { useAnalysis } from "../hooks/useAnalysis";
import { useAnalysisStore } from "../store";
import { apiRoadmap } from "../api/client";
import type { RoadmapPhase } from "../types";
import { SAMPLE_ROADMAP } from "../data/sample";

const TYPE_LABEL: Record<string, string> = {
  course: "Course",
  documentation: "Docs",
  book: "Book",
  practice: "Practice",
  video: "Video",
};

export default function Roadmap() {
  const { career, gap, analysis } = useAnalysis();
  const { roadmapProgress, toggleRoadmapItem, setToast } = useAnalysisStore();
  const [phases, setPhases] = useState<RoadmapPhase[]>([]);
  const [loading, setLoading] = useState(false);
  const [source, setSource] = useState<"backend" | "local">("local");

  useEffect(() => {
    if (!career || !gap || !analysis) return;
    let cancelled = false;
    setLoading(true);
    apiRoadmap({ career, gap, analysis })
      .then((res) => {
        if (cancelled) return;
        setPhases(res.phases);
        setSource(res.source);
      })
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [career?.id, gap?.careerId, analysis?.id]);

  if (!career || !gap) {
    return (
      <Card>
        <EmptyState
          icon={<Target className="h-6 w-6" />}
          title="Select a career first"
          description="Your learning roadmap is built from the missing skills of your target career."
          action={
            <Link to="/careers" className="btn-primary px-5 py-2.5">
              Choose career <ArrowRight className="h-4 w-4" />
            </Link>
          }
        />
      </Card>
    );
  }

  const displayPhases = phases.length > 0 ? phases : SAMPLE_ROADMAP;
  const doneCount = displayPhases.filter((p) => roadmapProgress[p.id]).length;
  const progressPct = Math.round((doneCount / displayPhases.length) * 100);

  return (
    <div className="space-y-6 animate-fade-in">
      <SectionHeader
        title="Learning Roadmap"
        subtitle={`A phased plan for ${career.title}, generated from ${gap.missingSkills.length} missing skill${gap.missingSkills.length === 1 ? "" : "s"}. Tick phases as you complete them.`}
        icon={<Map className="h-5 w-5" />}
        action={
          <div className="flex items-center gap-2">
            <Badge tone={source === "backend" ? "green" : "violet"}>
              {source === "backend" ? "GenAI plan" : "Adaptive plan"}
            </Badge>
          </div>
        }
      />

      {/* Progress overview */}
      <Card className="bg-gradient-to-r from-navy-800 to-navy-700 !border-0 text-white">
        <div className="flex flex-wrap items-center justify-between gap-5">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-brand-300">Roadmap progress</p>
            <p className="text-3xl font-extrabold mt-1">
              {doneCount}<span className="text-navy-300 text-xl">/{displayPhases.length}</span> phases
            </p>
            <p className="text-xs text-navy-300 mt-1">
              {loading ? "Generating your adaptive plan…" : `Est. total duration: ${displayPhases.length * 4} weeks at 8h/week`}
            </p>
          </div>
          <div className="flex-1 min-w-[200px] max-w-sm">
            <div className="flex justify-between text-xs font-bold mb-1.5">
              <span className="text-navy-300">Completion</span>
              <span className="text-brand-300">{progressPct}%</span>
            </div>
            <div className="h-2.5 rounded-full bg-white/15 overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-brand-400 to-violet-400 transition-all duration-700"
                style={{ width: `${progressPct}%` }}
              />
            </div>
          </div>
        </div>
      </Card>

      {loading && displayPhases.length === 0 ? (
        <Card>
          <div className="flex flex-col items-center py-14 gap-3">
            <Loader2 className="h-8 w-8 animate-spin text-brand-600" />
            <p className="text-sm font-semibold text-navy-500">Building your learning phases…</p>
          </div>
        </Card>
      ) : (
        <div className="space-y-4">
          {displayPhases.map((phase) => {
            const done = Boolean(roadmapProgress[phase.id]);
            return (
              <Card key={phase.id} className={`transition-all ${done ? "!border-success-200 bg-success-50/30" : ""}`}>
                <div className="flex flex-col sm:flex-row gap-5">
                  {/* Phase number + toggle */}
                  <div className="flex sm:flex-col items-center gap-3 sm:gap-2 sm:w-16 shrink-0">
                    <button
                      onClick={() => {
                        toggleRoadmapItem(phase.id);
                        setToast(done ? `Phase ${phase.phaseNumber} reopened` : `Phase ${phase.phaseNumber} completed 🎉`);
                      }}
                      className="group"
                      aria-label={done ? "Mark incomplete" : "Mark complete"}
                    >
                      {done ? (
                        <CheckCircle2 className="h-9 w-9 text-success-600 transition-transform group-hover:scale-110" />
                      ) : (
                        <Circle className="h-9 w-9 text-navy-200 group-hover:text-brand-500 transition-colors" />
                      )}
                    </button>
                    <span className="text-[11px] font-extrabold uppercase tracking-wider text-navy-400">
                      Phase {phase.phaseNumber}
                    </span>
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2.5">
                      <h3 className="font-bold text-navy-800">{phase.title}</h3>
                      {done && <Badge tone="green">Completed</Badge>}
                      <Badge tone="gray">
                        <Clock className="h-3 w-3" /> {phase.estimatedTime}
                      </Badge>
                    </div>

                    <div className="mt-3.5 grid md:grid-cols-2 gap-5">
                      <div>
                        <p className="text-[11px] font-bold uppercase tracking-wider text-navy-400 mb-2">
                          🎯 Learning objectives
                        </p>
                        <ul className="space-y-1.5">
                          {phase.objectives.map((o) => (
                            <li key={o} className="flex items-start gap-2 text-sm text-navy-600">
                              <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-brand-500 shrink-0" />
                              {o}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <p className="text-[11px] font-bold uppercase tracking-wider text-navy-400 mb-2">
                          <BookOpen className="h-3 w-3 inline mr-1" />
                          Recommended resources
                        </p>
                        <div className="space-y-2">
                          {phase.resources.map((r) => (
                            <a
                              key={r.title}
                              href={r.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center justify-between gap-2 rounded-xl border border-navy-100 bg-white px-3.5 py-2.5 hover:border-brand-300 hover:shadow-card transition group"
                            >
                              <span className="text-xs font-semibold text-navy-600 truncate group-hover:text-brand-700">
                                {r.title}
                              </span>
                              <span className="flex items-center gap-1.5 shrink-0">
                                <span className="rounded-md bg-navy-50 px-1.5 py-0.5 text-[10px] font-bold text-navy-400">
                                  {TYPE_LABEL[r.type] ?? r.type}
                                </span>
                                <ExternalLink className="h-3 w-3 text-navy-300 group-hover:text-brand-600" />
                              </span>
                            </a>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="mt-3.5 flex flex-wrap gap-1.5">
                      {phase.skills.map((s) => (
                        <span key={s} className="rounded-md bg-violet-50 border border-violet-100 px-2 py-0.5 text-[11px] font-bold text-violet-700">
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      <div className="flex justify-end no-print">
        <Link to="/reports" className="btn-primary px-5 py-2.5">
          Add to career report <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );
}
