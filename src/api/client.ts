/**
 * FastAPI integration layer.
 *
 * All backend calls go through this module. When VITE_API_BASE_URL is not
 * configured (or a request fails), each function falls back to the local
 * engine so the app remains fully functional as a frontend demo.
 *
 * Never put API keys here — the Generative AI key lives server-side in FastAPI.
 */

import type {
  AIRecommendation,
  AuthUser,
  Career,
  CareerMatch,
  JobDescriptionAnalysis,
  ReadinessResult,
  ResumeAnalysis,
  RoadmapPhase,
  SkillGapResult,
  UserProfile,
} from "../types";
import { analyzeResumeLocally } from "../lib/extract";
import { computeReadiness, computeSkillGap } from "../lib/gap";
import { rankCareers } from "../lib/matching";
import { analyzeJobDescription, generateRecommendations, generateRoadmap } from "../lib/recommend";

const API_BASE = (import.meta.env.VITE_API_BASE_URL as string | undefined)?.replace(/\/$/, "");

export const backendConfigured = Boolean(API_BASE);

async function apiFetch<T>(path: string, init?: RequestInit, timeoutMs = 15000): Promise<T> {
  if (!API_BASE) throw new Error("backend-not-configured");
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(`${API_BASE}${path}`, {
      ...init,
      signal: controller.signal,
      headers: { "Content-Type": "application/json", ...(init?.headers ?? {}) },
    });
    if (!res.ok) throw new Error(`Backend error ${res.status}`);
    return (await res.json()) as T;
  } finally {
    clearTimeout(timer);
  }
}

/* ------------------------------ Auth ------------------------------ */

export async function apiRegister(payload: {
  fullName: string;
  email: string;
  password: string;
  university: string;
  degree: string;
  graduationYear: string;
}): Promise<AuthUser> {
  try {
    return await apiFetch<AuthUser>("/api/auth/register", { method: "POST", body: JSON.stringify(payload) });
  } catch {
    // Local account store — replaced by FastAPI JWT auth in production.
    return { id: `local-${Date.now()}`, email: payload.email, fullName: payload.fullName };
  }
}

export async function apiLogin(email: string, password: string): Promise<AuthUser> {
  try {
    return await apiFetch<AuthUser>("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
  } catch {
    if (!email.includes("@")) throw new Error("Please enter a valid email address.");
    if (password.length < 6) throw new Error("Password must be at least 6 characters.");
    const name = email.split("@")[0].replace(/[._-]+/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
    return { id: `local-${Date.now()}`, email, fullName: name };
  }
}

export async function apiForgotPassword(email: string): Promise<{ message: string }> {
  try {
    return await apiFetch("/api/auth/forgot-password", { method: "POST", body: JSON.stringify({ email }) });
  } catch {
    return { message: `If an account exists for ${email}, a reset link has been sent.` };
  }
}

/* --------------------------- Resume ------------------------------ */

export async function apiAnalyzeResume(text: string, fileName: string): Promise<ResumeAnalysis> {
  try {
    return await apiFetch<ResumeAnalysis>("/api/resume/analyze", {
      method: "POST",
      body: JSON.stringify({ text, filename: fileName }),
    });
  } catch {
    // Simulate a short NLP pipeline latency for realistic UX
    await new Promise((r) => setTimeout(r, 900));
    return analyzeResumeLocally(text, fileName);
  }
}

/* ----------------------- Skill gap & score ----------------------- */

export async function apiSkillGap(params: {
  career: Career;
  analysis: ResumeAnalysis;
  userProfile?: UserProfile | null;
}): Promise<{ gap: SkillGapResult; readiness: ReadinessResult }> {
  try {
    const res = await apiFetch<{ gap: SkillGapResult; readiness: ReadinessResult }>("/api/analysis/skill-gap", {
      method: "POST",
      body: JSON.stringify({
        career_id: params.career.id,
        skills: params.analysis.extractedSkills.map((s) => s.name),
        profile: params.userProfile,
      }),
    });
    return res;
  } catch {
    const gap = computeSkillGap(params.career, params.analysis, params.userProfile);
    const readiness = computeReadiness(params.career, params.analysis, gap, params.userProfile);
    return { gap, readiness };
  }
}

/* ------------------------ Career matching ------------------------ */

export async function apiMatchCareers(params: {
  analysis: ResumeAnalysis;
  userProfile?: UserProfile | null;
  careers: Career[];
}): Promise<CareerMatch[]> {
  try {
    return await apiFetch<CareerMatch[]>("/api/matching/rank", {
      method: "POST",
      body: JSON.stringify({
        resume_text: params.analysis.rawTextPreview,
        skills: params.analysis.extractedSkills.map((s) => s.name),
        profile: params.userProfile,
      }),
    });
  } catch {
    await new Promise((r) => setTimeout(r, 500));
    return rankCareers(params);
  }
}

/* ---------------------- Generative AI ---------------------------- */

export async function apiRecommendations(params: {
  career: Career;
  gap: SkillGapResult;
  readiness: ReadinessResult;
  analysis: ResumeAnalysis;
  userProfile?: UserProfile | null;
}): Promise<{ recommendations: AIRecommendation[]; source: "backend" | "local" }> {
  try {
    const res = await apiFetch<{ recommendations: AIRecommendation[] }>("/api/recommendations", {
      method: "POST",
      body: JSON.stringify({
        career_id: params.career.id,
        missing_skills: params.gap.missingSkills,
        matched_skills: params.gap.matchedSkills,
        readiness: params.readiness.overall,
        profile: params.userProfile,
      }),
    });
    return { recommendations: res.recommendations, source: "backend" };
  } catch {
    await new Promise((r) => setTimeout(r, 700));
    return { recommendations: generateRecommendations(params), source: "local" };
  }
}

export async function apiRoadmap(params: {
  career: Career;
  gap: SkillGapResult;
  analysis: ResumeAnalysis;
}): Promise<{ phases: RoadmapPhase[]; source: "backend" | "local" }> {
  try {
    const res = await apiFetch<{ phases: RoadmapPhase[] }>("/api/roadmap", {
      method: "POST",
      body: JSON.stringify({
        career_id: params.career.id,
        missing_skills: params.gap.missingSkills,
        existing_skills: params.gap.matchedSkills,
      }),
    });
    return { phases: res.phases, source: "backend" };
  } catch {
    await new Promise((r) => setTimeout(r, 500));
    return { phases: generateRoadmap(params), source: "local" };
  }
}

/* ------------------------ Job description ------------------------ */

export async function apiAnalyzeJobDescription(
  text: string,
  analysis: ResumeAnalysis
): Promise<JobDescriptionAnalysis> {
  try {
    return await apiFetch<JobDescriptionAnalysis>("/api/job/analyze", {
      method: "POST",
      body: JSON.stringify({ description: text, resume_skills: analysis.extractedSkills.map((s) => s.name) }),
    });
  } catch {
    await new Promise((r) => setTimeout(r, 600));
    return analyzeJobDescription(text, analysis);
  }
}
