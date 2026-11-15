import type {
  ResumeAnalysis,
  Skill,
  ExtractedEducation,
  ExtractedExperience,
} from "../types";
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
    if (
      def.name === "C" &&
      !/\bC[ \t]+(?:[Pp]rogramming|[Ll]anguage)\b|(?:^|[,;:])[ \t]*C[ \t]*(?=[,;]|$)/m.test(
        text
      )
    ) {
      continue;
    }
    let occurrences = 0;
    for (const alias of def.aliases) {
      const a = alias.trim().toLowerCase();
      if (!a) continue;
      if (a.startsWith(" ") || a.endsWith(" ")) {
        if (lower.includes(a)) occurrences += 1;
        continue;
      }
      const escaped = a
        .replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
        .replace(/\//g, "\\/");
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
  /\b(?:bachelor(?:'s)?|b\.?s\.?c?|b\.?tech|bca|b\.?e|master(?:'s)?|m\.?s\.?c?|m\.?tech|mba|mca|ph\.?d|doctorate|associate(?:'s)?)\b\.?[^.\n,]{0,80}/gi;
const YEAR_RE = /(20\d{2}|graduating\s+in\s+20\d{2})/i;
const INSTITUTION_RE =
  /(?:[A-Z][\w'’.-]*\s+){0,4}(?:university|college|institute|school of|faculty of)[^.\n|]{0,70}/gi;

const EXP_HEADINGS =
  /(experience|employment|work history|internship|professional experience)/i;
const PROJECT_HEADINGS = /(projects|personal projects|academic projects)/i;

export function extractEducation(text: string): ExtractedEducation[] {
  const out: ExtractedEducation[] = [];
  // Scope institution/degree parsing to the education section when present.
  const lines = text.split(/\r?\n/);
  const start = lines.findIndex((line) =>
    /^(education|academic background|academics)\s*:?$/i.test(line.trim())
  );

  const nextHeading =
    /^(?:(?:professional|work|relevant) experience|experience|employment|work history|(?:key |technical |soft )?skills|(?:key )?achievements|projects|certifications|awards|passions|interests|references)\s*:?$/i;

  const end = lines.findIndex(
    (line, index) => index > start && nextHeading.test(line.trim())
  );

  const scope =
    start < 0
      ? text
      : lines.slice(start + 1, end < 0 ? undefined : end).join("\n");
  const degrees = scope.match(DEGREE_RE) ?? [];
  const institutions = [
    ...new Set(
      (scope.match(INSTITUTION_RE) ?? [])
        .map((s) => s.replace(/\s+/g, " ").trim().split(/[,·|]/)[0].trim())
        .filter((s) => /^[A-Z]/.test(s) && !s.includes("@") && s.length > 5)
    ),
  ];
  const yearMatch = scope.match(YEAR_RE);
  const uniqueDegrees = [
    ...new Set(degrees.map((d) => d.replace(/\s+/g, " ").trim())),
  ];
  if (uniqueDegrees.length === 0 && institutions.length === 0) return out;
  const count = Math.max(
    uniqueDegrees.length,
    Math.min(institutions.length, 2)
  );
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
  const lines = text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  const heading =
    /^(?:(?:professional|work|relevant) experience|experience|employment(?: history)?|work history|internships?):?$/i;

  const nextSection =
    /^(?:(?:technical |soft |key )?skills|education|(?:personal |academic )?projects|certifications|(?:key )?achievements|awards|summary|interests|passions):?$/i;

  const bullet = /^(?:[-•*▪◦«©¢\uF0B7]|e(?=\s))\s+/;

  const title =
    /^(?:[\p{L}\p{N}][\p{L}\p{N}+#./&'-]*[ \t]+){0,7}(?:engineer|developer|intern|analyst|assistant|specialist|consultant|researcher|lead|manager|designer|administrator)$/iu;

  const date = String.raw`(?:\d{1,2}/(?:19|20)\d{2}|(?:Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:t(?:ember)?)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?|Summer|Spring|Fall|Winter)\.?\s+(?:19|20)\d{2}|\b(?:19|20)\d{2}\b)`;

  const duration = new RegExp(
    `${date}(?:\\s*(?:[–—-]|\\bto\\b)\\s*(?:${date}|Present|Current))?`,
    "i"
  );

  const first = lines.findIndex((line) => heading.test(line)) + 1;
  const end = lines.findIndex(
    (line, index) => index >= first && nextSection.test(line)
  );
  const section = lines.slice(first, end < 0 ? undefined : end);

  const roles = section.flatMap((line, index) => {
    if (bullet.test(line)) return [];

    const separator = /,\s+|\s+[|–—-]\s+|\s+at\s+/i.exec(line);
    const role = separator ? line.slice(0, separator.index) : line;
    const company = separator
      ? line.slice(separator.index + separator[0].length)
      : undefined;
    const name = role
      .replace(duration, "")
      .replace(/[\s(]+$/, "")
      .trim();

    return title.test(name) ? [{ index, name, company }] : [];
  });

  return roles.slice(0, 5).map((role, index) => {
    const details = section.slice(role.index + 1, roles[index + 1]?.index);
    const firstBullet = details.findIndex((line) => bullet.test(line));
    const header = details.slice(0, firstBullet < 0 ? 5 : firstBullet);
    const metadata = [section[role.index], ...header].join(" ");

    const companyLine = role.company ?? header[0] ?? "";
    const dateIndex = companyLine.search(duration);
    const companyText =
      dateIndex < 0 ? companyLine : companyLine.slice(0, dateIndex);
    const organization = (
      role.company ? companyText : companyText.replace(/,\s*[^,]+$/, "")
    )
      .replace(/[(\s–—-]+$/, "")
      .trim();

    const summary =
      firstBullet < 0
        ? undefined
        : details
            .slice(firstBullet)
            .map((line) => line.replace(bullet, ""))
            .join(" ");

    return {
      title: role.name,
      organization: organization || undefined,
      duration: metadata.match(duration)?.[0],
      summary,
    };
  });
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
export function analyzeResumeLocally(
  text: string,
  fileName: string
): ResumeAnalysis {
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
export async function extractResumeText(
  file: File,
  isPdf: boolean,
  onOcrStart: () => void
): Promise<string> {
  let worker:
    | Awaited<ReturnType<typeof import("tesseract.js").createWorker>>
    | undefined;

  async function readImage(image: File | HTMLCanvasElement) {
    if (!worker) {
      onOcrStart();
      const { createWorker, PSM } = await import("tesseract.js");
      worker = await createWorker("eng");
      await worker.setParameters({ tessedit_pageseg_mode: PSM.AUTO });
    }

    const { data } = await worker.recognize(image);
    return data.text.trim();
  }

  try {
    if (!isPdf) {
      const text = await readImage(file);
      if (!text) throw new Error("No text detected. Try a clearer photo.");
      return text;
    }

    const pdfjs = await import("pdfjs-dist");
    pdfjs.GlobalWorkerOptions.workerSrc = new URL(
      "pdfjs-dist/build/pdf.worker.min.mjs",
      import.meta.url
    ).href;

    const pdf = await pdfjs.getDocument({ data: await file.arrayBuffer() })
      .promise;
    const pages: string[] = [];

    try {
      for (let number = 1; number <= Math.min(pdf.numPages, 8); number++) {
        const page = await pdf.getPage(number);
        const content = await page.getTextContent();
        const text = content.items
          .map((item) =>
            "str" in item ? item.str + (item.hasEOL ? "\n" : " ") : ""
          )
          .join("")
          .trim();

        if (text) {
          pages.push(text);
          continue;
        }

        const viewport = page.getViewport({ scale: 2 });
        const canvas = document.createElement("canvas");
        canvas.width = Math.ceil(viewport.width);
        canvas.height = Math.ceil(viewport.height);
        const context = canvas.getContext("2d");
        if (!context)
          throw new Error("Could not prepare the PDF page for OCR.");

        await page.render({ canvasContext: context, viewport }).promise;
        pages.push(await readImage(canvas));
      }
    } finally {
      await pdf.destroy();
    }

    const text = pages.join("\n").trim();
    if (!text) throw new Error("No text detected. Try a clearer scan.");
    return text;
  } finally {
    await worker?.terminate();
  }
}
