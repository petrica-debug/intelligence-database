"use client";

import { cn } from "@/lib/cn";
import { X } from "lucide-react";
import { createContext, useContext, useState, useCallback, type ReactNode } from "react";

/* ─── Card ─── */
export function Card({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("rounded-xl border border-border bg-surface p-5 transition-colors shadow-sm", className)} {...props}>
      {children}
    </div>
  );
}

export function GlassCard({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "rounded-xl border border-border/60 bg-surface/90 backdrop-blur-sm p-5 transition-all hover:border-border-2 shadow-sm",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

/* ─── Button ─── */
const buttonVariants: Record<string, string> = {
  primary: "bg-accent text-white hover:bg-accent-hover shadow-md shadow-accent/10",
  secondary: "bg-surface-2 text-text border border-border hover:bg-surface-3 hover:border-border-2",
  success: "bg-emerald text-white hover:bg-emerald/90",
  warning: "bg-amber text-white hover:bg-amber/90",
  danger: "bg-red text-white hover:bg-red/90",
  ghost: "text-text-2 hover:text-text hover:bg-surface-2",
};

const buttonSizes: Record<string, string> = {
  sm: "px-3 py-1.5 text-xs rounded-lg",
  md: "px-4 py-2 text-sm rounded-lg",
  lg: "px-6 py-2.5 text-sm rounded-xl",
};

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: keyof typeof buttonVariants;
  size?: keyof typeof buttonSizes;
}

export function Button({ variant = "primary", size = "md", className, ...props }: ButtonProps) {
  return (
    <button
      className={cn(
        "font-semibold transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center justify-center gap-2",
        buttonVariants[variant],
        buttonSizes[size],
        className
      )}
      {...props}
    />
  );
}

/* ─── Badge ─── */
const badgeColors: Record<string, string> = {
  person: "bg-accent-muted text-accent",
  company: "bg-purple-muted text-purple",
  mobile: "bg-emerald-muted text-emerald",
  address: "bg-amber-muted text-amber",
  vehicle: "bg-red-muted text-red",
  confirmed: "bg-emerald-muted text-emerald",
  likely: "bg-accent-muted text-accent",
  rumor: "bg-amber-muted text-amber",
  pending: "bg-amber-muted text-amber",
  approved: "bg-emerald-muted text-emerald",
  rejected: "bg-red-muted text-red",
  signal: "bg-amber-muted text-amber",
  info: "bg-cyan-muted text-cyan",
  default: "bg-surface-3 text-text-2",
};

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: keyof typeof badgeColors;
}

export function Badge({ variant = "default", className, ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold tracking-wide uppercase",
        badgeColors[variant] || badgeColors.default,
        className
      )}
      {...props}
    />
  );
}

/* ─── Input ─── */
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

export function Input({ label, className, id, ...props }: InputProps) {
  return (
    <div className="space-y-1.5">
      {label && (
        <label htmlFor={id} className="block text-[11px] font-medium text-text-2 uppercase tracking-wider">
          {label}
        </label>
      )}
      <input
        id={id}
        className={cn(
          "w-full px-3.5 py-2.5 bg-surface-2 border border-border rounded-lg text-text text-sm outline-none transition-colors",
          "focus:border-accent focus:ring-1 focus:ring-accent/20",
          "placeholder:text-text-3",
          className
        )}
        {...props}
      />
    </div>
  );
}

/* ─── Select ─── */
interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  options: { value: string; label: string }[];
}

export function Select({ label, options, className, id, ...props }: SelectProps) {
  return (
    <div className="space-y-1.5">
      {label && (
        <label htmlFor={id} className="block text-[11px] font-medium text-text-2 uppercase tracking-wider">
          {label}
        </label>
      )}
      <select
        id={id}
        className={cn(
          "w-full px-3.5 py-2.5 bg-surface-2 border border-border rounded-lg text-text text-sm outline-none transition-colors",
          "focus:border-accent focus:ring-1 focus:ring-accent/20",
          className
        )}
        {...props}
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
    </div>
  );
}

