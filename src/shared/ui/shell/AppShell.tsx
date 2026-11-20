"use client";

import { Suspense, useLayoutEffect, useSyncExternalStore } from "react";
import { usePathname } from "next/navigation";
import { TrialExpiredGate } from "@/features/billing/ui/TrialExpiredGate";
import { CountersDemoHost } from "@/features/demo/ui/CountersDemoHost";
import { AppNav } from "@/shared/ui/shell/AppNav";
import { AuthProvider, useAuthBooted } from "@/features/auth/ui/AuthProvider";
import { SettingsProvider } from "@/features/settings/ui/SettingsProvider";
import { AppBootLoading } from "@/shared/ui/kit/AppBootLoading";
import { loginSignedOutUrl } from "@/features/auth/lib/safe-next-path";
import {
  getAuthHydratedSnapshot,
  subscribeAuthHydration,
} from "@/features/auth/lib/hydration";
import { isCloudEnabled } from "@/shared/lib/supabase/client";
import { useAuthStore } from "@/features/auth/model/auth-store";
import { useShareStore } from "@/features/share/model/share-store";

function AppContent({
  children,
  fullBleed,
}: {
  children: React.ReactNode;
  fullBleed?: boolean;
}) {
  if (fullBleed) {
    return <>{children}</>;
  }
  return (
    <div className="flex min-h-screen flex-col bg-fc-body text-fc-text">
      <AppNav />
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-6">{children}</main>
    </div>
  );
}

function AppGate({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const authBooted = useAuthBooted();
  const session = useAuthStore((s) => s.session);
  const playerShareSession = useShareStore((s) => s.playerShareSession);
  const practiceShareSession = useShareStore((s) => s.practiceShareSession);
  const gamePlanShareSession = useShareStore((s) => s.gamePlanShareSession);
  const homeworkShareSession = useShareStore((s) => s.homeworkShareSession);
  const gameDayShareSession = useShareStore((s) => s.gameDayShareSession);
  const cloud = isCloudEnabled();
  const playerShareActive =
    !!playerShareSession ||
    !!practiceShareSession ||
    !!gamePlanShareSession ||
    !!homeworkShareSession ||
    !!gameDayShareSession;

  const hydrated = useSyncExternalStore(
    subscribeAuthHydration,
    getAuthHydratedSnapshot,
    () => false,
  );

  const authReady = cloud ? authBooted : authBooted && hydrated;
  const needsLogin = authReady && !session && !playerShareActive;
  const loginUrl = loginSignedOutUrl(pathname || "/library");

  useLayoutEffect(() => {
    if (!needsLogin) return;
    if (window.location.pathname.startsWith("/login")) return;
    window.location.replace(loginUrl);
  }, [needsLogin, loginUrl]);

  const fullBleed =
    pathname.startsWith("/library") ||
    pathname.startsWith("/designer") ||
    pathname.startsWith("/film-room") ||
    pathname.startsWith("/scouting") ||
    pathname.startsWith("/opponent-scout") ||
    pathname.startsWith("/settings");

  if (!authBooted || (!cloud && !hydrated)) {
    return <AppBootLoading />;
  }

  if (needsLogin) {
    return <AppBootLoading label="Redirecting to login…" />;
  }

  if (playerShareActive && !session) {
    return null;
  }

  return (
    <>
      <TrialExpiredGate />
      <Suspense fallback={null}>
        <CountersDemoHost />
      </Suspense>
      <AppContent fullBleed={fullBleed}>{children}</AppContent>
    </>
  );
}

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <SettingsProvider>
        <AppGate>{children}</AppGate>
      </SettingsProvider>
    </AuthProvider>
  );
}
