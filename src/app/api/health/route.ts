import { NextResponse } from "next/server";
import { APP_BUILD, APP_NAME } from "@/shared/lib/config";
import { isCloudConfigured } from "@/shared/lib/supabase/env";

export const runtime = "nodejs";

export async function GET() {
  return NextResponse.json({
    ok: true,
    app: APP_NAME,
    build: APP_BUILD,
    cloudConfigured: isCloudConfigured(),
  });
}
