# AGENTS.md — Batagents UI/UX Rules

## Project identity

Batagents is a Starknet-powered AI agent marketplace where developers can publish, sell, and monetize useful AI agents, while users connect a wallet, pay on testnet, run agents, and view usage/payment history.

## Main goal

Make Batagents look and feel like a production-grade AI + Web3 marketplace, not a demo or hackathon template.

## UI/UX standard

- Dark premium Web3 SaaS style.
- Deep navy/black background.
- Starknet-inspired purple and cyan accents.
- Clean spacing, strong typography, polished cards, readable layouts.
- No emojis in the UI. Use lucide-react icons only.
- Avoid generic “AI website” purple gradient overload.
- Avoid too many glowing effects.
- Avoid childish colors.
- Avoid fake demo buttons.
- Every screen must feel usable and testable by hackathon judges.

## Required user flow

The core product flow must be clear everywhere:

1. Connect wallet
2. Browse agents
3. Open agent details
4. Pay on Starknet testnet
5. Run agent
6. View output, usage history, and transaction hash

## Required UI states

Implement proper states for:

- Wallet disconnected
- Wallet connected
- Loading
- Empty data
- Error
- Payment pending
- Payment success
- Payment failed
- Agent running
- Agent result ready
- Disabled action until payment is confirmed

## Libraries to use

Use:

- shadcn/ui for base components
- Tailwind CSS for styling
- lucide-react for icons
- motion for animations
- sonner for toast notifications
- recharts for dashboard charts

Use Aceternity UI or Magic UI inspiration only for selected premium effects. Do not overuse animation.

## Pages to polish

Prioritize:

- Homepage
- Marketplace page
- Agent details page
- Creator dashboard
- Publish agent page
- Payment confirmation/success state
- User usage history page

## Code safety

Before editing:

- Inspect the existing structure.
- Do not break wallet connection.
- Do not break Starknet payment logic.
- Do not break Supabase/auth/database logic.
- Do not replace real functionality with fake demo states.
- Do not remove environment variable usage.
- Do not hardcode secrets.
- Keep code responsive.
- Keep components reusable.
- Run lint/build after changes when possible.

## Design quality checklist

Before finishing, verify:

- The homepage explains the product in under 10 seconds.
- The marketplace cards look premium and readable.
- The agent details page has clear pricing, creator, rating, description, and CTA.
- Payment states show transaction hash/receipt where available.
- The creator dashboard feels useful, not decorative.
- Mobile layout does not break.