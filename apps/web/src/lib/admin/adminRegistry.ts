export const ADMIN_REGISTRY_ADDRESS = (process.env.NEXT_PUBLIC_ADMIN_REGISTRY_ADDRESS || "0x0000000000000000000000000000000000000000") as `0x${string}`;

export const ADMIN_REGISTRY_ABI = [
  {
    inputs: [{ internalType: "address", name: "account", type: "address" }],
    name: "canAccessAdmin",
    outputs: [{ internalType: "bool", name: "", type: "bool" }],
    stateMutability: "view",
    type: "function",
  },
] as const;
