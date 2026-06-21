import React from "react";

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  hoverable?: boolean;
  glow?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  className = "",
  hoverable = true,
  glow = false,
  ...props
}) => {
  return (
    <div
      className={`glass-panel rounded-xl p-6 ${
        hoverable ? "glass-panel-hover" : ""
      } ${
        glow ? "shadow-[0_0_20px_rgba(234,96,2,0.05)] border-brand/20" : ""
      } ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};
