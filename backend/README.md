# CareerReady AI Backend

FastAPI backend for the CareerReady AI React frontend.

## Local development

From the repository root:

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

Open:
- API: http://127.0.0.1:8000
- Swagger API docs: http://127.0.0.1:8000/docs
- Health check: http://127.0.0.1:8000/health

When DATABASE_URL is not configured, the backend uses a local SQLite database.

## Render Web Service

- Runtime: Python 3
- Root Directory: backend
- Build Command: pip install -r requirements.txt
- Start Command: uvicorn app.main:app --host 0.0.0.0 --port $PORT

Set these environment variables in Render:
- DATABASE_URL: Neon PostgreSQL connection string
- CORS_ORIGINS: deployed frontend URL, for example https://your-frontend.onrender.com

Use the Neon pooled connection string and keep it private.

## Frontend integration

Set VITE_API_BASE_URL in the frontend Render Static Site environment variables to the backend URL, for example:
https://your-backend.onrender.com

The backend implements the nine routes called by src/api/client.ts:
- POST /api/auth/register
- POST /api/auth/login
- POST /api/auth/forgot-password
- POST /api/resume/analyze
- POST /api/analysis/skill-gap
- POST /api/matching/rank
- POST /api/recommendations
- POST /api/roadmap
- POST /api/job/analyze

## Current implementation notes

- Resume skill extraction is a keyword-based NLP baseline, not a trained language model.
- Career ranking is a transparent skill-overlap baseline, not a trained predictive ML model.
- Recommendations and roadmaps are templates. A Generative AI provider is not connected yet.
- Passwords are hashed, but login does not issue JWT tokens or authenticated sessions.
- Password-reset email delivery is not configured.
- Analysis history is saved without a user ID because the current frontend API does not send an authenticated user token.

This is a development starter, not a production-ready authentication or AI system.
