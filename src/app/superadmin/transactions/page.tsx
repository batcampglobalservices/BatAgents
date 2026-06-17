import LivePaymentLedger from "@/components/payments/live-payment-ledger";

export default function SuperadminTransactionsPage() {
  return (
    <section className="space-y-6">
      <div>
        <p className="text-xs uppercase tracking-[0.3em] text-cyan-300">Transactions</p>
        <h1 className="mt-2 text-3xl font-semibold text-white">Payment activity</h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300">
          This live ledger reflects confirmed Starknet Sepolia payments and the
          platform source attached to each hire.
        </p>
      </div>

      <LivePaymentLedger
        title="Transactions ledger"
        description="Confirmed Starknet Sepolia hires and payment records from the live app storage."
        variant="admin"
      />
    </section>
  );
}
