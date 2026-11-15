import type { Career, CareerMatch, ResumeAnalysis, UserProfile } from "../types";
import { buildCareerDocuments, buildStudentDocument, namesMatch, sharedSkillsFor } from "./matchUtils";

/**
 * Local ML career-matching engine.
 *
 * Mirrors the FastAPI service (TF-IDF + cosine similarity over career corpus
 * with a sentence-transformer semantic re-rank). Implemented here in
 * TypeScript so the demo works without the Python backend:
 *   1. Tokenize + stopword removal + light stemming
 *   2. TF-IDF weighting over [student, ...careers]
 *   3. Cosine similarity → raw score
 *   4. Skill-overlap bonus blended in (stand-in for semantic re-ranking)
 */

const STOPWORDS = new Set(
  `a an and are as at be by for from has have i in is it its of on or that the to was we with you your our will can should may more other such not but if then than this these those also into over under about after before during while who what when where how all any each other's they them their there here he she his her been being do does did done new using use used work working works job role team teams company companies`.split(
    /\s+/
  )
);

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9+#.\s-]/g, " ")
    .split(/\s+/)
    .map((t) => t.replace(/^[.]+|[.]+$/g, ""))
    .filter((t) => t.length > 1 && !STOPWORDS.has(t));
}

interface TfIdfModel {
  vocab: string[];
  idf: Float64Array;
  docVectors: Float64Array[];
}

function buildTfIdf(texts: string[]): TfIdfModel {
  const docsTokens = texts.map(tokenize);
  const df = new Map<string, number>();
  for (const tokens of docsTokens) {
    const uniq = new Set(tokens);
    for (const t of uniq) df.set(t, (df.get(t) ?? 0) + 1);
  }
  const vocab = [...df.keys()].sort();
  const idf = new Float64Array(vocab.length);
  const index = new Map(vocab.map((v, i) => [v, i]));
  const N = texts.length;
  vocab.forEach((term, i) => {
    idf[i] = Math.log((N + 1) / ((df.get(term) ?? 0) + 1)) + 1;
  });

  const docVectors = docsTokens.map((tokens) => {
    const tf = new Float64Array(vocab.length);
    for (const t of tokens) {
      const i = index.get(t);
      if (i !== undefined) tf[i] += 1;
    }
    // sublinear tf
    for (let i = 0; i < tf.length; i++) {
      if (tf[i] > 0) tf[i] = 1 + Math.log(tf[i]);
      tf[i] *= idf[i];
    }
    // l2 normalize
    let norm = 0;
    for (let i = 0; i < tf.length; i++) norm += tf[i] * tf[i];
    norm = Math.sqrt(norm) || 1;
    for (let i = 0; i < tf.length; i++) tf[i] /= norm;
    return tf;
  });

  return { vocab, idf, docVectors };
}

function cosine(a: Float64Array, b: Float64Array): number {
  let dot = 0;
  const n = Math.min(a.length, b.length);
  for (let i = 0; i < n; i++) dot += a[i] * b[i];
  return dot; // both are l2-normalized
}

export interface MatchInput {
  analysis: ResumeAnalysis;
  profile?: UserProfile | null;
  careers: Career[];
}

export function rankCareers({ analysis, profile, careers }: MatchInput): CareerMatch[] {
  const studentText = buildStudentDocument(analysis, profile);
  const careerDocs = buildCareerDocuments(careers);
  const texts = [studentText, ...careerDocs.map((d) => d.text)];
  const model = buildTfIdf(texts);

  const studentVec = model.docVectors[0];
  const results: CareerMatch[] = [];

  for (let i = 0; i < careerDocs.length; i++) {
    const career = careers[i];
    const sim = cosine(studentVec, model.docVectors[i + 1]);

    // Skill-overlap bonus (0–0.35): stands in for semantic similarity re-rank.
    const shared = sharedSkillsFor(career, analysis);
    const reqTotal =
      career.requiredTechnicalSkills.length + career.requiredSoftSkills.length || 1;
    const skillCoverage = shared.length / reqTotal;

    // Interests bonus
    const interestHit = (profile?.careerInterests ?? []).some(
      (t) => t.toLowerCase() === career.title.toLowerCase()
    );

    const score = Math.min(
      99,
      Math.round((sim * 0.55 + skillCoverage * 0.4 + (interestHit ? 0.05 : 0)) * 100)
    );

    const explanation = buildExplanation(career, shared, skillCoverage, sim, interestHit);

    results.push({
      careerId: career.id,
      careerTitle: career.title,
      score,
      explanation,
      sharedSkills: shared,
    });
  }

  return results.sort((a, b) => b.score - a.score);
}

function buildExplanation(
  career: Career,
  shared: string[],
  skillCoverage: number,
  sim: number,
  interestHit: boolean
): string {
  const parts: string[] = [];
  if (shared.length > 0) {
    parts.push(
      `You already match ${shared.length} required skill${shared.length === 1 ? "" : "s"} (${shared
        .slice(0, 4)
        .join(", ")}${shared.length > 4 ? ", …" : ""}).`
    );
  } else {
    parts.push("Very few of this career's required skills appear on your resume yet.");
  }
  parts.push(
    `Semantic similarity between your resume and this career profile is ${(sim * 100).toFixed(0)}%.`
  );
  if (skillCoverage >= 0.6) parts.push("Strong overall fit based on skill coverage.");
  else if (skillCoverage >= 0.35) parts.push("Moderate fit — a focused learning plan would close the gap.");
  else parts.push("Lower fit right now; consider this a longer-term target.");
  if (interestHit) parts.push("Matches one of your stated career interests.");
  return parts.join(" ");
}

export { namesMatch };
