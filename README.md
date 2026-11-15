# CareerReady AI — Career Readiness & Skill Gap Analysis

CareerReady AI helps students understand how well their current skills match a target career. The application includes resume analysis, career selection and matching, skill-gap analysis, readiness scoring, recommendations, learning roadmaps, job-description analysis, and reports.

## Project structure

- `src/`: React + TypeScript frontend
- `backend/`: FastAPI backend
- `backend/app/`: API routes, database setup, models, and request schemas

## Frontend: run locally

Requirements: Node.js 20 or newer and npm.

```bash
npm install
npm run dev
```

Vite normally starts at http://localhost:5173.

## Backend: run locally

Requirements: Python 3.10 or newer.

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

The API runs at http://127.0.0.1:8000.
- Swagger docs: http://127.0.0.1:8000/docs
- Health check: http://127.0.0.1:8000/health

If `DATABASE_URL` is not set, the backend uses a local SQLite database. For deployment, set it to your Neon PostgreSQL connection string.

## Connect frontend to backend

Create a frontend `.env` file in the repository root:

```env
VITE_API_BASE_URL=http://localhost:8000
```

Restart Vite after changing environment variables. In the deployed frontend service, set `VITE_API_BASE_URL` to the deployed backend URL.

Do not put database passwords or AI provider keys in frontend variables. Keep private credentials in the backend service environment.

## Backend API endpoints

- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/forgot-password`
- `POST /api/resume/analyze`
- `POST /api/analysis/skill-gap`
- `POST /api/matching/rank`
- `POST /api/recommendations`
- `POST /api/roadmap`
- `POST /api/job/analyze`

## Render deployment

Create two separate Render services.

### Backend Web Service

- Root Directory: `backend`
- Build Command: `pip install -r requirements.txt`
- Start Command: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
- Environment variables:
  - `DATABASE_URL`: Neon PostgreSQL connection string
  - `CORS_ORIGINS`: deployed frontend URL

### Frontend Static Site

- Root Directory: leave blank
- Build Command: `npm install && npm run build`
- Publish Directory: `dist`
- Environment variable:
  - `VITE_API_BASE_URL`: deployed backend URL

Add a rewrite rule for React Router: `/*` to `/index.html` with action `Rewrite`.

## Current implementation limitations

- Resume skill extraction is a keyword-based NLP baseline, not a trained language model.
- Career ranking currently uses skill overlap, not a trained predictive ML model.
- Recommendations and roadmaps are template-based; a Generative AI provider has not yet been connected.
- Passwords are hashed, but login does not issue JWT tokens or authenticated sessions.
- Password-reset email delivery is not configured.
- Analysis history is saved without a user association because the frontend does not yet send an authenticated user token.

This backend is a development starter and needs further security, testing, model training, and AI-provider integration before production use.
