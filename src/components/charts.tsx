import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  RadialBarChart,
  RadialBar,
  AreaChart,
  Area,
  CartesianGrid,
} from "recharts";
import type { CareerMatch, ReadinessResult, Skill, SkillGapResult } from "../types";

const COLORS = ["#2563EB", "#7C3AED", "#16A34A", "#F59E0B", "#0EA5E9", "#EC4899", "#64748B", "#14B8A6"];

const tooltipStyle = {
  background: "#101828",
  border: "none",
  borderRadius: 12,
  color: "#fff",
  fontSize: 12,
  fontWeight: 600 as const,
  boxShadow: "0 8px 24px rgba(16,24,40,0.25)",
};

/* ----------------------- Readiness gauge ------------------------ */
export function ReadinessGauge({ score, size = 190 }: { score: number; size?: number }) {
  const data = [{ name: "Readiness", value: score, fill: score >= 70 ? "#16A34A" : score >= 45 ? "#2563EB" : "#F59E0B" }];
  return (
    <div style={{ width: size, height: size }} className="relative">
      <ResponsiveContainer width="100%" height="100%">
        <RadialBarChart innerRadius="72%" outerRadius="100%" data={data} startAngle={90} endAngle={-270} barSize={14}>
          <RadialBar dataKey="value" cornerRadius={10} background={{ fill: "#EAECF0" }} />
        </RadialBarChart>
      </ResponsiveContainer>
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
        <span className="text-4xl font-extrabold tracking-tight text-navy-800">{score}%</span>
        <span className="text-[11px] font-semibold uppercase tracking-wider text-navy-400 mt-1">Readiness</span>
      </div>
    </div>
  );
}

