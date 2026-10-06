
ALTER TABLE public.astrologer_profiles
  ADD COLUMN IF NOT EXISTS is_online boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS rate_per_minute numeric(10,2) NOT NULL DEFAULT 10,
  ADD COLUMN IF NOT EXISTS rating_avg numeric(3,2) NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS rating_count integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS earnings numeric(12,2) NOT NULL DEFAULT 0;

-- protect sensitive astrologer columns from self-edits
CREATE OR REPLACE FUNCTION public.protect_astrologer_fields()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  IF coalesce(current_setting('app.bypass', true), '') = 'on' OR public.has_role(auth.uid(), 'admin') THEN
    RETURN NEW;
  END IF;
  NEW.status := OLD.status; NEW.approved_at := OLD.approved_at; NEW.approved_by := OLD.approved_by;
  NEW.rating_avg := OLD.rating_avg; NEW.rating_count := OLD.rating_count; NEW.earnings := OLD.earnings;
  NEW.user_id := OLD.user_id;
  RETURN NEW;
END $$;
DROP TRIGGER IF EXISTS trg_protect_astro ON public.astrologer_profiles;
CREATE TRIGGER trg_protect_astro BEFORE UPDATE ON public.astrologer_profiles
  FOR EACH ROW EXECUTE FUNCTION public.protect_astrologer_fields();

CREATE TABLE public.wallets (
  user_id uuid PRIMARY KEY,
  balance numeric(12,2) NOT NULL DEFAULT 0,
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.wallets TO authenticated;
GRANT ALL ON public.wallets TO service_role;
ALTER TABLE public.wallets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own wallet" ON public.wallets FOR SELECT TO authenticated
  USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));

CREATE TABLE public.wallet_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  amount numeric(12,2) NOT NULL,
  kind text NOT NULL,
  note text,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.wallet_transactions TO authenticated;
GRANT ALL ON public.wallet_transactions TO service_role;
ALTER TABLE public.wallet_transactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own tx" ON public.wallet_transactions FOR SELECT TO authenticated
  USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));

CREATE TABLE public.wallet_recharges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  amount numeric(12,2) NOT NULL CHECK (amount >= 10 AND amount <= 100000),
  utr text NOT NULL CHECK (char_length(utr) BETWEEN 6 AND 40),
  status text NOT NULL DEFAULT 'pending',
  created_at timestamptz NOT NULL DEFAULT now(),
  reviewed_at timestamptz
);
GRANT SELECT, INSERT ON public.wallet_recharges TO authenticated;
GRANT ALL ON public.wallet_recharges TO service_role;
ALTER TABLE public.wallet_recharges ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own recharges" ON public.wallet_recharges FOR SELECT TO authenticated
  USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "request recharge" ON public.wallet_recharges FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id AND status = 'pending');

CREATE TABLE public.chat_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  astrologer_id uuid NOT NULL REFERENCES public.astrologer_profiles(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'requested',
  rate numeric(10,2) NOT NULL,
  started_at timestamptz,
  ended_at timestamptz,
  minutes integer NOT NULL DEFAULT 0,
  amount numeric(12,2) NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.chat_sessions TO authenticated;
GRANT ALL ON public.chat_sessions TO service_role;
ALTER TABLE public.chat_sessions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "participants view sessions" ON public.chat_sessions FOR SELECT TO authenticated
  USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin')
    OR EXISTS (SELECT 1 FROM public.astrologer_profiles a WHERE a.id = astrologer_id AND a.user_id = auth.uid()));

CREATE TABLE public.chat_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid NOT NULL REFERENCES public.chat_sessions(id) ON DELETE CASCADE,
  sender_id uuid NOT NULL,
  body text NOT NULL CHECK (char_length(body) BETWEEN 1 AND 2000),
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.chat_messages TO authenticated;
GRANT ALL ON public.chat_messages TO service_role;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "participants read chat" ON public.chat_messages FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.chat_sessions s LEFT JOIN public.astrologer_profiles a ON a.id = s.astrologer_id
    WHERE s.id = session_id AND (s.user_id = auth.uid() OR a.user_id = auth.uid() OR public.has_role(auth.uid(),'admin'))));
CREATE POLICY "participants send chat" ON public.chat_messages FOR INSERT TO authenticated
  WITH CHECK (sender_id = auth.uid() AND EXISTS (SELECT 1 FROM public.chat_sessions s LEFT JOIN public.astrologer_profiles a ON a.id = s.astrologer_id
    WHERE s.id = session_id AND s.status = 'active' AND (s.user_id = auth.uid() OR a.user_id = auth.uid())));

