/**
 * FastAPI client. Backend errors are shown to the user instead of silently
 * creating fake accounts or substituting local analysis results.
 */
import type {
  AIRecommendation, AuthUser, Career, CareerMatch, JobDescriptionAnalysis,
  ReadinessResult, ResumeAnalysis, RoadmapPhase, SkillGapResult, UserProfile,
} from "../types";

const API_BASE = (import.meta.env.VITE_API_BASE_URL as string | undefined)?.replace(/\/$/, "");
export const backendConfigured = Boolean(API_BASE);

function getAccessToken(): string | null {
  try {
    const saved = localStorage.getItem("careeready-auth");
    if (!saved) return null;
    const parsed = JSON.parse(saved);
    return parsed?.state?.user?.accessToken ?? null;
  } catch {
    return null;
  }
}

async function apiFetch<T>(path: string, init?: RequestInit, timeoutMs = 20000): Promise<T> {
  if (!API_BASE) throw new Error("Backend is not configured. Please contact the administrator.");
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  const token = getAccessToken();
  try {
    const res = await fetch(`${API_BASE}${path}`, {
      ...init,
      signal: controller.signal,
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(init?.headers ?? {}),
      },
    });
    if (!res.ok) {
      let message = `Backend request failed (${res.status}).`;
      try {
        const body = await res.json();
        if (typeof body.detail === "string") message = body.detail;
      } catch { /* keep the HTTP status message */ }
      throw new Error(message);
    }
    return (await res.json()) as T;
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") throw new Error("The backend request timed out. Please try again.");
    throw error;
  } finally {
    clearTimeout(timer);
  }
}

export async function apiRegister(payload: {
  fullName: string; email: string; password: string; university: string; degree: string; graduationYear: string;
}): Promise<AuthUser> {
  return apiFetch<AuthUser>("/api/auth/register", { method: "POST", body: JSON.stringify(payload) });
}

export async function apiLogin(email: string, password: string): Promise<AuthUser> {
  return apiFetch<AuthUser>("/api/auth/login", { method: "POST", body: JSON.stringify({ email, password }) });
}

export async function apiForgotPassword(email: string): Promise<{ message: string }> {
  return apiFetch("/api/auth/forgot-password", { method: "POST", body: JSON.stringify({ email }) });
}

export async function apiAnalyzeResume(text: string, fileName: string): Promise<ResumeAnalysis> {
  return apiFetch<ResumeAnalysis>("/api/resume/analyze", { method: "POST", body: JSON.stringify({ text, filename: fileName }) });
}

export async function apiSkillGap(params: { career: Career; analysis: ResumeAnalysis; userProfile?: UserProfile | null }): Promise<{ gap: SkillGapResult; readiness: ReadinessResult }> {
  return apiFetch("/api/analysis/skill-gap", { method: "POST", body: JSON.stringify({
    career_id: params.career.id, skills: params.analysis.extractedSkills.map(s => s.name), profile: params.userProfile,
  }) });
}

export async function apiMatchCareers(params: { analysis: ResumeAnalysis; userProfile?: UserProfile | null; careers: Career[] }): Promise<CareerMatch[]> {
  return apiFetch("/api/matching/rank", { method: "POST", body: JSON.stringify({
    resume_text: params.analysis.rawTextPreview, skills: params.analysis.extractedSkills.map(s => s.name), profile: params.userProfile,
  }) });
}

export async function apiRecommendations(params: { career: Career; gap: SkillGapResult; readiness: ReadinessResult; analysis: ResumeAnalysis; userProfile?: UserProfile | null }): Promise<{ recommendations: AIRecommendation[]; source: "backend" | "local" }> {
  const res = await apiFetch<{ recommendations: AIRecommendation[] }>("/api/recommendations", { method: "POST", body: JSON.stringify({
    career_id: params.career.id, missing_skills: params.gap.missingSkills, matched_skills: params.gap.matchedSkills,
    readiness: params.readiness.overall, profile: params.userProfile,
  }) });
  return { recommendations: res.recommendations, source: "backend" };
}

export async function apiRoadmap(params: { career: Career; gap: SkillGapResult; analysis: ResumeAnalysis }): Promise<{ phases: RoadmapPhase[]; source: "backend" | "local" }> {
  const res = await apiFetch<{ phases: RoadmapPhase[] }>("/api/roadmap", { method: "POST", body: JSON.stringify({
    career_id: params.career.id, missing_skills: params.gap.missingSkills, existing_skills: params.gap.matchedSkills,
  }) });
  return { phases: res.phases, source: "backend" };
}

export async function apiAnalyzeJobDescription(text: string, analysis: ResumeAnalysis): Promise<JobDescriptionAnalysis> {
  return apiFetch<JobDescriptionAnalysis>("/api/job/analyze", { method: "POST", body: JSON.stringify({
    description: text, resume_skills: analysis.extractedSkills.map(s => s.name),
  }) });
}
