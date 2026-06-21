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

// In-memory data store for the dashboard session is emptied to obey "no mock data" rule
const mockUsers: AdminUser[] = [];
const mockAgents: AdminAgent[] = [];
const mockTransactions: AdminTransaction[] = [];
const mockReports: AdminReport[] = [];
const mockSecurityEvents: SecurityEvent[] = [];

export const adminDataService = {
  getPlatformMetrics(): PlatformMetrics {
    return {
      totalUsers: 0,
      totalCreators: 0,
      totalBuyers: 0,
      totalAgents: 0,
      totalMintedAgents: 0,
      totalListings: 0,
      totalPurchases: 0,
      totalRevenueVolume: "0.00 0G",
      activeUsersToday: 0,
      suspiciousActivityCount: 0,
      pendingReportsCount: 0
    };
  },

  getUsers(): AdminUser[] {
    return mockUsers;
  },

  getUserByWallet(wallet: string): AdminUser | undefined {
    return undefined;
  },

  updateUserStatus(wallet: string, status: "active" | "flagged" | "suspended" | "banned", reason?: string) {},

  updateUserNotes(wallet: string, notes: string) {},

  getAgents(): AdminAgent[] {
    return mockAgents;
  },

  getAgentById(tokenId: number): AdminAgent | undefined {
    return undefined;
  },

  toggleAgentActive(tokenId: number, active: boolean) {},

  updateAgentListingStatus(tokenId: number, status: "listed" | "delisted" | "not_listed") {},

  getTransactions(): AdminTransaction[] {
    return mockTransactions;
  },

  getReports(): AdminReport[] {
    return mockReports;
  },

  updateReportStatus(reportId: string, status: "open" | "reviewing" | "resolved" | "dismissed", notes?: string) {},

  getSecurityEvents(): SecurityEvent[] {
    return mockSecurityEvents;
  },

  resolveSecurityEvent(eventId: string) {}
};
