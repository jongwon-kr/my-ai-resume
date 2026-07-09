import type { User } from "@supabase/supabase-js";

export function getUserRole(user: User | null | undefined) {
  const role = user?.app_metadata?.role;
  return typeof role === "string" ? role : null;
}

export function isAdminUser(user: User | null | undefined) {
  return getUserRole(user) === "admin";
}
