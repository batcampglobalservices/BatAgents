import { FlagTriangleRight, ShieldAlert, ShieldCheck } from "lucide-react";
import { mockReports } from "@/data/reports";

export default function SuperadminReportsPage() {
  return (
    <section className="rounded-[2rem] border border-white/10 bg-white/5 p-6 backdrop-blur">
      <div>
        <p className="text-xs uppercase tracking-[0.3em] text-cyan-300">Reports</p>
        <h1 className="mt-2 text-3xl font-semibold text-white">Moderation queue</h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300">
          Review reported agents and resolve concerns before they reach more buyers.
        </p>
      </div>

      <div className="mt-6 space-y-4">
        {mockReports.map((report) => (
          <article key={`${report.reportedAgent}-${report.reporter}`} className="rounded-3xl border border-white/10 bg-slate-950/60 p-5">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div>
                <div className="flex items-center gap-3">
                  <FlagTriangleRight className="h-5 w-5 text-cyan-300" />
                  <div>
                    <p className="text-sm font-semibold text-white">{report.reportedAgent}</p>
                    <p className="mt-1 text-xs text-slate-500">Reported by {report.reporter}</p>
                  </div>
                </div>
                <p className="mt-4 max-w-3xl text-sm leading-6 text-slate-300">{report.reason}</p>
              </div>

              <div className="flex flex-wrap gap-2">
                <Badge label={report.severity} tone="severity" />
                <Badge label={report.status} tone={report.status === "resolved" ? "success" : "neutral"} />
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function Badge({
  label,
  tone,
}: {
  label: string;
  tone: "severity" | "success" | "neutral";
}) {
  const styles =
    tone === "success"
      ? "border-emerald-400/20 bg-emerald-400/10 text-emerald-100"
      : tone === "severity"
        ? "border-amber-400/20 bg-amber-400/10 text-amber-100"
        : "border-cyan-400/20 bg-cyan-400/10 text-cyan-100";

  const Icon = tone === "success" ? ShieldCheck : ShieldAlert;

  return (
    <span className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium ${styles}`}>
      <Icon className="h-3.5 w-3.5" />
      {label}
    </span>
  );
}
