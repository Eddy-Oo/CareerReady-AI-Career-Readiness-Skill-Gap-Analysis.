import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Target, Search, ArrowRight, CheckCircle2, Cpu, Users, Briefcase, Layers } from "lucide-react";
import { Card, SectionHeader, Badge, Button, Input, EmptyState } from "../components/ui";
import { CAREERS } from "../data/careers";
import { useAnalysisStore } from "../store";
import { useAnalysis } from "../hooks/useAnalysis";

export default function CareerSelection() {
  const [query, setQuery] = useState("");
  const [expanded, setExpanded] = useState<string | null>(null);
  const { selectedCareerId, selectCareer, setToast } = useAnalysisStore();
  const { analysis } = useAnalysis();
  const navigate = useNavigate();

  const filtered = CAREERS.filter(
    (c) =>
      c.title.toLowerCase().includes(query.toLowerCase()) ||
      c.description.toLowerCase().includes(query.toLowerCase()) ||
      c.technologies.some((t) => t.toLowerCase().includes(query.toLowerCase()))
  );

  const choose = (id: string) => {
    selectCareer(id);
    setToast(`Target career set: ${CAREERS.find((c) => c.id === id)?.title}`);
    navigate("/skill-gap");
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <SectionHeader
        title="Career Selection"
        subtitle="Choose your target career. Each path shows required technical skills, soft skills, recommended experience and core technologies."
        icon={<Target className="h-5 w-5" />}
        action={
          <Badge tone="blue">
            <Layers className="h-3 w-3" /> {CAREERS.length} paths
          </Badge>
        }
      />

      {/* Search */}
      <div className="relative max-w-xl">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-navy-300" />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search careers or technologies…"
          className="pl-11"
        />
      </div>

      {!analysis && (
        <div className="rounded-xl bg-warning-50 border border-warning-100 px-4 py-3 text-sm font-medium text-warning-600">
          No resume analyzed yet — you can still browse careers, but analysis pages will use sample data.
        </div>
      )}

      {filtered.length === 0 ? (
        <Card>
          <EmptyState title="No careers match your search" description="Try a different keyword like 'data', 'cloud' or 'React'." />
        </Card>
      ) : (
        <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-5">
          {filtered.map((c) => {
            const isSelected = selectedCareerId === c.id;
            const isOpen = expanded === c.id;
            return (
              <Card
                key={c.id}
                hover
                className={`flex flex-col ${isSelected ? "!border-brand-500 ring-2 ring-brand-100" : ""}`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500 to-violet-600 text-white shadow-sm">
                    <Cpu className="h-5 w-5" />
                  </div>
                  {isSelected && (
                    <Badge tone="green">
                      <CheckCircle2 className="h-3 w-3" /> Selected
                    </Badge>
                  )}
                </div>
                <h3 className="mt-3.5 font-bold text-navy-800">{c.title}</h3>
                <p className="text-xs text-navy-400 mt-1.5 leading-relaxed line-clamp-3">{c.description}</p>

                <div className="mt-3.5 flex flex-wrap gap-1.5">
                  {c.requiredTechnicalSkills.slice(0, 4).map((s) => (
                    <span key={s} className="rounded-md bg-brand-50 border border-brand-100 px-2 py-0.5 text-[11px] font-semibold text-brand-700">
                      {s}
                    </span>
                  ))}
                  {c.requiredTechnicalSkills.length > 4 && (
                    <span className="rounded-md bg-navy-50 px-2 py-0.5 text-[11px] font-semibold text-navy-400">
                      +{c.requiredTechnicalSkills.length - 4}
                    </span>
                  )}
                </div>

                {isOpen && (
                  <div className="mt-4 space-y-3.5 border-t border-navy-100 pt-4 animate-fade-in text-xs">
                    <div>
                      <p className="flex items-center gap-1.5 font-bold text-navy-700 mb-1.5">
                        <Cpu className="h-3.5 w-3.5 text-brand-600" /> Required technical skills
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {c.requiredTechnicalSkills.map((s) => (
                          <span key={s} className="rounded-md bg-navy-50 px-2 py-0.5 font-semibold text-navy-600">{s}</span>
                        ))}
                      </div>
                    </div>
                    <div>
                      <p className="flex items-center gap-1.5 font-bold text-navy-700 mb-1.5">
                        <Users className="h-3.5 w-3.5 text-violet-600" /> Soft skills
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {c.requiredSoftSkills.map((s) => (
                          <span key={s} className="rounded-md bg-violet-50 px-2 py-0.5 font-semibold text-violet-700">{s}</span>
                        ))}
                      </div>
                    </div>
                    <div>
                      <p className="flex items-center gap-1.5 font-bold text-navy-700 mb-1.5">
                        <Briefcase className="h-3.5 w-3.5 text-success-600" /> Experience
                      </p>
                      <p className="text-navy-500 leading-relaxed">{c.recommendedExperience}</p>
                    </div>
                    <div>
                      <p className="font-bold text-navy-700 mb-1.5">Technologies</p>
                      <p className="text-navy-500">{c.technologies.join(" · ")}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="rounded-lg bg-navy-50 px-3 py-2">
                        <p className="text-[10px] font-bold uppercase text-navy-400">Salary range</p>
                        <p className="text-xs font-extrabold text-navy-700 mt-0.5">{c.salaryRange}</p>
                      </div>
                      <div className="rounded-lg bg-navy-50 px-3 py-2">
                        <p className="text-[10px] font-bold uppercase text-navy-400">Outlook</p>
                        <p className="text-[11px] font-bold text-navy-700 mt-0.5 leading-tight">{c.outlook}</p>
                      </div>
                    </div>
                  </div>
                )}

                <div className="mt-auto pt-4 flex gap-2">
                  <Button
                    variant={isSelected ? "secondary" : "primary"}
                    size="sm"
                    className="flex-1"
                    onClick={() => choose(c.id)}
                  >
                    {isSelected ? "Re-analyze gap" : "Select career"} <ArrowRight className="h-3.5 w-3.5" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => setExpanded(isOpen ? null : c.id)}>
                    {isOpen ? "Less" : "Details"}
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
