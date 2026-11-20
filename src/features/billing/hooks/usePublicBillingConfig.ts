"use client";

import { useCallback, useEffect, useState } from "react";
import {
  BILLING_CONFIG_CHANGED_EVENT,
  BILLING_CONFIG_LEGACY_STORAGE_KEY,
  BILLING_CONFIG_STORAGE_KEY,
  DEFAULT_BILLING_CONFIG,
  loadBillingConfig,
} from "@/features/settings/lib/billing-config";
import type { BillingConfig } from "@/features/billing/model/billing-config";

export function usePublicBillingConfig(): BillingConfig {
  const [billing, setBilling] = useState(DEFAULT_BILLING_CONFIG);

  const refresh = useCallback(() => {
    setBilling(loadBillingConfig());
  }, []);

  useEffect(() => {
    refresh();
    const onStorage = (event: StorageEvent) => {
      if (
        !event.key ||
        event.key === BILLING_CONFIG_STORAGE_KEY ||
        event.key === BILLING_CONFIG_LEGACY_STORAGE_KEY
      ) {
        refresh();
      }
    };
    window.addEventListener("storage", onStorage);
    window.addEventListener(BILLING_CONFIG_CHANGED_EVENT, refresh);
    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener(BILLING_CONFIG_CHANGED_EVENT, refresh);
    };
  }, [refresh]);

  return billing;
}
