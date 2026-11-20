import { cloneAction, newObjectId } from "@/features/designer/model/designer/helpers";
import type { DesignerFrame } from "@/features/designer/model/designer";
import { createRandomId } from "@/shared/lib/random-id";

export function cloneFrameForImport(
  source: DesignerFrame,
  options?: { frameName?: string },
): DesignerFrame {
  const idMap = new Map<string, string>();
  const actions = (source.actions ?? []).map((action) => {
    const copy = cloneAction(action);
    idMap.set(action.id, copy.id);
    return copy;
  });

  return {
    ...source,
    id: `frame-${createRandomId()}`,
    name: options?.frameName?.trim() || source.name,
    objects: source.objects.map((object) => ({ ...object, id: newObjectId() })),
    actions,
    actionSequence: (source.actionSequence ?? source.actions.map((row) => row.id))
      .map((id) => idMap.get(id) ?? id)
      .filter((id) => actions.some((action) => action.id === id)),
    readBranch: undefined,
  };
}
