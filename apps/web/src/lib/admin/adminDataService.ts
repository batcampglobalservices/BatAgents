import { createPublicClient, http, formatEther, parseAbiItem } from "viem";
import { ogGalileoTestnet } from "@/config/chains";

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

// Contract configuration details
const NFT_ADDRESS = (process.env.NEXT_PUBLIC_AGENT_NFT_ADDRESS || "0xBA3A7aAf2490bD66CB42ba74e8bf2c55e115E920") as `0x${string}`;
const MARKETPLACE_ADDRESS = (process.env.NEXT_PUBLIC_MARKETPLACE_ADDRESS || "0x378B76beE85dcc4998ED099ED3373C8438e73958") as `0x${string}`;
const ROYALTIES_ADDRESS = (process.env.NEXT_PUBLIC_ROYALTIES_ADDRESS || "0x51aC526CCfc59c02A3f7d7fDF857A7CB902040E4") as `0x${string}`;
const USAGE_TRACKER_ADDRESS = (process.env.NEXT_PUBLIC_USAGE_TRACKER_ADDRESS || "0xe34eE39c57790E05F6fC9E5e5A6C615eA6F4d1B8") as `0x${string}`;

const NFT_ABI = [
  {
    inputs: [{ internalType: "uint256", name: "tokenId", type: "uint256" }],
    name: "getAgent",
    outputs: [
      {
        components: [
          { internalType: "address", name: "creator", type: "address" },
          { internalType: "string", name: "name", type: "string" },
          { internalType: "string", name: "category", type: "string" },
          { internalType: "string", name: "metadataURI", type: "string" },
          { internalType: "bytes32", name: "metadataHash", type: "bytes32" },
          { internalType: "bytes32", name: "encryptedDataHash", type: "bytes32" },
          { internalType: "bool", name: "active", type: "bool" },
          { internalType: "uint256", name: "createdAt", type: "uint256" }
        ],
        internalType: "struct BatAgentNFT.AgentData",
        name: "",
        type: "tuple"
      }
    ],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [{ internalType: "uint256", name: "tokenId", type: "uint256" }],
    name: "ownerOf",
    outputs: [{ internalType: "address", name: "", type: "address" }],
    stateMutability: "view",
    type: "function"
  }
] as const;

const MARKETPLACE_ABI = [
  {
    inputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    name: "listings",
    outputs: [
      { internalType: "address", name: "seller", type: "address" },
      { internalType: "uint256", name: "price", type: "uint256" },
      { internalType: "uint256", name: "hourlyRateWei", type: "uint256" },
      { internalType: "bool", name: "active", type: "bool" }
    ],
    stateMutability: "view",
    type: "function"
  }
] as const;

const ROYALTIES_ABI = [
  {
    inputs: [{ internalType: "address", name: "account", type: "address" }],
    name: "pendingBalanceOf",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [],
    name: "owner",
    outputs: [{ internalType: "address", name: "", type: "address" }],
    stateMutability: "view",
    type: "function"
  }
] as const;