/* --------------------- Readiness breakdown ---------------------- */
export function ReadinessBreakdownChart({ result }: { result: ReadinessResult }) {
  const data = result.breakdown.map((b) => ({ name: b.label, score: b.score, weight: Math.round(b.weight * 100) }));
  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={data} layout="vertical" margin={{ top: 4, right: 24, bottom: 4, left: 8 }}>
        <CartesianGrid horizontal={false} stroke="#EAECF0" />
        <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 11, fill: "#98A2B3" }} axisLine={false} tickLine={false} />
        <YAxis
          type="category"
          dataKey="name"
          width={135}
          tick={{ fontSize: 11, fill: "#475467", fontWeight: 600 }}
          axisLine={false}
          tickLine={false}
        />
        <Tooltip contentStyle={tooltipStyle} formatter={(v: number, _n, p) => [`${v}% (weight ${p.payload.weight}%)`, "Score"]} cursor={{ fill: "#F2F4F7" }} />
        <Bar dataKey="score" radius={[0, 8, 8, 0]} barSize={18}>
          {data.map((_, i) => (
            <Cell key={i} fill={COLORS[i % COLORS.length]} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

/* ------------------- Technical skill distribution ---------------- */
export function SkillDistributionChart({ skills }: { skills: Skill[] }) {
  const byCat = new Map<string, number>();
  for (const s of skills) byCat.set(s.category, (byCat.get(s.category) ?? 0) + 1);
  const data = [...byCat.entries()]
    .map(([name, value]) => ({ name: name.replace(" Programming Languages", " Prog."), value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 8);
  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={data} margin={{ top: 8, right: 8, bottom: 40, left: -18 }}>
        <CartesianGrid vertical={false} stroke="#EAECF0" />
        <XAxis dataKey="name" tick={{ fontSize: 10, fill: "#667085" }} angle={-35} textAnchor="end" interval={0} axisLine={false} tickLine={false} height={56} />
        <YAxis tick={{ fontSize: 11, fill: "#98A2B3" }} axisLine={false} tickLine={false} allowDecimals={false} />
        <Tooltip contentStyle={tooltipStyle} cursor={{ fill: "#F2F4F7" }} />
        <Bar dataKey="value" name="Skills" radius={[8, 8, 0, 0]} barSize={26} fill="#7C3AED" />
      </BarChart>
    </ResponsiveContainer>
  );
}

/* ----------------------- Skill gap chart ------------------------- */
export function SkillGapChart({ gap }: { gap: SkillGapResult }) {
  const data = [
    { name: "Matched", value: gap.matchedSkills.length, fill: "#16A34A" },
    { name: "Missing", value: gap.missingSkills.length, fill: "#DC2626" },
    { name: "Weak", value: gap.weakSkills.length, fill: "#F59E0B" },
  ];
  return (
    <div className="flex flex-col sm:flex-row items-center gap-6">
      <div className="w-[200px] h-[200px] shrink-0">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={data} dataKey="value" nameKey="name" innerRadius={55} outerRadius={85} paddingAngle={5} strokeWidth={0}>
              {data.map((d, i) => (
                <Cell key={i} fill={d.fill} />
              ))}
            </Pie>
            <Tooltip contentStyle={tooltipStyle} />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div className="space-y-3 flex-1 w-full">
        {data.map((d) => (
          <div key={d.name} className="flex items-center justify-between rounded-xl border border-navy-100 px-4 py-2.5">
            <span className="flex items-center gap-2 text-sm font-semibold text-navy-600">
              <span className="h-2.5 w-2.5 rounded-full" style={{ background: d.fill }} />
              {d.name}
            </span>
            <span className="text-lg font-extrabold text-navy-800">{d.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* --------------------- Career match bars ------------------------- */
export function CareerMatchChart({ matches }: { matches: CareerMatch[] }) {
  const data = matches.map((m) => ({ name: m.careerTitle, score: m.score }));
  return (
    <ResponsiveContainer width="100%" height={Math.max(220, data.length * 46)}>
      <BarChart data={data} layout="vertical" margin={{ top: 4, right: 36, bottom: 4, left: 8 }}>
        <CartesianGrid horizontal={false} stroke="#EAECF0" />
        <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 11, fill: "#98A2B3" }} axisLine={false} tickLine={false} />
        <YAxis type="category" dataKey="name" width={150} tick={{ fontSize: 11, fill: "#475467", fontWeight: 600 }} axisLine={false} tickLine={false} />
        <Tooltip contentStyle={tooltipStyle} formatter={(v: number) => [`${v}%`, "Match"]} cursor={{ fill: "#F2F4F7" }} />
        <Bar dataKey="score" radius={[0, 8, 8, 0]} barSize={20} fill="#2563EB" />
      </BarChart>
    </ResponsiveContainer>
  );
}

/* --------------------- Existing vs required ---------------------- */
export function ExistingVsRequiredChart({
  existing,
  required,
}: {
  existing: string[];
  required: string[];
}) {
  const union = [...new Set([...required, ...existing])].slice(0, 10);
  const data = union.map((s) => ({
    name: s.length > 12 ? s.slice(0, 11) + "…" : s,
    existing: existing.some((e) => e.toLowerCase() === s.toLowerCase()) ? 1 : 0,
    required: required.some((e) => e.toLowerCase() === s.toLowerCase()) ? 1 : 0,
  }));
  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart data={data} margin={{ top: 8, right: 8, bottom: 48, left: -18 }}>
        <CartesianGrid vertical={false} stroke="#EAECF0" />
        <XAxis dataKey="name" tick={{ fontSize: 10, fill: "#667085" }} angle={-30} textAnchor="end" interval={0} axisLine={false} tickLine={false} height={60} />
        <YAxis tick={{ fontSize: 11, fill: "#98A2B3" }} axisLine={false} tickLine={false} domain={[0, 1]} ticks={[0, 1]} />
        <Tooltip contentStyle={tooltipStyle} formatter={(v: number) => [v ? "Yes" : "No", ""]} cursor={{ fill: "#F2F4F7" }} />
        <Legend wrapperStyle={{ fontSize: 12, fontWeight: 600 }} />
        <Bar dataKey="existing" name="Your skill" fill="#2563EB" radius={[6, 6, 0, 0]} barSize={14} />
        <Bar dataKey="required" name="Required" fill="#7C3AED" radius={[6, 6, 0, 0]} barSize={14} />
      </BarChart>
    </ResponsiveContainer>
  );
}

/* --------------------- Readiness trend --------------------------- */
export function TrendChart({ history }: { history: { date: string; readiness: number; careerTitle: string }[] }) {
  const data = [...history]
    .slice()
    .reverse()
    .map((h) => ({ date: new Date(h.date).toLocaleDateString("en-US", { month: "short", day: "numeric" }), readiness: h.readiness }));
  return (
    <ResponsiveContainer width="100%" height={220}>
      <AreaChart data={data} margin={{ top: 8, right: 12, bottom: 4, left: -20 }}>
        <defs>
          <linearGradient id="trendGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#2563EB" stopOpacity={0.28} />
            <stop offset="100%" stopColor="#2563EB" stopOpacity={0.02} />
          </linearGradient>
        </defs>
        <CartesianGrid vertical={false} stroke="#EAECF0" />
        <XAxis dataKey="date" tick={{ fontSize: 11, fill: "#98A2B3" }} axisLine={false} tickLine={false} />
        <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: "#98A2B3" }} axisLine={false} tickLine={false} />
        <Tooltip contentStyle={tooltipStyle} formatter={(v: number) => [`${v}%`, "Readiness"]} />
        <Area type="monotone" dataKey="readiness" stroke="#2563EB" strokeWidth={2.5} fill="url(#trendGrad)" dot={{ r: 4, fill: "#2563EB" }} />
      </AreaChart>
    </ResponsiveContainer>
  );
}
