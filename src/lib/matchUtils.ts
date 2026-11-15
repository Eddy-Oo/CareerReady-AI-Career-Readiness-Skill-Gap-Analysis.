import type { Career, ResumeAnalysis, UserProfile } from "../types";

/** Shared helpers between the gap engine and the ML matcher. */

const norm = (s: string) => s.trim().toLowerCase();

const SYNONYMS: Record<string, string> = {
  mysql: "sql",
  postgresql: "sql",
  sqlite: "sql",
  "sql server": "sql",
  js: "javascript",
  "react.js": "react",
  reactjs: "react",
  nodejs: "node.js",
  nextjs: "next.js",
  vuejs: "vue.js",
  sklearn: "scikit-learn",
  tailwind: "tailwind css",
  "amazon web services": "aws",
  gcp: "google cloud",
  "google cloud platform": "google cloud",
  ml: "machine learning",
  "natural language processing": "nlp",
};

const canon = (s: string) => SYNONYMS[norm(s)] ?? norm(s);

const CAREER_ALIAS: Record<string, string[]> = {
  SQL: ["MySQL", "PostgreSQL", "SQLite", "SQL Server"],
  Scripting: ["Bash", "Python"],
  "Cloud Computing": ["AWS", "Azure", "Google Cloud"],
};

export function namesMatch(required: string, have: string): boolean {
  if (canon(required) === canon(have)) return true;
  return (CAREER_ALIAS[required] ?? []).some((e) => canon(e) === canon(have));
}

export function sharedSkillsFor(career: Career, analysis: ResumeAnalysis): string[] {
  const names = analysis.extractedSkills.map((s) => s.name);
  const req = [...career.requiredTechnicalSkills, ...career.requiredSoftSkills];
  return req.filter((r) => names.some((n) => namesMatch(r, n)));
}

export function buildStudentDocument(analysis: ResumeAnalysis, profile?: UserProfile | null): string {
  return [
    analysis.rawTextPreview,
    analysis.extractedSkills.map((s) => s.name).join(" "),
    analysis.experiences.map((e) => `${e.title ?? ""} ${e.organization ?? ""}`).join(" "),
    analysis.projects.join(" "),
    profile?.technicalSkills.join(" ") ?? "",
    profile?.careerInterests.join(" ") ?? "",
    profile?.degree ?? "",
  ].join(" \n ");
}

export function buildCareerDocuments(careers: Career[]) {
  return careers.map((c) => ({
    id: c.id,
    title: c.title,
    text: [
      c.title,
      c.description,
      c.requiredTechnicalSkills.join(" "),
      c.requiredSoftSkills.join(" "),
      c.technologies.join(" "),
      c.responsibilities.join(" "),
      c.recommendedExperience,
    ].join(" \n "),
  }));
}
