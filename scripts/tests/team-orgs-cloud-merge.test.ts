import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  mergeTeamOrganizations,
  removedTeamOrganizationIds,
  stampChangedTeamOrganizations,
} from "../../src/shared/lib/cloud/merge-team-orgs.ts";
import { newOrganization } from "../../src/features/auth/lib/team-organizations.ts";

describe("team org cloud merge", () => {
  it("keeps the newer updatedAt copy", () => {
    const local = newOrganization({
      name: "Athens BC",
      teamAdminEmail: "admin@athens.gr",
      coachSeats: 3,
      expiresAt: null,
    });
    local.id = "org-1";
    local.updatedAt = "2026-09-01T00:00:00.000Z";
    const remote = {
      ...local,
      name: "Athens BC Cloud",
      updatedAt: "2026-09-11T00:00:00.000Z",
    };
    const merged = mergeTeamOrganizations([local], [remote]);
    assert.equal(merged.length, 1);
    assert.equal(merged[0]!.name, "Athens BC Cloud");
  });

  it("stamps only changed organizations", () => {
    const org = newOrganization({
      name: "PAO",
      teamAdminEmail: "admin@pao.gr",
      coachSeats: 2,
      expiresAt: null,
    });
    org.id = "org-pao";
    org.updatedAt = "2026-08-01T00:00:00.000Z";
    const stamped = stampChangedTeamOrganizations(
      [org],
      [{ ...org, name: "Panathinaikos" }],
      "2026-09-11T12:00:00.000Z",
    );
    assert.equal(stamped[0]!.updatedAt, "2026-09-11T12:00:00.000Z");
    assert.deepEqual(
      removedTeamOrganizationIds([org], []),
      ["org-pao"],
    );
  });
});
