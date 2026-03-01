"use client";

import { cn } from "@/lib/cn";
import { X } from "lucide-react";
import { createContext, useContext, useState, useCallback, type ReactNode } from "react";

/* ─── Card ─── */
export function Card({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn(
      "rounded-2xl border border-border/80 bg-surface p-5 transition-all duration-200",
      "shadow-[0_1px_3px_rgba(0,0,0,0.04)] hover:shadow-[0_4px_12px_rgba(0,0,0,0.06)]",
      className
    )} {...props}>
      {children}
    </div>
  );
}

export function GlassCard({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-border/50 bg-white/80 backdrop-blur-md p-5 transition-all duration-200",
        "shadow-[0_1px_3px_rgba(0,0,0,0.04)] hover:shadow-[0_4px_16px_rgba(0,0,0,0.06)] hover:border-border",
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
  primary: "bg-accent text-white hover:bg-accent-hover shadow-sm shadow-accent/10 hover:shadow-md hover:shadow-accent/15 active:scale-[0.98]",
  secondary: "bg-surface-2 text-text border border-border hover:bg-surface-3 hover:border-border-2 active:scale-[0.98]",
  success: "bg-emerald text-white hover:bg-emerald/90 shadow-sm shadow-emerald/10 active:scale-[0.98]",
  warning: "bg-amber text-white hover:bg-amber/90 shadow-sm shadow-amber/10 active:scale-[0.98]",
  danger: "bg-red text-white hover:bg-red/90 shadow-sm shadow-red/10 active:scale-[0.98]",
  ghost: "text-text-2 hover:text-text hover:bg-surface-2",
};

const buttonSizes: Record<string, string> = {
  sm: "px-3 py-1.5 text-xs rounded-lg",
  md: "px-4 py-2.5 text-[13px] rounded-xl",
  lg: "px-6 py-3 text-sm rounded-xl",
};

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: keyof typeof buttonVariants;
  size?: keyof typeof buttonSizes;
}

export function Button({ variant = "primary", size = "md", className, ...props }: ButtonProps) {
  return (
    <button
      className={cn(
        "font-semibold transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center justify-center gap-2",
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
  person: "bg-accent/8 text-accent border border-accent/10",
  company: "bg-purple/8 text-purple border border-purple/10",
  mobile: "bg-emerald/8 text-emerald border border-emerald/10",
  address: "bg-amber/8 text-amber border border-amber/10",
  vehicle: "bg-red/8 text-red border border-red/10",
  confirmed: "bg-emerald/8 text-emerald border border-emerald/10",
  likely: "bg-accent/8 text-accent border border-accent/10",
  rumor: "bg-amber/8 text-amber border border-amber/10",
  pending: "bg-amber/8 text-amber border border-amber/10",
  approved: "bg-emerald/8 text-emerald border border-emerald/10",
  rejected: "bg-red/8 text-red border border-red/10",
  signal: "bg-amber/8 text-amber border border-amber/10",
  info: "bg-cyan/8 text-cyan border border-cyan/10",
  standard: "bg-emerald/8 text-emerald border border-emerald/10",
  sensitive: "bg-amber/8 text-amber border border-amber/10",
  confidential: "bg-red/8 text-red border border-red/10",
  "top-secret": "bg-purple/8 text-purple border border-purple/10",
  default: "bg-surface-3 text-text-2 border border-border/50",
};

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: keyof typeof badgeColors;
}

export function Badge({ variant = "default", className, ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-semibold tracking-wide uppercase",
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
          "w-full px-3.5 py-2.5 bg-surface-2 border border-border rounded-xl text-text text-sm outline-none transition-all duration-200",
          "focus:border-accent focus:ring-2 focus:ring-accent/10 focus:bg-white",
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
          "w-full px-3.5 py-2.5 bg-surface-2 border border-border rounded-xl text-text text-sm outline-none transition-all duration-200",
          "focus:border-accent focus:ring-2 focus:ring-accent/10 focus:bg-white",
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
          "w-full px-3.5 py-2.5 bg-surface-2 border border-border rounded-xl text-text text-sm outline-none transition-all duration-200 resize-y min-h-[100px]",
          "focus:border-accent focus:ring-2 focus:ring-accent/10 focus:bg-white",
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
      <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" />
      <div
        className="relative bg-surface border border-border/80 rounded-2xl w-[600px] max-w-[90vw] max-h-[85vh] overflow-hidden animate-scale-in shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-border/60">
          <h3 className="text-base font-semibold">{title}</h3>
          <button onClick={onClose} className="text-text-3 hover:text-text p-1.5 rounded-xl hover:bg-surface-2 transition-all cursor-pointer">
            <X size={16} />
          </button>
        </div>
        <div className="px-6 py-5 overflow-y-auto max-h-[60vh]">{children}</div>
        {footer && <div className="flex justify-end gap-2 px-6 py-4 border-t border-border/60">{footer}</div>}
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

  const iconColors = { success: "bg-emerald", error: "bg-red", info: "bg-accent", warning: "bg-amber" };

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div className="fixed bottom-6 right-6 z-[300] space-y-2">
        {toasts.map((t) => (
          <div
            key={t.id}
            className="animate-slide-in-right bg-white border border-border/60 rounded-xl px-4 py-3 shadow-lg flex items-center gap-3 min-w-[280px]"
          >
            <div className={cn("w-2 h-2 rounded-full", iconColors[t.type])} />
            <span className="text-[13px] text-text font-medium">{t.message}</span>
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
    <div className="group rounded-2xl border border-border/60 bg-white/80 backdrop-blur-sm p-4 transition-all duration-200 hover:shadow-[0_4px_16px_rgba(0,0,0,0.06)] hover:border-border cursor-default">
      <div className="flex items-center justify-between mb-3">
        <div className={cn("w-9 h-9 rounded-xl flex items-center justify-center transition-transform duration-200 group-hover:scale-105",
          color === "text-accent" ? "bg-accent/8" :
          color === "text-purple" ? "bg-purple/8" :
          color === "text-emerald" ? "bg-emerald/8" :
          color === "text-amber" ? "bg-amber/8" :
          color === "text-red" ? "bg-red/8" :
          color === "text-cyan" ? "bg-cyan/8" : "bg-accent/8"
        )}>
          <span className={cn(color)}>{icon}</span>
        </div>
        {trend && <span className="text-[10px] text-emerald font-semibold bg-emerald/8 px-2 py-0.5 rounded-full">{trend}</span>}
      </div>
      <div className="text-2xl font-bold tracking-tight">{value}</div>
      <div className="text-[12px] text-text-3 mt-0.5 font-medium">{label}</div>
    </div>
  );
}

/* ─── Empty State ─── */
export function EmptyState({ icon, title, description }: { icon: ReactNode; title: string; description: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="text-4xl text-text-3/50 mb-4">{icon}</div>
      <h3 className="text-lg font-semibold text-text mb-1">{title}</h3>
      <p className="text-sm text-text-2 max-w-sm">{description}</p>
    </div>
  );
}

/* ─── Page Header ─── */
export function PageHeader({ title, description, action }: { title: string; description?: string; action?: ReactNode }) {
  return (
    <div className="flex items-start justify-between mb-7">
      <div>
        <h1 className="text-[22px] font-bold tracking-tight">{title}</h1>
        {description && <p className="text-[13px] text-text-2 mt-0.5">{description}</p>}
      </div>
      {action && <div>{action}</div>}
    </div>
  );
}
