import { ROLES } from "@/shared/lib/config";
import { loadBillingConfig } from "@/features/settings/lib/billing-config";
import { createRandomId } from "@/shared/lib/random-id";
import {
  persistSettingsForUser,
  syncScopedSettingsFromCloud,
} from "@/features/settings/lib/user-settings-sync";
import type { RegisteredDevice } from "@/features/settings/model/user-settings";
import type { SessionUser } from "@/features/auth/model/auth";
import {
  loadScopedUserSettings,
  saveScopedUserSettings,
} from "@/features/settings/lib/user-settings-storage";

const DEVICE_ID_KEY = "fastcourt_device_id_v1";

function isBrowser() {
  return typeof window !== "undefined";
}

export function getOrCreateDeviceId(): string {
  if (!isBrowser()) return "server";
  try {
    const existing = localStorage.getItem(DEVICE_ID_KEY);
    if (existing) return existing;
    const id = createRandomId();
    localStorage.setItem(DEVICE_ID_KEY, id);
    return id;
  } catch {
    return `device-${Date.now()}`;
  }
}

export function deviceLabel(): string {
  if (!isBrowser()) return "Unknown device";
  const ua = navigator.userAgent;
  if (/iPad/i.test(ua)) return "iPad";
  if (/iPhone/i.test(ua)) return "iPhone";
  if (/Android/i.test(ua)) return "Android";
  if (/Windows/i.test(ua)) return "Windows";
  if (/Mac/i.test(ua)) return "Mac";
  return "Browser";
}

export function getRegisteredDevices(userId: string): RegisteredDevice[] {
  const bundle = loadScopedUserSettings(userId);
  return Array.isArray(bundle.devices) ? bundle.devices : [];
}

export function registerDeviceForUser(userId: string): RegisteredDevice[] {
  const deviceId = getOrCreateDeviceId();
  const now = new Date().toISOString();
  const bundle = loadScopedUserSettings(userId);
  const devices = Array.isArray(bundle.devices) ? [...bundle.devices] : [];
  const idx = devices.findIndex((d) => d.id === deviceId);
  const entry: RegisteredDevice = {
    id: deviceId,
    label: deviceLabel(),
    lastSeenAt: now,
  };
  if (idx >= 0) devices[idx] = entry;
  else devices.push(entry);
  saveScopedUserSettings(userId, { ...bundle, devices });
  return devices;
}

export function getDeviceLimitForUser(user: SessionUser): number | null {
  if (user.role === ROLES.admin) return null;
  const billing = loadBillingConfig();
  return Math.max(1, billing.deviceLimitPerCoach ?? 2);
}

export function checkDeviceLimit(
  user: SessionUser,
  devices: RegisteredDevice[],
): string | null {
  const limit = getDeviceLimitForUser(user);
  if (limit == null) return null;

  const deviceId = getOrCreateDeviceId();
  const known = devices.some((d) => d.id === deviceId);
  if (known) return null;
  if (devices.length < limit) return null;

  return `This account is already signed in on ${limit} device(s). Sign out on another device or ask your administrator to increase the limit.`;
}

export function enforceDeviceAccess(user: SessionUser): string | null {
  if (!isBrowser()) return null;
  const devices = registerDeviceForUser(user.id);
  return checkDeviceLimit(user, devices);
}

export async function enforceDeviceAccessAsync(user: SessionUser): Promise<string | null> {
  if (!isBrowser()) return null;

  await syncScopedSettingsFromCloud(user);
  const { syncTeamOrganizationsFromCloud } = await import(
    "@/features/auth/lib/team-organizations"
  );
  await syncTeamOrganizationsFromCloud(user);

  const error = enforceDeviceAccess(user);
  if (error) return error;

  const bundle = loadScopedUserSettings(user.id);
  await persistSettingsForUser(user, bundle);
  return null;
}
