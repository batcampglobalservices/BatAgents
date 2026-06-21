# Bat Agents — Smart Contracts Workspace

This directory contains the smart contracts for Bat Agents built with Solidity, Hardhat, and Foundry.

## Setup

1. Copy the environment variables to the root `.env` or `.env.local` file:
   ```bash
   cp ../.env.example ../.env.local
   ```
2. Fill in the required secrets, particularly `PRIVATE_KEY` for deployment.

## Commands

```bash
# Compile contracts
pnpm compile

# Run tests
pnpm test

# Deploy AdminRegistry to 0G Galileo Testnet
pnpm deploy:admin
```

## After Deployment

Once the `AdminRegistry` contract is successfully deployed, copy the printed contract address and add it to your frontend `.env.local` or environment configuration:

```env
NEXT_PUBLIC_ADMIN_REGISTRY_ADDRESS="0x..."
```
