import { useMemo } from "react";
import { useAnalysisStore, useAuthStore } from "../store";
import { CAREERS, getCareer } from "../data/careers";
import { computeReadiness, computeSkillGap } from "../lib/gap";
import { rankCareers } from "../lib/matching";
import type { CareerMatch, ReadinessResult, SkillGapResult } from "../types";

/** Single source of truth for derived analysis data across pages. */
export function useAnalysis() {
  const analysis = useAnalysisStore((s) => s.analysis);
  const selectedCareerId = useAnalysisStore((s) => s.selectedCareerId);
  const profile = useAuthStore((s) => s.profile);

  const career = getCareer(selectedCareerId);

  const gap = useMemo<SkillGapResult | null>(
    () => (career && analysis ? computeSkillGap(career, analysis, profile) : null),
    [career, analysis, profile]
  );

  const readiness = useMemo<ReadinessResult | null>(
    () => (career && analysis && gap ? computeReadiness(career, analysis, gap, profile) : null),
    [career, analysis, gap, profile]
  );

  const matches = useMemo<CareerMatch[]>(() => {
    if (!analysis) return [];
    return rankCareers({ analysis, profile, careers: CAREERS });
  }, [analysis, profile]);

  return { analysis, career, gap, readiness, matches, profile };
}
