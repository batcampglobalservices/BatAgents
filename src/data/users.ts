import type { AppUser } from "@/types/user";

const SUPERADMIN_NAME = process.env.NEXT_PUBLIC_SUPERADMIN_NAME?.trim() || "BatAgents Ops";
const SUPERADMIN_EMAIL = process.env.NEXT_PUBLIC_SUPERADMIN_EMAIL?.trim() || "ops@batagents.io";
const SUPERADMIN_WALLET_ADDRESS =
  process.env.NEXT_PUBLIC_SUPERADMIN_WALLET_ADDRESS?.trim() || "0x0a11...c0de";

export const mockUsers: AppUser[] = [
  {
    id: "user-buyer-001",
    name: "Amina Yusuf",
    email: "amina@demo.batagents",
    role: "buyer",
    walletAddress: "0x91f4...aa21",
    avatarUrl: "",
    joinedAt: "2026-06-01T09:30:00.000Z",
  },
  {
    id: "user-creator-001",
    name: "Daniel Okafor",
    email: "daniel@demo.batagents",
    role: "creator",
    walletAddress: "0x5cc1...9f10",
    avatarUrl: "",
    joinedAt: "2026-05-24T14:10:00.000Z",
  },
  {
    id: "user-admin-001",
    name: SUPERADMIN_NAME,
    email: SUPERADMIN_EMAIL,
    role: "superadmin",
    walletAddress: SUPERADMIN_WALLET_ADDRESS,
    avatarUrl: "",
    joinedAt: "2026-05-10T08:00:00.000Z",
  },
];

export function getMockUserByRole(role: AppUser["role"]) {
  return mockUsers.find((user) => user.role === role) ?? mockUsers[0];
}
