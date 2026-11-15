import type { Career, ReadinessResult, SkillGapResult, CareerMatch, ResumeAnalysis, UserProfile } from "../types";

const norm = (s: string) => s.trim().toLowerCase();

/** Compare skill names case-insensitively; treat a few well-known synonyms as equal. */
const SYNONYMS: Record<string, string> = {
  "mysql": "sql",
  "postgresql": "sql",
  "sqlite": "sql",
  "sql server": "sql",
  "js": "javascript",
  "react.js": "react",
  "reactjs": "react",
  "node.js": "node.js",
  "nodejs": "node.js",
  "nextjs": "next.js",
  "vue.js": "vue.js",
  "vuejs": "vue.js",
  "mongodb": "mongodb",
  "mongo": "mongodb",
  "scikit-learn": "scikit-learn",
  "sklearn": "scikit-learn",
  "tailwind": "tailwind css",
  "aws": "aws",
  "amazon web services": "aws",
  "gcp": "google cloud",
  "google cloud platform": "google cloud",
  "ml": "machine learning",
  "nlp": "nlp",
  "natural language processing": "nlp",
};

const canon = (s: string) => {
  const n = norm(s);
  return SYNONYMS[n] ?? n;
};

/** Map legacy skill aliases in career requirements onto extracted skill names. */
const CAREER_ALIAS: Record<string, string[]> = {
  SQL: ["MySQL", "PostgreSQL", "SQLite", "SQL Server"],
  "Data Structures": ["Data Structures"],
  Scripting: ["Bash", "Python"],
  Figma: ["Figma"],
  Prototyping: ["Prototyping"],
  "User Research": ["User Research"],
  "Design Systems": ["Design Systems"],
  Empathy: ["Empathy"],
  "Cloud Computing": ["AWS", "Azure", "Google Cloud"],
};

function namesMatch(required: string, have: string): boolean {
  if (canon(required) === canon(have)) return true;
  const extras = CAREER_ALIAS[required] ?? [];
  return extras.some((e) => canon(e) === canon(have));
}

export interface SkillPresence {
  /** canonical skill name → number of mentions in the resume */
  counts: Map<string, number>;
  names: string[];
}

export function buildPresence(analysis: ResumeAnalysis, profile?: UserProfile | null): SkillPresence {
  const counts = new Map<string, number>();
  const text = `${analysis.rawTextPreview} ${analysis.keywords.join(" ")}`.toLowerCase();
  for (const s of analysis.extractedSkills) {
    counts.set(norm(s.name), (counts.get(norm(s.name)) ?? 0) + 1);
  }
  // Skills listed on the profile but not detected in the resume still count as existing,
  // though with lower evidence (weight handled in scoring, not here).
  for (const p of profile?.technicalSkills ?? []) {
    const k = norm(p);
    if (!counts.has(k)) counts.set(k, 0.5);
  }
  void text;
  return { counts, names: [...counts.keys()] };
}

/**
 * Core skill-gap analysis: compare existing skills against career requirements.
 * Weak skills = present in the resume but with thin evidence (single passing
 * mention) AND relevant to the target career, or important for the career while
 * the student's evidence for them is shallow.
 */
export function computeSkillGap(
  career: Career,
  analysis: ResumeAnalysis,
  profile?: UserProfile | null
): SkillGapResult {
  const presence = buildPresence(analysis, profile);
  const existingNames = analysis.extractedSkills.map((s) => s.name);
  const existingSet = new Set(existingNames.map(norm));

  const matched: string[] = [];
  const missing: string[] = [];
  for (const req of career.requiredTechnicalSkills) {
    const hit = existingNames.find((e) => namesMatch(req, e)) ?? (existingSet.has(norm(req)) ? req : undefined);
    if (hit) matched.push(req);
    else missing.push(req);
  }

  const softMatched: string[] = [];
  const softMissing: string[] = [];
  for (const req of career.requiredSoftSkills) {
    const hit = existingNames.find((e) => namesMatch(req, e)) ?? (existingSet.has(norm(req)) ? req : undefined);
    if (hit) softMatched.push(req);
    else softMissing.push(req);
  }

  // Weak skills: matched but with low evidence (confidence < 70 → single mention),
  // or mentioned only once in passing among required technical skills.
  const confidenceByName = new Map(analysis.extractedSkills.map((s) => [norm(s.name), s.confidence]));
  const weak: { name: string; reason: string }[] = [];
  for (const req of [...matched, ...softMatched]) {
    const key = norm(req);
    const conf = confidenceByName.get(key);
    const aliasHit = analysis.extractedSkills.find((s) => namesMatch(req, s.name));
    const effective = Math.max(conf ?? 0, aliasHit?.confidence ?? 0);
    if (effective > 0 && effective < 70) {
      weak.push({
        name: req,
        reason: "Listed only once with limited supporting context — deepen with projects or experience.",
      });
    }
  }

  const totalReq = career.requiredTechnicalSkills.length + career.requiredSoftSkills.length;
  const totalMatched = matched.length + softMatched.length;
  const coverage = totalReq === 0 ? 0 : Math.round((totalMatched / totalReq) * 100);

  return {
    careerId: career.id,
    careerTitle: career.title,
    matchedSkills: [...matched, ...softMatched],
    missingSkills: [...missing, ...softMissing],
    weakSkills: weak,
    technicalMatched: matched,
    technicalMissing: missing,
    softMatched,
    softMissing,
    coverage,
  };
}

