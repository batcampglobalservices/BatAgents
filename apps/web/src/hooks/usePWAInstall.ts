"use client";

import { useState, useEffect } from "react";

// Define the BeforeInstallPromptEvent interface since it's not standard in TS yet
interface BeforeInstallPromptEvent extends Event {
  readonly platforms: Array<string>;
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed',
    platform: string
  }>;
  prompt(): Promise<void>;
}

export function usePWAInstall() {
  const [promptInstall, setPromptInstall] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [hasDismissed, setHasDismissed] = useState(false);

  useEffect(() => {
    // Check if already dismissed
    const dismissed = localStorage.getItem("pwa_install_dismissed") === "true";
    setHasDismissed(dismissed);

    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
    }

    const handler = (e: Event) => {
      e.preventDefault();
      setPromptInstall(e as BeforeInstallPromptEvent);
      setIsInstallable(true);
    };

    window.addEventListener("beforeinstallprompt", handler);

    // Track successful install
    window.addEventListener("appinstalled", () => {
      setIsInstallable(false);
      setIsInstalled(true);
    });

    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const install = async () => {
    if (!promptInstall) return;
    
    promptInstall.prompt();
    const { outcome } = await promptInstall.userChoice;
    
    if (outcome === 'accepted') {
      setIsInstallable(false);
    }
    
    // Clear the saved prompt since it can't be used again
    setPromptInstall(null);
  };

  const dismiss = () => {
    localStorage.setItem("pwa_install_dismissed", "true");
    setHasDismissed(true);
  };

  return {
    isInstallable,
    isInstalled,
    hasDismissed,
    install,
    dismiss,
    showPrompt: isInstallable && !isInstalled && !hasDismissed
  };
}
