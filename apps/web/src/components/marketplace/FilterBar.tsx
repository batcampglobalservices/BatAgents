import React from "react";
import { Search, SlidersHorizontal } from "lucide-react";

export const FilterBar = () => {
  const categories = ["All", "Productivity", "Coding", "Creative", "Finance", "Gaming"];

  return (
    <div className="glass-panel p-4 rounded-xl border border-white/5 flex flex-col md:flex-row gap-4 items-center justify-between relative z-10">
      {/* Search Input */}
      <div className="relative w-full md:w-96">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
        <input
          type="text"
          placeholder="Search agents by name or key features..."
          className="w-full bg-white/5 border border-white/5 focus:border-brand/40 focus:outline-none rounded-lg py-2 pl-10 pr-4 text-sm text-white placeholder-white/40 transition-colors"
        />
      </div>

      {/* Categories & Filters */}
      <div className="flex items-center gap-3 w-full md:w-auto overflow-x-auto pb-2 md:pb-0 scrollbar-none">
        <div className="flex gap-2">
          {categories.map((category) => (
            <button
              key={category}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                category === "All"
                  ? "bg-brand text-white shadow-[0_0_10px_rgba(234,96,2,0.2)]"
                  : "bg-white/5 border border-white/5 hover:border-brand/20 text-white/70 hover:text-white"
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        <button className="flex items-center gap-1.5 px-3 py-1.5 bg-white/5 border border-white/5 hover:border-brand/20 rounded-lg text-xs font-semibold text-white/70 hover:text-white transition-colors cursor-not-allowed">
          <SlidersHorizontal className="w-3.5 h-3.5" />
          <span>Filters</span>
        </button>
      </div>
    </div>
  );
};
