// CareerReady AI — shared domain types

export type SkillCategory =
  | "Programming Languages"
  | "Web Development"
  | "Mobile Development"
  | "Database"
  | "Data Science"
  | "Artificial Intelligence"
  | "Cybersecurity"
  | "Cloud Computing"
  | "Development Tools"
  | "Soft Skills";

export const SKILL_CATEGORIES: SkillCategory[] = [
  "Programming Languages",
  "Web Development",
  "Mobile Development",
  "Database",
  "Data Science",
  "Artificial Intelligence",
  "Cybersecurity",
  "Cloud Computing",
  "Development Tools",
  "Soft Skills",
];

export interface Skill {
  name: string;
  category: SkillCategory;
  /** 0–100 evidence strength derived from how often / how well the skill appears */
  confidence: number;
}

export interface ExtractedEducation {
  degree?: string;
  institution?: string;
  year?: string;
  details?: string;
}

export interface ExtractedExperience {
  title?: string;
  organization?: string;
  duration?: string;
  summary?: string;
}

export interface ResumeAnalysis {
  id: string;
  fileName: string;
  analyzedAt: string;
  extractedSkills: Skill[];
  technicalSkills: Skill[];
  softSkills: Skill[];
  education: ExtractedEducation[];
  experiences: ExtractedExperience[];
  projects: string[];
  keywords: string[];
  rawTextPreview: string;
  source: "backend" | "local";
}

export interface Career {
  id: string;
  title: string;
  description: string;
  requiredTechnicalSkills: string[];
  requiredSoftSkills: string[];
  recommendedExperience: string;
  technologies: string[];
  responsibilities: string[];
  salaryRange: string;
  outlook: string;
}

export interface SkillGapResult {
  careerId: string;
  careerTitle: string;
  matchedSkills: string[];
  missingSkills: string[];
  weakSkills: { name: string; reason: string }[];
  technicalMatched: string[];
  technicalMissing: string[];
  softMatched: string[];
  softMissing: string[];
  coverage: number; // 0–100
}

export interface ReadinessBreakdown {
  key: "required" | "technical" | "soft" | "experience" | "projects";
  label: string;
  score: number; // 0–100
  weight: number; // 0–1, sums to 1
  explanation: string;
}

export interface ReadinessResult {
  overall: number; // 0–100
  breakdown: ReadinessBreakdown[];
  disclaimer: string;
}

export interface CareerMatch {
  careerId: string;
  careerTitle: string;
  score: number; // 0–100
  explanation: string;
  sharedSkills: string[];
}

export interface LearningResource {
  title: string;
  url: string;
  type: "course" | "documentation" | "book" | "practice" | "video";
}

export interface RoadmapPhase {
  id: string;
  phaseNumber: number;
  title: string;
  objectives: string[];
  resources: LearningResource[];
  estimatedTime: string;
  skills: string[];
}

export interface AIRecommendation {
  id: string;
  type: "roadmap" | "technology" | "project" | "study_plan" | "interview" | "career_advice";
  title: string;
  body: string;
  priority: "high" | "medium" | "low";
}

export interface JobDescriptionAnalysis {
  id: string;
  title: string;
  requiredSkills: string[];
  technicalSkills: string[];
  softSkills: string[];
  experienceRequirements: string[];
  educationRequirements: string[];
  missingQualifications: string[];
  matchedQualifications: string[];
  recommendations: string[];
  source: "backend" | "local";
}

export interface UserProfile {
  fullName: string;
  email: string;
  university: string;
  degree: string;
  graduationYear: string;
  careerInterests: string[];
  technicalSkills: string[];
  experienceLevel: "beginner" | "intermediate" | "advanced";
  bio?: string;
  avatarColor?: string;
}

export interface AuthUser {
  id: string;
  email: string;
  fullName: string;
}

export interface AnalysisRecord {
  id: string;
  date: string;
  careerTitle: string;
  readiness: number;
  matched: number;
  missing: number;
  fileName: string;
}
