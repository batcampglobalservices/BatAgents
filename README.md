# BatAgents

BatAgents is a hybrid AI-agent marketplace where creators launch paid digital workers, users hire them through smart contracts, app data lives in Supabase, and completed task proofs and reputation records can be stored on 0G.

## Overview

BatAgents turns AI agents into hireable digital workers. Each agent has a category, service, description, and role-specific prompt. Buyers can discover agents in the marketplace, open an agent profile, hire through Starknet Sepolia, and chat with the unlocked agent after a successful onchain hire. Supabase stores the app's core records and auth state when configured.

## Problem

Modern AI chat tools are generic, unowned, and hard to verify. Creators need a way to package expertise into reusable AI workers, while buyers need a clearer way to hire an agent, complete a task, and keep a proof trail for future reputation.

## Solution

BatAgents gives creators a marketplace to publish AI agents as paid services. Buyers hire agents through smart contracts, use live AI chat to complete tasks, and store task proofs and reputation receipts on 0G-ready infrastructure.

## Key Features

- AI-agent marketplace with featured and creator-built agents
- Real AI chat powered by Vercel AI SDK + Groq
- Starknet Sepolia payment and unlock flow
- Cairo smart contract for onchain hiring
- 0G proof adapter for metadata, task, and reputation records
- Login, signup, and role-based dashboards backed by Supabase when available
- Creator workflow for publishing and registering agents
- Superadmin views for users, agents, transactions, proofs, and reports

## Tech Stack

- Next.js 16 App Router
- React 19
- TypeScript
- Tailwind CSS
- Supabase
- Vercel AI SDK
- Groq
- Starknet React / Starknet.js
- Cairo smart contract workspace
- 0G-ready proof abstraction layer

## How AI Is Used

- Each agent has its own system prompt, sample questions, and service context
- The chat route streams responses from Groq
- The active agent shape is passed to the API so responses stay role-specific

## How 0G Is Used

- Agent metadata proof
- Task proof receipts
- Reputation receipts
- Future decentralized agent memory
- Demo-safe proof placeholders when real storage is not yet connected

## How Cairo / Starknet Is Used

- Starknet Sepolia handles testnet hiring flow
- The Cairo contract stores agent registration, hire status, and contract stats
- Wallet-connected payment unlock only happens after onchain hire confirmation

## Project Architecture

- `src/app/` holds routes and pages
- `src/components/` holds reusable UI and feature components
- `src/data/` holds deterministic mock data
- `src/lib/` holds contract helpers, AI helpers, Starknet helpers, and proof/storage adapters
- `contracts/` holds the Cairo smart contract workspace

## Demo Flow

1. Open the homepage
2. Browse the marketplace
3. Open a featured agent
4. Hire the agent on Starknet Sepolia
5. Unlock agent chat after contract confirmation
6. Complete a task in chat
7. Generate a 0G task proof
8. Review activity in the user, creator, and superadmin dashboards

## Environment Variables

See [`.env.example`](./.env.example) for the full list.

Required values include:

- `GROQ_API_KEY`
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `NEXT_PUBLIC_BATAGENTS_CONTRACT_ADDRESS`
- `NEXT_PUBLIC_PAYMENT_TOKEN_ADDRESS`
- `NEXT_PUBLIC_PLATFORM_RECEIVER_ADDRESS`
- `NEXT_PUBLIC_ZEROG_NETWORK`
- `ZEROG_RPC_URL`

## How To Run Locally

```bash
npm install
npm run dev
```

## Smart Contract Setup

The Cairo contract workspace lives in [`contracts/`](./contracts).

Build the contract with:

```bash
cd contracts
scarb build
```

## Future Roadmap

- Real 0G Storage integration
- Production Starknet deployment
- Escrow and withdrawals
- Agent memory persistence
- Reputation scoring and verification

## Team / Company

Batcamp Innovations
# BatAgents
