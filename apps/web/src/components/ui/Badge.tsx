import React from "react";

interface BadgeProps {
  label: string;
  variant?: "primary" | "secondary" | "success" | "warning" | "info" | "neutral";
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  label,
  variant = "primary",
  className = "",
}) => {
  const baseStyles = "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border";

  const variants = {
    primary: "bg-brand/10 text-brand border-brand/20",
    secondary: "bg-white/5 text-white/80 border-white/10",
    success: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    warning: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    info: "bg-sky-500/10 text-sky-400 border-sky-500/20",
    neutral: "bg-zinc-800 text-zinc-400 border-zinc-700",
  };

  return (
    <span className={`${baseStyles} ${variants[variant]} ${className}`}>
      {label}
    </span>
  );
};