/**
 * Transparent, explainable career readiness score.
 * Weights: required skills matched 35%, technical coverage 25%,
 * soft skills 15%, relevant experience 15%, relevant projects 10%.
 * This is a readiness index — NOT a probability of getting hired.
 */
export function computeReadiness(
  career: Career,
  analysis: ResumeAnalysis,
  gap: SkillGapResult,
  profile?: UserProfile | null
): ReadinessResult {
  const totalReqTech = career.requiredTechnicalSkills.length || 1;
  const totalReqSoft = career.requiredSoftSkills.length || 1;

  const requiredScore = Math.round(
    ((gap.technicalMatched.length + gap.softMatched.length) /
      (career.requiredTechnicalSkills.length + career.requiredSoftSkills.length || 1)) *
      100
  );
  const technicalScore = Math.round((gap.technicalMatched.length / totalReqTech) * 100);
  const softScore = Math.round((gap.softMatched.length / totalReqSoft) * 100);

  // Experience: count relevant roles; internship/part-time count partially.
  const expRoles = analysis.experiences.length;
  const levelBoost =
    profile?.experienceLevel === "advanced" ? 15 : profile?.experienceLevel === "intermediate" ? 8 : 0;
  const experienceScore = Math.min(100, expRoles * 35 + levelBoost);

  const projCount = analysis.projects.length;
  const projectScore = Math.min(100, projCount * 30);

  const breakdown = [
    {
      key: "required" as const,
      label: "Required Skills Matched",
      score: requiredScore,
      weight: 0.35,
      explanation: `${gap.technicalMatched.length + gap.softMatched.length} of ${
        career.requiredTechnicalSkills.length + career.requiredSoftSkills.length
      } required skills detected on your resume (${gap.technicalMatched.length} technical, ${gap.softMatched.length} soft).`,
    },
    {
      key: "technical" as const,
      label: "Technical Skill Coverage",
      score: technicalScore,
      weight: 0.25,
      explanation: `You cover ${gap.technicalMatched.length} of ${career.requiredTechnicalSkills.length} technical skills required for ${career.title}.`,
    },
    {
      key: "soft" as const,
      label: "Soft Skill Coverage",
      score: softScore,
      weight: 0.15,
      explanation: `Your resume evidences ${gap.softMatched.length} of ${career.requiredSoftSkills.length} soft skills (e.g. ${gap.softMatched.slice(0, 2).join(", ") || "none yet"}).`,
    },
    {
      key: "experience" as const,
      label: "Relevant Experience",
      score: experienceScore,
      weight: 0.15,
      explanation: `${expRoles} experience entr${expRoles === 1 ? "y" : "ies"} detected${
        profile ? ` with "${profile.experienceLevel}" stated experience level` : ""
      }. Internships and part-time roles count toward this component.`,
    },
    {
      key: "projects" as const,
      label: "Relevant Projects",
      score: projectScore,
      weight: 0.1,
      explanation: `${projCount} project${projCount === 1 ? "" : "s"} identified on your resume. More shipped projects raise this component.`,
    },
  ];

  const overall = Math.round(
    breakdown.reduce((sum, b) => sum + b.score * b.weight, 0)
  );

  return {
    overall,
    breakdown,
    disclaimer:
      "This is a readiness index based on resume evidence and career requirements. It is not a probability of getting hired and does not account for interviews, referrals or employer context.",
  };
}

/** Shared-token weighting used by both explanations. */
function sharedSkills(career: Career, analysis: ResumeAnalysis): string[] {
  const names = analysis.extractedSkills.map((s) => s.name);
  const req = [...career.requiredTechnicalSkills, ...career.requiredSoftSkills];
  return req.filter((r) => names.some((n) => namesMatch(r, n)));
}

export interface MatchDocument {
  id: string;
  title: string;
  text: string;
}

/** Build the student document from resume + profile for TF-IDF matching. */
export function buildStudentDocument(analysis: ResumeAnalysis, profile?: UserProfile | null): string {
  const parts = [
    analysis.rawTextPreview,
    analysis.extractedSkills.map((s) => s.name).join(" "),
    analysis.experiences.map((e) => `${e.title ?? ""} ${e.organization ?? ""}`).join(" "),
    analysis.projects.join(" "),
    profile?.technicalSkills.join(" ") ?? "",
    profile?.careerInterests.join(" ") ?? "",
    profile?.degree ?? "",
  ];
  return parts.join(" \n ");
}

export function buildCareerDocuments(careers: Career[]): MatchDocument[] {
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

export { namesMatch };
