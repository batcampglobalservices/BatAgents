import React from "react";
import Link from "next/link";
import { Card } from "../ui/Card";
import { Badge } from "../ui/Badge";
import { Cpu, HardDrive } from "lucide-react";

export interface AgentCardProps {
  id: string;
  name: string;
  description: string;
  avatarUrl?: string; // Optional avatar uploaded to 0G storage
  creator: string;
  price: string;
  pricingType: "buyout" | "rental" | "ppm";
}

export const AgentCard: React.FC<AgentCardProps> = ({
  id,
  name,
  description,
  avatarUrl,
  creator,
  price,
  pricingType,
}) => {
  const shortCreator = `${creator.substring(0, 6)}...${creator.substring(creator.length - 4)}`;

  const pricingLabels = {
    buyout: "Buyout",
    rental: "Rental / day",
    ppm: "Per Message",
  };

  const badgeVariants = {
    buyout: "primary" as const,
    rental: "success" as const,
    ppm: "info" as const,
  };

  return (
    <Link href={`/agent/${id}`}>
      <Card hoverable={true} className="h-full flex flex-col justify-between border border-white/5 relative overflow-hidden group">
        {/* Glow Hover Element */}
        <div className="absolute inset-0 bg-gradient-to-tr from-brand/0 to-brand/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

        <div className="space-y-4 relative z-10">
          {/* Header (Avatar & Badge) */}
          <div className="flex justify-between items-start">
            <div className="w-12 h-12 rounded-xl bg-brand/10 border border-brand/20 flex items-center justify-center text-brand font-black text-lg overflow-hidden">
              {avatarUrl ? (
                <img src={avatarUrl} alt={name} className="w-full h-full object-cover" />
              ) : (
                name.substring(0, 2).toUpperCase()
              )}
            </div>
            <Badge label={pricingLabels[pricingType]} variant={badgeVariants[pricingType]} />
          </div>

          {/* Body */}
          <div className="space-y-2">
            <h3 className="font-bold text-lg text-white group-hover:text-brand transition-colors">
              {name}
            </h3>
            <p className="text-sm text-white/50 line-clamp-2 leading-relaxed">
              {description}
            </p>
          </div>
        </div>

        {/* Footer (Creator & Price) */}
        <div className="pt-6 mt-6 border-t border-white/5 flex items-center justify-between text-xs relative z-10">
          <div className="space-y-0.5">
            <span className="text-white/40 block">Creator</span>
            <span className="font-mono text-white/70 hover:text-brand transition-colors">
              {shortCreator}
            </span>
          </div>
          <div className="text-right">
            <span className="text-white/40 block">Price</span>
            <span className="font-bold text-sm text-white">
              {price} <span className="text-brand">0G</span>
            </span>
          </div>
        </div>
      </Card>
    </Link>
  );
};
