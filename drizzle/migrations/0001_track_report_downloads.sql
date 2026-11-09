CREATE TABLE public.report_download_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id UUID REFERENCES public.jathagam_leads(id) ON DELETE SET NULL,
  report_type TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT INSERT ON public.report_download_events TO anon, authenticated;
GRANT SELECT ON public.report_download_events TO authenticated;
GRANT ALL ON public.report_download_events TO service_role;
ALTER TABLE public.report_download_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can record report downloads"
  ON public.report_download_events FOR INSERT
  TO anon, authenticated
  WITH CHECK (report_type IN ('professional', 'onepage', 'birth_report', 'daily_panchangam'));
CREATE POLICY "Admins can view report downloads"
  ON public.report_download_events FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));
CREATE INDEX report_download_events_created_at_idx ON public.report_download_events(created_at DESC);
CREATE INDEX report_download_events_lead_id_idx ON public.report_download_events(lead_id);