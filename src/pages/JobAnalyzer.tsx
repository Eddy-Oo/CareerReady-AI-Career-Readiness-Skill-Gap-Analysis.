import { useState } from "react";
import {
  BriefcaseBusiness,
  ClipboardPaste,
  Sparkles,
  CheckCircle2,
  XCircle,
  GraduationCap,
  CalendarClock,
  ArrowRight,
  Loader2,
  AlertTriangle,
} from "lucide-react";
import { Card, SectionHeader, Badge, Button, Textarea, EmptyState, Toast } from "../components/ui";
import { useAnalysis } from "../hooks/useAnalysis";
import { useAnalysisStore } from "../store";
import { apiAnalyzeJobDescription } from "../api/client";
import { SAMPLE_JOB_DESCRIPTION } from "../data/sample";
import type { JobDescriptionAnalysis } from "../types";
import { Link } from "react-router-dom";

export default function JobAnalyzer() {
  const { analysis } = useAnalysis();
  const setToast = useAnalysisStore((s) => s.setToast);
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<JobDescriptionAnalysis | null>(null);

  const run = async () => {
    if (!analysis) return;
    if (text.trim().length < 40) {
      setError("Paste a fuller job description (at least 40 characters) for accurate extraction.");
      return;
    }
    setError(null);
    setBusy(true);
    try {
      const res = await apiAnalyzeJobDescription(text, analysis);
      setResult(res);
      setToast("Job description analyzed — qualifications compared with your resume.");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Analysis failed.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <SectionHeader
        title="Job Description Analyzer"
        subtitle="Paste a job posting — the NLP engine extracts required skills, experience and education, then highlights what you're missing and how to fix it."
        icon={<BriefcaseBusiness className="h-5 w-5" />}
        action={
          <Badge tone="violet">
            <Sparkles className="h-3 w-3" /> Requirements extraction
          </Badge>
        }
      />

      {!analysis && (
        <div className="rounded-xl bg-warning-50 border border-warning-100 px-4 py-3 text-sm font-medium text-warning-600">
          Analyze your resume first so your skills can be compared against the posting.
        </div>
      )}

      <div className="grid lg:grid-cols-2 gap-5 items-start">
        <Card>
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-bold text-navy-800 text-sm">Job posting</h3>
            <Button variant="ghost" size="sm" onClick={() => setText(SAMPLE_JOB_DESCRIPTION)}>
              <ClipboardPaste className="h-3.5 w-3.5" /> Load sample
            </Button>
          </div>
          <Textarea
            rows={14}
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={"Paste the job title, responsibilities and requirements here…\n\nExample:\nData Scientist — Remote, Full-time\nRequirements:\n- Bachelor's degree in CS or related field\n- 2+ years experience\n- Strong Python and SQL…"}
            className="font-mono text-[13px]"
          />
          {error && (
            <div className="mt-3 flex items-start gap-2 rounded-xl bg-danger-50 border border-red-100 px-3.5 py-2.5 text-xs font-medium text-red-700">
              <AlertTriangle className="h-4 w-4 shrink-0" /> {error}
            </div>
          )}
          <Button className="mt-4 w-full py-3" onClick={run} loading={busy} disabled={!analysis}>
            {busy ? "Extracting requirements…" : "Analyze job description"}
          </Button>
          {!analysis && (
            <Link to="/resume-analyzer" className="mt-3 block text-center text-sm font-bold text-brand-600">
              Go to resume analyzer →
            </Link>
          )}
        </Card>

        <div className="space-y-5">
          {busy && (
            <Card>
              <div className="flex flex-col items-center py-12 gap-3">
                <Loader2 className="h-8 w-8 animate-spin text-violet-600" />
                <p className="text-sm font-semibold text-navy-500">Extracting requirements and comparing skills…</p>
              </div>
            </Card>
          )}

          {!busy && !result && (
            <Card>
              <EmptyState
                icon={<BriefcaseBusiness className="h-6 w-6" />}
                title="No job description analyzed"
                description="Paste a posting and click analyze to see matched vs missing qualifications with improvement tips."
              />
            </Card>
          )}

          {!busy && result && (
            <>
              <Card className="bg-gradient-to-r from-navy-800 to-navy-700 !border-0 text-white animate-fade-in">
                <p className="text-xs font-bold uppercase tracking-widest text-brand-300">Position</p>
                <h3 className="text-lg font-extrabold mt-1">{result.title}</h3>
                <div className="mt-4 grid grid-cols-3 gap-3 text-center">
                  {[
                    [result.matchedQualifications.length, "Matched", "text-success-400"],
                    [result.missingQualifications.length, "Missing", "text-red-400"],
                    [result.requiredSkills.length, "Total skills", "text-brand-300"],
                  ].map(([n, l, cls]) => (
                    <div key={String(l)} className="rounded-xl bg-white/10 py-2.5">
                      <p className={`text-xl font-extrabold ${cls}`}>{n}</p>
                      <p className="text-[11px] text-navy-300 font-semibold">{l}</p>
                    </div>
                  ))}
                </div>
              </Card>

              <div className="grid sm:grid-cols-2 gap-5">
                <Card>
                  <div className="flex items-center gap-2 mb-3">
                    <CheckCircle2 className="h-4.5 w-4.5 text-success-600" />
                    <h3 className="font-bold text-navy-800 text-sm">Matched qualifications</h3>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {result.matchedQualifications.length === 0 && (
                      <p className="text-sm text-navy-400">None matched — focus on the missing list.</p>
                    )}
                    {result.matchedQualifications.map((s) => (
                      <span key={s} className="rounded-lg bg-success-50 border border-success-100 px-2.5 py-1 text-xs font-bold text-success-700">
                        {s}
                      </span>
                    ))}
                  </div>
                </Card>

                <Card>
                  <div className="flex items-center gap-2 mb-3">
                    <XCircle className="h-4.5 w-4.5 text-red-600" />
                    <h3 className="font-bold text-navy-800 text-sm">Missing qualifications</h3>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {result.missingQualifications.length === 0 && (
                      <p className="text-sm font-medium text-success-600">You meet every listed skill 🎉</p>
                    )}
                    {result.missingQualifications.map((s) => (
                      <span key={s} className="rounded-lg bg-danger-50 border border-red-100 px-2.5 py-1 text-xs font-bold text-red-700">
                        {s}
                      </span>
                    ))}
                  </div>
                </Card>
              </div>

              <div className="grid sm:grid-cols-2 gap-5">
                <Card>
                  <div className="flex items-center gap-2 mb-3">
                    <CalendarClock className="h-4.5 w-4.5 text-brand-600" />
                    <h3 className="font-bold text-navy-800 text-sm">Experience requirements</h3>
                  </div>
                  {result.experienceRequirements.length === 0 ? (
                    <p className="text-sm text-navy-400">No explicit experience requirement found.</p>
                  ) : (
                    <ul className="space-y-1.5">
                      {result.experienceRequirements.map((e) => (
                        <li key={e} className="rounded-lg bg-brand-50 border border-brand-100 px-3 py-2 text-xs font-semibold text-brand-700">
                          {e}
                        </li>
                      ))}
                    </ul>
                  )}
                </Card>

                <Card>
                  <div className="flex items-center gap-2 mb-3">
                    <GraduationCap className="h-4.5 w-4.5 text-violet-600" />
                    <h3 className="font-bold text-navy-800 text-sm">Education requirements</h3>
                  </div>
                  {result.educationRequirements.length === 0 ? (
                    <p className="text-sm text-navy-400">No explicit education requirement found.</p>
                  ) : (
                    <ul className="space-y-1.5">
                      {result.educationRequirements.map((e) => (
                        <li key={e} className="rounded-lg bg-violet-50 border border-violet-100 px-3 py-2 text-xs font-semibold text-violet-700">
                          {e}
                        </li>
                      ))}
                    </ul>
                  )}
                </Card>
              </div>

              <Card>
                <SectionHeader title="Personalized improvement recommendations" icon={<Sparkles className="h-5 w-5" />} />
                <ol className="space-y-3">
                  {result.recommendations.map((r, i) => (
                    <li key={i} className="flex items-start gap-3 rounded-xl bg-navy-50 border border-navy-100 px-4 py-3">
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-navy-800 text-white text-[11px] font-extrabold">
                        {i + 1}
                      </span>
                      <p className="text-sm text-navy-600 leading-relaxed">{r}</p>
                    </li>
                  ))}
                </ol>
                <div className="mt-5 flex justify-end no-print">
                  <Link to="/skill-gap" className="btn-primary px-5 py-2.5">
                    Open skill gap analysis <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              </Card>
            </>
          )}
        </div>
      </div>
      <Toast message={null} onClose={() => setToast(null)} />
    </div>
  );
}