CREATE TABLE public.astrologer_reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid NOT NULL UNIQUE REFERENCES public.chat_sessions(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  astrologer_id uuid NOT NULL REFERENCES public.astrologer_profiles(id) ON DELETE CASCADE,
  rating integer NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment text CHECK (comment IS NULL OR char_length(comment) <= 1000),
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.astrologer_reviews TO anon, authenticated;
GRANT ALL ON public.astrologer_reviews TO service_role;
ALTER TABLE public.astrologer_reviews ENABLE ROW LEVEL SECURITY;
CREATE POLICY "anyone reads reviews" ON public.astrologer_reviews FOR SELECT USING (true);

ALTER PUBLICATION supabase_realtime ADD TABLE public.chat_messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.chat_sessions;

-- RPCs
CREATE OR REPLACE FUNCTION public.request_chat(_astrologer_id uuid)
RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE r numeric; bal numeric; sid uuid;
BEGIN
  IF auth.uid() IS NULL THEN RAISE EXCEPTION 'login required'; END IF;
  SELECT rate_per_minute INTO r FROM astrologer_profiles
    WHERE id = _astrologer_id AND status = 'approved' AND is_online;
  IF r IS NULL THEN RAISE EXCEPTION 'astrologer offline'; END IF;
  SELECT coalesce((SELECT balance FROM wallets WHERE user_id = auth.uid()), 0) INTO bal;
  IF bal < r * 3 THEN RAISE EXCEPTION 'insufficient balance: need at least 3 minutes'; END IF;
  IF EXISTS (SELECT 1 FROM chat_sessions WHERE user_id = auth.uid() AND status IN ('requested','active')) THEN
    RAISE EXCEPTION 'you already have an open chat';
  END IF;
  INSERT INTO chat_sessions(user_id, astrologer_id, rate) VALUES (auth.uid(), _astrologer_id, r) RETURNING id INTO sid;
  RETURN sid;
END $$;

CREATE OR REPLACE FUNCTION public.respond_chat(_session uuid, _accept boolean)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  UPDATE chat_sessions s SET status = CASE WHEN _accept THEN 'active' ELSE 'rejected' END,
    started_at = CASE WHEN _accept THEN now() ELSE NULL END,
    ended_at = CASE WHEN _accept THEN NULL ELSE now() END
  WHERE s.id = _session AND s.status = 'requested'
    AND EXISTS (SELECT 1 FROM astrologer_profiles a WHERE a.id = s.astrologer_id AND a.user_id = auth.uid());
  IF NOT FOUND THEN RAISE EXCEPTION 'not allowed'; END IF;
END $$;

CREATE OR REPLACE FUNCTION public.end_chat(_session uuid)
RETURNS numeric LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE s chat_sessions; astro_uid uuid; mins int; amt numeric; bal numeric;
BEGIN
  SELECT * INTO s FROM chat_sessions WHERE id = _session FOR UPDATE;
  IF s.id IS NULL THEN RAISE EXCEPTION 'not found'; END IF;
  SELECT user_id INTO astro_uid FROM astrologer_profiles WHERE id = s.astrologer_id;
  IF auth.uid() NOT IN (s.user_id, astro_uid) AND NOT has_role(auth.uid(),'admin') THEN RAISE EXCEPTION 'not allowed'; END IF;
  IF s.status = 'requested' THEN
    UPDATE chat_sessions SET status = 'cancelled', ended_at = now() WHERE id = _session; RETURN 0;
  END IF;
  IF s.status <> 'active' THEN RETURN s.amount; END IF;
  mins := greatest(1, ceil(extract(epoch FROM (now() - s.started_at)) / 60.0)::int);
  SELECT coalesce((SELECT balance FROM wallets WHERE user_id = s.user_id FOR UPDATE), 0) INTO bal;
  amt := least(mins * s.rate, bal);
  UPDATE wallets SET balance = balance - amt, updated_at = now() WHERE user_id = s.user_id;
  INSERT INTO wallet_transactions(user_id, amount, kind, note) VALUES (s.user_id, -amt, 'chat', mins || ' min chat');
  PERFORM set_config('app.bypass', 'on', true);
  UPDATE astrologer_profiles SET earnings = earnings + amt WHERE id = s.astrologer_id;
  UPDATE chat_sessions SET status = 'ended', ended_at = now(), minutes = mins, amount = amt WHERE id = _session;
  RETURN amt;
END $$;

CREATE OR REPLACE FUNCTION public.approve_recharge(_id uuid, _approve boolean)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE r wallet_recharges;
BEGIN
  IF NOT has_role(auth.uid(),'admin') THEN RAISE EXCEPTION 'admin only'; END IF;
  SELECT * INTO r FROM wallet_recharges WHERE id = _id AND status = 'pending' FOR UPDATE;
  IF r.id IS NULL THEN RAISE EXCEPTION 'not pending'; END IF;
  UPDATE wallet_recharges SET status = CASE WHEN _approve THEN 'approved' ELSE 'rejected' END, reviewed_at = now() WHERE id = _id;
  IF _approve THEN
    INSERT INTO wallets(user_id, balance) VALUES (r.user_id, r.amount)
      ON CONFLICT (user_id) DO UPDATE SET balance = wallets.balance + r.amount, updated_at = now();
    INSERT INTO wallet_transactions(user_id, amount, kind, note) VALUES (r.user_id, r.amount, 'recharge', 'UTR ' || r.utr);
  END IF;
END $$;

CREATE OR REPLACE FUNCTION public.submit_review(_session uuid, _rating int, _comment text)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE s chat_sessions;
BEGIN
  SELECT * INTO s FROM chat_sessions WHERE id = _session AND user_id = auth.uid() AND status = 'ended';
  IF s.id IS NULL THEN RAISE EXCEPTION 'not allowed'; END IF;
  INSERT INTO astrologer_reviews(session_id, user_id, astrologer_id, rating, comment)
    VALUES (_session, auth.uid(), s.astrologer_id, _rating, nullif(trim(_comment), ''));
  PERFORM set_config('app.bypass', 'on', true);
  UPDATE astrologer_profiles a SET rating_count = x.c, rating_avg = x.av
    FROM (SELECT count(*) c, round(avg(rating)::numeric, 2) av FROM astrologer_reviews WHERE astrologer_id = s.astrologer_id) x
    WHERE a.id = s.astrologer_id;
END $$;

REVOKE EXECUTE ON FUNCTION public.request_chat(uuid), public.respond_chat(uuid, boolean), public.end_chat(uuid),
  public.approve_recharge(uuid, boolean), public.submit_review(uuid, int, text) FROM anon, public;
GRANT EXECUTE ON FUNCTION public.request_chat(uuid), public.respond_chat(uuid, boolean), public.end_chat(uuid),
  public.approve_recharge(uuid, boolean), public.submit_review(uuid, int, text) TO authenticated;
