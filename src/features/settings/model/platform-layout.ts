import type { AppearanceSettings } from "@/features/settings/model/appearance-settings";

/** Admin-controlled layout shared by all coaches. */
export interface PlatformLayoutSettings {
  libraryColumns: AppearanceSettings["libraryColumns"];
  libraryFramesGrid: AppearanceSettings["libraryFramesGrid"];
  designerColumns: AppearanceSettings["designerColumns"];
  updatedAt: string;
}
