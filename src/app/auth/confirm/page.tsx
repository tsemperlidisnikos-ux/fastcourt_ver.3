import { Suspense } from "react";
import { AuthConfirmClient } from "@/features/auth/ui/AuthConfirmClient";

export default function AuthConfirmPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-[#0f172a] text-[#94a3b8]">
          Confirming your account…
        </div>
      }
    >
      <AuthConfirmClient />
    </Suspense>
  );
}
