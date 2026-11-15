import { useState } from "react";
import type { FormEvent } from "react";
import { Button, Card, Input, SectionHeader, Textarea } from "./ui";
import { SKILL_CATEGORIES } from "../types";
import type {
  ExtractedEducation,
  ExtractedExperience,
  ResumeAnalysis,
  Skill,
  SkillCategory,
} from "../types";

const educationFields = [
  ["degree", "Degree"],
  ["institution", "Institution"],
  ["year", "Graduation year"],
  ["details", "Additional details"],
] as const;

const jobFields = [
  ["title", "Job title"],
  ["organization", "Company"],
  ["duration", "Dates"],
] as const;

function updateAt<T extends object>(
  rows: T[],
  index: number,
  change: Partial<T>
) {
  return rows.map((row, i) => (i === index ? { ...row, ...change } : row));
}

export default function EditResumeDetails({
  analysis,
  onSave,
  onCancel,
}: {
  analysis: ResumeAnalysis;
  onSave: (updated: ResumeAnalysis) => void;
  onCancel: () => void;
}) {
  const [skills, setSkills] = useState(
    analysis.extractedSkills.map((skill) => ({ ...skill }))
  );
  const [education, setEducation] = useState<ExtractedEducation[]>(
    analysis.education.map((entry) => ({ ...entry }))
  );
  const [jobs, setJobs] = useState<ExtractedExperience[]>(
    analysis.experiences.map((job) => ({ ...job }))
  );

  function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const uniqueSkills = new Map<string, Skill>();
    for (const skill of skills) {
      const name = skill.name.trim().replace(/\s+/g, " ");
      if (name) uniqueSkills.set(name.toLowerCase(), { ...skill, name });
    }
    const extractedSkills = [...uniqueSkills.values()];

    onSave({
      ...analysis,
      extractedSkills,
      technicalSkills: extractedSkills.filter(
        (s) => s.category !== "Soft Skills"
      ),
      softSkills: extractedSkills.filter((s) => s.category === "Soft Skills"),
      keywords: extractedSkills.map((s) => s.name),
      education: education.filter((entry) =>
        Object.values(entry).some((value) => value?.trim())
      ),
      experiences: jobs.filter((job) =>
        Object.values(job).some((value) => value?.trim())
      ),
    });
  }

  return (
    <Card>
      <SectionHeader
        title="Edit extracted details"
        subtitle="Review your skills, education, and jobs before choosing a career."
      />

      <form onSubmit={save} className="space-y-6">
        <section className="space-y-3">
          <h3 className="font-semibold">Skills</h3>

          {skills.map((skill, index) => (
            <div
              key={index}
              className="grid gap-3 rounded-xl border p-3 sm:grid-cols-3"
            >
              <label>
                Skill name
                <Input
                  value={skill.name}
                  onChange={(e) =>
                    setSkills(
                      updateAt(skills, index, {
                        name: e.target.value,
                        confidence: 100,
                        userEdited: true,
                      })
                    )
                  }
                />
              </label>
              <label>
                Category
                <select
                  className="block w-full rounded-xl border p-2"
                  value={skill.category}
                  onChange={(e) =>
                    setSkills(
                      updateAt(skills, index, {
                        category: e.target.value as SkillCategory,
                        confidence: 100,
                        userEdited: true,
                      })
                    )
                  }
                >
                  {SKILL_CATEGORIES.map((category) => (
                    <option key={category}>{category}</option>
                  ))}
                </select>
              </label>
              <Button
                type="button"
                variant="ghost"
                onClick={() => setSkills(skills.filter((_, i) => i !== index))}
              >
                Remove skill
              </Button>
            </div>
          ))}

          <Button
            type="button"
            variant="secondary"
            onClick={() =>
              setSkills([
                ...skills,
                {
                  name: "",
                  category: "Development Tools",
                  confidence: 100,
                  userEdited: true,
                },
              ])
            }
          >
            Add skill
          </Button>
        </section>

        <section className="space-y-3">
          <h3 className="font-semibold">Education</h3>

          {education.map((entry, index) => (
            <div
              key={index}
              className="grid gap-3 rounded-xl border p-3 sm:grid-cols-2"
            >
              {educationFields.map(([field, label]) => (
                <label key={field}>
                  {label}
                  <Input
                    value={entry[field] ?? ""}
                    onChange={(e) =>
                      setEducation(
                        updateAt(education, index, {
                          [field]: e.target.value,
                        })
                      )
                    }
                  />
                </label>
              ))}
              <Button
                type="button"
                variant="ghost"
                onClick={() =>
                  setEducation(education.filter((_, i) => i !== index))
                }
              >
                Remove education
              </Button>
            </div>
          ))}

          <Button
            type="button"
            variant="secondary"
            onClick={() => setEducation([...education, {}])}
          >
            Add education
          </Button>
        </section>

        <section className="space-y-3">
          <h3 className="font-semibold">Work experience</h3>

          {jobs.map((job, index) => (
            <div
              key={index}
              className="grid gap-3 rounded-xl border p-3 sm:grid-cols-2"
            >
              {jobFields.map(([field, label]) => (
                <label key={field}>
                  {label}
                  <Input
                    value={job[field] ?? ""}
                    onChange={(e) =>
                      setJobs(
                        updateAt(jobs, index, {
                          [field]: e.target.value,
                        })
                      )
                    }
                  />
                </label>
              ))}
              <label className="sm:col-span-2">
                Duties
                <Textarea
                  rows={3}
                  value={job.summary ?? ""}
                  onChange={(e) =>
                    setJobs(
                      updateAt(jobs, index, {
                        summary: e.target.value,
                      })
                    )
                  }
                />
              </label>
              <Button
                type="button"
                variant="ghost"
                onClick={() => setJobs(jobs.filter((_, i) => i !== index))}
              >
                Remove job
              </Button>
            </div>
          ))}

          <Button
            type="button"
            variant="secondary"
            onClick={() => setJobs([...jobs, {}])}
          >
            Add job
          </Button>
        </section>

        <div className="flex justify-end gap-3">
          <Button type="button" variant="secondary" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit">Save changes</Button>
        </div>
      </form>
    </Card>
  );
}
