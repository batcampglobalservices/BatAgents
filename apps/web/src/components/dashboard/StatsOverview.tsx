import React from "react";
import { Card } from "../ui/Card";
import { PlusSquare, MessageSquare, Coins } from "lucide-react";

interface StatsOverviewProps {
  agentsCount?: string;
  totalEarnings?: string;
  totalUsage?: string;
}

export const StatsOverview: React.FC<StatsOverviewProps> = ({
  agentsCount = "—",
  totalEarnings = "—",
  totalUsage = "—",
}) => {
  const stats = [
    {
      title: "Agents Created",
      value: agentsCount,
      icon: <PlusSquare className="w-5 h-5 text-brand" />,
      description: "Minted Agentic ID tokens",
    },
    {
      title: "Total Earnings",
      value: totalEarnings !== "—" ? `${totalEarnings} 0G` : "—",
      icon: <Coins className="w-5 h-5 text-emerald-400" />,
      description: "Withdrawn + claimable royalties",
    },
    {
      title: "Total Chats Served",
      value: totalUsage,
      icon: <MessageSquare className="w-5 h-5 text-sky-400" />,
      description: "0G Compute completion events",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
      {stats.map((stat, idx) => (
        <Card key={idx} hoverable={false} className="border border-white/5 p-5 flex items-start gap-4">
          <div className="p-2.5 bg-white/5 rounded-xl border border-white/5 shrink-0">
            {stat.icon}
          </div>
          <div className="space-y-1">
            <span className="text-xs text-white/50 block font-semibold uppercase">{stat.title}</span>
            <span className="text-2xl font-bold text-white block">{stat.value}</span>
            <span className="text-[10px] text-white/40 block leading-tight">{stat.description}</span>
          </div>
        </Card>
      ))}
    </div>
  );
};
