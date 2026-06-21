// Web3 Security & Operations Data Service

export interface PlatformMetrics {
  totalUsers: number;
  totalCreators: number;
  totalBuyers: number;
  totalAgents: number;
  totalMintedAgents: number;
  totalListings: number;
  totalPurchases: number;
  totalRevenueVolume: string; // in ETH/0G tokens
  activeUsersToday: number;
  suspiciousActivityCount: number;
  pendingReportsCount: number;
}

export interface AdminUser {
  wallet: string;
  displayName: string;
  avatarUrl: string;
  role: "creator" | "buyer" | "admin";
  status: "active" | "flagged" | "suspended" | "banned";
  dateJoined: string;
  lastActivity: string;
  agentsCreated: number;
  purchasesMade: number;
  totalSpent: string;
  totalEarned: string;
  riskScore: number; // 0 to 100
  securityFlagReason?: string;
  adminNotes: string;
}

export interface AdminAgent {
  tokenId: number;
  name: string;
  creator: string;
  category: string;
  mintStatus: "minted" | "pending";
  metadataURI: string;
  metadataHash: string;
  encryptedDataHash: string;
  listingStatus: "listed" | "delisted" | "not_listed";
  price: string;
  usageCount: number;
  reportsCount: number;
  active: boolean;
  createdAt: string;
}

export interface AdminTransaction {
  hash: string;
  wallet: string;
  actionType: "mint" | "list" | "purchase" | "rent" | "ppm_purchase" | "withdraw" | "update" | "credit_consume";
  agentId: number;
  amount: string;
  status: "success" | "failed" | "pending";
  timestamp: string;
}

export interface AdminReport {
  id: string;
  reporter: string;
  targetWalletOrAgent: string; // wallet address or "Agent #{id}"
  targetType: "user" | "agent";
  reason: "scam" | "inappropriate_content" | "payment_dispute" | "malicious_output" | "spam";
  description: string;
  status: "open" | "reviewing" | "resolved" | "dismissed";
  createdDate: string;
  adminNotes: string;
}

export interface SecurityEvent {
  id: string;
  type: string;
  riskLevel: "low" | "medium" | "high" | "critical";
  details: string;
  wallet?: string;
  timestamp: string;
  resolved: boolean;
}

// In-memory data store for the dashboard session
const mockUsers: AdminUser[] = [
  {
    wallet: "0x9e6cc6aE6C7Cb38938745d07f83F7D84dd15a339",
    displayName: "Platform Admin",
    avatarUrl: "https://api.dicebear.com/7.x/identicon/svg?seed=admin",
    role: "admin",
    status: "active",
    dateJoined: "2026-05-10",
    lastActivity: "2026-06-21T17:05:00Z",
    agentsCreated: 0,
    purchasesMade: 0,
    totalSpent: "0.0",
    totalEarned: "0.0",
    riskScore: 0,
    adminNotes: "Platform deployer account. Main superadmin."
  },
  {
    wallet: "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
    displayName: "Alice (Creator)",
    avatarUrl: "https://api.dicebear.com/7.x/bottts/svg?seed=Alice",
    role: "creator",
    status: "active",
    dateJoined: "2026-06-01",
    lastActivity: "2026-06-21T16:45:00Z",
    agentsCreated: 3,
    purchasesMade: 1,
    totalSpent: "0.5",
    totalEarned: "4.8",
    riskScore: 10,
    adminNotes: "Top creator for automated trading scripts. Verified."
  },
  {
    wallet: "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC",
    displayName: "Bob (Buyer)",
    avatarUrl: "https://api.dicebear.com/7.x/bottts/svg?seed=Bob",
    role: "buyer",
    status: "active",
    dateJoined: "2026-06-05",
    lastActivity: "2026-06-21T17:12:00Z",
    agentsCreated: 0,
    purchasesMade: 8,
    totalSpent: "3.2",
    totalEarned: "0.0",
    riskScore: 15,
    adminNotes: "Active developer purchasing agent usage credits."
  },
  {
    wallet: "0x90F79bf6EB2c4f870365E785982E1f101E93b906",
    displayName: "Charlie (Suspicious User)",
    avatarUrl: "https://api.dicebear.com/7.x/bottts/svg?seed=Charlie",
    role: "creator",
    status: "flagged",
    dateJoined: "2026-06-18",
    lastActivity: "2026-06-21T17:10:00Z",
    agentsCreated: 12, // High creations in short time
    purchasesMade: 0,
    totalSpent: "0.0",
    totalEarned: "0.0",
    riskScore: 78,
    securityFlagReason: "Rapid agent creation from new wallet.",
    adminNotes: "Creating multiple copy-paste bots with almost identical prompt hashes. Under review."
  },
  {
    wallet: "0x15d34AAf54a67C689082e3d9d24485e2268749a3",
    displayName: "Eve (Banned User)",
    avatarUrl: "https://api.dicebear.com/7.x/bottts/svg?seed=Eve",
    role: "buyer",
    status: "banned",
    dateJoined: "2026-05-20",
    lastActivity: "2026-06-15T09:12:00Z",
    agentsCreated: 0,
    purchasesMade: 2,
    totalSpent: "1.0",
    totalEarned: "0.0",
    riskScore: 95,
    securityFlagReason: "Payment dispute & double spending exploit attempts.",
    adminNotes: "Repeatedly calling withdraw function directly to attempt gas-draining or re-entry. Suspended indefinitely."
  }
];

