-- ═══════════════════════════════════════════════════════════════
-- BéniConsult — Migration Supabase complète
-- À exécuter dans Supabase > SQL Editor
-- ═══════════════════════════════════════════════════════════════

-- ─── 1. TABLE PROFILES (étend auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id              UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name       TEXT,
  email           TEXT,
  phone           TEXT,
  role            TEXT NOT NULL DEFAULT 'patient' CHECK (role IN ('patient','doctor','admin')),
  avatar_url      TEXT,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW(),

  -- Champs spécifiques médecin
  doctor_status   TEXT DEFAULT 'en_attente' CHECK (doctor_status IN ('en_attente','approuvé','rejeté')),
  specialty       TEXT,
  city            TEXT,
  hospital        TEXT,
  tarif_fcfa      INTEGER DEFAULT 2000,
  bio             TEXT,
  is_online       BOOLEAN DEFAULT FALSE,
  rating          NUMERIC(3,2) DEFAULT 0,
  consultations_count INTEGER DEFAULT 0
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Policies profiles
CREATE POLICY "Lecture profil public (médecins approuvés)"
  ON public.profiles FOR SELECT
  USING (role = 'doctor' AND doctor_status = 'approuvé' OR auth.uid() = id);

CREATE POLICY "Lecture propre profil"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Mise à jour propre profil"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Insertion propre profil"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Admin voit tout
CREATE POLICY "Admin lecture tous profils"
  ON public.profiles FOR ALL
  USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- ─── 2. TABLE APPOINTMENTS
CREATE TABLE IF NOT EXISTS public.appointments (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  doctor_id         UUID REFERENCES public.profiles(id),
  doctor_name       TEXT,
  doctor_specialty  TEXT,
  patient_id        UUID REFERENCES public.profiles(id),
  patient_name      TEXT,
  patient_email     TEXT,
  date              DATE NOT NULL,
  time              TIME,
  tarif_fcfa        INTEGER,
  status            TEXT DEFAULT 'en_attente' CHECK (status IN ('en_attente','confirmé','terminé','annulé')),
  type              TEXT DEFAULT 'rdv' CHECK (type IN ('rdv','instant')),
  prescription_id   UUID,
  notes             TEXT,
  created_at        TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Patient voit ses RDV"
  ON public.appointments FOR SELECT
  USING (patient_id = auth.uid());

CREATE POLICY "Médecin voit ses RDV"
  ON public.appointments FOR SELECT
  USING (doctor_id = auth.uid());

CREATE POLICY "Patient crée RDV"
  ON public.appointments FOR INSERT
  WITH CHECK (patient_id = auth.uid());

CREATE POLICY "Médecin met à jour RDV"
  ON public.appointments FOR UPDATE
  USING (doctor_id = auth.uid() OR patient_id = auth.uid());

CREATE POLICY "Admin voit tous RDV"
  ON public.appointments FOR ALL
  USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- ─── 3. TABLE MESSAGES
CREATE TABLE IF NOT EXISTS public.messages (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  appointment_id  UUID REFERENCES public.appointments(id) ON DELETE CASCADE,
  sender_id       UUID REFERENCES public.profiles(id),
  sender_role     TEXT CHECK (sender_role IN ('patient','doctor')),
  content         TEXT NOT NULL,
  read            BOOLEAN DEFAULT FALSE,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Participants voient les messages"
  ON public.messages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.appointments
      WHERE id = appointment_id
      AND (patient_id = auth.uid() OR doctor_id = auth.uid())
    )
  );

CREATE POLICY "Participants envoient messages"
  ON public.messages FOR INSERT
  WITH CHECK (sender_id = auth.uid());

-- Active Realtime pour messages
ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;

-- ─── 4. TABLE PAYMENTS
CREATE TABLE IF NOT EXISTS public.payments (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  appointment_id  UUID REFERENCES public.appointments(id),
  patient_id      UUID REFERENCES public.profiles(id),
  doctor_id       UUID REFERENCES public.profiles(id),
  amount_fcfa     INTEGER NOT NULL,
  method          TEXT CHECK (method IN ('mtn','moov','carte')),
  phone_number    TEXT,
  status          TEXT DEFAULT 'en_attente' CHECK (status IN ('en_attente','succès','echec')),
  reference       TEXT UNIQUE,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Patient voit ses paiements"
  ON public.payments FOR SELECT USING (patient_id = auth.uid());

CREATE POLICY "Médecin voit ses paiements"
  ON public.payments FOR SELECT USING (doctor_id = auth.uid());

CREATE POLICY "Patient crée paiement"
  ON public.payments FOR INSERT WITH CHECK (patient_id = auth.uid());

CREATE POLICY "Admin voit tous paiements"
  ON public.payments FOR ALL
  USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- ─── 5. TABLE PRESCRIPTIONS
CREATE TABLE IF NOT EXISTS public.prescriptions (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  appointment_id  UUID REFERENCES public.appointments(id),
  doctor_id       UUID REFERENCES public.profiles(id),
  doctor_name     TEXT,
  doctor_specialty TEXT,
  patient_id      UUID REFERENCES public.profiles(id),
  patient_name    TEXT,
  medications     JSONB DEFAULT '[]',
  notes           TEXT,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.prescriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Patient voit ses ordonnances"
  ON public.prescriptions FOR SELECT USING (patient_id = auth.uid());

CREATE POLICY "Médecin voit ses ordonnances"
  ON public.prescriptions FOR SELECT USING (doctor_id = auth.uid());

CREATE POLICY "Médecin crée ordonnance"
  ON public.prescriptions FOR INSERT WITH CHECK (doctor_id = auth.uid());

-- ─── 6. TABLE MEDICAL RECORDS
CREATE TABLE IF NOT EXISTS public.medical_records (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id          UUID UNIQUE REFERENCES public.profiles(id) ON DELETE CASCADE,
  blood_type          TEXT,
  allergies           TEXT[] DEFAULT '{}',
  chronic_conditions  TEXT[] DEFAULT '{}',
  treatments          TEXT[] DEFAULT '{}',
  surgeries           TEXT[] DEFAULT '{}',
  family_history      TEXT,
  updated_at          TIMESTAMPTZ DEFAULT NOW(),
  created_at          TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.medical_records ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Patient gère son dossier"
  ON public.medical_records FOR ALL USING (patient_id = auth.uid());

CREATE POLICY "Médecin lit dossier patient (si RDV confirmé)"
  ON public.medical_records FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.appointments
      WHERE patient_id = medical_records.patient_id
      AND doctor_id = auth.uid()
      AND status IN ('confirmé','terminé')
    )
  );

-- ─── 7. TABLE NOTIFICATIONS
CREATE TABLE IF NOT EXISTS public.notifications (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  type        TEXT CHECK (type IN ('rdv','message','paiement','ordonnance','compte')),
  message     TEXT NOT NULL,
  read        BOOLEAN DEFAULT FALSE,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Utilisateur voit ses notifications"
  ON public.notifications FOR ALL USING (user_id = auth.uid());

-- Active Realtime pour notifications
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;

-- ─── 8. TABLE ADMIN NOTIFICATIONS (pour alerter les admins)
CREATE TABLE IF NOT EXISTS public.admin_notifications (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type         TEXT,
  message      TEXT,
  doctor_email TEXT,
  read         BOOLEAN DEFAULT FALSE,
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.admin_notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin voit toutes les notifs admin"
  ON public.admin_notifications FOR ALL
  USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "N'importe qui peut insérer notif admin"
  ON public.admin_notifications FOR INSERT WITH CHECK (true);

-- ─── 9. TRIGGER : auto-créer profil après inscription auth
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1))
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ─── 10. TRIGGER : met à jour updated_at automatiquement
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER medical_records_updated_at
  BEFORE UPDATE ON public.medical_records
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- ─── 11. DONNÉES MOCK (médecins de test)
-- Crée d'abord un user dans auth.users via la console Supabase,
-- puis insère le profil médecin correspondant :

-- Exemples de profils médecins mock (à adapter avec de vrais UUID auth) :
INSERT INTO public.profiles (id, full_name, email, role, doctor_status, specialty, city, hospital, tarif_fcfa, bio, is_online, rating, consultations_count)
VALUES
  (gen_random_uuid(), 'Dr. Adélaïde Hounsou',   'adohounsou@cnhu.bj',      'doctor', 'approuvé', 'Médecine générale', 'Cotonou',       'CNHU-HKM',              1500, 'Médecin généraliste au CNHU-HKM avec 8 ans d'expérience.',          true,  4.9, 124),
  (gen_random_uuid(), 'Dr. Yao Fonton',           'yao.fonton@hopital.bj',   'doctor', 'approuvé', 'Pédiatrie',         'Parakou',        'Hôpital Borgou',        2000, 'Pédiatre spécialisé dans les maladies infectieuses de l'enfant.',   true,  4.7, 89),
  (gen_random_uuid(), 'Dr. Bintou Saka',          'bsaka@clinique.bj',       'doctor', 'approuvé', 'Gynécologie',       'Cotonou',        'Clinique Sainte-Rita',  3000, 'Gynécologue-obstétricienne, suivi grossesse et contraception.',      false, 4.8, 201),
  (gen_random_uuid(), 'Dr. Koffi Agossou',        'kagossou@medecin.bj',     'doctor', 'approuvé', 'Cardiologie',       'Abomey-Calavi',  'CHD Atlantique',        3500, 'Cardiologue formé à Dakar, spécialisé hypertension artérielle.',     false, 4.6, 67),
  (gen_random_uuid(), 'Dr. Mariam Tchékoura',     'mtchekoura@sante.bj',     'doctor', 'en_attente','Dermatologie',     'Porto-Novo',     'Cabinet privé',         2500, 'Dermatologue, consultations acné, eczéma, maladies de peau.',        false, 0,   0)
ON CONFLICT DO NOTHING;

-- Crée un admin (remplace l'UUID par celui de ton user Supabase)
-- INSERT INTO public.profiles (id, full_name, email, role)
-- VALUES ('TON-UUID-ICI', 'Admin BéniConsult', 'admin@beniconsult.bj', 'admin');

-- ─── 12. INDEX pour les performances
CREATE INDEX IF NOT EXISTS idx_appointments_patient ON public.appointments(patient_id);
CREATE INDEX IF NOT EXISTS idx_appointments_doctor  ON public.appointments(doctor_id);
CREATE INDEX IF NOT EXISTS idx_appointments_date    ON public.appointments(date);
CREATE INDEX IF NOT EXISTS idx_messages_appointment ON public.messages(appointment_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user   ON public.notifications(user_id, read);
CREATE INDEX IF NOT EXISTS idx_payments_patient     ON public.payments(patient_id);
CREATE INDEX IF NOT EXISTS idx_profiles_role        ON public.profiles(role, doctor_status);
CREATE INDEX IF NOT EXISTS idx_profiles_online      ON public.profiles(is_online) WHERE role = 'doctor';
