"use client";

import { useEffect, useRef } from "react";

type GlowPoint = {
  currentX: number;
  currentY: number;
  targetX: number;
  targetY: number;
};

export default function CursorReactiveBackground() {
  const rootRef = useRef<HTMLDivElement>(null);
  const primaryGlowRef = useRef<HTMLDivElement>(null);
  const accentGlowRef = useRef<HTMLDivElement>(null);
  const ambientGlowRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    const primaryGlow = primaryGlowRef.current;
    const accentGlow = accentGlowRef.current;
    const ambientGlow = ambientGlowRef.current;

    if (!root || !primaryGlow || !accentGlow || !ambientGlow) {
      return;
    }

    const isTouchDevice = window.matchMedia("(pointer: coarse)").matches;
    const glow: GlowPoint = {
      currentX: window.innerWidth / 2,
      currentY: window.innerHeight / 2,
      targetX: window.innerWidth / 2,
      targetY: window.innerHeight / 2,
    };

    let frame = 0;

    const applyTransforms = (x: number, y: number) => {
      primaryGlow.style.transform = `translate3d(${x - 420}px, ${y - 420}px, 0)`;
      accentGlow.style.transform = `translate3d(${x - 220}px, ${y - 220}px, 0)`;
      ambientGlow.style.transform = `translate3d(${x - 520}px, ${y - 520}px, 0)`;
    };

    const animate = () => {
      glow.currentX += (glow.targetX - glow.currentX) * 0.09;
      glow.currentY += (glow.targetY - glow.currentY) * 0.09;

      applyTransforms(glow.currentX, glow.currentY);
      frame = window.requestAnimationFrame(animate);
    };

    const handlePointerMove = (event: PointerEvent) => {
      glow.targetX = event.clientX;
      glow.targetY = event.clientY;
    };

    const handleResize = () => {
      if (isTouchDevice) {
        const centerX = window.innerWidth / 2;
        const centerY = window.innerHeight / 3;
        glow.targetX = centerX;
        glow.targetY = centerY;
        glow.currentX = centerX;
        glow.currentY = centerY;
        applyTransforms(centerX, centerY);
      }
    };

    const centerX = window.innerWidth / 2;
    const centerY = isTouchDevice ? window.innerHeight / 3 : window.innerHeight / 2;
    glow.currentX = centerX;
    glow.currentY = centerY;
    glow.targetX = centerX;
    glow.targetY = centerY;
    applyTransforms(centerX, centerY);

    if (!isTouchDevice) {
      window.addEventListener("pointermove", handlePointerMove, { passive: true });
    }
    window.addEventListener("resize", handleResize);
    frame = window.requestAnimationFrame(animate);

    return () => {
      if (!isTouchDevice) {
        window.removeEventListener("pointermove", handlePointerMove);
      }
      window.removeEventListener("resize", handleResize);
      window.cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <div
      ref={rootRef}
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-0 overflow-hidden"
    >
      <div className="absolute inset-0 bg-[linear-gradient(180deg,#050816_0%,#040611_40%,#03040b_100%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_14%,rgba(124,77,255,0.12),transparent_28%),radial-gradient(circle_at_78%_18%,rgba(56,189,248,0.08),transparent_26%),radial-gradient(circle_at_50%_70%,rgba(91,124,250,0.06),transparent_34%)]" />
      <div className="absolute inset-0 opacity-[0.12] [background-image:linear-gradient(rgba(255,255,255,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.08)_1px,transparent_1px)] [background-size:84px_84px]" />
      <div
        ref={ambientGlowRef}
        className="absolute left-0 top-0 h-[1040px] w-[1040px] rounded-full bg-[radial-gradient(circle,rgba(139,92,246,0.16),rgba(56,189,248,0.06)_30%,transparent_68%)] blur-3xl will-change-transform"
      />
      <div
        ref={primaryGlowRef}
        className="absolute left-0 top-0 h-[840px] w-[840px] rounded-full bg-[radial-gradient(circle,rgba(139,92,246,0.28),rgba(91,124,250,0.16)_34%,transparent_70%)] blur-3xl will-change-transform"
      />
      <div
        ref={accentGlowRef}
        className="absolute left-0 top-0 h-[440px] w-[440px] rounded-full bg-[radial-gradient(circle,rgba(56,189,248,0.28),transparent_64%)] blur-2xl will-change-transform"
      />
      <div className="absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-[#03040b] to-transparent" />
    </div>
  );
}
