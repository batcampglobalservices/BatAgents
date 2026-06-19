"use client";

import { ReactNode, useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

type RevealVariant = "up" | "left" | "right" | "zoom" | "fade";

const hiddenByVariant: Record<RevealVariant, string> = {
  up: "translate-y-10 opacity-0 blur-md",
  left: "-translate-x-10 opacity-0 blur-md",
  right: "translate-x-10 opacity-0 blur-md",
  zoom: "scale-[0.96] opacity-0 blur-md",
  fade: "opacity-0 blur-md",
};

export default function ScrollReveal({
  children,
  className,
  delay = 0,
  variant = "up",
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
  variant?: RevealVariant;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.16, rootMargin: "0px 0px -70px 0px" },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={cn(
        "transition-all duration-[950ms] ease-[cubic-bezier(0.16,1,0.3,1)] will-change-transform motion-reduce:translate-x-0 motion-reduce:translate-y-0 motion-reduce:scale-100 motion-reduce:opacity-100 motion-reduce:blur-0",
        visible
          ? "translate-x-0 translate-y-0 scale-100 opacity-100 blur-0"
          : hiddenByVariant[variant],
        className,
      )}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}
