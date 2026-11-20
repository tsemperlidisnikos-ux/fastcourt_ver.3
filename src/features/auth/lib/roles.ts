import { getAdminBootstrapEmails, ROLES, type Role } from "@/shared/lib/config";
import type { SessionUser } from "@/features/auth/model/auth";

export function isMasterAdminEmail(email: string) {
  const normalized = email.trim().toLowerCase();
  return getAdminBootstrapEmails().includes(normalized);
}

/** Local/demo mode only — master admin password (Coolify without Supabase). */
export function getLocalAdminPassword() {
  return (
    process.env.NEXT_PUBLIC_LOCAL_ADMIN_PASSWORD?.trim() ||
    "FastCourt-Admin-2026!"
  );
}

/** Returns an error message when local master-admin password is wrong. */
export function localAdminPasswordError(email: string, password: string) {
  if (!isMasterAdminEmail(email)) return null;
  if (password === getLocalAdminPassword()) return null;
  return "Incorrect email or password.";
}

export function resolveSignupRole(email: string): Role {
  return isMasterAdminEmail(email) ? ROLES.admin : ROLES.coach;
}

export function isAdminUser(user: SessionUser | null | undefined) {
  return user?.role === ROLES.admin;
}

export function isTeamAdminUser(user: SessionUser | null | undefined) {
  if (!user) return false;
  return user.role === ROLES.teamAdmin || user.orgMemberRole === "team_admin";
}

export function hasFullAccess(user: SessionUser | null | undefined) {
  if (!user) return false;
  if (user.role === ROLES.admin) return true;
  return user.accessType === "unlimited";
}
