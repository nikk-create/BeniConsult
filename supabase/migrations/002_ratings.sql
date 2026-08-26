-- ═══════════════════════════════════════════════════════════════
-- BéniConsult — Migration 002 : Notations + Paiement vérifié
-- À exécuter dans Supabase > SQL Editor
-- ═══════════════════════════════════════════════════════════════

-- ─── 1. TABLE RATINGS (notations)
CREATE TABLE IF NOT EXISTS public.ratings (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  appointment_id UUID REFERENCES public.appointments(id) ON DELETE CASCADE,
  doctor_id      UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  patient_id     UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  patient_name   TEXT,
  rating         INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment        TEXT,
  created_at     TIMESTAMPTZ DEFAULT NOW()
);

-- Un patient ne peut noter qu'une seule fois par RDV
CREATE UNIQUE INDEX IF NOT EXISTS ratings_appointment_patient
  ON public.ratings(appointment_id, patient_id);

ALTER TABLE public.ratings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Patient cree notation"
  ON public.ratings FOR INSERT
  WITH CHECK (patient_id = auth.uid());

CREATE POLICY "Lecture publique notations"
  ON public.ratings FOR SELECT
  USING (true);

CREATE POLICY "Medecin voit ses notations"
  ON public.ratings FOR SELECT
  USING (doctor_id = auth.uid());

-- ─── 2. Colonne rated dans appointments
ALTER TABLE public.appointments
  ADD COLUMN IF NOT EXISTS rated BOOLEAN DEFAULT FALSE;

-- ─── 3. Active Realtime sur appointments
ALTER PUBLICATION supabase_realtime ADD TABLE public.appointments;

-- ─── 4. Index performances
CREATE INDEX IF NOT EXISTS idx_ratings_doctor ON public.ratings(doctor_id);
CREATE INDEX IF NOT EXISTS idx_ratings_patient ON public.ratings(patient_id);
