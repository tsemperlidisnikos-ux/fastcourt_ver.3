"use client";

import { useEffect } from "react";
import { useAuthStore } from "@/features/auth/model/auth-store";
import { useLibraryStore } from "@/features/library/model/library-store";
import { useSettingsStore } from "@/features/settings/model/settings-store";
import { isAdminUser, isTeamAdminUser } from "@/features/auth/lib/roles";
import { AdminSettingsPanel } from "@/features/settings/ui/AdminSettingsPanel";
import { CoachSettingsPanel } from "@/features/settings/ui/CoachSettingsPanel";
import { TeamAdminSettingsPanel } from "@/features/settings/ui/TeamAdminSettingsPanel";

export default function SettingsPage() {
  const session = useAuthStore((s) => s.session);
  const hydrated = useLibraryStore((s) => s.hydrated);
  const refresh = useLibraryStore((s) => s.refresh);
  const settingsHydrated = useSettingsStore((s) => s.hydrated);

  useEffect(() => {
    if (!hydrated) void refresh();
  }, [hydrated, refresh]);

  if (!session || !settingsHydrated) return null;

  if (isAdminUser(session.user)) {
    return <AdminSettingsPanel session={session} />;
  }

  if (isTeamAdminUser(session.user)) {
    return <TeamAdminSettingsPanel session={session} />;
  }

  return <CoachSettingsPanel session={session} />;
}