/* ─── Textarea ─── */
interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
}

export function Textarea({ label, className, id, ...props }: TextareaProps) {
  return (
    <div className="space-y-1.5">
      {label && (
        <label htmlFor={id} className="block text-[11px] font-medium text-text-2 uppercase tracking-wider">
          {label}
        </label>
      )}
      <textarea
        id={id}
        className={cn(
          "w-full px-3.5 py-2.5 bg-surface-2 border border-border rounded-lg text-text text-sm outline-none transition-colors resize-y min-h-[100px]",
          "focus:border-accent focus:ring-1 focus:ring-accent/20",
          "placeholder:text-text-3",
          className
        )}
        {...props}
      />
    </div>
  );
}

/* ─── Modal ─── */
interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  footer?: ReactNode;
}

export function Modal({ open, onClose, title, children, footer }: ModalProps) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center" onClick={onClose}>
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" />
      <div
        className="relative bg-surface border border-border rounded-2xl w-[600px] max-w-[90vw] max-h-[85vh] overflow-hidden animate-scale-in shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <h3 className="text-base font-semibold">{title}</h3>
          <button onClick={onClose} className="text-text-2 hover:text-text p-1 rounded-lg hover:bg-surface-2 transition-colors cursor-pointer">
            <X size={18} />
          </button>
        </div>
        <div className="px-6 py-5 overflow-y-auto max-h-[60vh]">{children}</div>
        {footer && <div className="flex justify-end gap-2 px-6 py-4 border-t border-border">{footer}</div>}
      </div>
    </div>
  );
}

/* ─── Toast System ─── */
interface Toast {
  id: number;
  message: string;
  type: "success" | "error" | "info" | "warning";
}

const ToastContext = createContext<{ toast: (msg: string, type?: Toast["type"]) => void }>({
  toast: () => {},
});

export function useToast() {
  return useContext(ToastContext);
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const toast = useCallback((message: string, type: Toast["type"] = "info") => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 3500);
  }, []);

  const iconMap = { success: "text-emerald", error: "text-red", info: "text-accent", warning: "text-amber" };

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div className="fixed bottom-6 right-6 z-[300] space-y-2">
        {toasts.map((t) => (
          <div
            key={t.id}
            className="animate-slide-in bg-surface border border-border rounded-xl px-4 py-3 shadow-lg flex items-center gap-3 min-w-[280px]"
          >
            <div className={cn("w-2 h-2 rounded-full", iconMap[t.type].replace("text-", "bg-"))} />
            <span className="text-sm text-text">{t.message}</span>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

/* ─── Stat Card ─── */
interface StatCardProps {
  icon: ReactNode;
  value: number | string;
  label: string;
  trend?: string;
  color?: string;
}

export function StatCard({ icon, value, label, trend, color = "text-accent" }: StatCardProps) {
  return (
    <GlassCard className="group cursor-default">
      <div className="flex items-start justify-between">
        <div className={cn("text-2xl", color)}>{icon}</div>
        {trend && <span className="text-[11px] text-emerald font-medium bg-emerald-muted px-2 py-0.5 rounded-full">{trend}</span>}
      </div>
      <div className="mt-3">
        <div className="text-3xl font-bold tracking-tight">{value}</div>
        <div className="text-sm text-text-2 mt-1">{label}</div>
      </div>
    </GlassCard>
  );
}

/* ─── Empty State ─── */
export function EmptyState({ icon, title, description }: { icon: ReactNode; title: string; description: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="text-4xl text-text-3 mb-4">{icon}</div>
      <h3 className="text-lg font-semibold text-text mb-1">{title}</h3>
      <p className="text-sm text-text-2 max-w-sm">{description}</p>
    </div>
  );
}

/* ─── Page Header ─── */
export function PageHeader({ title, description, action }: { title: string; description?: string; action?: ReactNode }) {
  return (
    <div className="flex items-start justify-between mb-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
        {description && <p className="text-sm text-text-2 mt-1">{description}</p>}
      </div>
      {action && <div>{action}</div>}
    </div>
  );
}
