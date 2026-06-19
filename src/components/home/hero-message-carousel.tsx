"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

type HeroMessage = {
  title: string;
  subtitle: string;
  description: string;
};

const heroMessages: HeroMessage[] = [
  {
    title: "Mint AI Agents.",
    subtitle: "Own intelligence as a digital asset.",
    description:
      "Create AI agents, mint them on-chain, and turn your knowledge into something users can discover, hire, and use.",
  },
  {
    title: "Own Them.",
    subtitle: "Your agent. Your value. Your economy.",
    description:
      "Every agent has identity, provenance, pricing, and ownership designed for the next generation of digital work.",
  },
  {
    title: "Monetize Intelligence.",
    subtitle: "Let your AI work like a freelancer.",
    description:
      "List agents on the marketplace and earn when people use them for business, research, content, code, and more.",
  },
  {
    title: "Powered by 0G.",
    subtitle: "Built for verifiable AI ownership.",
    description:
      "Bat Agents combines AI, Web3, and 0G infrastructure to create a transparent marketplace for useful digital labor.",
  },
];

export default function HeroMessageCarousel() {
  const [activeIndex, setActiveIndex] = useState(0);
  const activeMessage = heroMessages[activeIndex];

  useEffect(() => {
    const timer = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % heroMessages.length);
    }, 4600);

    return () => {
      window.clearInterval(timer);
    };
  }, []);

  const slideLabel = useMemo(
    () => String(activeIndex + 1).padStart(2, "0"),
    [activeIndex],
  );

  return (
    <section className="group relative overflow-hidden rounded-[2rem] border border-white/12 bg-[linear-gradient(180deg,rgba(255,255,255,0.08),rgba(255,255,255,0.03))] p-5 shadow-[0_28px_90px_rgba(0,0,0,0.34)] backdrop-blur-2xl sm:p-6">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_25%_18%,rgba(139,92,246,0.24),transparent_26%),radial-gradient(circle_at_88%_82%,rgba(56,189,248,0.14),transparent_28%)]" />
      <div className="absolute inset-0 opacity-[0.09] [background-image:linear-gradient(rgba(255,255,255,0.09)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.09)_1px,transparent_1px)] [background-size:60px_60px]" />

      <div className="relative">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-[10px] uppercase tracking-[0.4em] text-cyan-300">
              Carousel signal
            </p>
            <p className="mt-2 text-xs uppercase tracking-[0.25em] text-slate-500">
              Slide {slideLabel} of {heroMessages.length}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <IconButton
              label="Previous slide"
              onClick={() =>
                setActiveIndex((current) =>
                  (current - 1 + heroMessages.length) % heroMessages.length,
                )
              }
            >
              <ChevronLeft className="h-4 w-4" />
            </IconButton>
            <IconButton
              label="Next slide"
              onClick={() =>
                setActiveIndex((current) => (current + 1) % heroMessages.length)
              }
            >
              <ChevronRight className="h-4 w-4" />
            </IconButton>
          </div>
        </div>

        <div className="relative mt-6 min-h-[210px]">
          <div
            key={activeIndex}
            className="animate-[hero-message-in_480ms_cubic-bezier(0.22,1,0.36,1)]"
          >
            <h2 className="max-w-sm text-3xl font-semibold tracking-[-0.05em] text-white sm:text-[2.7rem]">
              {activeMessage.title}
            </h2>
            <p className="mt-3 max-w-md text-sm font-medium leading-7 text-cyan-100/90 sm:text-base">
              {activeMessage.subtitle}
            </p>
            <p className="mt-4 max-w-md text-sm leading-7 text-slate-300 sm:text-[15px]">
              {activeMessage.description}
            </p>
          </div>
        </div>

        <div className="mt-6 flex flex-wrap items-center gap-2">
          {heroMessages.map((message, index) => (
            <button
              key={message.title}
              type="button"
              onClick={() => setActiveIndex(index)}
              aria-label={`Go to slide ${index + 1}`}
              className={cn(
                "h-2.5 rounded-full transition-all duration-300",
                index === activeIndex
                  ? "w-12 bg-gradient-to-r from-[#8b5cf6] via-[#5b7cfa] to-[#38bdf8] shadow-[0_0_16px_rgba(91,124,250,0.45)]"
                  : "w-2.5 bg-white/20 hover:bg-white/30",
              )}
            />
          ))}
        </div>

        <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-white/10 pt-4 text-[11px] uppercase tracking-[0.24em] text-slate-500">
          <span>Auto-rotates every 4.6s</span>
          <span>Manual navigation enabled</span>
        </div>
      </div>

      <style jsx global>{`
        @keyframes hero-message-in {
          from {
            opacity: 0;
            transform: translate3d(0, 18px, 0);
          }
          to {
            opacity: 1;
            transform: translate3d(0, 0, 0);
          }
        }
      `}</style>
    </section>
  );
}

function IconButton({
  children,
  label,
  onClick,
}: {
  children: ReactNode;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/5 text-slate-100 transition hover:border-white/20 hover:bg-white/10"
    >
      {children}
    </button>
  );
}
