import { Link } from "react-router-dom";
import {
  Zap,
  FileSearch,
  GitCompareArrows,
  BarChart3,
  Sparkles,
  Map,
  ArrowRight,
  CheckCircle2,
  BrainCircuit,
  Layers,
  ShieldCheck,
} from "lucide-react";

const FEATURES = [
  {
    icon: FileSearch,
    title: "AI Resume Analyzer",
    desc: "Upload a PDF and our NLP pipeline extracts technical skills, soft skills, education and experience — organized into 10 categories.",
    tone: "bg-brand-50 text-brand-600",
  },
  {
    icon: GitCompareArrows,
    title: "Transparent Skill Gap",
    desc: "See exactly which required skills you match, which are missing, and which need deeper evidence — with a visual comparison.",
    tone: "bg-violet-50 text-violet-600",
  },
  {
    icon: BarChart3,
    title: "ML Career Matching",
    desc: "TF-IDF + cosine similarity and sentence-transformer semantics rank your top 5 career fits with clear explanations.",
    tone: "bg-success-50 text-success-600",
  },
  {
    icon: Sparkles,
    title: "GenAI Recommendations",
    desc: "Personalized learning roadmaps, project ideas, study plans and interview prep generated from your actual gaps.",
    tone: "bg-warning-50 text-warning-600",
  },
  {
    icon: Map,
    title: "Learning Roadmaps",
    desc: "Phase-by-phase plans with objectives, resources, time estimates and progress tracking you can tick off.",
    tone: "bg-brand-50 text-brand-600",
  },
  {
    icon: Layers,
    title: "Career Readiness Score",
    desc: "A five-factor, fully explainable readiness index — never a fake 'probability of getting hired'.",
    tone: "bg-violet-50 text-violet-600",
  },
];

const STEPS = [
  ["Create your student account", "Register with your university details in under a minute."],
  ["Upload your resume (PDF)", "NLP extracts your skills, education and experience automatically."],
  ["Select a target career", "Choose from 12 careers with full requirement breakdowns."],
  ["See your gap & readiness", "Matched vs missing skills, five-factor scoring, ML rankings."],
  ["Follow your AI roadmap", "Track phases, tick off milestones, re-analyze to measure growth."],
];

