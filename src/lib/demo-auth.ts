import type { UserRole } from "@/types/user";

export const DEMO_ROLE_STORAGE_KEY = "batagents-demo-role";
export const DEMO_EMAIL_STORAGE_KEY = "batagents-demo-email";
const DEMO_ROLE_CHANGE_EVENT = "batagents-demo-role-change";

function notifyDemoRoleChange() {
  if (typeof window === "undefined") {
    return;
  }

  window.dispatchEvent(new Event(DEMO_ROLE_CHANGE_EVENT));
}

export function getDashboardPathForRole(role: UserRole) {
  if (role === "buyer") {
    return "/dashboard/user";
  }

  if (role === "creator") {
    return "/dashboard/creator";
  }

  return "/superadmin";
}

export function getRoleLabel(role: UserRole) {
  if (role === "buyer") {
    return "Buyer";
  }

  if (role === "creator") {
    return "Creator";
  }

  return "Superadmin";
}

export function getStoredDemoRole() {
  if (typeof window === "undefined") {
    return null;
  }

  const value = window.localStorage.getItem(DEMO_ROLE_STORAGE_KEY);

  if (value === "buyer" || value === "creator" || value === "superadmin") {
    return value;
  }

  return null;
}

export function setStoredDemoRole(role: UserRole, email?: string) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(DEMO_ROLE_STORAGE_KEY, role);
  if (email) {
    window.localStorage.setItem(DEMO_EMAIL_STORAGE_KEY, email);
  }

  notifyDemoRoleChange();
}

export function clearStoredDemoRole() {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.removeItem(DEMO_ROLE_STORAGE_KEY);
  window.localStorage.removeItem(DEMO_EMAIL_STORAGE_KEY);
  notifyDemoRoleChange();
}

export function subscribeDemoRoleChange(onStoreChange: () => void) {
  if (typeof window === "undefined") {
    return () => {};
  }

  window.addEventListener(DEMO_ROLE_CHANGE_EVENT, onStoreChange);
  window.addEventListener("storage", onStoreChange);

  return () => {
    window.removeEventListener(DEMO_ROLE_CHANGE_EVENT, onStoreChange);
    window.removeEventListener("storage", onStoreChange);
  };
}
