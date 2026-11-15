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
