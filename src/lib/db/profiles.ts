import type { AppUser, UserRole } from "@/types/user";
import { getMockUserByRole } from "@/data/users";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";

async function getSupabaseClient() {
  const { getSupabaseServerClient } = await import("@/lib/supabase/server");

  return (
    getSupabaseBrowserClient() ??
    (await getSupabaseServerClient()) ??
    getSupabaseAdminClient()
  );
}

export async function getProfileByEmail(email: string) {
  const client = await getSupabaseClient();

  if (!client) {
    return null;
  }

  const { data } = await client.from("profiles").select("*").eq("email", email).maybeSingle();
  return data ?? null;
}

export async function upsertProfile(input: {
  id: string;
  email: string;
  displayName?: string;
  walletAddress?: string;
  role: UserRole;
}) {
  const client = await getSupabaseClient();

  if (!client) {
    return {
      id: input.id,
      email: input.email,
      display_name: input.displayName ?? input.email,
      wallet_address: input.walletAddress ?? null,
      role: input.role,
      created_at: new Date().toISOString(),
    };
  }

  const { data, error } = await client
    .from("profiles")
    .upsert({
      id: input.id,
      email: input.email,
      display_name: input.displayName ?? input.email,
      wallet_address: input.walletAddress ?? null,
      role: input.role,
    })
    .select("*")
    .single();

  if (error) {
    throw error;
  }

  return data;
}

export function profileToAppUser(profile: {
  id: string;
  email: string | null;
  display_name: string | null;
  wallet_address: string | null;
  role: UserRole;
  created_at: string;
}): AppUser {
  return {
    id: profile.id,
    name: profile.display_name ?? profile.email ?? "BatAgents User",
    email: profile.email ?? "",
    role: profile.role,
    walletAddress: profile.wallet_address ?? undefined,
    avatarUrl: "",
    joinedAt: profile.created_at,
  };
}

export function getFallbackProfile(role: UserRole) {
  return getMockUserByRole(role);
}

export async function getWorkspaceUser(fallbackRole: UserRole) {
  const client = await getSupabaseClient();

  if (!client) {
    return getFallbackProfile(fallbackRole);
  }

  const {
    data: { user },
  } = await client.auth.getUser();

  if (!user) {
    return getFallbackProfile(fallbackRole);
  }

  const email = user.email ?? "";
  const displayName =
    user.user_metadata?.full_name ??
    user.user_metadata?.display_name ??
    email ??
    "BatAgents User";
  const role = (user.user_metadata?.role as UserRole | undefined) ?? fallbackRole;
  const walletAddress = user.user_metadata?.wallet_address as string | undefined;

  const { data: existingProfile } = await client
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();

  if (existingProfile) {
    return profileToAppUser(existingProfile);
  }

  const profile = await upsertProfile({
    id: user.id,
    email,
    displayName,
    walletAddress,
    role,
  });

  return profileToAppUser(profile);
}
