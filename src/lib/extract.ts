import type { ResumeAnalysis, Skill, ExtractedEducation, ExtractedExperience } from "../types";
import { SKILL_DB, aliasMatches } from "../data/skills";

const uuid = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `id-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;

/**
 * Rule-based NLP skill extractor (local fallback for the FastAPI/spaCy engine).
 * Detects skills with word-boundary alias matching and scores each hit by
 * how often the skill actually occurs in the text (mention frequency).
 */
export function extractSkillsFromText(text: string): Skill[] {
  const lower = ` ${text.toLowerCase()} `;
  const found: Skill[] = [];
  for (const def of SKILL_DB) {
    let occurrences = 0;
    for (const alias of def.aliases) {
      const a = alias.trim().toLowerCase();
      if (!a) continue;
      if (a.startsWith(" ") || a.endsWith(" ")) {
        if (lower.includes(a)) occurrences += 1;
        continue;
      }
      const escaped = a.replace(/[.*+?^${}()|[\]\\]/g, "\\$&").replace(/\//g, "\\/");
      const re = new RegExp(`(?<![a-z0-9+#])${escaped}(?![a-z0-9+#])`, "gi");
      occurrences += (lower.match(re) ?? []).length;
    }
    if (occurrences > 0) {
      // More mentions → higher confidence (cap 98 for local rules)
      const confidence = Math.min(98, 55 + occurrences * 8);
      found.push({ name: def.name, category: def.category, confidence });
    }
  }
  return found;
}

