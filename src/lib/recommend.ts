import type {
  AIRecommendation,
  Career,
  JobDescriptionAnalysis,
  ReadinessResult,
  ResumeAnalysis,
  RoadmapPhase,
  SkillGapResult,
  UserProfile,
} from "../types";
import { extractSkillsFromText } from "./extract";
import { namesMatch } from "./matchUtils";

const uuid = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `id-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;

const RESOURCE_HUBS: Record<string, { title: string; url: string }[]> = {
  Python: [
    { title: "Python for Everybody (Coursera)", url: "https://www.coursera.org/specializations/python" },
    { title: "Real Python Tutorials", url: "https://realpython.com/" },
  ],
  SQL: [
    { title: "SQLZoo Interactive Tutorials", url: "https://sqlzoo.net/" },
    { title: "PostgreSQL Tutorial", url: "https://www.postgresqltutorial.com/" },
  ],
  Statistics: [
    { title: "Khan Academy Statistics", url: "https://www.khanacademy.org/math/statistics-probability" },
    { title: "Think Stats (free)", url: "https://greenteapress.com/thinkstats2/html/" },
  ],
  "Machine Learning": [
    { title: "Andrew NG — ML Specialization", url: "https://www.coursera.org/specializations/machine-learning-introduction" },
    { title: "scikit-learn User Guide", url: "https://scikit-learn.org/stable/user_guide.html" },
  ],
  React: [
    { title: "React Official Docs", url: "https://react.dev/learn" },
    { title: "Full Stack Open (free)", url: "https://fullstackopen.com/" },
  ],
  Docker: [
    { title: "Docker Get Started", url: "https://docs.docker.com/get-started/" },
    { title: "Kubernetes Basics", url: "https://kubernetes.io/docs/tutorials/kubernetes-basics/" },
  ],
  AWS: [
    { title: "AWS Skill Builder — Free Tier", url: "https://skillbuilder.aws/" },
    { title: "AWS Well-Architected Labs", url: "https://wellarchitectedlabs.com/" },
  ],
  NLP: [
    { title: "spaCy 101", url: "https://spacy.io/usage/spacy-101" },
    { title: "Hugging Face NLP Course", url: "https://huggingface.co/learn/nlp-course" },
  ],
};

function resourcesFor(skill: string): { title: string; url: string; type: "course" | "documentation" | "practice" | "video" | "book" }[] {
  const hub = RESOURCE_HUBS[skill];
  if (hub) return hub.map((h) => ({ ...h, type: "course" as const }));
  return [
    { title: `${skill} — freeCodeCamp search`, url: "https://www.freecodecamp.org/news/search/?query=" + encodeURIComponent(skill), type: "video" },
    { title: `${skill} — MDN / official docs`, url: "https://developer.mozilla.org/en-US/search?q=" + encodeURIComponent(skill), type: "documentation" },
  ];
}

/**
 * Personalized recommendation generator (local generative fallback).
 * Produces the same output schema as the FastAPI /api/recommendations endpoint
 * which calls the Generative AI API with the full analysis context.
 */
export function generateRecommendations(params: {
  career: Career;
  gap: SkillGapResult;
  readiness: ReadinessResult;
  analysis: ResumeAnalysis;
  profile?: UserProfile | null;
}): AIRecommendation[] {
  const { career, gap, readiness, analysis, profile } = params;
  const missingTech = gap.technicalMissing;
  const topMissing = missingTech.slice(0, 4);
  const expCount = analysis.experiences.length;
  const projCount = analysis.projects.length;
  const name = profile?.fullName?.split(" ")[0] || "You";

  const recs: AIRecommendation[] = [];

  recs.push({
    id: uuid(),
    type: "roadmap",
    title: `A focused roadmap to ${career.title}`,
    body:
      topMissing.length === 0
        ? `Great news — you already cover every required skill for ${career.title}. Focus on deepening evidence: ship one flagship project and quantify your impact so recruiters see mastery, not just exposure.`
        : `Start with ${topMissing.join(", ")}. These are the highest-impact gaps blocking your readiness for ${career.title}. Work through them in order, one per week, and re-run the analysis after each phase to track progress.`,
    priority: "high",
  });

  if (topMissing.length > 0) {
    recs.push({
      id: uuid(),
      type: "technology",
      title: `Learn ${topMissing[0]}${topMissing.length > 1 ? ` and ${topMissing[1]}` : ""} first`,
      body: `Job descriptions for ${career.title} mention ${topMissing.slice(0, 3).join(", ")} far more often than other skills. Prioritizing these two first gives you the fastest readiness gain: they typically unlock 20–30% of the missing coverage on their own.`,
      priority: "high",
    });
  }

  const flagshipIdea =
    missingTech.length > 0
      ? `a project that uses ${missingTech.slice(0, 3).join(", ")}`
      : "an advanced extension of one of your existing projects";
  recs.push({
    id: uuid(),
    type: "project",
    title: "Build a portfolio project that closes the gap",
    body: `Build ${flagshipIdea} end-to-end and deploy it publicly. A deployed project demonstrating ${career.title.toLowerCase()} skills is worth more than three tutorial clones — write a README with the problem, architecture diagram, screenshots and measurable results.`,
    priority: "high",
  });

  const weeklyHours = profile?.experienceLevel === "advanced" ? 6 : profile?.experienceLevel === "intermediate" ? 8 : 10;
  recs.push({
    id: uuid(),
    type: "study_plan",
    title: `${weeklyHours} hours/week study plan`,
    body: `Split your week: 40% theory (courses/reading), 40% hands-on coding on ${flagshipIdea}, 20% review and spaced repetition. Spend Saturday on one medium-difficulty practice problem related to ${career.requiredTechnicalSkills[0] ?? "your core stack"}. Consistency beats intensity — a fixed 90-minute daily slot outperforms occasional 8-hour marathons.`,
    priority: "medium",
  });

  recs.push({
    id: uuid(),
    type: "interview",
    title: `Interview prep for ${career.title}`,
    body: `Expect behavioral questions plus technical rounds on ${career.requiredTechnicalSkills.slice(0, 3).join(", ")}. Practice the STAR method for your ${expCount || "student"} experience${expCount === 1 ? "" : "s"}, prepare a 2-minute walkthrough of your best project, and do 2–3 mock interviews per week. Review ${career.requiredSoftSkills.slice(0, 2).join(" and ")} examples — interviewers score these explicitly.`,
    priority: "medium",
  });

  const readinessNote =
    readiness.overall >= 70
      ? `You're at ${readiness.overall}% readiness — start applying now and tailor your resume to each posting.`
      : readiness.overall >= 45
      ? `You're at ${readiness.overall}% readiness — roughly 2–3 months of focused work should push you past 70% for ${career.title}.`
      : `You're at ${readiness.overall}% readiness — treat the next semester as a build phase: coursework + projects first, applications after you cross 60%.`;

  recs.push({
    id: uuid(),
    type: "career_advice",
    title: `Where you stand for ${career.title}`,
    body: `${readinessNote} ${
      projCount < 2
        ? "Add at least two more projects with measurable outcomes."
        : "Your project base is solid — now emphasize quantified results."
    } ${
      expCount === 0
        ? "Apply for internships or contribute to open source to gain your first experience entry."
        : "Quantify each resume bullet with numbers (users, latency, coverage) to strengthen your experience score."
    }`,
    priority: "low",
  });

  return recs;
}