// Module level state
let loaded = false;
let platformMetrics: PlatformMetrics = {
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

let usersList: AdminUser[] = [];
let agentsList: AdminAgent[] = [];
let transactionsList: AdminTransaction[] = [];
let reportsList: AdminReport[] = [];
let securityEventsList: SecurityEvent[] = [];

export const adminDataService = {
  async loadData(force = false): Promise<void> {
    if (loaded && !force) return;

    try {
      const rpcUrl = process.env.NEXT_PUBLIC_ZERO_G_RPC_URL || "https://rpc.ankr.com/0g_galileo_testnet_evm";
      const publicClient = createPublicClient({
        chain: ogGalileoTestnet,
        transport: http(rpcUrl),
      });

      // 1. Fetch current block number to calculate timestamps
      const currentBlock = await publicClient.getBlockNumber();

      // Helper to calculate approximate event timestamp
      const getApproxTimestamp = (blockNum: bigint) => {
        const diff = Number(currentBlock - blockNum);
        return new Date(Date.now() - diff * 2000).toISOString();
      };

      // 2. Query all event logs in parallel
      const [
        usageLogs,
        royaltyLogs,
        withdrawalLogs,
        listedLogs,
        delistedLogs,
        soldLogs,
        hiredLogs,
        subscriptionLogs
      ] = await Promise.all([
        publicClient.getLogs({
          address: USAGE_TRACKER_ADDRESS,
          event: parseAbiItem("event UsageRecorded(uint256 indexed tokenId, address indexed user, uint256 timestamp, uint256 approxTokens)"),
          fromBlock: 0n,
          toBlock: "latest"
        }),
        publicClient.getLogs({
          address: ROYALTIES_ADDRESS,
          event: parseAbiItem("event RoyaltyRecorded(address indexed creator, uint256 grossAmount, uint256 creatorAmount, uint256 platformAmount)"),
          fromBlock: 0n,
          toBlock: "latest"
        }),
        publicClient.getLogs({
          address: ROYALTIES_ADDRESS,
          event: parseAbiItem("event Withdrawal(address indexed account, uint256 amount)"),
          fromBlock: 0n,
          toBlock: "latest"
        }),
        publicClient.getLogs({
          address: MARKETPLACE_ADDRESS,
          event: parseAbiItem("event AgentListed(uint256 indexed tokenId, address indexed seller, uint256 price, uint256 hourlyRateWei)"),
          fromBlock: 0n,
          toBlock: "latest"
        }),
        publicClient.getLogs({
          address: MARKETPLACE_ADDRESS,
          event: parseAbiItem("event AgentDelisted(uint256 indexed tokenId)"),
          fromBlock: 0n,
          toBlock: "latest"
        }),
        publicClient.getLogs({
          address: MARKETPLACE_ADDRESS,
          event: parseAbiItem("event AgentSold(uint256 indexed tokenId, address indexed seller, address indexed buyer, uint256 price)"),
          fromBlock: 0n,
          toBlock: "latest"
        }),
        publicClient.getLogs({
          address: MARKETPLACE_ADDRESS,
          event: parseAbiItem("event AgentHired(uint256 indexed tokenId, address indexed buyer, uint256 durationSeconds, uint256 totalCost)"),
          fromBlock: 0n,
          toBlock: "latest"
        }),
        publicClient.getLogs({
          address: MARKETPLACE_ADDRESS,
          event: parseAbiItem("event SubscriptionPaid(uint256 indexed tokenId, address indexed creator, uint256 expiresAt)"),
          fromBlock: 0n,
          toBlock: "latest"
        })
      ]);

      // 3. Scan Token IDs 1 to 30 for agents
      const scanPromises = Array.from({ length: 30 }, (_, index) => {
        const tokenId = BigInt(index + 1);
        return (async () => {
          try {
            const agentData = await publicClient.readContract({
              address: NFT_ADDRESS,
              abi: NFT_ABI,
              functionName: "getAgent",
              args: [tokenId],
            });

            if (!agentData || !agentData.active) return null;

            let isListed = false;
            let priceStr = "0.00 0G";
            let listingStatus: "listed" | "delisted" | "not_listed" = "not_listed";

            try {
              const [seller, priceVal, hourlyRateWei, active] = await publicClient.readContract({
                address: MARKETPLACE_ADDRESS,
                abi: MARKETPLACE_ABI,
                functionName: "listings",
                args: [tokenId],
              });
              isListed = active;
              priceStr = priceVal > 0n ? `${formatEther(priceVal)} 0G` : `${formatEther(hourlyRateWei)} 0G/hr`;
              listingStatus = isListed ? "listed" : (priceVal > 0n || hourlyRateWei > 0n ? "delisted" : "not_listed");
            } catch (err) {}

            const usageCount = usageLogs.filter(log => log.args.tokenId === tokenId).length;

            return {
              tokenId: Number(tokenId),
              name: agentData.name,
              creator: agentData.creator,
              category: agentData.category,
              mintStatus: "minted" as const,
              metadataURI: agentData.metadataURI,
              metadataHash: agentData.metadataHash,
              encryptedDataHash: agentData.encryptedDataHash,
              listingStatus,
              price: priceStr,
              usageCount,
              reportsCount: 0,
              active: agentData.active,
              createdAt: new Date(Number(agentData.createdAt) * 1000).toISOString()
            } as AdminAgent;
          } catch (err) {
            return null;
          }
        })();
      });

      const scannedAgents = await Promise.all(scanPromises);
      agentsList = scannedAgents.filter((a): a is AdminAgent => a !== null);

      // 4. Construct Transactions List
      const txs: AdminTransaction[] = [];

      listedLogs.forEach(l => {
        const amount = l.args.price && l.args.price > 0n 
          ? `${formatEther(l.args.price)} 0G` 
          : `${formatEther(l.args.hourlyRateWei || 0n)} 0G/hr`;
        txs.push({
          hash: l.transactionHash,
          wallet: l.args.seller || "",
          actionType: "list",
          agentId: Number(l.args.tokenId),
          amount,
          status: "success",
          timestamp: getApproxTimestamp(l.blockNumber)
        });
      });

      delistedLogs.forEach(l => {
        txs.push({
          hash: l.transactionHash,
          wallet: "",
          actionType: "update",
          agentId: Number(l.args.tokenId),
          amount: "Delisted",
          status: "success",
          timestamp: getApproxTimestamp(l.blockNumber)
        });
      });

      soldLogs.forEach(l => {
        txs.push({
          hash: l.transactionHash,
          wallet: l.args.buyer || "",
          actionType: "purchase",
          agentId: Number(l.args.tokenId),
          amount: `${formatEther(l.args.price || 0n)} 0G`,
          status: "success",
          timestamp: getApproxTimestamp(l.blockNumber)
        });
      });

      hiredLogs.forEach(l => {
        txs.push({
          hash: l.transactionHash,
          wallet: l.args.buyer || "",
          actionType: "rent",
          agentId: Number(l.args.tokenId),
          amount: `${formatEther(l.args.totalCost || 0n)} 0G`,
          status: "success",
          timestamp: getApproxTimestamp(l.blockNumber)
        });
      });

      withdrawalLogs.forEach(l => {
        txs.push({
          hash: l.transactionHash,
          wallet: l.args.account || "",
          actionType: "withdraw",
          agentId: 0,
          amount: `${formatEther(l.args.amount || 0n)} 0G`,
          status: "success",
          timestamp: getApproxTimestamp(l.blockNumber)
        });
      });

      subscriptionLogs.forEach(l => {
        txs.push({
          hash: l.transactionHash,
          wallet: l.args.creator || "",
          actionType: "update",
          agentId: Number(l.args.tokenId),
          amount: "Sub Paid",
          status: "success",
          timestamp: getApproxTimestamp(l.blockNumber)
        });
      });

      usageLogs.forEach(l => {
        txs.push({
          hash: l.transactionHash,
          wallet: l.args.user || "",
          actionType: "credit_consume",
          agentId: Number(l.args.tokenId),
          amount: `${l.args.approxTokens || 0n} tokens`,
          status: "success",
          timestamp: getApproxTimestamp(l.blockNumber)
        });
      });

      transactionsList = txs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

      // 5. Construct Unique Users List
      const uniqueWallets = new Set<string>();
      agentsList.forEach(a => uniqueWallets.add(a.creator.toLowerCase()));
      transactionsList.forEach(t => {
        if (t.wallet) uniqueWallets.add(t.wallet.toLowerCase());
      });

      // Get royalties owner for admin role check
      let royaltiesOwner = "";
      try {
        royaltiesOwner = await publicClient.readContract({
          address: ROYALTIES_ADDRESS,
          abi: ROYALTIES_ABI,
          functionName: "owner"
        });
      } catch (err) {}

      const users: AdminUser[] = [];
      uniqueWallets.forEach(wallet => {
        // Calculate Creator/Buyer spent and earned
        const createdCount = agentsList.filter(a => a.creator.toLowerCase() === wallet).length;
        
        let totalSpent = 0n;
        soldLogs.forEach(l => {
          if (l.args.buyer?.toLowerCase() === wallet) totalSpent += l.args.price || 0n;
        });
        hiredLogs.forEach(l => {
          if (l.args.buyer?.toLowerCase() === wallet) totalSpent += l.args.totalCost || 0n;
        });

        let totalEarned = 0n;
        royaltyLogs.forEach(l => {
          if (l.args.creator?.toLowerCase() === wallet) totalEarned += l.args.creatorAmount || 0n;
        });

        const isSuperadmin = royaltiesOwner && royaltiesOwner.toLowerCase() === wallet;
        const role = isSuperadmin ? "admin" : (createdCount > 0 ? "creator" : "buyer");

        // Approximate join date (first log or default)
        const userTxs = transactionsList.filter(t => t.wallet.toLowerCase() === wallet);
        const joinedDate = userTxs.length > 0 ? userTxs[userTxs.length - 1].timestamp : new Date().toISOString();
        const lastAct = userTxs.length > 0 ? userTxs[0].timestamp : new Date().toISOString();

        users.push({
          wallet,
          displayName: `${role.toUpperCase()}-${wallet.slice(2, 8)}`,
          avatarUrl: `https://api.dicebear.com/7.x/bottts/svg?seed=${wallet}`,
          role,
          status: "active",
          dateJoined: joinedDate,
          lastActivity: lastAct,
          agentsCreated: createdCount,
          purchasesMade: userTxs.filter(t => t.actionType === "purchase" || t.actionType === "rent").length,
          totalSpent: formatEther(totalSpent),
          totalEarned: formatEther(totalEarned),
          riskScore: 0,
          adminNotes: ""
        });
      });
      usersList = users;

      // 6. Calculate Platform Metrics
      let grossVolume = 0n;
      royaltyLogs.forEach(l => {
        grossVolume += l.args.grossAmount || 0n;
      });

      // 7. Security Alerts List
      const securityEvents: SecurityEvent[] = [
        {
          id: "sec-1",
          type: "Network Health Check",
          riskLevel: "low",
          details: "Galileo Testnet connection established and responsive.",
          timestamp: new Date().toISOString(),
          resolved: true
        }
      ];

      usageLogs.forEach((log, idx) => {
        if (log.args.approxTokens && log.args.approxTokens > 10000n) {
          securityEvents.push({
            id: `sec-usage-${idx}`,
            type: "High Compute Usage Detected",
            riskLevel: "medium",
            details: `Agent ID #${log.args.tokenId} consumed approx ${log.args.approxTokens} tokens in a single request.`,
            wallet: log.args.user,
            timestamp: getApproxTimestamp(log.blockNumber),
            resolved: false
          });
        }
      });
      securityEventsList = securityEvents;

      platformMetrics = {
        totalUsers: usersList.length,
        totalCreators: usersList.filter(u => u.role === "creator").length,
        totalBuyers: usersList.filter(u => u.role === "buyer").length,
        totalAgents: agentsList.filter(a => a.active).length,
        totalMintedAgents: agentsList.length,
        totalListings: agentsList.filter(a => a.listingStatus === "listed").length,
        totalPurchases: soldLogs.length + hiredLogs.length,
        totalRevenueVolume: `${parseFloat(formatEther(grossVolume)).toFixed(2)} 0G`,
        activeUsersToday: uniqueWallets.size,
        suspiciousActivityCount: securityEventsList.filter(e => !e.resolved).length,
        pendingReportsCount: 0
      };

      loaded = true;
    } catch (err) {
      console.error("Failed to fetch admin on-chain logs:", err);
    }
  },

  getPlatformMetrics(): PlatformMetrics {
    return platformMetrics;
  },

  getUsers(): AdminUser[] {
    return usersList;
  },

  getUserByWallet(wallet: string): AdminUser | undefined {
    return usersList.find(u => u.wallet.toLowerCase() === wallet.toLowerCase());
  },

  updateUserStatus(wallet: string, status: "active" | "flagged" | "suspended" | "banned", reason?: string) {
    const user = usersList.find(u => u.wallet.toLowerCase() === wallet.toLowerCase());
    if (user) {
      user.status = status;
      if (reason) user.securityFlagReason = reason;
    }
  },

  updateUserNotes(wallet: string, notes: string) {
    const user = usersList.find(u => u.wallet.toLowerCase() === wallet.toLowerCase());
    if (user) user.adminNotes = notes;
  },

  getAgents(): AdminAgent[] {
    return agentsList;
  },

  getAgentById(tokenId: number): AdminAgent | undefined {
    return agentsList.find(a => a.tokenId === tokenId);
  },

  toggleAgentActive(tokenId: number, active: boolean) {
    const agent = agentsList.find(a => a.tokenId === tokenId);
    if (agent) agent.active = active;
  },

  updateAgentListingStatus(tokenId: number, status: "listed" | "delisted" | "not_listed") {
    const agent = agentsList.find(a => a.tokenId === tokenId);
    if (agent) agent.listingStatus = status;
  },

  getTransactions(): AdminTransaction[] {
    return transactionsList;
  },

  getReports(): AdminReport[] {
    return reportsList;
  },

  updateReportStatus(reportId: string, status: "open" | "reviewing" | "resolved" | "dismissed", notes?: string) {
    const report = reportsList.find(r => r.id === reportId);
    if (report) {
      report.status = status;
      if (notes) report.adminNotes = notes;
    }
  },

  getSecurityEvents(): SecurityEvent[] {
    return securityEventsList;
  },

  resolveSecurityEvent(eventId: string) {
    const ev = securityEventsList.find(e => e.id === eventId);
    if (ev) ev.resolved = true;
  }
};
