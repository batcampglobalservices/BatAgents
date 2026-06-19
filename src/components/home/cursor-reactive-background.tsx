"use client";

import { useEffect, useRef } from "react";

export default function CursorReactiveBackground() {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    let frame = 0;
    let targetX = window.innerWidth / 2;
    let targetY = window.innerHeight / 2;
    let currentX = targetX;
    let currentY = targetY;

    const animate = () => {
      currentX += (targetX - currentX) * 0.08;
      currentY += (targetY - currentY) * 0.08;
      root.style.setProperty("--cursor-x", `${currentX}px`);
      root.style.setProperty("--cursor-y", `${currentY}px`);
      frame = requestAnimationFrame(animate);
    };

    const handlePointerMove = (event: PointerEvent) => {
      targetX = event.clientX;
      targetY = event.clientY;
    };

    window.addEventListener("pointermove", handlePointerMove, {
      passive: true,
    });
    frame = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <div
      ref={rootRef}
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-0 overflow-hidden"
      style={{
        // Fallback values before the first pointer event.
        ["--cursor-x" as string]: "50vw",
        ["--cursor-y" as string]: "30vh",
      }}
    >
      <div className="absolute inset-0 bg-[radial-gradient(900px_circle_at_var(--cursor-x)_var(--cursor-y),rgba(139,92,246,0.23),rgba(56,189,248,0.11)_24%,transparent_52%)] transition-opacity duration-300" />
      <div className="absolute inset-0 bg-[radial-gradient(420px_circle_at_var(--cursor-x)_var(--cursor-y),rgba(255,255,255,0.16),transparent_54%)] mix-blend-screen" />
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.045)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.045)_1px,transparent_1px)] bg-[size:82px_82px] opacity-[0.10] [mask-image:radial-gradient(circle_at_var(--cursor-x)_var(--cursor-y),black,transparent_55%)]" />
      <div className="absolute left-[7%] top-[18%] h-72 w-72 rounded-full bg-[#8b5cf6]/15 blur-[105px]" />
      <div className="absolute bottom-[10%] right-[8%] h-80 w-80 rounded-full bg-[#38bdf8]/10 blur-[115px]" />
      <div className="absolute inset-0 opacity-[0.18] [background-image:radial-gradient(circle_at_20%_30%,rgba(255,255,255,0.7)_0_1px,transparent_1px),radial-gradient(circle_at_80%_20%,rgba(125,211,252,0.8)_0_1px,transparent_1px),radial-gradient(circle_at_62%_72%,rgba(196,181,253,0.75)_0_1px,transparent_1px)] [background-size:120px_120px,180px_180px,240px_240px]" />
    </div>
  );
}
