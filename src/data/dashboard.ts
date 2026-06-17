import { agents } from "@/data/agents";
import { mockReports } from "@/data/reports";
import { mockTransactions } from "@/data/transactions";
import { mockUsers, getMockUserByRole } from "@/data/users";
import { buildReputationReceipt, buildTaskProof } from "@/lib/0g";

const buyer = getMockUserByRole("buyer");
const creator = getMockUserByRole("creator");
const superadmin = getMockUserByRole("superadmin");
const firstAgent = agents[0] ?? null;
const secondAgent = agents[1] ?? firstAgent;
const fourthAgent = agents[3] ?? firstAgent;
const sixthAgent = agents[5] ?? fourthAgent ?? firstAgent;

export const buyerDashboardData = {
  stats: {
    hiredAgents: 4,
    completedTasks: 9,
    reviewsSubmitted: 6,
    zeroGProofs: 5,
  },
  hiredAgents: agents.slice(0, 3).map((agent) => ({
    agent,
    hiredAt: "2026-06-15T12:00:00.000Z",
    status: "active" as const,
    lastChat: `Latest task work completed with ${agent.name}.`,
  })),
  recentChats: firstAgent && fourthAgent && sixthAgent ? [
    {
      agent: firstAgent.name,
      summary: "Pitch tightened to a stronger one-liner.",
      updatedAt: "2026-06-16T12:30:00.000Z",
    },
    {
      agent: fourthAgent.name,
      summary: "Research brief completed with takeaways.",
      updatedAt: "2026-06-15T16:20:00.000Z",
    },
    {
      agent: sixthAgent.name,
      summary: "Wallet-based product flow clarified.",
      updatedAt: "2026-06-14T14:05:00.000Z",
    },
  ] : [],
  completedTasks: firstAgent && fourthAgent ? [
    {
      id: "task-001",
      agentName: firstAgent.name,
      result: "Pitch deck trimmed and clarified for investors.",
      completedAt: "2026-06-16T12:15:00.000Z",
      proof: buildTaskProof({
        id: "task-001",
        agentId: firstAgent.id,
        buyerWallet: buyer.walletAddress ?? "0x0g_buyer",
        taskSummary: "Pitch deck review",
        resultSummary: "Pitch deck trimmed and clarified for investors.",
        paymentTxHash: "0x0g_payment_user_001",
        proofRootHash: "0x0g_user_task_001",
        completedAt: "2026-06-16T12:15:00.000Z",
      }),
    },
    {
      id: "task-002",
      agentName: fourthAgent.name,
      result: "Research brief captured the strongest market angles.",
      completedAt: "2026-06-15T16:20:00.000Z",
      proof: buildTaskProof({
        id: "task-002",
        agentId: fourthAgent.id,
        buyerWallet: buyer.walletAddress ?? "0x0g_buyer",
        taskSummary: "Research brief",
        resultSummary: "Research brief captured the strongest market angles.",
        paymentTxHash: "0x0g_payment_user_002",
        proofRootHash: "0x0g_user_task_002",
        completedAt: "2026-06-15T16:20:00.000Z",
      }),
    },
  ] : [],
  reviews: firstAgent && sixthAgent ? [
    {
      agent: firstAgent.name,
      rating: 5,
      review: "Fast, direct, and useful feedback.",
    },
    {
      agent: sixthAgent.name,
      rating: 4,
      review: "Clean explanation of the wallet flow.",
    },
  ] : [],
  zeroGProofs: agents
    .filter((agent) => agent.zeroGProof)
    .slice(0, 2)
    .map((agent) => ({
      agentName: agent.name,
      proof: agent.zeroGProof!,
    })),
  paymentHistory: mockTransactions.slice(0, 3),
  recommendedAgents: agents.slice(3, 6),
};

export const creatorDashboardData = {
  stats: {
    totalAgents: agents.length,
    totalHires: agents.reduce((sum, agent) => sum + agent.completedJobs, 0),
    totalEarnings: agents.reduce((sum, agent) => sum + agent.price * agent.completedJobs, 0),
    averageRating:
      agents.length > 0
        ? agents.reduce((sum, agent) => sum + agent.rating, 0) / agents.length
        : 0,
    metadataProofs: agents.filter((agent) => agent.zeroGProof).length,
    taskProofReceipts: agents.length * 4,
  },
  recentActivity: agents.length > 0 ? [
    `${agents[0].name} got new hires this week.`,
    `${agents[1]?.name ?? agents[0].name} received a proof receipt.`,
    `${agents[2]?.name ?? agents[0].name} earned a new storage proof.`,
  ] : [],
  agentRows: agents.map((agent, index) => ({
    id: agent.id,
    name: agent.name,
    category: agent.category,
    price: `${agent.currency} ${agent.price}`,
    hires: agent.completedJobs,
    rating: agent.rating,
    earnings: `${Math.round(agent.price * agent.completedJobs)} ${agent.currency}`,
    proofStatus: agent.zeroGProof ? "Stored on 0G" : "Pending",
    status: index === 2 ? "Paused" : "Active",
  })),
  proofHighlights: agents
    .filter((agent) => agent.zeroGProof)
    .slice(0, 3)
    .map((agent) => ({
      agentName: agent.name,
      proof: agent.zeroGProof!,
    })),
  registrationReceipts: agents.slice(0, 4).map((agent, index) => ({
    agentName: agent.name,
    txHash: `0x0g_reg_${agent.id}_${index.toString().padStart(2, "0")}`,
    status: index === 2 ? "pending" : "confirmed",
  })),
};

export const superadminDashboardData = {
  stats: {
    totalUsers: mockUsers.length + 4,
    totalCreators: mockUsers.filter((user) => user.role === "creator").length,
    totalAgents: agents.length,
    totalHires: agents.reduce((sum, agent) => sum + agent.completedJobs, 0),
    totalVolume: mockTransactions.length * 12,
    totalZeroGProofs: agents.filter((agent) => agent.zeroGProof).length + 5,
    flaggedAgents: 2,
    pendingReviews: mockReports.filter((report) => report.status !== "resolved").length,
  },
  recentUsers: mockUsers.map((user) => ({
    name: user.name,
    email: user.email,
    role: user.role,
    joinedAt: user.joinedAt,
  })),
  recentAgents: agents.slice(0, 4),
  recentTransactions: mockTransactions,
  proofActivity: [
    ...(firstAgent
      ? [
          buildTaskProof({
            id: "superadmin-task-001",
            agentId: firstAgent.id,
            buyerWallet: buyer.walletAddress ?? "0x0g_buyer",
            taskSummary: "Pitch review",
            resultSummary: "Proof receipt stored for recent task.",
            paymentTxHash: "0x0g_tx_superadmin_task_001",
            proofRootHash: "0x0g_superadmin_task_001",
            completedAt: "2026-06-16T12:00:00.000Z",
          }),
        ]
      : []),
    ...(secondAgent
      ? [
          buildReputationReceipt({
            id: "superadmin-rep-001",
            agentId: secondAgent.id,
            rating: 5,
            review: "Great buyer feedback captured in proof.",
            reviewerWallet: buyer.walletAddress ?? "0x0g_buyer",
            proofRootHash: "0x0g_superadmin_rep_001",
            createdAt: "2026-06-16T12:20:00.000Z",
          }),
        ]
      : []),
  ],
  reportsQueue: mockReports,
  highlightedUsers: [buyer, creator, superadmin],
};
