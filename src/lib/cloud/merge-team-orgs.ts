import type { TeamOrganization } from "@/types/team-org";

function orgUpdatedAt(org: TeamOrganization): string {
  return org.updatedAt || org.createdAt || "";
}

export function mergeTeamOrganizations(
  local: TeamOrganization[],
  remote: TeamOrganization[],
): TeamOrganization[] {
  const byId = new Map<string, TeamOrganization>();
  for (const org of remote) {
    if (org?.id) byId.set(org.id, org);
  }
  for (const org of local) {
    if (!org?.id) continue;
    const existing = byId.get(org.id);
    if (!existing || orgUpdatedAt(org) >= orgUpdatedAt(existing)) {
      byId.set(org.id, org);
    }
  }
  return [...byId.values()].sort((a, b) => a.name.localeCompare(b.name));
}

export function stampChangedTeamOrganizations(
  previous: TeamOrganization[],
  next: TeamOrganization[],
  now = new Date().toISOString(),
): TeamOrganization[] {
  const prevById = new Map(previous.map((org) => [org.id, org]));
  return next.map((org) => {
    const old = prevById.get(org.id);
    if (!old) return { ...org, updatedAt: org.updatedAt || now };
    const oldStamp = old.updatedAt;
    const withoutStamp = { ...org, updatedAt: oldStamp };
    if (JSON.stringify(withoutStamp) === JSON.stringify(old)) {
      return { ...org, updatedAt: old.updatedAt || org.createdAt };
    }
    return { ...org, updatedAt: now };
  });
}

export function removedTeamOrganizationIds(
  previous: TeamOrganization[],
  next: TeamOrganization[],
): string[] {
  const nextIds = new Set(next.map((org) => org.id));
  return previous.filter((org) => !nextIds.has(org.id)).map((org) => org.id);
}
