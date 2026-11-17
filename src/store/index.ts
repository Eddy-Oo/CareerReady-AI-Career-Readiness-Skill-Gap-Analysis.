import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { AnalysisRecord, AuthUser, UserProfile } from "../types";
import { DEFAULT_PROFILE } from "../data/sample";
import type { ResumeAnalysis } from "../types";
import { apiGetAccountData, apiLogin, apiRegister } from "../api/client";

interface AuthState {
  user: AuthUser | null;
  profile: UserProfile;
  error: string | null;
  loading: boolean;
  register: (data: {
    fullName: string;
    email: string;
    password: string;
    university: string;
    degree: string;
    graduationYear: string;
  }) => Promise<boolean>;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  clearError: () => void;
  updateProfile: (patch: Partial<UserProfile>) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      profile: DEFAULT_PROFILE,
      error: null,
      loading: false,

      register: async (data) => {
        set({ loading: true, error: null });
        try {
          const user = await apiRegister(data);
          useAnalysisStore.getState().resetForUser(user.id);
          set({
            user,
            loading: false,
            profile: {
              ...DEFAULT_PROFILE,
              fullName: data.fullName,
              email: data.email,
              university: data.university,
              degree: data.degree,
              graduationYear: data.graduationYear,
            },
          });
          return true;
        } catch (e) {
          set({ error: e instanceof Error ? e.message : "Registration failed", loading: false });
          return false;
        }
      },

      login: async (email, password) => {
        set({ loading: true, error: null });
        try {
          const user = await apiLogin(email, password);
          const currentOwnerId = useAnalysisStore.getState().ownerUserId;

          // Clear cached dashboard data only when a different account signs in.
          if (currentOwnerId !== user.id) {
            useAnalysisStore.getState().resetForUser(user.id);
          }

          set({
            user,
            loading: false,
            profile: {
              ...DEFAULT_PROFILE,
              email: user.email,
              fullName: user.fullName,
            },
          });

          // Restore this account's latest saved resume and target career from Neon.
          // The account token is persisted above before the authenticated request.
          try {
            const savedData = await apiGetAccountData();
            const analysisStore = useAnalysisStore.getState();
            analysisStore.setAnalysis(savedData.analysis);
            analysisStore.selectCareer(savedData.selectedCareerId);
          } catch (restoreError) {
            console.error("ACCOUNT DATA RESTORE ERROR:", restoreError);
            useAnalysisStore.getState().setToast(
              "Signed in, but saved workspace data could not be loaded. Please refresh and try again."
            );
          }

          return true;
        } catch (e) {
          set({ error: e instanceof Error ? e.message : "Login failed", loading: false });
          return false;
        }
      },

      logout: () => set({ user: null, error: null }),
      clearError: () => set({ error: null }),
      updateProfile: (patch) => set({ profile: { ...get().profile, ...patch } }),
    }),
    { name: "careeready-auth" }
  )
);

interface AnalysisState {
  ownerUserId: string | null;
  analysis: ResumeAnalysis | null;
  selectedCareerId: string | null;
  history: AnalysisRecord[];
  roadmapProgress: Record<string, boolean>;
  toast: string | null;
  setAnalysis: (a: ResumeAnalysis | null) => void;
  selectCareer: (id: string | null) => void;
  addHistory: (rec: AnalysisRecord) => void;
  toggleRoadmapItem: (phaseId: string) => void;
  setToast: (msg: string | null) => void;
  resetForUser: (userId: string) => void;
}

export const useAnalysisStore = create<AnalysisState>()(
  persist(
    (set, get) => ({
      ownerUserId: null,
      analysis: null,
      selectedCareerId: null,
      history: [],
      roadmapProgress: {},
      toast: null,
      setAnalysis: (a) => set({ analysis: a }),
      selectCareer: (id) => set({ selectedCareerId: id }),
      addHistory: (rec) => set({ history: [rec, ...get().history].slice(0, 20) }),
      toggleRoadmapItem: (phaseId) =>
        set({ roadmapProgress: { ...get().roadmapProgress, [phaseId]: !get().roadmapProgress[phaseId] } }),
      setToast: (msg) => set({ toast: msg }),
      resetForUser: (userId) =>
        set({
          ownerUserId: userId,
          analysis: null,
          selectedCareerId: null,
          history: [],
          roadmapProgress: {},
          toast: null,
        }),
    }),
    { name: "careeready-analysis" }
  )
);
