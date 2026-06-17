"use client";

import type { ComponentType } from "react";
import { useState } from "react";
import {
  BadgeCheck,
  Copy,
  ExternalLink,
  Hash,
  Landmark,
  ShieldCheck,
  CalendarClock,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { ZeroGProof } from "@/types/0g";

type ProofCardProps = {
  proofType: string;
  proof: ZeroGProof;
  status?: "stored" | "verified" | "mock";
  className?: string;
};

const statusStyles: Record<NonNullable<ProofCardProps["status"]>, string> = {
  stored: "bg-emerald-400/10 text-emerald-200 border-emerald-400/30",
  verified: "bg-cyan-400/10 text-cyan-100 border-cyan-400/30",
  mock: "bg-amber-400/10 text-amber-100 border-amber-400/30",
};

export default function ProofCard({
  proofType,
  proof,
  status = "mock",
  className,
}: ProofCardProps) {
  const [copyState, setCopyState] = useState<"idle" | "copied">("idle");
  const proofModeLabel = proof.mode === "real" ? "Stored on 0G" : "0G Testnet Proof";

  return (
    <article
      className={cn(
        "rounded-3xl border border-white/10 bg-slate-950/70 p-5 shadow-[0_20px_80px_rgba(3,7,18,0.32)] backdrop-blur",
        className,
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-cyan-300">
            {proofType}
          </p>
          <h3 className="mt-2 text-lg font-semibold text-white">0G proof receipt</h3>
        </div>
        <span
          className={cn(
            "inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium",
            statusStyles[status],
          )}
        >
          <BadgeCheck className="h-3.5 w-3.5" />
          {status === "stored" ? "Stored" : status === "verified" ? "Verified" : "Mock"}
        </span>
      </div>

      <div className="mt-5 space-y-3 text-sm text-slate-300">
        <Row icon={Hash} label="Root hash" value={proof.rootHash} mono />
        <Row
          icon={Landmark}
          label="Transaction"
          value={proof.txHash ?? "Pending"}
          mono
          copyable={Boolean(proof.txHash)}
        />
        <Row icon={CalendarClock} label="Stored at" value={formatDate(proof.storedAt)} />
        <Row
          icon={ShieldCheck}
          label="Status"
          value={proofModeLabel}
        />
        {proof.url ? (
          <div className="flex items-center justify-between gap-3 rounded-2xl bg-white/5 px-4 py-3">
            <div>
              <p className="text-[11px] uppercase tracking-[0.25em] text-slate-500">
                Explorer
              </p>
              <a
                href={proof.url}
                target="_blank"
                rel="noreferrer"
                className="mt-1 inline-flex items-center gap-2 text-sm text-cyan-300 transition hover:text-cyan-200"
              >
                Open proof
                <ExternalLink className="h-3.5 w-3.5" />
              </a>
            </div>
            <button
              type="button"
              onClick={async () => {
                await navigator.clipboard.writeText(proof.url ?? "");
                setCopyState("copied");
                window.setTimeout(() => setCopyState("idle"), 1600);
              }}
              className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-2 text-xs font-medium text-slate-200 transition hover:border-cyan-400/30 hover:bg-white/10"
            >
              <Copy className="h-3.5 w-3.5" />
              {copyState === "copied" ? "Copied" : "Copy link"}
            </button>
          </div>
        ) : null}
      </div>
    </article>
  );
}

function Row({
  icon: Icon,
  label,
  value,
  mono = false,
  copyable = false,
}: {
  icon: ComponentType<{ className?: string }>;
  label: string;
  value: string;
  mono?: boolean;
  copyable?: boolean;
}) {
  const [copyState, setCopyState] = useState<"idle" | "copied">("idle");

  return (
    <div className="flex items-start gap-3 rounded-2xl bg-white/5 px-4 py-3">
      <Icon className="mt-0.5 h-4 w-4 shrink-0 text-cyan-300" />
      <div className="min-w-0">
        <p className="text-[11px] uppercase tracking-[0.25em] text-slate-500">
          {label}
        </p>
        <div className="mt-1 flex items-start gap-3">
          <p className={cn("break-all text-sm", mono && "font-mono text-xs")}>{value}</p>
          {copyable ? (
            <button
              type="button"
              onClick={async () => {
                await navigator.clipboard.writeText(value);
                setCopyState("copied");
                window.setTimeout(() => setCopyState("idle"), 1600);
              }}
              className="inline-flex shrink-0 items-center gap-1 rounded-full border border-white/10 bg-white/5 px-2 py-1 text-[11px] font-medium text-slate-200 transition hover:border-cyan-400/30 hover:bg-white/10"
            >
              <Copy className="h-3 w-3" />
              {copyState === "copied" ? "Copied" : "Copy"}
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
}

function formatDate(value: string) {
  return new Date(value).toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "UTC",
  });
}
