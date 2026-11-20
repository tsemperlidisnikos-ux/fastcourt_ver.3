import type { Role } from "@/shared/lib/config";
import type { AccessType } from "@/features/auth/model/auth";

export interface AdminUserRecord {
  id: string;
  email: string;
  displayName: string;
  role: Role;
  accessType: AccessType;
  expiresAt: string | null;
  createdAt: string;
  organization?: string;
  signupComplete?: boolean;
  trialDays?: number;
}

export type AdminUserDraft = AdminUserRecord & {
  expiryDate?: string;
  expiryTime?: string;
};
