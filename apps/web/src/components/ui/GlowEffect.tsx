import React from "react";

interface GlowEffectProps {
  position?: "top-left" | "top-right" | "bottom-left" | "bottom-right" | "center";
  size?: "sm" | "md" | "lg" | "xl";
  color?: string;
  opacity?: string;
  animate?: boolean;
}

export const GlowEffect: React.FC<GlowEffectProps> = ({
  position = "center",
  size = "md",
  color = "bg-brand",
  opacity = "opacity-20",
  animate = true,
}) => {
  const positions = {
    "top-left": "-top-40 -left-40",
    "top-right": "-top-40 -right-40",
    "bottom-left": "-bottom-40 -left-40",
    "bottom-right": "-bottom-40 -right-40",
    center: "top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2",
  };

  const sizes = {
    sm: "w-48 h-48 blur-2xl",
    md: "w-72 h-72 blur-3xl",
    lg: "w-96 h-96 blur-[100px]",
    xl: "w-[500px] h-[500px] blur-[150px]",
  };

  return (
    <div
      className={`absolute rounded-full pointer-events-none ${positions[position]} ${
        sizes[size]
      } ${color} ${opacity} ${animate ? "animate-pulse-glow" : ""} z-0`}
    />
  );
};
