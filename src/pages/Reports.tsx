import { FileText, Printer, Download, ArrowRight, Trophy, Target, Sparkles, Layers } from "lucide-react";
import { Card, SectionHeader, Badge, Button, EmptyState, ProgressBar } from "../components/ui";
import { ReadinessGauge } from "../components/charts";
import { useAnalysis } from "../hooks/useAnalysis";
import { useAnalysisStore } from "../store";
import { Link } from "react-router-dom";


function downloadCareerReportPdf(lines: string[], filename: string) {
  const clean = (value: string) => value.normalize("NFKD").replace(/[\u0300-\u036f]/g, "").replace(/[^\x20-\x7E]/g, "?");
  const wrapped = lines.flatMap((value) => {
    const words = clean(value).split(/\s+/);
    const result: string[] = [];
    let line = "";
    words.forEach((word) => {
      if (line && (line + " " + word).length > 88) {
        result.push(line);
        line = word;
      } else {
        line = line ? line + " " + word : word;
      }
    });
    result.push(line);
    return result;
  });
  const pages: string[][] = [];
  for (let i = 0; i < wrapped.length; i += 48) pages.push(wrapped.slice(i, i + 48));
  const objects: string[] = [];
  objects[1] = "<< /Type /Catalog /Pages 2 0 R >>";
  objects[3] = "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>";
  const pageRefs: string[] = [];
  pages.forEach((page, pageIndex) => {
    const pageId = 4 + pageIndex * 2;
    const streamId = pageId + 1;
    pageRefs.push(pageId + " 0 R");
    const commands = ["BT", "/F1 16 Tf", "50 750 Td", "(CareerReady AI - Career Readiness Report) Tj", "/F1 9 Tf"];
    page.forEach((line, index) => {
      commands.push(index === 0 ? "0 -28 Td" : "0 -14 Td");
      commands.push("(" + line.replace(/\\/g, "\\\\").replace(/\(/g, "\\(").replace(/\)/g, "\\)") + ") Tj");
    });
    commands.push("ET", "BT", "/F1 8 Tf", "50 28 Td", "(Page " + (pageIndex + 1) + " of " + pages.length + ") Tj", "ET");
    const stream = commands.join("\n");
    objects[pageId] = "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 3 0 R >> >> /Contents " + streamId + " 0 R >>";
    objects[streamId] = "<< /Length " + new TextEncoder().encode(stream).length + " >>\nstream\n" + stream + "\nendstream";
  });
  objects[2] = "<< /Type /Pages /Kids [" + pageRefs.join(" ") + "] /Count " + pages.length + " >>";
  let pdf = "%PDF-1.4\n";
  const offsets = [0];
  for (let id = 1; id < objects.length; id++) {
    offsets[id] = new TextEncoder().encode(pdf).length;
    pdf += id + " 0 obj\n" + objects[id] + "\nendobj\n";
  }
  const xrefOffset = new TextEncoder().encode(pdf).length;
  pdf += "xref\n0 " + objects.length + "\n0000000000 65535 f \n";
  for (let id = 1; id < objects.length; id++) pdf += String(offsets[id]).padStart(10, "0") + " 00000 n \n";
  pdf += "trailer\n<< /Size " + objects.length + " /Root 1 0 R >>\nstartxref\n" + xrefOffset + "\n%%EOF";
  const url = URL.createObjectURL(new Blob([pdf], { type: "application/pdf" }));
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export default function Reports() {
  const { analysis, career, gap, readiness, matches, profile } = useAnalysis();
  const history = useAnalysisStore((s) => s.history);
  const setToast = useAnalysisStore((s) => s.setToast);

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
                const lines = [
                  "CAREERREADY AI - CAREER READINESS REPORT",
                  "Generated: " + date,
                  "Analysis ID: " + analysis.id,
                  "",
                  "STUDENT INFORMATION",
                  "Name: " + profile.fullName,
                  "Email: " + profile.email,
                  "University: " + profile.university,
                  "Degree: " + profile.degree,
                  "Graduation year: " + profile.graduationYear,
                  "Experience level: " + profile.experienceLevel,
                  "Career interests: " + (profile.careerInterests.join(", ") || "Not specified"),
                  "",
                  "CAREER READINESS",
                  "Target career: " + career.title,
                  "Overall readiness: " + readiness.overall + "%",
                  "Skill coverage: " + gap.coverage + "%",
                  readiness.disclaimer,
                  "",
                  "READINESS SCORE FACTORS",
                  ...readiness.breakdown.map((item) => item.label + ": " + item.score + "% (weight " + Math.round(item.weight * 100) + "%)"),
                  "",
                  "RESUME ANALYSIS",
                  "Resume file: " + analysis.fileName,
                  "Technical skills: " + analysis.technicalSkills.length,
                  "Soft skills: " + analysis.softSkills.length,
                  "Projects: " + analysis.projects.length,
                  "Extracted skills: " + analysis.extractedSkills.map((skill) => skill.name).join(", "),
                  "",
                  "SKILL GAP ANALYSIS",
                  "Matched skills: " + gap.matchedSkills.join(", "),
                  "Missing skills: " + gap.missingSkills.join(", "),
                  "Weak skills: " + gap.weakSkills.map((skill) => skill.name).join(", "),
                  "",
                  "TOP CAREER MATCHES",
                  ...matches.slice(0, 5).map((match, index) => (index + 1) + ". " + match.careerTitle + ": " + match.score + "%"),
                  "",
                  "LEARNING RECOMMENDATIONS",
                  "Priority skill 1: " + (gap.technicalMissing[0] || "Deepen existing skills"),
                  "Priority skill 2: " + (gap.technicalMissing[1] || "Build portfolio projects"),
                  "Practice: 2-3 interview problems weekly and prepare STAR stories.",
                  "Application goal: Apply to " + career.title + " roles after reaching 70% readiness.",
                  "",
                  "ANALYSIS HISTORY",
                  ...(history.length ? history.map((item) => new Date(item.date).toLocaleDateString() + " | " + item.careerTitle + " | Matched: " + item.matched + " | Missing: " + item.missing + " | Readiness: " + item.readiness + "%") : ["No previous analysis history."]),
                  "",
                  "Readiness scores are educational estimates, not hiring probabilities."
                ];
                downloadCareerReportPdf(lines, "CareerReady-AI-Report-" + new Date().toISOString().slice(0, 10) + ".pdf");
                setToast("Your career report PDF has been downloaded.");
              }}
            >
              <Download className="h-4 w-4" /> Export PDF
            </Button>
          </div>
        }
      />

      <div className="space-y-5 rounded-2xl">
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
