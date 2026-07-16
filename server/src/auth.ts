import type { Request } from "express";
import { getServiceSupabase } from "./supabase.js";

export class AuthError extends Error {
  constructor(
    public status: number,
    message: string
  ) {
    super(message);
  }
}

/**
 * Verifies the caller is a signed-in admin. Expects `Authorization: Bearer
 * <supabase access token>`; validates it with Supabase and checks membership
 * in the admin_users table. Throws AuthError on any failure.
 */
export async function requireAdmin(req: Request): Promise<{ id: string; email: string }> {
  const supabase = getServiceSupabase();
  if (!supabase) throw new AuthError(503, "Server auth is not configured.");

  const header = req.header("authorization") || "";
  const token = header.startsWith("Bearer ") ? header.slice(7).trim() : "";
  if (!token) throw new AuthError(401, "Missing bearer token.");

  const { data, error } = await supabase.auth.getUser(token);
  if (error || !data.user) throw new AuthError(401, "Invalid or expired session.");

  const { data: admin } = await supabase
    .from("admin_users")
    .select("user_id")
    .eq("user_id", data.user.id)
    .maybeSingle();
  if (!admin) throw new AuthError(403, "Admin access required.");

  return { id: data.user.id, email: data.user.email ?? "" };
}
