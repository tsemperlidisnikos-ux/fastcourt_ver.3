import { Suspense } from "react";
import { LibraryScreen } from "@/features/library/ui/LibraryScreen";

export default function LibraryPage() {
  return (
    <Suspense fallback={<div className="fd-ui p-6">Loading library…</div>}>
      <LibraryScreen />
    </Suspense>
  );
}
