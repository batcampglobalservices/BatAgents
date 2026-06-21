"use client";

import React, { useEffect, useState } from "react";
import { usePWAInstall } from "@/hooks/usePWAInstall";

export function InstallBanner() {
  const { showPrompt, install, dismiss } = usePWAInstall();
  const [mounted, setMounted] = useState(false);
  const [visitCount, setVisitCount] = useState(0);

  useEffect(() => {
    setMounted(true);
    
    // Only show after the user has visited a couple of times
    // to avoid being annoying on the first load
    const visits = parseInt(localStorage.getItem("pwa_visits") || "0", 10) + 1;
    localStorage.setItem("pwa_visits", visits.toString());
    setVisitCount(visits);
  }, []);

  // Only render on client to avoid hydration mismatch
  // And only show if conditions are met (visited > 1 time and prompt is available)
  if (!mounted || !showPrompt || visitCount <= 1) {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96 bg-bg-light border border-border-color rounded-lg p-4 shadow-xl z-50 animate-in slide-in-from-bottom-5">
      <div className="flex items-start justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-md bg-primary/20 flex items-center justify-center text-primary">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white">Install Bat Agents</h3>
            <p className="text-xs text-text-secondary mt-1">Get quick access to your marketplace and offline resilience.</p>
          </div>
        </div>
        <button 
          onClick={dismiss}
          className="text-text-secondary hover:text-white transition-colors"
          aria-label="Dismiss"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </div>
      <div className="mt-4 flex space-x-2">
        <button 
          onClick={install}
          className="flex-1 bg-primary text-white text-sm font-medium py-2 rounded transition-colors hover:bg-opacity-90"
        >
          Install App
        </button>
      </div>
    </div>
  );
}
