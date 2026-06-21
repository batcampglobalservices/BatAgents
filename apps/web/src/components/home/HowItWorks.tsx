import React from "react";
import { Card } from "../ui/Card";
import { PlusSquare, CreditCard, MessageSquare } from "lucide-react";

export const HowItWorks = () => {
  const steps = [
    {
      icon: <PlusSquare className="w-6 h-6 text-brand" />,
      number: "01",
      title: "Create & Encrypt",
      description: "Define your agent's persona. Upload knowledge files and system prompts. Avatars are uploaded public; prompts are AES-256 encrypted directly on-chain via 0G Storage.",
      primitive: "0G Storage",
    },
    {
      icon: <CreditCard className="w-6 h-6 text-brand" />,
      number: "02",
      title: "Mint & List",
      description: "Mint your agent as a transferable ERC-7857 Agentic ID. Set your marketplace terms: Buyout price, Rental access, or pay-per-message (PPM) parameters.",
      primitive: "0G Chain",
    },
    {
      icon: <MessageSquare className="w-6 h-6 text-brand" />,
      number: "03",
      title: "Serve & Earn",
      description: "Buyers connect to the agent. Access permissions are checked on-chain. Decryption happens on the node, sending the prompt to the 0G Compute Router for TEE inference.",
      primitive: "0G Compute",
    },
  ];

  return (
    <section className="py-20 relative z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-4">
          <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
            How Bat Agents Works
          </h2>
          <p className="text-white/50 text-sm sm:text-base">
            A fully trustless pipeline powered by 0G primitives. No centralized databases, passwords, or traditional APIs.
          </p>
        </div>

        {/* Steps Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
          {steps.map((step, idx) => (
            <Card key={step.number} hoverable={true} className="flex flex-col h-full justify-between relative border border-white/5">
              {/* Step counter */}
              <div className="absolute top-6 right-6 text-3xl font-black text-white/5 select-none">
                {step.number}
              </div>

              <div>
                {/* Icon */}
                <div className="p-3 bg-brand/10 rounded-xl w-fit mb-6">
                  {step.icon}
                </div>

                {/* Title */}
                <h3 className="text-xl font-bold text-white mb-3">{step.title}</h3>
                
                {/* Description */}
                <p className="text-sm text-white/50 leading-relaxed mb-6">
                  {step.description}
                </p>
              </div>

              {/* Bottom technology info tag */}
              <div className="pt-4 border-t border-white/5 flex items-center justify-between text-xs text-white/40">
                <span>Infrastructure:</span>
                <span className="font-semibold text-brand/80 px-2 py-0.5 rounded bg-brand/5 border border-brand/10">
                  {step.primitive}
                </span>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};
