-- FastCourt: cloud copy of team organizations (branding, seats, members)
-- Safe if the table already exists from an older/partial schema.

CREATE TABLE IF NOT EXISTS public.team_organizations (
  id text PRIMARY KEY
);

ALTER TABLE public.team_organizations
  ADD COLUMN IF NOT EXISTS name text;
ALTER TABLE public.team_organizations
  ADD COLUMN IF NOT EXISTS team_admin_email text;
ALTER TABLE public.team_organizations
  ADD COLUMN IF NOT EXISTS team_admin_user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL;
ALTER TABLE public.team_organizations
  ADD COLUMN IF NOT EXISTS payload jsonb;
ALTER TABLE public.team_organizations
  ADD COLUMN IF NOT EXISTS updated_at timestamptz;

UPDATE public.team_organizations SET name = coalesce(name, '') WHERE name IS NULL;
UPDATE public.team_organizations SET team_admin_email = coalesce(team_admin_email, '') WHERE team_admin_email IS NULL;
UPDATE public.team_organizations SET payload = coalesce(payload, '{}'::jsonb) WHERE payload IS NULL;
UPDATE public.team_organizations SET updated_at = coalesce(updated_at, now()) WHERE updated_at IS NULL;

ALTER TABLE public.team_organizations ALTER COLUMN name SET DEFAULT '';
ALTER TABLE public.team_organizations ALTER COLUMN name SET NOT NULL;
ALTER TABLE public.team_organizations ALTER COLUMN team_admin_email SET DEFAULT '';
ALTER TABLE public.team_organizations ALTER COLUMN team_admin_email SET NOT NULL;
ALTER TABLE public.team_organizations ALTER COLUMN payload SET DEFAULT '{}'::jsonb;
ALTER TABLE public.team_organizations ALTER COLUMN payload SET NOT NULL;
ALTER TABLE public.team_organizations ALTER COLUMN updated_at SET DEFAULT now();
ALTER TABLE public.team_organizations ALTER COLUMN updated_at SET NOT NULL;

CREATE INDEX IF NOT EXISTS team_organizations_admin_email_idx
  ON public.team_organizations (lower(team_admin_email));

CREATE INDEX IF NOT EXISTS team_organizations_admin_user_idx
  ON public.team_organizations (team_admin_user_id)
  WHERE team_admin_user_id IS NOT NULL;

CREATE OR REPLACE FUNCTION public.team_org_mentions_email(payload jsonb, email text)
RETURNS boolean
LANGUAGE sql
IMMUTABLE
AS $$
  SELECT
    email IS NOT NULL
    AND length(trim(email)) > 0
    AND (
      EXISTS (
        SELECT 1
        FROM jsonb_array_elements(coalesce(payload->'coaches', '[]'::jsonb)) member
        WHERE lower(trim(member->>'email')) = lower(trim(email))
      )
      OR EXISTS (
        SELECT 1
        FROM jsonb_array_elements(coalesce(payload->'players', '[]'::jsonb)) member
        WHERE lower(trim(member->>'email')) = lower(trim(email))
      )
    );
$$;

ALTER TABLE public.team_organizations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS team_organizations_select ON public.team_organizations;
CREATE POLICY team_organizations_select ON public.team_organizations
  FOR SELECT
  USING (
    public.is_profile_admin()
    OR team_admin_user_id = auth.uid()
    OR lower(team_admin_email) = lower(coalesce(auth.jwt()->>'email', ''))
    OR public.team_org_mentions_email(payload, coalesce(auth.jwt()->>'email', ''))
  );

DROP POLICY IF EXISTS team_organizations_insert ON public.team_organizations;
CREATE POLICY team_organizations_insert ON public.team_organizations
  FOR INSERT
  WITH CHECK (
    public.is_profile_admin()
    OR team_admin_user_id = auth.uid()
    OR lower(team_admin_email) = lower(coalesce(auth.jwt()->>'email', ''))
    OR public.team_org_mentions_email(payload, coalesce(auth.jwt()->>'email', ''))
  );

DROP POLICY IF EXISTS team_organizations_update ON public.team_organizations;
CREATE POLICY team_organizations_update ON public.team_organizations
  FOR UPDATE
  USING (
    public.is_profile_admin()
    OR team_admin_user_id = auth.uid()
    OR lower(team_admin_email) = lower(coalesce(auth.jwt()->>'email', ''))
    OR public.team_org_mentions_email(payload, coalesce(auth.jwt()->>'email', ''))
  )
  WITH CHECK (
    public.is_profile_admin()
    OR team_admin_user_id = auth.uid()
    OR lower(team_admin_email) = lower(coalesce(auth.jwt()->>'email', ''))
    OR public.team_org_mentions_email(payload, coalesce(auth.jwt()->>'email', ''))
  );

DROP POLICY IF EXISTS team_organizations_delete ON public.team_organizations;
CREATE POLICY team_organizations_delete ON public.team_organizations
  FOR DELETE
  USING (
    public.is_profile_admin()
    OR team_admin_user_id = auth.uid()
    OR lower(team_admin_email) = lower(coalesce(auth.jwt()->>'email', ''))
  );
