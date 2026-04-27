-- Roles enum + table for admin access (standard pattern)
DO $$ BEGIN
  CREATE TYPE public.app_role AS ENUM ('admin', 'user');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE TABLE IF NOT EXISTS public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN
LANGUAGE SQL STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role);
$$;

DROP POLICY IF EXISTS "Admins can view roles" ON public.user_roles;
CREATE POLICY "Admins can view roles" ON public.user_roles
  FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Leads table
CREATE TABLE IF NOT EXISTS public.jathagam_leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  gender TEXT,
  birth_date DATE NOT NULL,
  birth_time TIME NOT NULL,
  place_name TEXT NOT NULL,
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  tz_offset_hours DOUBLE PRECISION,
  rasi TEXT,
  nakshatra TEXT,
  lagna TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.jathagam_leads ENABLE ROW LEVEL SECURITY;

-- Anyone can submit a lead (public form)
DROP POLICY IF EXISTS "Anyone can insert leads" ON public.jathagam_leads;
CREATE POLICY "Anyone can insert leads"
  ON public.jathagam_leads FOR INSERT
  TO anon, authenticated
  WITH CHECK (
    char_length(name) BETWEEN 1 AND 100
    AND char_length(phone) BETWEEN 5 AND 20
    AND char_length(place_name) BETWEEN 1 AND 200
  );

-- Only admins can read leads
DROP POLICY IF EXISTS "Admins can view leads" ON public.jathagam_leads;
CREATE POLICY "Admins can view leads"
  ON public.jathagam_leads FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE INDEX IF NOT EXISTS idx_jathagam_leads_created_at ON public.jathagam_leads(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_jathagam_leads_phone ON public.jathagam_leads(phone);