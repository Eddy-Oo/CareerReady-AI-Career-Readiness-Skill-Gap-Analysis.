import type { ReactNode, ButtonHTMLAttributes, InputHTMLAttributes, TextareaHTMLAttributes } from "react";
import { Loader2 } from "lucide-react";

/* ------------------------------ Card ------------------------------ */
export function Card({
  children,
  className = "",
  hover = false,
}: {
  children: ReactNode;
  className?: string;
  hover?: boolean;
}) {
  return (
    <div className={`card p-5 sm:p-6 transition-shadow ${hover ? "hover:shadow-card-hover" : ""} ${className}`}>
      {children}
    </div>
  );
}

/* --------------------------- Section head -------------------------- */
export function SectionHeader({
  title,
  subtitle,
  action,
  icon,
}: {
  title: string;
  subtitle?: string;
  action?: ReactNode;
  icon?: ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-3 mb-5">
      <div className="flex items-start gap-3">
        {icon && (
          <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
            {icon}
          </div>
        )}
        <div>
          <h2 className="text-lg font-bold text-navy-800 tracking-tight">{title}</h2>
          {subtitle && <p className="text-sm text-navy-400 mt-0.5 max-w-2xl">{subtitle}</p>}
        </div>
      </div>
      {action}
    </div>
  );
}

/* ------------------------------ Button ----------------------------- */
interface BtnProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  loading?: boolean;
  size?: "sm" | "md" | "lg";
}
export function Button({ variant = "primary", loading, size = "md", className = "", children, ...rest }: BtnProps) {
  const variantCls =
    variant === "primary"
      ? "bg-brand-600 text-white hover:bg-brand-700"
      : variant === "secondary"
      ? "bg-white text-navy-600 border border-navy-200 hover:bg-navy-50"
      : variant === "danger"
      ? "bg-danger text-white hover:bg-red-700"
      : "text-navy-500 hover:bg-navy-100 hover:text-navy-700";
  const sizeCls = size === "sm" ? "px-3 py-1.5 text-xs" : size === "lg" ? "px-6 py-3.5 text-[15px]" : "px-4 py-2.5 text-sm";
  return (
    <button
      {...rest}
      disabled={rest.disabled || loading}
      className={`inline-flex items-center justify-center gap-2 rounded-xl font-semibold transition-all duration-200 disabled:opacity-50 disabled:pointer-events-none active:scale-[0.98] ${variantCls} ${sizeCls} ${className}`}
    >
      {loading && <Loader2 className="h-4 w-4 animate-spin" />}
      {children}
    </button>
  );
}

/* ------------------------------ Badge ------------------------------ */
const badgeTones: Record<string, string> = {
  blue: "bg-brand-50 text-brand-700 border border-brand-100",
  green: "bg-success-50 text-success-700 border border-success-100",
  red: "bg-danger-50 text-danger text-red-700 border border-danger-100",
  amber: "bg-warning-50 text-warning-600 border border-warning-100",
  violet: "bg-violet-50 text-violet-700 border border-violet-100",
  gray: "bg-navy-50 text-navy-500 border border-navy-100",
};
export function Badge({ tone = "gray", children, className = "" }: { tone?: keyof typeof badgeTones; children: ReactNode; className?: string }) {
  return <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${badgeTones[tone]} ${className}`}>{children}</span>;
}

/* --------------------------- Progress bar -------------------------- */
export function ProgressBar({
  value,
  tone = "blue",
  height = "h-2",
  label,
  showValue = true,
}: {
  value: number;
  tone?: "blue" | "green" | "violet" | "amber" | "red";
  height?: string;
  label?: string;
  showValue?: boolean;
}) {
  const color =
    tone === "green" ? "bg-success-600" : tone === "violet" ? "bg-violet-600" : tone === "amber" ? "bg-warning-500" : tone === "red" ? "bg-danger" : "bg-brand-600";
  const v = Math.max(0, Math.min(100, Math.round(value)));
  return (
    <div className="w-full">
      {label && (
        <div className="flex justify-between mb-1.5 text-xs font-semibold">
          <span className="text-navy-500">{label}</span>
          {showValue && <span className="text-navy-700">{v}%</span>}
        </div>
      )}
      <div className={`w-full ${height} rounded-full bg-navy-100 overflow-hidden`}>
        <div
          className={`${height} rounded-full ${color} transition-all duration-700 ease-out`}
          style={{ width: `${v}%` }}
          role="progressbar"
          aria-valuenow={v}
          aria-valuemin={0}
          aria-valuemax={100}
        />
      </div>
    </div>
  );
}

/* ------------------------------ Fields ----------------------------- */
export function Field({ label, hint, children }: { label: string; hint?: string; children: ReactNode }) {
  return (
    <div>
      <label className="block text-sm font-semibold text-navy-700 mb-1.5">{label}</label>
      {children}
      {hint && <p className="text-xs text-navy-400 mt-1">{hint}</p>}
    </div>
  );
}

export function Input({ className = "", ...rest }: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...rest}
      className={`w-full rounded-xl border border-navy-200 bg-white px-4 py-2.5 text-sm text-navy-800 placeholder:text-navy-300 transition focus:border-brand-500 focus:ring-4 focus:ring-brand-100 outline-none ${className}`}
    />
  );
}

export function Textarea({ className = "", ...rest }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      {...rest}
      className={`w-full rounded-xl border border-navy-200 bg-white px-4 py-3 text-sm text-navy-800 placeholder:text-navy-300 transition focus:border-brand-500 focus:ring-4 focus:ring-brand-100 outline-none resize-y ${className}`}
    />
  );
}

export function Select({ className = "", children, ...rest }: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      {...rest}
      className={`w-full rounded-xl border border-navy-200 bg-white px-4 py-2.5 text-sm text-navy-800 transition focus:border-brand-500 focus:ring-4 focus:ring-brand-100 outline-none appearance-none bg-no-repeat ${className}`}
      style={{
        backgroundImage:
          "url(\"data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' fill='none' stroke='%23667085' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m4 6 4 4 4-4'/%3E%3C/svg%3E\")",
        backgroundPosition: "right 0.75rem center",
      }}
    >
      {children}
    </select>
  );
}

/* --------------------------- Empty / loading ----------------------- */
export function EmptyState({ icon, title, description, action }: { icon?: ReactNode; title: string; description?: string; action?: ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-14 px-6">
      {icon && <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-navy-50 text-navy-300">{icon}</div>}
      <h3 className="text-base font-bold text-navy-700">{title}</h3>
      {description && <p className="text-sm text-navy-400 mt-1.5 max-w-md">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

export function Spinner({ label }: { label?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-14 gap-3">
      <Loader2 className="h-8 w-8 animate-spin text-brand-600" />
      {label && <p className="text-sm font-medium text-navy-400">{label}</p>}
    </div>
  );
}

/* ------------------------------- Toast ----------------------------- */
export function Toast({ message, onClose }: { message: string | null; onClose: () => void }) {
  if (!message) return null;
  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 animate-fade-in-up no-print">
      <div className="flex items-center gap-3 rounded-xl bg-navy-800 text-white px-4 py-3 shadow-lg text-sm font-medium">
        {message}
        <button onClick={onClose} className="text-navy-300 hover:text-white text-lg leading-none" aria-label="Dismiss">
          ×
        </button>
      </div>
    </div>
  );
}
