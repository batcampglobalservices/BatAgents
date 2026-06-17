export const ERC20_ABI = [
  {
    type: "function",
    name: "approve",
    inputs: [
      {
        name: "spender",
        type: "core::starknet::contract_address::ContractAddress",
      },
      {
        name: "amount",
        type: "core::integer::u256",
      },
    ],
    outputs: [],
    state_mutability: "external",
  },
  {
    type: "function",
    name: "allowance",
    inputs: [
      {
        name: "owner",
        type: "core::starknet::contract_address::ContractAddress",
      },
      {
        name: "spender",
        type: "core::starknet::contract_address::ContractAddress",
      },
    ],
    outputs: [
      {
        type: "core::integer::u256",
      },
    ],
    state_mutability: "view",
  },
  {
    type: "function",
    name: "balanceOf",
    inputs: [
      {
        name: "account",
        type: "core::starknet::contract_address::ContractAddress",
      },
    ],
    outputs: [
      {
        type: "core::integer::u256",
      },
    ],
    state_mutability: "view",
  },
] as const;

