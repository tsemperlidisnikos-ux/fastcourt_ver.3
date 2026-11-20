"use client";

import { useEffect } from "react";
import { consumeInviteFromUrlHash } from "@/features/auth/lib/team-invite";

export function TeamInviteBootstrap() {
  useEffect(() => {
    consumeInviteFromUrlHash();
  }, []);
  return null;
}