/**
 * Learning roadmap generator — phases derived from the missing skills,
 * ordered from foundations to applied work. Mirrors the FastAPI
 * /api/roadmap endpoint (which enhances these with the generative model).
 */
export function generateRoadmap(params: {
  career: Career;
  gap: SkillGapResult;
  analysis: ResumeAnalysis;
  useSampleForDemo?: boolean;
}): RoadmapPhase[] {
  const { career, gap, analysis } = params;
  const missing = [...new Set([...gap.technicalMissing, ...gap.softMissing])];

  // If nothing is missing, give an advanced deepening roadmap.
  const targets = missing.length > 0 ? missing.slice(0, 6) : career.requiredTechnicalSkills.slice(0, 5);

  const foundations = targets.filter((t) =>
    ["Python", "JavaScript", "SQL", "Statistics", "Java", "HTML", "CSS"].includes(t)
  );
  const ordered = [...foundations, ...targets.filter((t) => !foundations.includes(t))];

  const phaseTitles: Record<string, string> = {
    Python: "Python Fundamentals",
    JavaScript: "JavaScript & Modern Web",
    SQL: "SQL & Data Modeling",
    Statistics: "Statistics Foundations",
    "Machine Learning": "Machine Learning Core",
    "Data Visualization": "Data Visualization",
    Pandas: "Data Analysis with Pandas",
    React: "React Application Development",
    Docker: "Containerization with Docker",
    AWS: "Cloud Fundamentals on AWS",
    NLP: "Natural Language Processing",
    "Generative AI": "Generative AI & LLM Applications",
    Kubernetes: "Kubernetes Orchestration",
    "CI/CD": "CI/CD Pipelines",
    Terraform: "Infrastructure as Code",
  };

  const phases: RoadmapPhase[] = ordered.map((skill, i) => ({
    id: `phase-${i + 1}-${skill.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`,
    phaseNumber: i + 1,
    title: phaseTitles[skill] ?? `${skill} Essentials`,
    objectives: [
      `Understand the core concepts of ${skill} and when to apply them`,
      `Complete at least one hands-on exercise or tutorial module`,
      `Explain ${skill} basics clearly in an interview setting`,
      `Integrate ${skill} into your portfolio project`,
    ],
    resources: resourcesFor(skill).map((r) => ({ ...r, type: r.type as "course" | "documentation" | "video" })),
    estimatedTime: i < 2 ? "2–3 weeks" : "3–4 weeks",
    skills: [skill],
  }));

  phases.push({
    id: `phase-${phases.length + 1}-portfolio`,
    phaseNumber: phases.length + 1,
    title: "Portfolio Projects & Job Applications",
    objectives: [
      `Ship a capstone project demonstrating ${career.title} skills`,
      "Write a quantified, ATS-friendly resume",
      "Practice 10+ technical interview questions",
      "Apply to 10 roles with tailored cover letters",
    ],
    resources: [
      { title: "GitHub Profile README", url: "https://docs.github.com/en/account-and-profile/setting-up-and-managing-your-github-profile/customizing-your-profile/about-your-profile", type: "documentation" },
      { title: "LeetCode Top Interview 150", url: "https://leetcode.com/studyplan/top-interview-150/", type: "practice" },
    ],
    estimatedTime: "4–6 weeks",
    skills: analysis.extractedSkills.slice(0, 3).map((s) => s.name),
  });

  return phases;
}

