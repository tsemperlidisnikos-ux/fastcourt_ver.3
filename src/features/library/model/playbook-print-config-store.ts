"use client";

import { create } from "zustand";
import {
  DEFAULT_PLAYBOOK_PRINT_CONFIG,
  loadPlaybookPrintConfig,
  savePlaybookPrintConfig,
} from "@/features/library/lib/playbook-print-config";
import type { PlaybookPrintConfig } from "@/features/library/model/playbook-print-config";

interface PlaybookPrintConfigState {
  hydrated: boolean;
  config: PlaybookPrintConfig;
  hydrate: () => void;
  setConfig: (next: PlaybookPrintConfig, persist?: boolean) => void;
  resetToDefaults: () => void;
}

export const usePlaybookPrintConfigStore = create<PlaybookPrintConfigState>(
  (set) => ({
    hydrated: false,
    config: DEFAULT_PLAYBOOK_PRINT_CONFIG,

    hydrate: () => {
      const config = loadPlaybookPrintConfig();
      set({ config, hydrated: true });
    },

    setConfig: (next, persist = true) => {
      set({ config: next });
      if (persist) savePlaybookPrintConfig(next);
    },

    resetToDefaults: () => {
      const next = { ...DEFAULT_PLAYBOOK_PRINT_CONFIG };
      set({ config: next });
      savePlaybookPrintConfig(next);
    },
  }),
);
