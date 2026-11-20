"use client";

import { CountersDemoOverlay } from "@/features/demo/ui/CountersDemoOverlay";
import { useCountersDemo } from "@/features/demo/hooks/useCountersDemo";
import "@/features/demo/styles/fc-counters-demo.css";

export function CountersDemoHost() {
  const { open, closeDemo } = useCountersDemo();
  if (!open) return null;
  return <CountersDemoOverlay onClose={closeDemo} />;
}
