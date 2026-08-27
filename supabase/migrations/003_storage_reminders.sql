-- ═══════════════════════════════════════════════════════════════
-- BéniConsult — Migration 003 : Storage avatars + rappels RDV
-- À exécuter dans Supabase > SQL Editor
-- ═══════════════════════════════════════════════════════════════

-- ─── 1. Bucket avatars (Storage)
-- IMPORTANT : Fais ça dans Supabase > Storage > New bucket
-- Nom : avatars
-- Public : OUI (cocher "Public bucket")
-- Puis lance ce SQL pour les policies :

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'avatars',
  'avatars',
  true,
  2097152, -- 2MB max
  ARRAY['image/jpeg','image/png','image/webp']
)
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 2097152;

-- Policy : upload son propre avatar
CREATE POLICY "Upload avatar propre"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'avatars' AND
    auth.uid()::text = split_part(name, '.', 1) OR
    auth.uid()::text = split_part(name, '/', 2)
  );

-- Policy : lecture publique des avatars
CREATE POLICY "Lecture publique avatars"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'avatars');

-- Policy : mise à jour / remplacement de son avatar
CREATE POLICY "Mise à jour avatar propre"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'avatars' AND auth.uid() IS NOT NULL);

-- Policy : suppression de son avatar
CREATE POLICY "Suppression avatar propre"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'avatars' AND auth.uid() IS NOT NULL);

-- ─── 2. Table appointment_reminders — pour les rappels
CREATE TABLE IF NOT EXISTS public.appointment_reminders (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  appointment_id UUID REFERENCES public.appointments(id) ON DELETE CASCADE,
  patient_id     UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  doctor_id      UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  remind_at      TIMESTAMPTZ NOT NULL,
  sent           BOOLEAN DEFAULT FALSE,
  created_at     TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.appointment_reminders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Patient voit ses rappels"
  ON public.appointment_reminders FOR SELECT
  USING (patient_id = auth.uid());

-- ─── 3. Fonction qui crée automatiquement un rappel quand RDV confirmé
CREATE OR REPLACE FUNCTION public.create_appointment_reminder()
RETURNS TRIGGER AS $$
DECLARE
  appt_datetime TIMESTAMPTZ;
  remind_time   TIMESTAMPTZ;
BEGIN
  -- Ne crée un rappel que si le statut passe à confirmé
  IF NEW.status = 'confirmé' AND OLD.status != 'confirmé' THEN
    -- Combine date + heure du RDV
    appt_datetime := (NEW.date::TEXT || ' ' || COALESCE(NEW.time::TEXT, '08:00:00'))::TIMESTAMPTZ;
    remind_time   := appt_datetime - INTERVAL '1 hour';

    -- Crée le rappel si dans le futur
    IF remind_time > NOW() THEN
      INSERT INTO public.appointment_reminders (
        appointment_id, patient_id, doctor_id, remind_at
      ) VALUES (
        NEW.id, NEW.patient_id, NEW.doctor_id, remind_time
      )
      ON CONFLICT DO NOTHING;
    END IF;

    -- Notification in-app immédiate pour le patient
    INSERT INTO public.notifications (user_id, type, message)
    VALUES (
      NEW.patient_id,
      'rdv',
      'Votre rendez-vous du ' || TO_CHAR(NEW.date, 'DD/MM/YYYY') ||
      ' à ' || COALESCE(NEW.time::TEXT, '—') || ' avec ' ||
      NEW.doctor_name || ' est confirmé !'
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_appointment_confirmed ON public.appointments;
CREATE TRIGGER on_appointment_confirmed
  AFTER UPDATE ON public.appointments
  FOR EACH ROW EXECUTE FUNCTION public.create_appointment_reminder();

-- ─── 4. Fonction de rappel — à appeler via un cron job Supabase
-- Supabase > Database > Extensions > pg_cron (activer)
-- Puis dans SQL Editor :
-- SELECT cron.schedule('appointment-reminders', '*/30 * * * *', $$
--   SELECT public.send_appointment_reminders();
-- $$);

CREATE OR REPLACE FUNCTION public.send_appointment_reminders()
RETURNS void AS $$
DECLARE
  reminder RECORD;
BEGIN
  FOR reminder IN
    SELECT r.*, a.patient_name, a.doctor_name, a.date, a.time
    FROM public.appointment_reminders r
    JOIN public.appointments a ON a.id = r.appointment_id
    WHERE r.sent = FALSE
    AND r.remind_at <= NOW()
    AND a.status = 'confirmé'
  LOOP
    -- Notification in-app
    INSERT INTO public.notifications (user_id, type, message)
    VALUES (
      reminder.patient_id,
      'rdv',
      '⏰ Rappel : Votre consultation avec ' || reminder.doctor_name ||
      ' est dans 1 heure (' || TO_CHAR(reminder.remind_at + INTERVAL '1 hour', 'HH24:MI') || ')'
    );

    -- Marque comme envoyé
    UPDATE public.appointment_reminders SET sent = TRUE WHERE id = reminder.id;
  END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ─── 5. Index
CREATE INDEX IF NOT EXISTS idx_reminders_remind_at ON public.appointment_reminders(remind_at) WHERE sent = FALSE;
CREATE INDEX IF NOT EXISTS idx_profiles_avatar ON public.profiles(avatar_url) WHERE avatar_url IS NOT NULL;
