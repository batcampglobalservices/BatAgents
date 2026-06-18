"use client";

import { useEffect, useMemo, useState } from "react";
import { Copy, Lock, Unlock } from "lucide-react";
import { useAccount, useNetwork, useProvider } from "@starknet-react/core";
import { toast } from "sonner";
import type { Agent } from "@/types/agent";
import { DEFAULT_PAYMENT_TOKEN, STARKNET_CHAIN } from "@/lib/starknet-config";
import {
  BATAGENTS_CONTRACT_ADDRESS,
  isContractConfigured,
  isPaymentTokenConfigured,
} from "@/lib/contracts";
import {
  approvePaymentToken,
  getPaymentTokenAllowance,
  getPaymentTokenBalance,
  getPaymentTokenDecimals,
  parseTokenAmount,
} from "@/lib/starknet-token";
import {
  getAgentOnchainStats,
  hasUserHiredAgentOnchain,
  hireAgentOnchain,
} from "@/lib/starknet-contract";
import {
  isValidStarknetAddress,
  getPaymentReceiverAddress,
  shortenAddress,
  waitForStarknetTransaction,
} from "@/lib/starknet-payments";
import {
  markAgentUnlocked,
} from "@/lib/hires";
import {
  createHireRecord,
  createTransactionRecord,
} from "@/lib/db/hires";
import WalletConnectButton from "./wallet-connect-button";

type PaymentUnlockCardProps = {
  agent: Agent;
  onUnlocked?: (txHash: string) => void;
};

type HireStage =
  | "idle"
  | "not-connected"
  | "checking"
  | "not-hired"
  | "approving"
  | "approval-pending"
  | "approval-confirmed"
  | "hiring"
  | "hire-submitted"
  | "waiting-confirmation"
  | "confirmed"
  | "unlocked"
  | "failed";

