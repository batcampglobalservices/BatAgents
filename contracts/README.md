# BatAgents Cairo Contract

This folder contains the Starknet Cairo contract used by BatAgents for hire and payment state.

## Build

```bash
cd contracts
scarb build
```

## Test

```bash
cd contracts
scarb test
```

## Deploy To Starknet Sepolia

1. Build the contract with `scarb build`.
2. Declare and deploy the compiled class with your chosen Starknet deployment tool.
3. Copy the deployed contract address into `.env.local`.
4. Set the payment token address in `.env.local`.

Required frontend environment variables:

```env
NEXT_PUBLIC_STARKNET_NETWORK=sepolia
NEXT_PUBLIC_BATAGENTS_CONTRACT_ADDRESS=0x02dc821723ec5b9ec51ea02186451718ae25d70d7af078daa18df5c552ed44ed
NEXT_PUBLIC_PAYMENT_TOKEN_ADDRESS=
```

## Flow After Deployment

```txt
Deploy contract
→ Add contract address to .env.local
→ Add payment token address
→ Register agent onchain
→ Hire agent through contract
→ Unlock chat after has_user_hired returns true
```

