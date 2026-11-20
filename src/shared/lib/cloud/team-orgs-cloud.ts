import { isAdminUser, isMasterAdminEmail } from "@/features/auth/lib/roles";
import { createClient, isCloudEnabled } from "@/shared/lib/supabase/client";
import type { SessionUser } from "@/features/auth/model/auth";
import type { TeamOrganization } from "@/features/auth/model/team-org";

interface TeamOrganizationRow {
  id: string;
  name: string;
  team_admin_email: string;
  team_admin_user_id: string | null;
  payload: TeamOrganization;
  updated_at: string;
}

function isCloudUser(user: SessionUser): boolean {
  return !user.id.startsWith("local-") && !user.id.startsWith("demo-");
}

function asUuid(id: string | undefined): string | null {
  if (!id) return null;
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
    id,
  )
    ? id
    : null;
}

function tableMissing(message: string) {
  return /team_organizations/i.test(message) && /does not exist/i.test(message);
}

export function userCanPersistTeamOrganization(
  org: TeamOrganization,
  user: SessionUser,
): boolean {
  if (isAdminUser(user) || isMasterAdminEmail(user.email)) return true;
  const email = user.email.trim().toLowerCase();
  if (org.teamAdminEmail.trim().toLowerCase() === email) return true;
  if (org.teamAdminUserId && org.teamAdminUserId === user.id) return true;
  return [...org.coaches, ...org.players].some(
    (member) => member.email.trim().toLowerCase() === email,
  );
}

export function userCanDeleteTeamOrganization(
  org: TeamOrganization,
  user: SessionUser,
): boolean {
  if (isAdminUser(user) || isMasterAdminEmail(user.email)) return true;
  const email = user.email.trim().toLowerCase();
  if (org.teamAdminEmail.trim().toLowerCase() === email) return true;
  return Boolean(org.teamAdminUserId && org.teamAdminUserId === user.id);
}

function rowToOrg(row: TeamOrganizationRow): TeamOrganization | null {
  const payload = row.payload;
  if (!payload || typeof payload !== "object" || !payload.id) return null;
  return {
    ...payload,
    id: row.id,
    name: row.name || payload.name,
    teamAdminEmail: row.team_admin_email || payload.teamAdminEmail,
    teamAdminUserId: row.team_admin_user_id || payload.teamAdminUserId,
    updatedAt: payload.updatedAt || row.updated_at,
  };
}

function orgToRow(org: TeamOrganization, user: SessionUser) {
  const adminUserId =
    asUuid(org.teamAdminUserId) ??
    (org.teamAdminEmail.trim().toLowerCase() === user.email.trim().toLowerCase()
      ? asUuid(user.id)
      : null);
  const stamped: TeamOrganization = {
    ...org,
    teamAdminUserId: adminUserId ?? org.teamAdminUserId,
    updatedAt: org.updatedAt || new Date().toISOString(),
  };
  return {
    id: stamped.id,
    name: stamped.name,
    team_admin_email: stamped.teamAdminEmail.trim().toLowerCase(),
    team_admin_user_id: adminUserId,
    payload: stamped,
    updated_at: stamped.updatedAt,
  };
}

export async function fetchCloudTeamOrganizations(
  user: SessionUser,
): Promise<
  | { ok: true; orgs: TeamOrganization[] }
  | { ok: false; error: string }
> {
  if (!isCloudEnabled() || !isCloudUser(user)) {
    return { ok: true, orgs: [] };
  }
  const supabase = createClient();
  if (!supabase) return { ok: true, orgs: [] };

  const { data, error } = await supabase
    .from("team_organizations")
    .select("id, name, team_admin_email, team_admin_user_id, payload, updated_at");

  if (error) {
    if (tableMissing(error.message)) return { ok: true, orgs: [] };
    return { ok: false, error: error.message };
  }

  const orgs = (data as TeamOrganizationRow[] | null ?? [])
    .map(rowToOrg)
    .filter((org): org is TeamOrganization => org != null);
  return { ok: true, orgs };
}

export async function saveCloudTeamOrganizations(
  user: SessionUser,
  orgs: TeamOrganization[],
  removedIds: string[] = [],
  removedLookup: TeamOrganization[] = [],
): Promise<{ ok: true } | { ok: false; error: string }> {
  if (!isCloudEnabled() || !isCloudUser(user)) return { ok: true };
  const supabase = createClient();
  if (!supabase) return { ok: true };

  const writable = orgs.filter((org) => userCanPersistTeamOrganization(org, user));
  if (writable.length) {
    const { error } = await supabase
      .from("team_organizations")
      .upsert(writable.map((org) => orgToRow(org, user)), { onConflict: "id" });
    if (error) {
      if (tableMissing(error.message)) return { ok: true };
      return { ok: false, error: error.message };
    }
  }

  const removed = removedLookup.filter(
    (org) => removedIds.includes(org.id) && userCanDeleteTeamOrganization(org, user),
  );
  for (const org of removed) {
    const { error } = await supabase.from("team_organizations").delete().eq("id", org.id);
    if (error && !tableMissing(error.message)) {
      return { ok: false, error: error.message };
    }
  }

  return { ok: true };
}
