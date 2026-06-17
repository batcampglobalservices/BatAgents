import { agents as staticAgents } from "@/data/agents";
import { mockUsers } from "@/data/users";
import { mockTransactions } from "@/data/transactions";
import { mockReports } from "@/data/reports";
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

export async function getDashboardStats() {
  const client = await getSupabaseClient();

  if (!client) {
    return {
      totalUsers: mockUsers.length,
      totalCreators: mockUsers.filter((user) => user.role === "creator").length,
      totalAgents: staticAgents.length,
      totalHires: staticAgents.reduce((sum, agent) => sum + agent.completedJobs, 0),
      totalTransactions: mockTransactions.length,
      totalProofs: staticAgents.filter((agent) => agent.zeroGProof).length,
      totalReviews: mockReports.length,
    };
  }

  const [users, creators, agents, hires, transactions, proofs, reviews] = await Promise.all([
    client.from("profiles").select("id, role", { count: "exact", head: true }),
    client.from("profiles").select("id", { count: "exact", head: true }).eq("role", "creator"),
    client.from("agents").select("id", { count: "exact", head: true }),
    client.from("hires").select("id", { count: "exact", head: true }),
    client.from("transactions").select("id", { count: "exact", head: true }),
    client.from("proof_events").select("id", { count: "exact", head: true }),
    client.from("reviews").select("id", { count: "exact", head: true }),
  ]);

  return {
    totalUsers: users.count ?? mockUsers.length,
    totalCreators: creators.count ?? mockUsers.filter((user) => user.role === "creator").length,
    totalAgents: agents.count ?? staticAgents.length,
    totalHires: hires.count ?? 0,
    totalTransactions: transactions.count ?? 0,
    totalProofs: proofs.count ?? 0,
    totalReviews: reviews.count ?? 0,
  };
}
