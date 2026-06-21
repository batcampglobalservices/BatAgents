export function isLocalAdminAllowed(address: string | undefined | null): boolean {
  if (!address) return false;
  
  const enableLocalFallback = process.env.NEXT_PUBLIC_ENABLE_LOCAL_ADMIN_ALLOWLIST === "true";
  if (!enableLocalFallback) return false;

  const localWallets = process.env.NEXT_PUBLIC_LOCAL_ADMIN_WALLETS || "";
  const allowedList = localWallets.split(",").map(w => w.trim().toLowerCase()).filter(Boolean);
  
  return allowedList.includes(address.toLowerCase());
}
