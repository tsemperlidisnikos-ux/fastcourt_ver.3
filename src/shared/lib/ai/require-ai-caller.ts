import { consumeRateLimit } from "@/shared/lib/ai/rate-limit";
import { clientIpFromRequest, getRequestAuthUser } from "@/features/auth/lib/api-user";
import { isCloudConfigured } from "@/shared/lib/supabase/env";

export type AiCallerErrorCode = "unauthorized" | "rate_limited";

export type AiCallerResult =
  | { ok: true; key: string }
  | {
      ok: false;
      status: number;
      error: string;
      code: AiCallerErrorCode;
      retryAfterSec?: number;
    };

export async function requireAiCaller(
  request: Request,
  scope: string,
  limit: number,
  windowMs: number,
): Promise<AiCallerResult> {
  let identity: string;

  if (isCloudConfigured()) {
    const user = await getRequestAuthUser();
    if (!user) {
      return {
        ok: false,
        status: 401,
        error: "Sign in required to use AI features.",
        code: "unauthorized",
      };
    }
    identity = `user:${user.id}`;
  } else {
    identity = `ip:${clientIpFromRequest(request)}`;
  }

  const limited = consumeRateLimit(`${scope}:${identity}`, limit, windowMs);
  if (!limited.ok) {
    return {
      ok: false,
      status: 429,
      error: `Too many AI requests. Try again in ${limited.retryAfterSec}s.`,
      code: "rate_limited",
      retryAfterSec: limited.retryAfterSec,
    };
  }

  return { ok: true, key: identity };
}
