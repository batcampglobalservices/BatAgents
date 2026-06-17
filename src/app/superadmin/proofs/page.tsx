import ProofCard from "@/components/0g/proof-card";
import LiveProofLog from "@/components/0g/live-proof-log";
import { superadminDashboardData } from "@/data/dashboard";

export default function SuperadminProofsPage() {
  return (
    <section className="rounded-[2rem] border border-white/10 bg-white/5 p-6 backdrop-blur">
      <div>
        <p className="text-xs uppercase tracking-[0.3em] text-cyan-300">0G proofs</p>
        <h1 className="mt-2 text-3xl font-semibold text-white">Stored receipts and proof records</h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300">
          These mock receipts are the bridge between agent activity, task completion, and future decentralized storage.
        </p>
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        {superadminDashboardData.proofActivity.map((proof, index) => (
          <ProofCard
            key={`${proof.rootHash}-${index}`}
            proofType={index === 0 ? "Task proof" : "Reputation receipt"}
            proof={proof}
            status="stored"
          />
        ))}
      </div>

      <div className="mt-6">
        <LiveProofLog title="Stored proof records" />
      </div>
    </section>
  );
}
