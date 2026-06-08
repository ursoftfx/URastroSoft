
-- PROFILES
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  phone TEXT NOT NULL,
  whatsapp_number TEXT,
  photo_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users view own profile" ON public.profiles FOR SELECT TO authenticated
  USING (auth.uid() = id OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "users insert own profile" ON public.profiles FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = id);
CREATE POLICY "users update own profile" ON public.profiles FOR UPDATE TO authenticated
  USING (auth.uid() = id OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "admins delete profile" ON public.profiles FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(),'admin'));

CREATE TRIGGER trg_profiles_updated BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ASTROLOGER PROFILES
CREATE TYPE public.astrologer_status AS ENUM ('pending','approved','rejected');

CREATE TABLE public.astrologer_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT NOT NULL,
  bio TEXT,
  specialties TEXT[] NOT NULL DEFAULT '{}',
  languages TEXT[] NOT NULL DEFAULT '{}',
  experience_years INT NOT NULL DEFAULT 0,
  charges_note TEXT,
  contact_phone TEXT,
  contact_whatsapp TEXT,
  photo_url TEXT,
  status public.astrologer_status NOT NULL DEFAULT 'pending',
  approved_at TIMESTAMPTZ,
  approved_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.astrologer_profiles TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.astrologer_profiles TO authenticated;
GRANT ALL ON public.astrologer_profiles TO service_role;
ALTER TABLE public.astrologer_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "anyone views approved astrologers" ON public.astrologer_profiles FOR SELECT
  USING (status = 'approved' OR auth.uid() = user_id OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "users apply as astrologer" ON public.astrologer_profiles FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);
CREATE POLICY "self or admin update astrologer" ON public.astrologer_profiles FOR UPDATE TO authenticated
  USING (auth.uid() = user_id OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "admin delete astrologer" ON public.astrologer_profiles FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(),'admin'));

CREATE TRIGGER trg_astro_updated BEFORE UPDATE ON public.astrologer_profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE INDEX idx_astro_status ON public.astrologer_profiles(status);

-- CONSULTATIONS
CREATE TYPE public.consultation_mode AS ENUM ('text','voice');
CREATE TYPE public.consultation_status AS ENUM ('open','answered','closed');

CREATE TABLE public.consultations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  astrologer_id UUID NOT NULL REFERENCES public.astrologer_profiles(id) ON DELETE CASCADE,
  mode public.consultation_mode NOT NULL DEFAULT 'text',
  subject TEXT,
  question TEXT NOT NULL,
  status public.consultation_status NOT NULL DEFAULT 'open',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.consultations TO authenticated;
GRANT ALL ON public.consultations TO service_role;
ALTER TABLE public.consultations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "user sees own consultations" ON public.consultations FOR SELECT TO authenticated
  USING (
    auth.uid() = user_id
    OR public.has_role(auth.uid(),'admin')
    OR EXISTS (SELECT 1 FROM public.astrologer_profiles a WHERE a.id = astrologer_id AND a.user_id = auth.uid())
  );
CREATE POLICY "users create own consultation" ON public.consultations FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);
CREATE POLICY "participants update consultation" ON public.consultations FOR UPDATE TO authenticated
  USING (
    auth.uid() = user_id
    OR public.has_role(auth.uid(),'admin')
    OR EXISTS (SELECT 1 FROM public.astrologer_profiles a WHERE a.id = astrologer_id AND a.user_id = auth.uid())
  );
CREATE POLICY "admin delete consultation" ON public.consultations FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(),'admin'));

CREATE TRIGGER trg_consult_updated BEFORE UPDATE ON public.consultations
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE INDEX idx_consult_user ON public.consultations(user_id);
CREATE INDEX idx_consult_astro ON public.consultations(astrologer_id);

-- MESSAGES
CREATE TABLE public.consultation_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  consultation_id UUID NOT NULL REFERENCES public.consultations(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  body TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, DELETE ON public.consultation_messages TO authenticated;
GRANT ALL ON public.consultation_messages TO service_role;
ALTER TABLE public.consultation_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "participants read messages" ON public.consultation_messages FOR SELECT TO authenticated
  USING (
    public.has_role(auth.uid(),'admin')
    OR EXISTS (
      SELECT 1 FROM public.consultations c
      LEFT JOIN public.astrologer_profiles a ON a.id = c.astrologer_id
      WHERE c.id = consultation_id AND (c.user_id = auth.uid() OR a.user_id = auth.uid())
    )
  );
CREATE POLICY "participants send messages" ON public.consultation_messages FOR INSERT TO authenticated
  WITH CHECK (
    sender_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM public.consultations c
      LEFT JOIN public.astrologer_profiles a ON a.id = c.astrologer_id
      WHERE c.id = consultation_id AND (c.user_id = auth.uid() OR a.user_id = auth.uid())
    )
  );
CREATE POLICY "admin delete messages" ON public.consultation_messages FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(),'admin'));
CREATE INDEX idx_msg_consult ON public.consultation_messages(consultation_id, created_at);
