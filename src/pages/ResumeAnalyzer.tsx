import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import EditResumeDetails from "../components/EditResumeDetails";
import {
  UploadCloud,
  FileText,
  CheckCircle2,
  GraduationCap,
  Briefcase,
  FolderKanban,
  Cpu,
  Users,
  Sparkles,
  AlertTriangle,
  BrainCircuit,
} from "lucide-react";
import {
  Card,
  SectionHeader,
  Badge,
  Button,
  EmptyState,
  Spinner,
} from "../components/ui";
import { useAnalysisStore } from "../store";
import { apiAnalyzeResume, apiPredictCareerRole, apiGenerateCareerAdvice } from "../api/client";
import { extractResumeText } from "../lib/extract";
import { SKILL_CATEGORIES } from "../types";
import type { SkillCategory } from "../types";

const CATEGORY_TONE: Record<string, string> = {
  "Programming Languages": "blue",
  "Web Development": "violet",
  "Mobile Development": "blue",
  Database: "green",
  "Data Science": "violet",
  "Artificial Intelligence": "violet",
  Cybersecurity: "red",
  "Cloud Computing": "blue",
  "Development Tools": "gray",
  "Soft Skills": "green",
};

export default function ResumeAnalyzer() {
  const [dragOver, setDragOver] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [phase, setPhase] = useState("");
  const [editing, setEditing] = useState(false);
  const [predicting, setPredicting] = useState(false);
  const [predictionError, setPredictionError] = useState<string | null>(null);
  const [prediction, setPrediction] = useState<Awaited<ReturnType<typeof apiPredictCareerRole>> | null>(null);
  const [generatingAdvice, setGeneratingAdvice] = useState(false);
  const [adviceError, setAdviceError] = useState<string | null>(null);
  const [careerAdvice, setCareerAdvice] = useState<Awaited<ReturnType<typeof apiGenerateCareerAdvice>> | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const { analysis, setAnalysis, setToast } = useAnalysisStore();
  const navigate = useNavigate();

  const runAnalysis = async (text: string, fileName: string) => {
    setEditing(false);
    setBusy(true);
    setError(null);
    setPhase("Extracting text from PDF…");
    try {
      setPhase("Running NLP skill extraction…");
      const result = await apiAnalyzeResume(text, fileName);
      setPhase("Organizing skills into categories…");
      setAnalysis(result);
      setToast(
        `Analysis complete — ${result.extractedSkills.length} skills extracted from ${fileName}`
      );
      setBusy(false);
      setPhase("");
    } catch (e) {
      setBusy(false);
      setPhase("");
      setError(
        e instanceof Error
          ? e.message
          : "Analysis failed. Please try another file."
      );
    }
  };

  const handleFile = async (file: File) => {
    if (busy) return;
    setError(null);

    const isPdf = file.type === "application/pdf" || /\.pdf$/i.test(file.name);

    const isImage =
      ["image/jpeg", "image/png"].includes(file.type) ||
      /\.(jpe?g|png)$/i.test(file.name);

    if (!isPdf && !isImage) {
      setError("Please upload a PDF, JPG, or PNG résumé.");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setError("File too large — maximum size is 10 MB.");
      return;
    }

    setBusy(true);
    setPhase(isPdf ? "Reading PDF…" : "Preparing image…");

    try {
      const text = await extractResumeText(file, isPdf, () => {
        setPhase("Reading résumé with OCR…");
      });
      await runAnalysis(text, file.name);
    } catch (error) {
      setBusy(false);
      setPhase("");
      setError(
        error instanceof Error
          ? error.message
          : "Could not read this résumé. Try a clearer image or PDF."
      );
    }
  };


  const handleCareerPrediction = async () => {
    if (!analysis?.rawTextPreview?.trim() || predicting) return;
    setPredicting(true);
    setPredictionError(null);
    setPrediction(null);
    try {
      const result = await apiPredictCareerRole(analysis.rawTextPreview);
      setPrediction(result);
    } catch (e) {
      setPredictionError(
        e instanceof Error ? e.message : "Career prediction failed. Please try again."
      );
    } finally {
      setPredicting(false);
    }
  };


  const handleGenerateCareerAdvice = async () => {
    if (!analysis?.rawTextPreview?.trim() || !prediction || generatingAdvice) return;
    setGeneratingAdvice(true);
    setAdviceError(null);
    setCareerAdvice(null);
    try {
      const result = await apiGenerateCareerAdvice({
        resumeText: analysis.rawTextPreview,
        predictedCareer: prediction.predictedJobRole,
        existingSkills: analysis.extractedSkills.map((skill) => skill.name),
      });
      setCareerAdvice(result);
    } catch (e) {
      setAdviceError(
        e instanceof Error ? e.message : "Could not generate career advice. Please try again."
      );
    } finally {
      setGeneratingAdvice(false);
    }
  };

  const grouped = SKILL_CATEGORIES.map((cat) => ({
    cat,
    skills: analysis?.extractedSkills.filter((s) => s.category === cat) ?? [],
  })).filter((g) => g.skills.length > 0);

  const softSkills = analysis?.softSkills ?? [];

  return (
    <div className="space-y-6 animate-fade-in">
      <SectionHeader
        title="AI Resume Analyzer"
        subtitle="Upload a PDF resume — NLP extracts technical skills, soft skills, education and experience, organized into 10 skill categories."
        icon={<UploadCloud className="h-5 w-5" />}
        action={
          <Badge tone="violet">
            <Sparkles className="h-3 w-3" /> NLP Engine
          </Badge>
        }
      />

      {/* Upload zone */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          const f = e.dataTransfer.files?.[0];
          if (f) handleFile(f);
        }}
        onClick={() => !busy && inputRef.current?.click()}
        className={`relative rounded-2xl border-2 border-dashed p-8 sm:p-12 text-center cursor-pointer transition-all duration-200 ${
          dragOver
            ? "border-brand-500 bg-brand-50 shadow-glow"
            : "border-navy-200 bg-white hover:border-brand-400 hover:bg-brand-50/40"
        }`}
      >
        <input
          ref={inputRef}
          type="file"
          accept=".pdf,.jpg,.jpeg,.png"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) handleFile(f);
            e.target.value = "";
          }}
        />
        {busy ? (
          <div className="py-4">
            <div className="mx-auto mb-3 flex h-14 w-14 animate-pulseRing items-center justify-center rounded-2xl bg-brand-100 text-brand-600">
              <Cpu className="h-7 w-7 animate-pulse" />
            </div>
            <p className="text-sm font-bold text-navy-700">
              {phase || "Analyzing…"}
            </p>
            <div className="mx-auto mt-3 h-1.5 w-56 overflow-hidden rounded-full bg-navy-100">
              <div className="h-full w-1/2 rounded-full bg-gradient-to-r from-brand-500 to-violet-600 animate-shimmer bg-[length:200px_100%]" />
            </div>
          </div>
        ) : (
          <>
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-500 to-violet-600 text-white shadow-glow">
              <UploadCloud className="h-7 w-7" />
            </div>
            <p className="text-base font-bold text-navy-800">
              Drop your resume PDF here{" "}
              <span className="text-brand-600">or click to browse</span>
            </p>
            <p className="text-sm text-navy-400 mt-1.5">
              PDF only · up to 10 MB · stored securely on the backend
            </p>
            <div className="mt-5 flex flex-wrap justify-center gap-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  runAnalysis(SAMPLE_TEXT, "Sample_Resume.pdf");
                }}
              >
                Try sample resume
              </Button>
            </div>
          </>
        )}
      </div>

      {error && (
        <div className="flex items-start gap-2.5 rounded-xl bg-danger-50 border border-red-100 px-4 py-3 text-sm font-medium text-red-700 animate-fade-in">
          <AlertTriangle className="h-4.5 w-4.5 shrink-0 mt-0.5" /> {error}
        </div>
      )}

      {!analysis && !busy && (
        <Card>
          <EmptyState
            icon={<FileText className="h-6 w-6" />}
            title="No resume analyzed yet"
            description="Upload your PDF or run the sample to see extracted skills, education and experience."
          />
        </Card>
      )}

      {analysis && !busy && editing && (
        <EditResumeDetails
          key={analysis.id}
          analysis={analysis}
          onCancel={() => setEditing(false)}
          onSave={(updated) => {
            setAnalysis(updated);
            setEditing(false);
            setToast("Résumé details updated.");
          }}
        />
      )}

      {analysis && !busy && !editing && (
        <>
          {/* Summary header */}
          <Card className="bg-gradient-to-r from-navy-800 to-navy-700 !border-0 text-white">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/10">
                  <FileText className="h-6 w-6 text-brand-300" />
                </div>
                <div>
                  <p className="font-bold">{analysis.fileName}</p>
                  <p className="text-xs text-navy-300">
                    Analyzed {new Date(analysis.analyzedAt).toLocaleString()} ·{" "}
                    <span
                      className={
                        analysis.source === "backend"
                          ? "text-success-400"
                          : "text-brand-300"
                      }
                    >
                      {analysis.source === "backend"
                        ? "FastAPI NLP engine"
                        : "Local fallback engine"}
                    </span>
                  </p>
                </div>
              </div>
              <div className="flex gap-6 text-center">
                {[
                  [analysis.technicalSkills.length, "Technical"],
                  [analysis.softSkills.length, "Soft"],
                  [analysis.experiences.length, "Experience"],
                  [analysis.projects.length, "Projects"],
                ].map(([n, l]) => (
                  <div key={String(l)}>
                    <p className="text-2xl font-extrabold text-brand-300">
                      {n}
                    </p>
                    <p className="text-[11px] text-navy-300 font-semibold">
                      {l}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </Card>


          {/* ML Career Prediction */}
          <Card>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-start gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-violet-100 text-violet-700">
                  <BrainCircuit className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-bold text-navy-800">ML Career Prediction</h3>
                  <p className="mt-1 text-sm text-navy-500">
                    Predict the top career-role categories using your analyzed resume and our trained machine learning model.
                  </p>
                </div>
              </div>
              <Button onClick={handleCareerPrediction} disabled={predicting || !analysis.rawTextPreview.trim()}>
                {predicting ? "Predicting…" : "Predict My Career Role"}
              </Button>
            </div>
            {predictionError && (
              <p role="alert" className="mt-4 rounded-lg border border-red-100 bg-danger-50 px-3 py-2 text-sm text-red-700">
                {predictionError}
              </p>
            )}
            {prediction && (
              <div className="mt-5 border-t border-navy-100 pt-4">
                <p className="text-xs font-bold uppercase tracking-wide text-navy-400">Predicted career role</p>
                <p className="mt-1 text-xl font-extrabold text-violet-700">{prediction.predictedJobRole}</p>
                <div className="mt-4 space-y-3">
                  {prediction.topPredictions.map((item) => (
                    <div key={item.jobRole}>
                      <div className="mb-1 flex justify-between gap-3 text-sm">
                        <span className="font-semibold text-navy-700">{item.jobRole}</span>
                        <span className="font-bold text-navy-600">{item.probability.toFixed(2)}%</span>
                      </div>
                      <div className="h-2 overflow-hidden rounded-full bg-navy-100">
                        <div className="h-full rounded-full bg-violet-500" style={{ width: `${Math.max(0, Math.min(100, item.probability))}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
                <p className="mt-4 text-xs leading-relaxed text-navy-400">{prediction.disclaimer}</p>
              </div>
            )}
          </Card>


          {/* Generative AI Career Advisor */}
          <Card>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-start gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-100 text-brand-700">
                  <Sparkles className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-bold text-navy-800">Generative AI Career Advisor</h3>
                  <p className="mt-1 text-sm text-navy-500">
                    Get personalized advice based on your resume and predicted career role.
                  </p>
                </div>
              </div>
              <Button onClick={handleGenerateCareerAdvice} disabled={generatingAdvice || !prediction}>
                {generatingAdvice ? "Generating advice…" : "Generate AI Career Advice"}
              </Button>
            </div>
            {!prediction && (
              <p className="mt-3 text-xs text-navy-400">
                First click “Predict My Career Role” above. Your prediction will guide the AI advice.
              </p>
            )}
            {adviceError && (
              <p role="alert" className="mt-4 rounded-lg border border-red-100 bg-danger-50 px-3 py-2 text-sm text-red-700">
                {adviceError}
              </p>
            )}
            {careerAdvice && (
              <div className="mt-5 border-t border-navy-100 pt-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wide text-navy-400">AI career recommendation</p>
                    <p className="mt-1 text-lg font-extrabold text-brand-700">{careerAdvice.predictedCareer}</p>
                  </div>
                  <Badge tone="violet">Generative AI</Badge>
                </div>
                <div className="mt-4 whitespace-pre-wrap text-sm leading-7 text-navy-700">
                  {careerAdvice.advice}
                </div>
                <div className="mt-4">
                  <p className="text-xs font-bold uppercase tracking-wide text-navy-400">Skills found in your resume</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {careerAdvice.existingSkills.map((skill) => (
                      <Badge key={skill} tone="green">{skill}</Badge>
                    ))}
                  </div>
                </div>
                <p className="mt-3 text-xs text-navy-400">Generated with {careerAdvice.model}. AI advice is a guide, not a guaranteed career assessment.</p>
              </div>
            )}
          </Card>

          {/* Skill categories */}
          <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-5">
            {grouped.map((g) => (
              <Card key={g.cat} hover>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-bold text-navy-800 text-sm">{g.cat}</h3>
                  <Badge tone={(CATEGORY_TONE[g.cat] ?? "gray") as "blue"}>
                    {g.skills.length}
                  </Badge>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {g.skills.map((s) => (
                    <span
                      key={s.name}
                      title={
                        s.userEdited
                          ? "Added or edited by you"
                          : `Detection confidence ${s.confidence}%`
                      }
                      className="inline-flex items-center gap-1 rounded-lg bg-navy-50 border border-navy-100 px-2.5 py-1 text-xs font-semibold text-navy-600 hover:border-brand-300 hover:text-brand-700 transition"
                    >
                      {s.name}
                      <span className="text-[9px] font-bold text-navy-300">
                        {s.userEdited ? "Edited" : `${s.confidence}%`}
                      </span>
                    </span>
                  ))}
                </div>
              </Card>
            ))}
          </div>

          {/* Education / Experience / Projects */}
          <div className="grid lg:grid-cols-3 gap-5">
            <Card>
              <SectionHeader
                title="Education"
                icon={<GraduationCap className="h-5 w-5" />}
              />
              {analysis.education.length === 0 ? (
                <p className="text-sm text-navy-400">
                  No education section detected.Review the extracted information
                  or add an education.
                </p>
              ) : (
                <div className="space-y-4">
                  {analysis.education.map((e, i) => (
                    <div key={i} className="border-l-2 border-brand-500 pl-4">
                      <p className="text-sm font-bold text-navy-800">
                        {e.degree ?? "Degree"}
                      </p>
                      <p className="text-xs text-navy-500 mt-0.5">
                        {e.institution}
                      </p>
                      {e.year && (
                        <p className="text-xs font-semibold text-brand-600 mt-1">
                          {e.year}
                        </p>
                      )}
                      {e.details && (
                        <p className="text-xs text-navy-400 mt-1">
                          {e.details}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </Card>

            <Card>
              <SectionHeader
                title="Work experience"
                icon={<Briefcase className="h-5 w-5" />}
              />
              {analysis.experiences.length === 0 ? (
                <p className="text-sm text-navy-400">
                  No experience detected. Review the extracted information or
                  add an experience.
                </p>
              ) : (
                <div className="space-y-4">
                  {analysis.experiences.map((x, i) => (
                    <div key={i} className="border-l-2 border-violet-500 pl-4">
                      <p className="text-sm font-bold text-navy-800">
                        {x.title}
                      </p>
                      <p className="text-xs text-navy-500 mt-0.5">
                        {x.organization}
                        {x.duration && (
                          <span className="text-navy-300"> · {x.duration}</span>
                        )}
                      </p>
                      {x.summary && (
                        <p className="text-xs text-navy-400 mt-1.5 leading-relaxed">
                          {x.summary}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </Card>

            <Card>
              <SectionHeader
                title="Projects"
                icon={<FolderKanban className="h-5 w-5" />}
              />
              {analysis.projects.length === 0 ? (
                <p className="text-sm text-navy-400">
                  No Projects detected. Review the extracted information or add
                  a Project.
                </p>
              ) : (
                <ul className="space-y-2.5">
                  {analysis.projects.map((p, i) => (
                    <li
                      key={i}
                      className="flex items-start gap-2.5 rounded-xl bg-success-50 border border-success-100 px-3.5 py-2.5"
                    >
                      <CheckCircle2 className="h-4 w-4 text-success-600 shrink-0 mt-0.5" />
                      <span className="text-xs font-medium text-navy-600 leading-relaxed">
                        {p}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </Card>
          </div>

          {/* Soft skills */}
          <Card>
            <SectionHeader
              title="Soft skills detected"
              subtitle="Identified from phrasing and context in your resume"
              icon={<Users className="h-5 w-5" />}
            />
            <div className="flex flex-wrap gap-2">
              {softSkills.length === 0 ? (
                <p className="text-sm text-navy-400">
                  No soft skills detected — try adding a Soft Skills section.
                </p>
              ) : (
                softSkills.map((s) => (
                  <span
                    key={s.name}
                    className="rounded-full bg-gradient-to-r from-brand-600 to-violet-600 px-3.5 py-1.5 text-xs font-bold text-white shadow-sm"
                  >
                    {s.name}
                  </span>
                ))
              )}
            </div>
            <div className="mt-5 flex justify-end gap-2.5 no-print">
              <Button variant="secondary" onClick={() => setEditing(true)}>
                Edit extracted details
              </Button>
              <Button variant="secondary" onClick={() => navigate("/careers")}>
                Continue to career selection →
              </Button>
            </div>
          </Card>
        </>
      )}
    </div>
  );
}

const SAMPLE_TEXT = `JOHN DOE
john.doe@university.edu | github.com/johndoe

EDUCATION
Bachelor of Science in Computer Science — Tech University, Graduation 2026

EXPERIENCE
Software Engineering Intern — CloudWorks (Summer 2025)
- Built REST APIs with Python and Flask
- Wrote unit tests with pytest and used Git for version control
- Collaborated with an Agile team and communicated with stakeholders

PROJECTS
- Weatherly: React dashboard with charts and a Node.js backend
- StudyBuddy: Android app built with Flutter and Firebase

TECHNICAL SKILLS
Python, Java, JavaScript, HTML, CSS, React, Node.js, MySQL, MongoDB, Git, Docker, Linux, Testing

SOFT SKILLS
Communication, Teamwork, Problem Solving, Creativity
`;
