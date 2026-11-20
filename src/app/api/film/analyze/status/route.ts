import { NextResponse } from "next/server";
import { getOpenAiVisionModel, isOpenAiConfigured } from "@/shared/lib/ai/env";
import { getRequestAuthUser } from "@/features/auth/lib/api-user";
import type { FilmAnalyzeStatusResponse } from "@/features/film-room/lib/film-clip-analyze-types";
import { isCloudConfigured } from "@/shared/lib/supabase/env";

export const runtime = "nodejs";

export async function GET() {
  if (isCloudConfigured()) {
    const user = await getRequestAuthUser();
    if (!user) {
      return NextResponse.json(
        { ok: false, error: "Sign in required.", code: "unauthorized" },
        { status: 401 },
      );
    }
  }

  return NextResponse.json({
    ok: true,
    configured: isOpenAiConfigured(),
    model: getOpenAiVisionModel(),
  } satisfies FilmAnalyzeStatusResponse);
}
