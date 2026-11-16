# CareerReady AI — Career Readiness & Skill Gap Analysis

CareerReady AI helps students understand how well their current skills match a target career. The application includes resume analysis, career selection and matching, skill-gap analysis, readiness scoring, AI-style recommendations, learning roadmaps, job-description analysis, and reports.

## Requirements

- Node.js 20 or newer
- npm

## Run locally

```bash
git clone https://github.com/Eddy-Oo/CareerReady-AI-Career-Readiness-Skill-Gap-Analysis..git
cd CareerReady-AI-Career-Readiness-Skill-Gap-Analysis.
npm install
npm run dev
```

Open the local URL printed by Vite (normally `http://localhost:5173`).

## Production build

```bash
npm run build
npm run preview
```

The production files are generated in `dist/`.

## Optional backend

The frontend can run in local-demo mode without a backend. To connect a compatible FastAPI backend, create a `.env` file in the project root:

```env
VITE_API_BASE_URL=http://localhost:8000
```

Restart the Vite development server after changing environment variables. Do not put private API keys in frontend environment variables. Generative AI provider keys must remain on the backend.

If the backend URL is not configured or a request fails, the current frontend API client uses its local analysis/recommendation functions as a demo fallback.

## Main application areas

- Resume Analyzer
- Career Selection and Career Matching
- Skill Gap Analysis and Career Readiness
- AI Recommendations and Learning Roadmap
- Job Description Analyzer
- Reports, Student Profile, and Settings

## Notes

- Authentication currently has a local-demo fallback when the backend is unavailable. It is not production-grade authentication.
- Resume parsing and career analysis can use the included local engine; backend endpoints are optional for the demo.
- Never commit passwords, API keys, access tokens, or private environment files.

# CareerReady AI — AI-Powered Career Readiness & Skill Gap Analysis System

Senior project web application: students upload a resume (PDF), AI extracts skills, compares them with career requirements, scores readiness transparently, ranks career matches with ML, and generates GenAI learning recommendations.

## Project Status

- **Project Type**: React + TypeScript + Vite full application (frontend for the CareerReady AI platform)
- **Entry Point**: `src/main.tsx` → `src/App.tsx` (React Router)
- **Build**: `npm run build` (Vite 7) — production build verified passing
- **Type check**: `npx tsc -p tsconfig.app.json --noEmit`
- **Styling**: Tailwind CSS 3.4 with custom design tokens (see below)
- **Charts**: Recharts · **State**: Zustand (persisted) · **Icons**: lucide-react · **PDF parsing**: pdfjs-dist

## Design System (locked — do not change)

- Primary Dark Navy `#101828` (sidebar/bg accents), Brand Blue `#2563EB`, Accent Purple `#7C3AED`
- Success Green `#16A34A`, Background `#F8FAFC`, Cards `#FFFFFF`
- Custom Tailwind tokens: `navy`, `brand`, `violet`, `success`, `warning`, `danger`, `surface`
- Components: `.card`, `.btn-*`, `.input`, `.label`, `.badge`, `.skeleton` in `src/index.css`
- Sidebar navigation, rounded-2xl cards, subtle shadows, Inter font

## Architecture

```
src/
├── api/client.ts        # FastAPI integration layer — EVERY backend call goes here.
│                        # Uses VITE_API_BASE_URL; on missing/failing backend it
│                        # falls back to local engines (demo mode, source: "local").
│                        # Endpoints: /api/auth/*, /api/resume/analyze,
│                        # /api/analysis/skill-gap, /api/matching/rank,
│                        # /api/recommendations, /api/roadmap, /api/job/analyze
├── lib/                 # Deterministic engines (mirror planned Python services)
│   ├── extract.ts       # NLP skill extractor (10 categories, 160+ skill aliases),
│   │                    # education/experience/project parsing, extractPdfText()
│   ├── gap.ts           # computeSkillGap (matched/missing/weak) + computeReadiness
│   ├── matching.ts      # ML career matcher: TF-IDF + cosine similarity + skill re-rank
│   ├── matchUtils.ts    # shared normalization/synonym helpers
│   └── recommend.ts     # GenAI recommendation/roadmap generators + job-description analyzer
├── data/
│   ├── skills.ts        # SKILL_DB: skill → category + detection aliases (add skills here)
│   ├── careers.ts       # 12 careers with requirements, technologies, salary, outlook
│   └── sample.ts        # Sample resume text, sample history, roadmap, recommendations
├── store/index.ts       # Zustand: useAuthStore (user/profile) + useAnalysisStore
├── hooks/useAnalysis.ts # Single source of truth for derived gap/readiness/matches
├── components/
│   ├── ui.tsx           # Card, Button, Badge, ProgressBar, Field, Input, EmptyState…
│   └── charts.tsx       # ReadinessGauge, SkillGapChart, CareerMatchChart, TrendChart…
├── layouts/DashboardLayout.tsx  # Sidebar + topbar (responsive, mobile drawer)
└── pages/               # 15 pages: Landing, Login, Register, ForgotPassword,
                         # Dashboard, ResumeAnalyzer, CareerSelection, SkillGap,
                         # CareerMatching, Recommendations, Roadmap, JobAnalyzer,
                         # Reports (print/PDF export), Profile, Settings
```

## Key Behaviors

- **Auth**: any valid email + password (≥6 chars) works in demo mode; zustand/persist keeps session; `/dashboard`+ are route-guarded (`RequireAuth`).
- **Resume upload**: real client-side PDF text extraction (pdf.js) → local NLP engine; "Try sample resume" button for instant demo. Sample analysis is pre-loaded on first visit.
- **Readiness score** = 35% required skills matched + 25% technical coverage + 15% soft skills + 15% experience + 10% projects. Always displayed with explanations + disclaimer ("not a probability of getting hired").
- **Weak skills** = matched skills with thin evidence (low mention frequency) — shown with reasons.
- **Reports**: `window.print()` with `@media print` rules → Save as PDF.
- **Backend switch**: set `VITE_API_BASE_URL` in `.env` to connect FastAPI; no API keys in frontend (GenAI key stays server-side).

## Conventions

- UI copy in English (user's language); code/identifiers English.
- Prefer small reusable components in `src/components/ui.tsx` over one-off markup.
- New backend endpoints: add a typed function in `src/api/client.ts` with local fallback, never fetch() directly from pages.
- Validate with `npm run build` + `npx tsc --noEmit` before completing any task.