export default function Landing() {
  return (
    <div className="min-h-screen bg-surface">
      {/* Nav */}
      <header className="sticky top-0 z-40 bg-white/85 backdrop-blur-md border-b border-navy-100 no-print">
        <div className="mx-auto max-w-7xl px-5 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500 to-violet-600">
              <Zap className="h-4.5 w-4.5 text-white" strokeWidth={2.5} />
            </div>
            <span className="font-bold text-navy-800 tracking-tight">CareerReady AI</span>
          </div>
          <nav className="hidden md:flex items-center gap-7 text-sm font-semibold text-navy-500">
            <a href="#features" className="hover:text-brand-600 transition">Features</a>
            <a href="#how" className="hover:text-brand-600 transition">How it works</a>
            <a href="#research" className="hover:text-brand-600 transition">Research</a>
          </nav>
          <div className="flex items-center gap-2.5">
            <Link to="/login" className="btn-ghost px-4 py-2.5">Sign in</Link>
            <Link to="/register" className="btn-primary px-4 py-2.5">
              Get started <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-brand-50/70 via-surface to-surface" />
        <div className="absolute -top-24 right-0 h-80 w-80 rounded-full bg-violet-200/40 blur-3xl" />
        <div className="absolute top-40 -left-20 h-72 w-72 rounded-full bg-brand-200/40 blur-3xl" />
        <div className="relative mx-auto max-w-7xl px-5 pt-16 pb-20 lg:pt-24 lg:pb-28">
          <div className="max-w-3xl animate-fade-in-up">
            <span className="inline-flex items-center gap-2 rounded-full border border-brand-200 bg-white px-3.5 py-1.5 text-xs font-bold text-brand-700 shadow-sm">
              <BrainCircuit className="h-3.5 w-3.5" /> NLP · Machine Learning · Generative AI
            </span>
            <h1 className="mt-5 text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-navy-800 leading-[1.08]">
              Know your career readiness —{" "}
              <span className="bg-gradient-to-r from-brand-600 to-violet-600 bg-clip-text text-transparent">
                skill by skill.
              </span>
            </h1>
            <p className="mt-5 text-lg text-navy-500 leading-relaxed max-w-2xl">
              CareerReady AI parses your resume with NLP, compares your skills against real career
              requirements, scores your readiness transparently, and generates personalized learning
              roadmaps with generative AI.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/register" className="btn-primary px-6 py-3.5 text-[15px] shadow-glow">
                Analyze my resume <ArrowRight className="h-4 w-4" />
              </Link>
              <Link to="/login" className="btn-secondary px-6 py-3.5 text-[15px]">
                Explore live demo
              </Link>
            </div>
            <div className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-sm font-medium text-navy-500">
              {["12 career paths", "10 skill categories", "5-factor scoring", "PDF resume upload"].map((t) => (
                <span key={t} className="inline-flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4 text-success-600" /> {t}
                </span>
              ))}
            </div>
          </div>

          {/* Hero preview card */}
          <div className="mt-14 grid sm:grid-cols-3 gap-4 max-w-4xl">
            {[
              ["Career Readiness", "74%", "Full Stack Developer", "from-brand-500"],
              ["Skills Matched", "7 / 10", "Python · React · SQL · Git", "from-success-500"],
              ["Top Career Match", "91%", "Full Stack Developer", "from-violet-600"],
            ].map(([label, value, sub, grad]) => (
              <div key={label} className="card p-5 hover:shadow-card-hover transition-shadow">
                <p className="text-xs font-bold uppercase tracking-wider text-navy-400">{label}</p>
                <p className={`mt-2 text-3xl font-extrabold bg-gradient-to-r ${grad} bg-clip-text text-transparent`}>
                  {value}
                </p>
                <p className="text-xs text-navy-400 mt-1">{sub}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="mx-auto max-w-7xl px-5 py-16 lg:py-24">
        <div className="text-center max-w-2xl mx-auto">
          <p className="text-xs font-bold uppercase tracking-widest text-brand-600">Capabilities</p>
          <h2 className="mt-2 text-3xl sm:text-4xl font-extrabold tracking-tight text-navy-800">
            Everything a job-seeking student needs
          </h2>
          <p className="mt-3 text-navy-500">
            From raw PDF to a personal, trackable career development plan — powered by a modern AI stack.
          </p>
        </div>
        <div className="mt-12 grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {FEATURES.map((f) => (
            <div key={f.title} className="card p-6 hover:shadow-card-hover hover:-translate-y-0.5 transition-all">
              <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${f.tone}`}>
                <f.icon className="h-5.5 w-5.5" />
              </div>
              <h3 className="mt-4 font-bold text-navy-800">{f.title}</h3>
              <p className="mt-1.5 text-sm text-navy-400 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section id="how" className="bg-navy-800 text-white py-16 lg:py-24 relative overflow-hidden">
        <div className="absolute -top-20 right-1/4 h-72 w-72 rounded-full bg-brand-600/20 blur-3xl" />
        <div className="absolute bottom-0 left-0 h-64 w-64 rounded-full bg-violet-600/20 blur-3xl" />
        <div className="relative mx-auto max-w-7xl px-5">
          <div className="text-center max-w-2xl mx-auto">
            <p className="text-xs font-bold uppercase tracking-widest text-brand-400">How it works</p>
            <h2 className="mt-2 text-3xl sm:text-4xl font-extrabold tracking-tight">Five steps to career readiness</h2>
          </div>
          <ol className="mt-12 grid sm:grid-cols-2 lg:grid-cols-5 gap-5">
            {STEPS.map(([title, desc], i) => (
              <li key={title} className="rounded-2xl bg-white/5 border border-white/10 p-5">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500 to-violet-600 text-sm font-extrabold">
                  {i + 1}
                </span>
                <h3 className="mt-3.5 font-bold text-sm">{title}</h3>
                <p className="mt-1.5 text-xs text-navy-300 leading-relaxed">{desc}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Research contribution */}
      <section id="research" className="mx-auto max-w-7xl px-5 py-16 lg:py-24">
        <div className="card p-8 lg:p-12 bg-gradient-to-br from-white to-brand-50/50">
          <div className="flex flex-col lg:flex-row gap-10 items-start">
            <div className="flex-1">
              <p className="text-xs font-bold uppercase tracking-widest text-violet-600">Research contribution</p>
              <h2 className="mt-2 text-2xl sm:text-3xl font-extrabold tracking-tight text-navy-800">
                Integrating four AI techniques into one readiness system
              </h2>
              <p className="mt-3 text-navy-500 leading-relaxed">
                CareerReady AI combines <strong className="text-navy-700">NLP-based resume skill extraction</strong>,{" "}
                <strong className="text-navy-700">ML-based career matching</strong> (TF-IDF, cosine similarity,
                sentence-transformers), <strong className="text-navy-700">transparent skill-gap analysis</strong> and{" "}
                <strong className="text-navy-700">generative AI recommendations</strong> — with clean architecture so the
                React web app, FastAPI backend, PostgreSQL database and Flutter mobile app integrate progressively.
              </p>
              <ul className="mt-5 space-y-2.5">
                {[
                  "No black-box scores — every factor is explained and weighted",
                  "Offline-capable fallback engine keeps the demo fully functional",
                  "API integration points prepared for FastAPI + PostgreSQL",
                ].map((t) => (
                  <li key={t} className="flex items-start gap-2.5 text-sm font-medium text-navy-600">
                    <ShieldCheck className="h-4.5 w-4.5 text-success-600 shrink-0 mt-0.5" /> {t}
                  </li>
                ))}
              </ul>
            </div>
            <div className="w-full lg:w-[360px] shrink-0 rounded-2xl bg-navy-800 text-navy-200 p-6 font-mono text-[12px] leading-relaxed overflow-x-auto">
              <p className="text-navy-400 text-[11px] mb-2 font-sans font-bold uppercase tracking-wider">System architecture</p>
              <pre className="whitespace-pre">{`┌────────────────┐
│  React + Vite  │  Web app
├────────────────┤
│   FastAPI REST │  Auth · JSON
├────────────────┤
│  NLP / ML Eng  │  spaCy · TF-IDF
│  + GenAI API   │  Sentence-Transf.
├────────────────┤
│  PostgreSQL    │  Users · Results
└────────────────┘
        ▲
┌────────────────┐
│ Flutter Mobile │  (progressive)
└────────────────┘`}</pre>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-7xl px-5 pb-20">
        <div className="rounded-3xl bg-gradient-to-r from-brand-600 via-brand-600 to-violet-600 text-white p-10 lg:p-14 text-center relative overflow-hidden">
          <div className="absolute -top-16 -right-16 h-56 w-56 rounded-full bg-white/10 blur-2xl" />
          <h2 className="relative text-2xl sm:text-3xl font-extrabold tracking-tight">
            Ready to close your skill gap?
          </h2>
          <p className="relative mt-2.5 text-brand-100 max-w-xl mx-auto">
            Create your account, upload a resume and get your first readiness report in under two minutes.
          </p>
          <div className="relative mt-7 flex flex-wrap justify-center gap-3">
            <Link to="/register" className="btn bg-white text-brand-700 hover:bg-brand-50 px-6 py-3.5 text-[15px]">
              Get started free <ArrowRight className="h-4 w-4" />
            </Link>
            <Link to="/login" className="btn border border-white/40 text-white hover:bg-white/10 px-6 py-3.5 text-[15px]">
              Sign in
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-navy-100 bg-white">
        <div className="mx-auto max-w-7xl px-5 py-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-navy-400">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-brand-500 to-violet-600">
              <Zap className="h-4 w-4 text-white" strokeWidth={2.5} />
            </div>
            <span className="font-bold text-navy-700">CareerReady AI</span>
          </div>
          <p>AI-Powered Career Readiness & Skill Gap Analysis System · 2026</p>
        </div>
      </footer>
    </div>
  );
}
