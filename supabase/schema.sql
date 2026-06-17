-- BatAgents hybrid schema: Supabase for app persistence, 0G for proofs.

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  display_name text,
  wallet_address text,
  role text not null default 'buyer' check (role in ('buyer', 'creator', 'superadmin')),
  created_at timestamptz not null default now()
);

create table if not exists public.agents (
  id uuid primary key,
  slug text unique not null,
  name text not null,
  category text,
  description text,
  service text,
  system_prompt text,
  price numeric,
  currency text not null default 'ETH',
  creator_id uuid references public.profiles(id),
  creator_wallet text,
  status text not null default 'draft',
  zero_g_root_hash text,
  zero_g_tx_hash text,
  zero_g_url text,
  zero_g_mode text,
  zero_g_status text,
  zero_g_stored_at timestamptz,
  onchain_agent_id text,
  onchain_registration_tx_hash text,
  onchain_registered boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.agent_questions (
  id uuid primary key default gen_random_uuid(),
  agent_id uuid references public.agents(id) on delete cascade,
  question text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.hires (
  id uuid primary key,
  agent_id uuid references public.agents(id) on delete cascade,
  buyer_id uuid references public.profiles(id),
  buyer_wallet text,
  creator_wallet text,
  amount numeric,
  currency text not null default 'ETH',
  network text not null default 'starknet-sepolia',
  contract_address text,
  payment_token_address text,
  tx_hash text,
  onchain_confirmed boolean not null default false,
  hired_at timestamptz not null default now()
);

create table if not exists public.transactions (
  id uuid primary key,
  hire_id uuid references public.hires(id) on delete cascade,
  agent_id uuid references public.agents(id),
  buyer_wallet text,
  receiver_wallet text,
  amount numeric,
  currency text,
  network text,
  contract_address text,
  payment_token_address text,
  tx_hash text,
  status text,
  source text not null default 'BatAgents Cairo Contract',
  created_at timestamptz not null default now()
);

create table if not exists public.task_proofs (
  id uuid primary key,
  agent_id uuid references public.agents(id) on delete cascade,
  hire_id uuid references public.hires(id),
  buyer_id uuid references public.profiles(id),
  buyer_wallet text,
  task_summary text,
  result_summary text,
  zero_g_root_hash text,
  zero_g_tx_hash text,
  zero_g_url text,
  zero_g_mode text,
  zero_g_status text,
  zero_g_stored_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.reviews (
  id uuid primary key,
  agent_id uuid references public.agents(id) on delete cascade,
  buyer_id uuid references public.profiles(id),
  buyer_wallet text,
  rating int check (rating between 1 and 5),
  review text,
  created_at timestamptz not null default now()
);

create table if not exists public.reputation_receipts (
  id uuid primary key,
  agent_id uuid references public.agents(id) on delete cascade,
  review_id uuid references public.reviews(id) on delete cascade,
  reviewer_wallet text,
  rating int check (rating between 1 and 5),
  review text,
  zero_g_root_hash text,
  zero_g_tx_hash text,
  zero_g_url text,
  zero_g_mode text,
  zero_g_status text,
  zero_g_stored_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.proof_events (
  id uuid primary key,
  proof_type text,
  agent_id uuid references public.agents(id),
  related_id uuid,
  root_hash text,
  tx_hash text,
  url text,
  mode text,
  status text,
  stored_at timestamptz,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;
alter table public.agents enable row level security;
alter table public.hires enable row level security;
alter table public.transactions enable row level security;
alter table public.task_proofs enable row level security;
alter table public.reviews enable row level security;
alter table public.reputation_receipts enable row level security;
alter table public.proof_events enable row level security;

create policy "Public read agents"
on public.agents for select
using (status = 'published' or status = 'active');

create policy "Authenticated insert agents"
on public.agents for insert
to authenticated
with check (true);

create policy "Authenticated update own agents"
on public.agents for update
to authenticated
using (creator_id = auth.uid());

create policy "Users read own profiles"
on public.profiles for select
to authenticated
using (id = auth.uid());

create policy "Users update own profiles"
on public.profiles for update
to authenticated
using (id = auth.uid());

create policy "Users read own hires"
on public.hires for select
to authenticated
using (buyer_id = auth.uid());

create policy "Creators read agent hires"
on public.hires for select
to authenticated
using (
  exists (
    select 1 from public.agents
    where agents.id = hires.agent_id
      and agents.creator_id = auth.uid()
  )
);

create policy "Users read own transactions"
on public.transactions for select
to authenticated
using (buyer_wallet is not null);

create policy "Users read own task proofs"
on public.task_proofs for select
to authenticated
using (buyer_id = auth.uid());

create policy "Creators read task proofs"
on public.task_proofs for select
to authenticated
using (
  exists (
    select 1 from public.agents
    where agents.id = task_proofs.agent_id
      and agents.creator_id = auth.uid()
  )
);

create policy "Users read own reviews"
on public.reviews for select
to authenticated
using (buyer_id = auth.uid());

create policy "Creators read reputation receipts"
on public.reputation_receipts for select
to authenticated
using (
  exists (
    select 1 from public.agents
    where agents.id = reputation_receipts.agent_id
      and agents.creator_id = auth.uid()
  )
);

create policy "Service role can manage all records"
on public.proof_events
for all
to service_role
using (true)
with check (true);

-- MVP-safe: expand production RLS with creator ownership, superadmin bypass, and
-- more granular insert/update rules as deployment hardening continues.
