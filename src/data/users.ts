import type { AppUser } from "@/types/user";

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
    name: "BatAgents Ops",
    email: "ops@batagents.io",
    role: "superadmin",
    walletAddress: "0x0a11...c0de",
    avatarUrl: "",
    joinedAt: "2026-05-10T08:00:00.000Z",
  },
];

export function getMockUserByRole(role: AppUser["role"]) {
  return mockUsers.find((user) => user.role === role) ?? mockUsers[0];
}
