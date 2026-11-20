import { Suspense } from "react";
import { DesignerScreen } from "@/features/designer/ui/DesignerScreen";

export default function DesignerPage() {
  return (
    <Suspense
      fallback={
        <div
          id="screen-designer"
          className="fd-play-editor-pane fd-ui designer-route active"
        >
          <p className="p-6 text-sm text-[#64748b]">Loading designer…</p>
        </div>
      }
    >
      <DesignerScreen />
    </Suspense>
  );
}
