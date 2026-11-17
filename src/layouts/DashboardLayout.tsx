import { useEffect, useState } from "react";
import { NavLink, Outlet, useNavigate, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  FileSearch,
  Target,
  GitCompareArrows,
  BarChart3,
  Sparkles,
  Map,
  BriefcaseBusiness,
  FileText,
  User,
  Settings,
  LogOut,
  Menu,
  X,
  Zap,
} from "lucide-react";
import { useAuthStore, useAnalysisStore } from "../store";
import { Toast } from "../components/ui";
import { getCareer } from "../data/careers";

const NAV = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/resume-analyzer", label: "Resume Analyzer", icon: FileSearch },
  { to: "/careers", label: "Career Selection", icon: Target },
  { to: "/skill-gap", label: "Skill Gap Analysis", icon: GitCompareArrows },
  { to: "/career-matching", label: "Career Matching", icon: BarChart3 },
  { to: "/recommendations", label: "AI Recommendations", icon: Sparkles },
  { to: "/roadmap", label: "Learning Roadmap", icon: Map },
  { to: "/job-analyzer", label: "Job Description", icon: BriefcaseBusiness },
  { to: "/reports", label: "Career Report", icon: FileText },
];

const NAV_SECONDARY = [
  { to: "/profile", label: "Student Profile", icon: User },
  { to: "/settings", label: "Settings", icon: Settings },
];

export default function DashboardLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { user, profile, logout } = useAuthStore();
  const { toast, setToast, selectedCareerId } = useAnalysisStore();
  const career = getCareer(selectedCareerId);

  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 3500);
    return () => clearTimeout(t);
  }, [toast, setToast]);

  const initials = profile.fullName
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const sidebar = (
    <div className="flex h-full flex-col bg-navy-800 text-white">
      {/* Brand */}
      <div className="px-5 pt-6 pb-5 flex items-center gap-3 border-b border-white/5">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500 to-violet-600 shadow-glow">
          <Zap className="h-5 w-5 text-white" strokeWidth={2.5} />
        </div>
        <div className="leading-tight">
          <p className="font-bold text-[15px] tracking-tight">CareerReady AI</p>
          <p className="text-[11px] text-navy-300">Skill Gap Intelligence</p>
        </div>
      </div>

      {/* Target career chip */}
      {career && (
        <div className="mx-4 mt-4 rounded-xl bg-white/5 border border-white/10 px-3.5 py-2.5">
          <p className="text-[10px] uppercase tracking-wider text-brand-300 font-bold">Target career</p>
          <p className="text-sm font-semibold text-white mt-0.5 truncate">{career.title}</p>
        </div>
      )}

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto thin-scroll px-3 py-4 space-y-1">
        {NAV.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-all duration-150 ${
                isActive
                  ? "bg-gradient-to-r from-brand-600 to-brand-500 text-white shadow-[0_4px_12px_rgba(37,99,235,0.35)]"
                  : "text-navy-300 hover:bg-white/5 hover:text-white"
              }`
            }
          >
            <item.icon className="h-[18px] w-[18px] shrink-0" />
            {item.label}
          </NavLink>
        ))}

        <div className="pt-4 pb-1 px-3.5 text-[10px] font-bold uppercase tracking-widest text-navy-400">Account</div>
        {NAV_SECONDARY.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-all duration-150 ${
                isActive
                  ? "bg-gradient-to-r from-brand-600 to-brand-500 text-white shadow-[0_4px_12px_rgba(37,99,235,0.35)]"
                  : "text-navy-300 hover:bg-white/5 hover:text-white"
              }`
            }
          >
            <item.icon className="h-[18px] w-[18px] shrink-0" />
            {item.label}
          </NavLink>
        ))}
      </nav>

      {/* User block */}
      <div className="border-t border-white/5 p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-brand-500 text-xs font-bold">
            {initials || "S"}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold truncate">{profile.fullName}</p>
            <p className="text-[11px] text-navy-400 truncate">{user?.email ?? profile.email}</p>
          </div>
          <button
            onClick={() => {
              logout();
              navigate("/login");
            }}
            className="rounded-lg p-2 text-navy-400 hover:bg-white/10 hover:text-white transition"
            title="Log out"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-surface">
      {/* Desktop sidebar */}
      <aside className="hidden lg:block fixed inset-y-0 left-0 w-[264px] z-30 no-print">{sidebar}</aside>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden no-print">
          <div className="absolute inset-0 bg-navy-900/60 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
          <aside className="absolute inset-y-0 left-0 w-[280px] animate-fade-in">{sidebar}</aside>
          <button
            className="absolute top-4 right-4 rounded-lg bg-white/10 p-2 text-white"
            onClick={() => setMobileOpen(false)}
            aria-label="Close menu"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      )}

      {/* Main */}
      <div className="lg:pl-[264px]">
        {/* Topbar */}
        <header className="sticky top-0 z-20 bg-white/85 backdrop-blur-md border-b border-navy-100 no-print">
          <div className="flex h-16 items-center justify-between gap-4 px-4 sm:px-6">
            <div className="flex items-center gap-3">
              <button
                className="rounded-xl border border-navy-200 p-2 text-navy-600 lg:hidden"
                onClick={() => setMobileOpen(true)}
                aria-label="Open menu"
              >
                <Menu className="h-5 w-5" />
              </button>
              <div className="hidden sm:block">
                <p className="text-sm font-bold text-navy-800">AI Career Analytics Workspace</p>
                <p className="text-xs text-navy-400">NLP resume parsing · ML career matching · GenAI recommendations</p>
              </div>
            </div>
            <div className="flex items-center gap-2 sm:gap-3">
              <span className="hidden sm:inline-flex items-center gap-1.5 rounded-full bg-success-50 border border-success-100 px-3 py-1 text-[11px] font-bold text-success-700">
                <span className="h-1.5 w-1.5 rounded-full bg-success-600 animate-pulse" />
                AI Engine Online
              </span>
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-brand-500 text-xs font-bold text-white">
                {initials || "S"}
              </div>
            </div>
          </div>
        </header>

        <main className="px-4 sm:px-6 lg:px-8 py-6 lg:py-8 max-w-[1440px] mx-auto">
          <Outlet />
        </main>
      </div>

      <Toast message={toast} onClose={() => setToast(null)} />
    </div>
  );
}