const DEGREE_RE =
  /(bachelor(?:'s)?|b\.?s\.?c?\.?|b\.?tech|bca|b\.?e\.?|master(?:'s)?|m\.?s\.?c?\.?|m\.?tech|mba|mca|ph\.?d|doctorate|associate(?:'s)?)[^.\n,]{0,80}(?:in|of)?[^.\n,]{0,80}/gi;
const YEAR_RE = /(20\d{2}|graduating\s+in\s+20\d{2})/i;
const INSTITUTION_RE =
  /(?:[A-Z][\w'’.-]*\s+){0,4}(?:university|college|institute|school of|faculty of)[^.\n|]{0,70}/gi;

const EXP_HEADINGS =
  /(experience|employment|work history|internship|professional experience)/i;
const PROJECT_HEADINGS = /(projects|personal projects|academic projects)/i;

export function extractEducation(text: string): ExtractedEducation[] {
  const out: ExtractedEducation[] = [];
  // Scope institution/degree parsing to the education section when present.
  const secMatch = text.match(
    /(education|academic background|academics)\b[\s\S]{0,600}?(?=\n\s*(experience|employment|work history|projects|technical skills|certifications)\b)/i
  );
  const scope = secMatch ? secMatch[0] : text;
  const degrees = scope.match(DEGREE_RE) ?? [];
  const institutions = [
    ...new Set(
      (scope.match(INSTITUTION_RE) ?? [])
        .map((s) => s.replace(/\s+/g, " ").trim().split(/[,·|]/)[0].trim())
        .filter((s) => /^[A-Z]/.test(s) && !s.includes("@") && s.length > 5)
    ),
  ];
  const yearMatch = scope.match(YEAR_RE);
  const uniqueDegrees = [...new Set(degrees.map((d) => d.replace(/\s+/g, " ").trim()))];
  if (uniqueDegrees.length === 0 && institutions.length === 0) return out;
  const count = Math.max(uniqueDegrees.length, Math.min(institutions.length, 2));
  for (let i = 0; i < count; i++) {
    out.push({
      degree: uniqueDegrees[i],
      institution: institutions[i],
      year: i === 0 ? yearMatch?.[0] : undefined,
    });
  }
  return out;
}

export function extractExperiences(text: string): ExtractedExperience[] {
  const out: ExtractedExperience[] = [];
  const lines = text.split(/\n/).map((l) => l.trim());
  const expIdx = lines.findIndex((l) => EXP_HEADINGS.test(l) && l.length < 60);
  const projIdx = lines.findIndex((l) => PROJECT_HEADINGS.test(l) && l.length < 60);
  const start = expIdx >= 0 ? expIdx + 1 : 0;
  const end = projIdx > start ? projIdx : Math.min(lines.length, start + 40);

  const titleRe =
    /(engineer|developer|intern|analyst|assistant|specialist|consultant|researcher|lead|manager|designer|administrator)/i;
  const durationRe = /((?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\.?\s*20\d{2}|20\d{2}\s*[–-]\s*(?:present|20\d{2})|summer\s+20\d{2}|20\d{2})/i;

  for (let i = start; i < end; i++) {
    const line = lines[i];
    if (!line || line.length < 8) continue;
    if (/^(skills|education|certifications|summary)/i.test(line)) break;
    if (titleRe.test(line)) {
      const parts = line.split(/\s+[|–—-]\s+|\s+at\s+/i);
      const duration = line.match(durationRe)?.[0];
      out.push({
        title: parts[0]?.trim().slice(0, 70),
        organization: parts[1]?.replace(/\s*\([^)]*\)\s*/g, " ").trim().slice(0, 60) || undefined,
        duration: duration,
        summary: undefined,
      });
      if (out.length >= 5) break;
    }
  }
  // Attach bullet summaries
  if (out.length > 0) {
    const bullets = lines.filter((l) => /^[-•*]/.test(l)).slice(0, 3);
    if (bullets.length) {
      out[0].summary = bullets.map((b) => b.replace(/^[-•*]\s*/, "")).join(" ");
    }
  }
  return out;
}

export function extractProjects(text: string): string[] {
  const lines = text.split(/\n/).map((l) => l.trim());
  const idx = lines.findIndex((l) => PROJECT_HEADINGS.test(l) && l.length < 60);
  if (idx < 0) return [];
  const projects: string[] = [];
  for (let i = idx + 1; i < lines.length && projects.length < 6; i++) {
    const line = lines[i];
    if (!line) continue;
    if (/^(technical|soft|certifications|skills|education)/i.test(line)) break;
    if (/^[-•*]/.test(line)) {
      const clean = line.replace(/^[-•*]\s*/, "").trim();
      if (clean.length > 12) projects.push(clean.slice(0, 140));
    }
  }
  return projects;
}

/** Build a full local ResumeAnalysis from raw resume text. */
export function analyzeResumeLocally(text: string, fileName: string): ResumeAnalysis {
  const all = extractSkillsFromText(text);
  const technical = all.filter((s) => s.category !== "Soft Skills");
  const soft = all.filter((s) => s.category === "Soft Skills");
  return {
    id: uuid(),
    fileName,
    analyzedAt: new Date().toISOString(),
    extractedSkills: all,
    technicalSkills: technical,
    softSkills: soft,
    education: extractEducation(text),
    experiences: extractExperiences(text),
    projects: extractProjects(text),
    keywords: all.slice(0, 10).map((s) => s.name),
    rawTextPreview: text.slice(0, 800),
    source: "local",
  };
}

/** Extract plain text from a PDF file using pdf.js when available. */
export async function extractPdfText(file: File): Promise<string> {
  const pdfjs = await import("pdfjs-dist");
  const workerSrc = new URL("pdfjs-dist/build/pdf.worker.min.mjs", import.meta.url).href;
  pdfjs.GlobalWorkerOptions.workerSrc = workerSrc;
  const buf = await file.arrayBuffer();
  const doc = await pdfjs.getDocument({ data: buf }).promise;
  const parts: string[] = [];
  const maxPages = Math.min(doc.numPages, 8);
  for (let p = 1; p <= maxPages; p++) {
    const page = await doc.getPage(p);
    const content = await page.getTextContent();
    const pageText = content.items
      .map((it) => ("str" in it ? it.str : ""))
      .join(" ");
    parts.push(pageText);
  }
  await doc.destroy();
  const text = parts.join("\n").replace(/\s+/g, " ").trim();
  if (!text) throw new Error("No selectable text found in this PDF. Please upload a text-based PDF resume.");
  return text;
}