const mockAgents: AdminAgent[] = [
  {
    tokenId: 1,
    name: "Galileo Finance Bot",
    creator: "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
    category: "Finance",
    mintStatus: "minted",
    metadataURI: "0g-storage://0x8c7deef49195b05819777ca22ff611681283e35ab04f2f451f28b494d1b82e1f",
    metadataHash: "0x8c7deef49195b05819777ca22ff611681283e35ab04f2f451f28b494d1b82e1f",
    encryptedDataHash: "0xfa11b22e1183e35ab04f2f451f28b494d1b82e1ffa11b22e1183e35ab04f2f45",
    listingStatus: "listed",
    price: "0.5 0G",
    usageCount: 145,
    reportsCount: 0,
    active: true,
    createdAt: "2026-06-02T12:00:00Z"
  },
  {
    tokenId: 2,
    name: "Web Scraper Agent",
    creator: "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
    category: "Data",
    mintStatus: "minted",
    metadataURI: "0g-storage://0x4e2fe11ba183e35ab04f2f451f28b494d1b82e1f8c7deef49195b05819777ca2",
    metadataHash: "0x4e2fe11ba183e35ab04f2f451f28b494d1b82e1f8c7deef49195b05819777ca2",
    encryptedDataHash: "0xdeef49195b05819777ca22ff611681283e35ab04f2f451f28b494d1b82e1f0000",
    listingStatus: "listed",
    price: "0.1 0G",
    usageCount: 88,
    reportsCount: 0,
    active: true,
    createdAt: "2026-06-04T15:30:00Z"
  },
  {
    tokenId: 3,
    name: "AI Prompt Exploit Helper",
    creator: "0x90F79bf6EB2c4f870365E785982E1f101E93b906",
    category: "Utility",
    mintStatus: "minted",
    metadataURI: "0g-storage://0x99238383ee83e35ab04f2f451f28b494d1b82e1f8c7deef49195b05819777ca",
    metadataHash: "0x99238383ee83e35ab04f2f451f28b494d1b82e1f8c7deef49195b05819777ca",
    encryptedDataHash: "0x7ca22ff611681283e35ab04f2f451f28b494d1b82e1ffa11b22e1183e35ab04f",
    listingStatus: "listed",
    price: "1.2 0G",
    usageCount: 5,
    reportsCount: 2,
    active: true,
    createdAt: "2026-06-19T22:15:00Z"
  }
];

const mockTransactions: AdminTransaction[] = [
  {
    hash: "0x789b5324efb12a3cd1095fe6c3d90abf21c5b4e7a835c24e612dfa8f9b1b8cd2",
    wallet: "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC",
    actionType: "purchase",
    agentId: 1,
    amount: "0.5 0G",
    status: "success",
    timestamp: "2026-06-21T17:01:00Z"
  },
  {
    hash: "0x892fa3cd4e835c24e612dfa8f9b1b8cd2789b5324efb12a3cd1095fe6c3d90abf",
    wallet: "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC",
    actionType: "rent",
    agentId: 2,
    amount: "0.3 0G",
    status: "success",
    timestamp: "2026-06-21T16:55:00Z"
  },
  {
    hash: "0xfa11b22e1183e35ab04f2f451f28b494d1b82e1f8c7deef49195b05819777ca2",
    wallet: "0x90F79bf6EB2c4f870365E785982E1f101E93b906",
    actionType: "mint",
    agentId: 3,
    amount: "0.0 0G",
    status: "success",
    timestamp: "2026-06-19T22:10:00Z"
  },
  {
    hash: "0xbc183a216c5b4e7a835c24e612dfa8f9b1b8cd2789b5324efb12a3cd1095fe6c3d",
    wallet: "0x15d34AAf54a67C689082e3d9d24485e2268749a3",
    actionType: "withdraw",
    agentId: 0,
    amount: "2.4 0G",
    status: "failed",
    timestamp: "2026-06-15T09:10:00Z"
  }
];