export default function PaymentUnlockCard({
  agent,
  onUnlocked,
}: PaymentUnlockCardProps) {
  const { account, address, isConnected } = useAccount();
  const { chain } = useNetwork();
  const provider = useProvider();

  const [stage, setStage] = useState<HireStage>("idle");
  const [txHash, setTxHash] = useState<string | null>(null);
  const [copyState, setCopyState] = useState<"idle" | "copied">("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isHiredOnchain, setIsHiredOnchain] = useState(false);
  const [onchainStats, setOnchainStats] = useState<{
    totalHires: string;
    totalEarnings: string;
  } | null>(null);

  const hasContract = isContractConfigured();
  const hasToken = isPaymentTokenConfigured();
  const onchainAgentId = agent.onchainAgentId ?? agent.slug;
  const paymentTokenAddressValid = isValidStarknetAddress(
    DEFAULT_PAYMENT_TOKEN.address,
  );
  const resolvedReceiverAddress = useMemo(
    () => getPaymentReceiverAddress(agent.creatorWallet),
    [agent.creatorWallet],
  );
  const isWrongNetwork =
    Boolean(chain?.network) && chain.network !== STARKNET_CHAIN.network;
  const readyToAttemptHire = Boolean(
    account &&
      address &&
      isConnected &&
      !isWrongNetwork &&
      hasContract &&
      hasToken &&
      paymentTokenAddressValid &&
      (agent.onchainRegistrationTxHash || agent.onchainAgentId) &&
      !isHiredOnchain &&
      stage !== "checking" &&
      stage !== "approving" &&
      stage !== "approval-pending" &&
      stage !== "hiring" &&
      stage !== "hire-submitted" &&
      stage !== "waiting-confirmation",
  );

  useEffect(() => {
    let cancelled = false;

    async function syncOnchainState() {
      if (!address) {
        setIsHiredOnchain(false);
        setOnchainStats(null);
        setStage("not-connected");
        return;
      }

      if (!hasContract) {
        setStage("failed");
        setErrorMessage(
          "BatAgents contract address is not configured. Add NEXT_PUBLIC_BATAGENTS_CONTRACT_ADDRESS after deployment.",
        );
        return;
      }

      if (!hasToken) {
        setStage("failed");
        setErrorMessage(
          "Payment token address is not configured. Add NEXT_PUBLIC_PAYMENT_TOKEN_ADDRESS after deployment.",
        );
        return;
      }

      if (isWrongNetwork) {
        setStage("failed");
        setErrorMessage("Switch your Starknet wallet to Sepolia testnet.");
        return;
      }

      setStage("checking");
      setErrorMessage(null);

      try {
        const providerForReads = provider.provider;
        const hired = await hasUserHiredAgentOnchain({
          provider: providerForReads,
          agentSlug: agent.slug,
          agentOnchainId: onchainAgentId,
          buyerAddress: address,
        });
        const stats = await getAgentOnchainStats(
          providerForReads,
          agent.slug,
          onchainAgentId,
        );

        if (cancelled) {
          return;
        }

        setIsHiredOnchain(hired);
        setOnchainStats(stats);
        setStage(hired ? "unlocked" : "not-hired");
      } catch (error) {
        if (cancelled) {
          return;
        }

        setIsHiredOnchain(false);
        setOnchainStats(null);
        setStage("failed");
        setErrorMessage(
          error instanceof Error
            ? error.message
            : "Checking onchain hire status failed.",
        );
      }
    }

    void syncOnchainState();

    return () => {
      cancelled = true;
    };
  }, [account, address, agent.slug, agent.onchainAgentId, hasContract, hasToken, isWrongNetwork, onchainAgentId, provider]);

  const statusLabel = useMemo(() => {
    if (isHiredOnchain || stage === "unlocked" || stage === "confirmed") {
      return "Chat unlocked by onchain proof";
    }

    switch (stage) {
      case "not-connected":
        return "Wallet not connected";
      case "checking":
        return "Checking onchain hire status";
      case "not-hired":
        return "Not hired yet";
      case "approving":
        return "Approve payment token";
      case "approval-pending":
        return "Approval pending";
      case "approval-confirmed":
        return "Approval confirmed";
      case "hiring":
        return "Hire agent on Starknet Sepolia";
      case "hire-submitted":
        return "Hire transaction submitted";
      case "waiting-confirmation":
        return "Waiting for confirmation";
      case "failed":
        return "Failed or rejected";
      default:
        return "Ready to hire";
    }
  }, [isHiredOnchain, stage]);

  const statusTone =
    isHiredOnchain || stage === "unlocked" || stage === "confirmed"
      ? "bg-emerald-400/10 text-emerald-100"
      : stage === "failed"
        ? "bg-rose-400/10 text-rose-100"
        : stage === "checking" || stage === "waiting-confirmation"
          ? "bg-cyan-400/10 text-cyan-100"
          : "bg-amber-400/10 text-amber-100";

  const paymentStatusText = useMemo(() => {
    if (isHiredOnchain || stage === "unlocked" || stage === "confirmed") {
      return "Contract confirmed your hire. Chat is unlocked by onchain proof.";
    }

    if (stage === "failed") {
      return errorMessage || "The hire flow failed.";
    }

    if (stage === "checking") {
      return "Checking onchain hire status before showing the unlock flow.";
    }

    return "Hire through the BatAgents Cairo contract on Starknet Sepolia.";
  }, [errorMessage, isHiredOnchain, stage]);

  async function handleHire() {
    if (!account || !address) {
      setStage("not-connected");
      setErrorMessage("Connect a Starknet wallet first.");
      return;
    }

    if (!hasContract) {
      setStage("failed");
      setErrorMessage(
        "BatAgents contract address is not configured. Add NEXT_PUBLIC_BATAGENTS_CONTRACT_ADDRESS after deployment.",
      );
      return;
    }

    if (!hasToken) {
      setStage("failed");
      setErrorMessage(
        "Payment token address is not configured. Add NEXT_PUBLIC_PAYMENT_TOKEN_ADDRESS after deployment.",
      );
      return;
    }

    if (isWrongNetwork) {
      setStage("failed");
      setErrorMessage("Switch your Starknet wallet to Sepolia testnet.");
      return;
    }

    if (!agent.onchainRegistrationTxHash && !agent.onchainAgentId) {
      setStage("failed");
      setErrorMessage(
        "This agent is not registered onchain yet. It cannot be hired until the creator registers it.",
      );
      return;
    }

    if (!paymentTokenAddressValid) {
      setStage("failed");
      setErrorMessage("Payment token address is invalid.");
      return;
    }

    if (!resolvedReceiverAddress) {
      setStage("failed");
      setErrorMessage(
        "Receiver address is missing. Set a valid creator wallet or platform receiver address.",
      );
      return;
    }

    setErrorMessage(null);
    const loadingToast = toast.loading("Preparing Starknet Sepolia hire...");

    try {
      const amount = parseTokenAmount(agent.price, getPaymentTokenDecimals());
      const readClient = provider.provider;

      setStage("checking");
      toast.loading("Checking wallet balance and allowance...", { id: loadingToast });
      const balance = await getPaymentTokenBalance(readClient, address);

      if (balance < amount) {
        throw new Error(
          "You need Starknet Sepolia STRK to hire this agent. Fund your wallet using a Starknet Sepolia faucet, then try again.",
        );
      }

      const allowance = await getPaymentTokenAllowance(
        readClient,
        address,
        BATAGENTS_CONTRACT_ADDRESS,
      );

      if (allowance < amount) {
        setStage("approving");
        toast.loading("Approve the payment token in your wallet.", {
          id: loadingToast,
        });
        const approvalTxHash = await approvePaymentToken({
          account,
          spender: BATAGENTS_CONTRACT_ADDRESS,
          amount,
        });
        setTxHash(approvalTxHash);
        setStage("approval-pending");

        const approvalStatus = await waitForStarknetTransaction(
          account,
          approvalTxHash,
        );

        if (approvalStatus !== "accepted") {
          throw new Error(
            approvalStatus === "rejected"
              ? "Token approval was rejected or reverted."
              : "Approval timed out before Starknet Sepolia confirmed it.",
          );
        }

        setStage("approval-confirmed");
      }

      setStage("hiring");
      toast.loading("Submitting hire transaction to Starknet Sepolia...", {
        id: loadingToast,
      });

      const hireTxHash = await hireAgentOnchain({
        account,
        agentSlug: agent.slug,
        agentOnchainId: onchainAgentId,
      });
      setTxHash(hireTxHash);
      setStage("hire-submitted");

      const hireStatus = await waitForStarknetTransaction(account, hireTxHash);

      if (hireStatus !== "accepted") {
        throw new Error(
          hireStatus === "rejected"
            ? "Hire transaction was rejected or reverted."
            : "Hire confirmation timed out on Starknet Sepolia.",
        );
      }

      const verifiedHire = await hasUserHiredAgentOnchain({
        provider: readClient,
        agentSlug: agent.slug,
        agentOnchainId: onchainAgentId,
        buyerAddress: address,
      });

      if (!verifiedHire) {
        throw new Error("Contract did not confirm your hire.");
      }

      const now = new Date().toISOString();
      await createHireRecord({
        id: `hire_${agent.id}_${Date.now()}`,
        agentId: agent.id,
        buyerWallet: address,
        transactionHash: hireTxHash,
        amount: agent.price,
        currency: agent.currency,
        status: "paid",
        createdAt: now,
        source: "batagents-cairo-contract",
      });

      await createTransactionRecord({
        id: `tx_${agent.id}_${Date.now()}`,
        agentId: agent.id,
        agentName: agent.name,
        buyerWallet: address,
        creatorWallet: resolvedReceiverAddress,
        amount: agent.price,
        currency: agent.currency,
        txHash: hireTxHash,
        status: "successful",
        network: "starknet-sepolia",
        source: "batagents-cairo-contract",
        createdAt: now,
      });

      const refreshedStats = await getAgentOnchainStats(
        readClient,
        agent.slug,
        onchainAgentId,
      );
      setIsHiredOnchain(true);
      setOnchainStats(refreshedStats);
      setStage("confirmed");
      setStage("unlocked");
      toast.success("Payment confirmed. Chat is unlocked.", {
        id: loadingToast,
      });
      markAgentUnlocked({
        agentId: agent.id,
        buyerWallet: address,
        transactionHash: hireTxHash,
        createdAt: now,
      });
      onUnlocked?.(hireTxHash);
    } catch (error) {
      setStage("failed");
      const message = error instanceof Error ? error.message : "Hire failed.";
      setErrorMessage(message);
      toast.error(message, { id: loadingToast });
    }
  }

  async function verifyAccessAgain() {
    if (!address) {
      setStage("not-connected");
      setErrorMessage("Connect a Starknet wallet first.");
      return;
    }

    if (!hasContract) {
      setStage("failed");
      setErrorMessage(
        "BatAgents contract address is not configured. Add NEXT_PUBLIC_BATAGENTS_CONTRACT_ADDRESS after deployment.",
      );
      return;
    }

    try {
      setStage("checking");
      setErrorMessage(null);
      const loadingToast = toast.loading("Rechecking contract access...");

      const readClient = provider.provider;
      const verifiedHire = await hasUserHiredAgentOnchain({
        provider: readClient,
        agentSlug: agent.slug,
        agentOnchainId: onchainAgentId,
        buyerAddress: address,
      });

      setIsHiredOnchain(verifiedHire);

      if (verifiedHire) {
        setStage("unlocked");
        toast.success("Contract access confirmed.", { id: loadingToast });
        const refreshedStats = await getAgentOnchainStats(
          readClient,
          agent.slug,
          onchainAgentId,
        );
        setOnchainStats(refreshedStats);
        return;
      }

      setStage("not-hired");
      toast.info("Hire not confirmed yet. Try again after the transaction settles.", {
        id: loadingToast,
      });
      setErrorMessage(
        "Payment transaction was submitted, but contract access was not confirmed yet. Try verifying again.",
      );
    } catch (error) {
      setStage("failed");
      const message = error instanceof Error ? error.message : "Verifying contract access failed.";
      setErrorMessage(message);
      toast.error(message);
    }
  }

  return (
    <section className="rounded-3xl border border-white/10 bg-white/5 p-5 backdrop-blur">
      <p className="text-xs uppercase tracking-[0.35em] text-cyan-300">
        Starknet Sepolia testnet payment
      </p>
      <h2 className="mt-3 text-xl font-semibold text-white">Hire through BatAgents Cairo contract</h2>
      <p className="mt-2 text-sm leading-6 text-slate-300">
        Connect a Starknet wallet, approve the payment token, and hire this agent only
        after the contract confirms your onchain hire.
      </p>

      <div className="mt-5 rounded-2xl border border-white/10 bg-slate-950/70 p-4 text-sm text-slate-300">
        <div className="flex items-center justify-between gap-3">
          <span>Agent fee</span>
          <strong className="text-white">
            {agent.currency} {agent.price}
          </strong>
        </div>
        <div className="mt-3 flex items-center justify-between gap-3">
          <span>Payment asset</span>
          <span className="font-medium text-white">
            {DEFAULT_PAYMENT_TOKEN.symbol} on {STARKNET_CHAIN.name}
          </span>
        </div>
        <div className="mt-3 flex items-center justify-between gap-3">
          <span>Contract</span>
          <span className="font-mono text-xs text-slate-400">
            {hasContract ? shortenAddress(BATAGENTS_CONTRACT_ADDRESS) : "Missing"}
          </span>
        </div>
        <div className="mt-3 flex items-center justify-between gap-3">
          <span>Receiver</span>
          <span className="font-mono text-xs text-slate-400">
            {resolvedReceiverAddress ? shortenAddress(resolvedReceiverAddress) : "Missing"}
          </span>
        </div>
      </div>

      <div className="mt-4">
        <WalletConnectButton />
      </div>

      {isWrongNetwork ? (
        <div className="mt-4 rounded-2xl border border-amber-400/20 bg-amber-400/10 p-4 text-sm text-amber-100">
          Switch your Starknet wallet to Sepolia testnet to hire this agent.
        </div>
      ) : null}

      <details className="mt-4 rounded-2xl border border-white/10 bg-slate-950/70 p-4">
        <summary className="cursor-pointer list-none text-sm font-medium text-white">
          Testing on Starknet Sepolia
        </summary>
        <div className="mt-3 text-sm leading-6 text-slate-300">
          Connect Argent X or Braavos, switch to Starknet Sepolia, fund the wallet with Sepolia STRK,
          then hire the agent. The chat unlocks only after the contract confirms your hire.
        </div>
      </details>

      {!hasContract ? (
        <div className="mt-4 rounded-2xl border border-rose-400/20 bg-rose-400/10 p-4 text-sm text-rose-100">
          BatAgents contract address is not configured. Add
          `NEXT_PUBLIC_BATAGENTS_CONTRACT_ADDRESS` after deployment.
        </div>
      ) : null}

      {!hasToken ? (
        <div className="mt-4 rounded-2xl border border-rose-400/20 bg-rose-400/10 p-4 text-sm text-rose-100">
          Payment token address is not configured. Add
          `NEXT_PUBLIC_PAYMENT_TOKEN_ADDRESS` after deployment.
        </div>
      ) : null}

      <div className="mt-4 rounded-2xl border border-white/10 bg-slate-950/70 p-4">
        <div className="flex items-center justify-between gap-3">
          <span className="text-sm text-slate-300">Status</span>
          <span className={`rounded-full px-3 py-1 text-xs font-medium ${statusTone}`}>
            {statusLabel}
          </span>
        </div>
        <p className="mt-3 text-sm leading-6 text-slate-300">{paymentStatusText}</p>
      </div>

      {onchainStats ? (
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <div className="rounded-2xl border border-white/10 bg-slate-950/70 p-4">
            <p className="text-[11px] uppercase tracking-[0.25em] text-slate-500">
              Contract hires
            </p>
            <p className="mt-2 text-lg font-semibold text-white">{onchainStats.totalHires}</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-slate-950/70 p-4">
            <p className="text-[11px] uppercase tracking-[0.25em] text-slate-500">
              Contract earnings
            </p>
            <p className="mt-2 text-lg font-semibold text-white">
              {onchainStats.totalEarnings}
            </p>
          </div>
        </div>
      ) : null}

      <button
        type="button"
        disabled={!readyToAttemptHire}
        onClick={handleHire}
        className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-full bg-cyan-400 px-4 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:bg-slate-700 disabled:text-slate-300"
      >
        {isHiredOnchain ? (
          <>
            <Unlock className="h-4 w-4" />
            Chat unlocked by onchain proof
          </>
        ) : (
          <>
            <Lock className="h-4 w-4" />
            {stage === "approving"
              ? "Approve payment token"
              : stage === "approval-pending"
                ? "Approval pending"
                : stage === "approval-confirmed"
                  ? "Approval confirmed"
                  : stage === "hiring"
                    ? "Hire agent on Starknet Sepolia"
                    : stage === "hire-submitted"
                      ? "Hire transaction submitted"
                      : stage === "waiting-confirmation"
                        ? "Waiting for confirmation"
                        : "Hire through contract"}
          </>
        )}
      </button>

      {txHash ? (
        <div className="mt-4 rounded-2xl border border-white/10 bg-slate-950/70 p-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-[0.28em] text-slate-500">
                Transaction hash
              </p>
              <p className="mt-2 break-all font-mono text-xs text-slate-200">{txHash}</p>
            </div>
            <button
              type="button"
              onClick={async () => {
                await navigator.clipboard.writeText(txHash);
                setCopyState("copied");
                window.setTimeout(() => setCopyState("idle"), 1600);
              }}
              className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-2 text-xs font-medium text-slate-200 transition hover:border-cyan-400/30 hover:bg-white/10"
            >
              <Copy className="h-3.5 w-3.5" />
              {copyState === "copied" ? "Copied" : "Copy"}
            </button>
          </div>
        </div>
      ) : null}

      {errorMessage ? (
        <div className="mt-4 rounded-2xl border border-rose-400/20 bg-rose-400/10 p-4 text-sm text-rose-100">
          {errorMessage}
        </div>
      ) : null}

      {(stage === "failed" || stage === "not-hired") && hasContract ? (
        <button
          type="button"
          onClick={verifyAccessAgain}
          className="mt-3 inline-flex w-full items-center justify-center rounded-full border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold text-white transition hover:border-cyan-400/30 hover:bg-white/10"
        >
          Verify access again
        </button>
      ) : null}
    </section>
  );
}
