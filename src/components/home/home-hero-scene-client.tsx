"use client";

import dynamic from "next/dynamic";

const HomeHeroScene = dynamic(() => import("./home-hero-scene"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full min-h-[420px] w-full items-center justify-center">
      <div className="h-40 w-40 rounded-full border border-[#8b5cf6]/30 bg-[#8b5cf6]/10 shadow-[0_0_80px_rgba(139,92,246,0.25)]" />
    </div>
  ),
});

export default function HomeHeroSceneClient() {
  return <HomeHeroScene />;
}
