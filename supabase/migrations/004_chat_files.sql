-- ═══════════════════════════════════════════════════════════════
-- BéniConsult — Migration 004 : Bucket chat-files + colonnes messages
-- ═══════════════════════════════════════════════════════════════

-- ─── 1. Colonnes fichiers dans messages
ALTER TABLE public.messages
  ADD COLUMN IF NOT EXISTS file_url   TEXT,
  ADD COLUMN IF NOT EXISTS file_type  TEXT,
  ADD COLUMN IF NOT EXISTS file_name  TEXT;

-- ─── 2. Bucket chat-files
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'chat-files',
  'chat-files',
  true,
  5242880, -- 5MB
  ARRAY['image/jpeg','image/png','image/webp','image/gif','application/pdf','application/msword','application/vnd.openxmlformats-officedocument.wordprocessingml.document']
)
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 5242880;

-- ─── 3. Policies bucket chat-files
DROP POLICY IF EXISTS "Upload chat file" ON storage.objects;
DROP POLICY IF EXISTS "Lecture chat files" ON storage.objects;

CREATE POLICY "Upload chat file"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'chat-files' AND auth.uid() IS NOT NULL);

CREATE POLICY "Lecture chat files"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'chat-files');
