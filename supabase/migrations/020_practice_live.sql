-- FastCourt: cross-device Practice Live sync (share-link staff / bench tablets)

CREATE TABLE IF NOT EXISTS public.practice_live (
  session_id text PRIMARY KEY,
  sync_token text NOT NULL,
  current_index integer NOT NULL DEFAULT 0,
  completed jsonb NOT NULL DEFAULT '[]'::jsonb,
  live_call text,
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS practice_live_token_idx ON public.practice_live (sync_token);

ALTER TABLE public.practice_live ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS practice_live_deny_direct ON public.practice_live;
CREATE POLICY practice_live_deny_direct ON public.practice_live
  FOR ALL
  USING (false);

CREATE OR REPLACE FUNCTION public.set_practice_live(
  p_session_id text,
  p_sync_token text,
  p_current_index integer,
  p_completed jsonb,
  p_live_call text
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_existing_token text;
  v_now timestamptz := now();
  v_completed jsonb;
  v_call text;
BEGIN
  IF length(trim(p_session_id)) < 3
    OR length(trim(p_sync_token)) < 8
    OR p_current_index IS NULL
    OR p_current_index < 0 THEN
    RETURN jsonb_build_object('ok', false, 'error', 'invalid_args');
  END IF;

  v_completed := CASE
    WHEN jsonb_typeof(coalesce(p_completed, '[]'::jsonb)) = 'array' THEN coalesce(p_completed, '[]'::jsonb)
    ELSE '[]'::jsonb
  END;
  v_call := nullif(trim(coalesce(p_live_call, '')), '');

  SELECT sync_token
  INTO v_existing_token
  FROM public.practice_live
  WHERE session_id = trim(p_session_id);

  IF v_existing_token IS NULL THEN
    INSERT INTO public.practice_live (
      session_id, sync_token, current_index, completed, live_call, updated_at
    )
    VALUES (
      trim(p_session_id), trim(p_sync_token), p_current_index, v_completed, v_call, v_now
    );
  ELSIF v_existing_token = trim(p_sync_token) THEN
    UPDATE public.practice_live
    SET current_index = p_current_index,
        completed = v_completed,
        live_call = v_call,
        updated_at = v_now
    WHERE session_id = trim(p_session_id);
  ELSE
    RETURN jsonb_build_object('ok', false, 'error', 'token_mismatch');
  END IF;

  RETURN jsonb_build_object(
    'ok', true,
    'currentIndex', p_current_index,
    'completed', v_completed,
    'liveCall', v_call,
    'updatedAt', v_now
  );
END;
$$;

CREATE OR REPLACE FUNCTION public.get_practice_live(
  p_session_id text,
  p_sync_token text
)
RETURNS jsonb
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT jsonb_build_object(
    'ok', true,
    'currentIndex', current_index,
    'completed', completed,
    'liveCall', live_call,
    'updatedAt', updated_at
  )
  FROM public.practice_live
  WHERE session_id = trim(p_session_id)
    AND sync_token = trim(p_sync_token)
  LIMIT 1;
$$;

REVOKE ALL ON FUNCTION public.set_practice_live(text, text, integer, jsonb, text) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.get_practice_live(text, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.set_practice_live(text, text, integer, jsonb, text) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_practice_live(text, text) TO anon, authenticated;
