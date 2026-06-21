import React from "react";
import Link from "next/link";

export default function OfflinePage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
      <div className="w-24 h-24 mb-6 rounded-full bg-bg-light flex items-center justify-center border border-border-color">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="48"
          height="48"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="text-primary"
        >
          <path d="M1 1l22 22" />
          <path d="M16.72 11.06A10.94 10.94 0 0 1 19 12.55" />
          <path d="M5 12.55a10.94 10.94 0 0 1 5.17-2.39" />
          <path d="M10.71 5.05A16 16 0 0 1 22.58 9" />
          <path d="M1.42 9a15.91 15.91 0 0 1 4.7-2.88" />
          <path d="M8.53 16.11a6 6 0 0 1 6.95 0" />
          <line x1="12" y1="20" x2="12.01" y2="20" />
        </svg>
      </div>
      <h1 className="text-3xl font-bold mb-4">You are offline</h1>
      <p className="text-text-secondary max-w-md mb-8">
        It looks like you've lost your connection. Bat Agents requires a live network connection to read on-chain agent states and facilitate marketplace actions.
      </p>
      <Link 
        href="/marketplace" 
        className="px-6 py-3 bg-primary text-white rounded-md font-medium hover:bg-opacity-90 transition-colors"
      >
        Try browsing cached marketplace
      </Link>
    </div>
  );
}