const EXP_REQ_RE = /(\d+\+?\s*(?:years?|yrs?)\s*(?:of)?\s*(?:experience|exp)?)/gi;
const EDU_REQ_RE =
  /(bachelor(?:'?s)?|master(?:'?s)?|ph\.?d|b\.?tech|m\.?tech|bca|mca|degree in[^.\n]{0,60}|university degree)/gi;

/** Job description analyzer (local fallback for POST /api/job-analysis). */
export function analyzeJobDescription(text: string, analysis: ResumeAnalysis): JobDescriptionAnalysis {
  const skills = extractSkillsFromText(text);
  const technical = skills.filter((s) => s.category !== "Soft Skills");
  const soft = skills.filter((s) => s.category === "Soft Skills");

  const experience = [...new Set(text.match(EXP_REQ_RE) ?? [])].map((s) => s.trim());
  const education = [...new Set((text.match(EDU_REQ_RE) ?? []).map((s) => s.trim()))];

  const existing = analysis.extractedSkills;
  const matched: string[] = [];
  const missing: string[] = [];
  for (const s of skills) {
    const hit = existing.find((e) => namesMatch(s.name, e.name));
    if (hit) matched.push(s.name);
    else missing.push(s.name);
  }

  const recommendations = [
    missing.length > 0
      ? `Add these missing skills before applying: ${missing.slice(0, 6).join(", ")}. Start with the ones that appear most often in the listing.`
      : "Your resume already covers every skill listed in this job description — emphasize them in your cover letter.",
    experience.length > 0
      ? `The posting asks for ${experience.join(", ")}. If you fall short, quantify internships, freelance work and capstone projects as professional experience.`
      : "No explicit experience requirement found — highlight projects as evidence of applied skill.",
    soft.length > 0
      ? `Soft skills explicitly requested: ${soft.map((s) => s.name).join(", ")}. Mirror this exact wording in your resume's skills section so ATS keyword matching succeeds.`
      : "Include 2–3 soft skills naturally in your experience bullets to pass ATS screening.",
  ];

  return {
    id: uuid(),
    title: text.split("\n").find((l) => l.trim().length > 0)?.slice(0, 80) || "Untitled position",
    requiredSkills: skills.map((s) => s.name),
    technicalSkills: technical.map((s) => s.name),
    softSkills: soft.map((s) => s.name),
    experienceRequirements: experience,
    educationRequirements: education,
    missingQualifications: missing,
    matchedQualifications: matched,
    recommendations,
    source: "local",
  };
}
