export function isLocalAdminAllowed(address: string | undefined | null): boolean {
  if (!address) return false;
  
  // 1. Check NEXT_PUBLIC_ADMIN_WALLETS (standard admin allowlist)
  const adminWallets = process.env.NEXT_PUBLIC_ADMIN_WALLETS || "";
  const adminList = adminWallets.split(",").map(w => w.trim().toLowerCase()).filter(Boolean);
  if (adminList.includes(address.toLowerCase())) {
    return true;
  }

  // 2. Check NEXT_PUBLIC_LOCAL_ADMIN_WALLETS (local developer fallback)
  const enableLocalFallback = process.env.NEXT_PUBLIC_ENABLE_LOCAL_ADMIN_ALLOWLIST === "true";
  if (!enableLocalFallback) return false;

  const localWallets = process.env.NEXT_PUBLIC_LOCAL_ADMIN_WALLETS || "";
  const allowedList = localWallets.split(",").map(w => w.trim().toLowerCase()).filter(Boolean);
  
  return allowedList.includes(address.toLowerCase());
}
