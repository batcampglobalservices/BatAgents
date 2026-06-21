import React from "react";

interface AdminStatCardProps {
  title: string;
  value: string | number;
  change?: string;
  isPositive?: boolean;
  icon: React.ReactNode;
}

export const AdminStatCard: React.FC<AdminStatCardProps> = ({
  title,
  value,
  change,
  isPositive = true,
  icon
}) => {
  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 hover:border-zinc-700/60 transition-all flex items-start justify-between shadow-md relative overflow-hidden group">
      {/* Background glow effect */}
      <div className="absolute top-0 right-0 w-24 h-24 bg-brand/5 rounded-full blur-2xl group-hover:bg-brand/10 transition-all"></div>
      
      <div className="space-y-3">
        <span className="text-xs text-zinc-500 uppercase font-mono tracking-wider">{title}</span>
        <div className="text-2xl font-bold text-white tracking-tight">{value}</div>
        {change && (
          <div className="flex items-center gap-1 text-xs">
            <span className={isPositive ? "text-green-400" : "text-red-400"}>
              {isPositive ? "↑" : "↓"} {change}
            </span>
            <span className="text-zinc-500">vs last week</span>
          </div>
        )}
      </div>

      <div className="p-3 bg-zinc-800/40 border border-zinc-700/30 rounded-lg text-brand group-hover:scale-105 transition-transform">
        {icon}
      </div>
    </div>
  );
};