const mockReports: AdminReport[] = [
  {
    id: "REP-102",
    reporter: "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC",
    targetWalletOrAgent: "Agent #3",
    targetType: "agent",
    reason: "malicious_output",
    description: "The agent generates exploits meant to bypass API filters and scan targets without authorization.",
    status: "open",
    createdDate: "2026-06-20T10:30:00Z",
    adminNotes: "Prompt payload and data hash point to an active script hacking helper. Requires immediate disabling."
  },
  {
    id: "REP-103",
    reporter: "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
    targetWalletOrAgent: "0x90F79bf6EB2c4f870365E785982E1f101E93b906",
    targetType: "user",
    reason: "spam",
    description: "This creator is minting duplicate agents trying to flood the front page marketplace listings.",
    status: "reviewing",
    createdDate: "2026-06-21T02:00:00Z",
    adminNotes: "Checked smart contract creates: wallet has created 12 agents in the past 48 hours. Most listings disabled."
  }
];

const mockSecurityEvents: SecurityEvent[] = [
  {
    id: "SEC-901",
    type: "Rapid Agent Creation",
    riskLevel: "high",
    details: "Wallet 0x90F79bf6EB... created 8 agents within 15 minutes.",
    wallet: "0x90F79bf6EB2c4f870365E785982E1f101E93b906",
    timestamp: "2026-06-21T17:10:00Z",
    resolved: false
  },
  {
    id: "SEC-902",
    type: "Failed Contract Access",
    riskLevel: "medium",
    details: "Unauthorized address tried calling setFactory directly 4 times.",
    wallet: "0x15d34AAf54a67C689082e3d9d24485e2268749a3",
    timestamp: "2026-06-21T16:02:00Z",
    resolved: false
  },
  {
    id: "SEC-903",
    type: "Double Spend Attempt",
    riskLevel: "critical",
    details: "Withdrawal transaction failed due to mismatched internal split math. Reentrancy attempt blocked by guard.",
    wallet: "0x15d34AAf54a67C689082e3d9d24485e2268749a3",
    timestamp: "2026-06-15T09:10:00Z",
    resolved: true
  }
];

export const adminDataService = {
  getPlatformMetrics(): PlatformMetrics {
    const totalSpentVal = mockUsers.reduce((sum, u) => sum + parseFloat(u.totalSpent), 0);
    return {
      totalUsers: mockUsers.length,
      totalCreators: mockUsers.filter(u => u.role === "creator").length,
      totalBuyers: mockUsers.filter(u => u.role === "buyer").length,
      totalAgents: mockAgents.length,
      totalMintedAgents: mockAgents.filter(a => a.mintStatus === "minted").length,
      totalListings: mockAgents.filter(a => a.listingStatus === "listed").length,
      totalPurchases: mockTransactions.filter(t => t.actionType === "purchase" && t.status === "success").length,
      totalRevenueVolume: `${totalSpentVal.toFixed(2)} 0G`,
      activeUsersToday: 3,
      suspiciousActivityCount: mockSecurityEvents.filter(s => !s.resolved).length,
      pendingReportsCount: mockReports.filter(r => r.status === "open" || r.status === "reviewing").length
    };
  },

  getUsers(): AdminUser[] {
    return mockUsers;
  },

  getUserByWallet(wallet: string): AdminUser | undefined {
    return mockUsers.find(u => u.wallet.toLowerCase() === wallet.toLowerCase());
  },

  updateUserStatus(wallet: string, status: "active" | "flagged" | "suspended" | "banned", reason?: string) {
    const user = mockUsers.find(u => u.wallet.toLowerCase() === wallet.toLowerCase());
    if (user) {
      user.status = status;
      if (reason) user.securityFlagReason = reason;
      user.lastActivity = new Date().toISOString();
    }
  },

  updateUserNotes(wallet: string, notes: string) {
    const user = mockUsers.find(u => u.wallet.toLowerCase() === wallet.toLowerCase());
    if (user) {
      user.adminNotes = notes;
    }
  },

  getAgents(): AdminAgent[] {
    return mockAgents;
  },

  getAgentById(tokenId: number): AdminAgent | undefined {
    return mockAgents.find(a => a.tokenId === tokenId);
  },

  toggleAgentActive(tokenId: number, active: boolean) {
    const agent = mockAgents.find(a => a.tokenId === tokenId);
    if (agent) {
      agent.active = active;
    }
  },

  updateAgentListingStatus(tokenId: number, status: "listed" | "delisted" | "not_listed") {
    const agent = mockAgents.find(a => a.tokenId === tokenId);
    if (agent) {
      agent.listingStatus = status;
    }
  },

  getTransactions(): AdminTransaction[] {
    return mockTransactions;
  },

  getReports(): AdminReport[] {
    return mockReports;
  },

  updateReportStatus(reportId: string, status: "open" | "reviewing" | "resolved" | "dismissed", notes?: string) {
    const report = mockReports.find(r => r.id === reportId);
    if (report) {
      report.status = status;
      if (notes) report.adminNotes = notes;
    }
  },

  getSecurityEvents(): SecurityEvent[] {
    return mockSecurityEvents;
  },

  resolveSecurityEvent(eventId: string) {
    const ev = mockSecurityEvents.find(e => e.id === eventId);
    if (ev) {
      ev.resolved = true;
    }
  }
};
