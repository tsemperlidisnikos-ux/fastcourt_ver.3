import { NextResponse } from "next/server";
import { getOpenAiVisionModel, isOpenAiConfigured } from "@/lib/ai/env";
import { getRequestAuthUser } from "@/lib/auth/api-user";
import type { FilmAnalyzeStatusResponse } from "@/lib/film-room/film-clip-analyze-types";
import { isCloudConfigured } from "@/lib/supabase/env";

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
