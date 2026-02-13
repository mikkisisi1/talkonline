
-- Create admin-media storage bucket
INSERT INTO storage.buckets (id, name, public) VALUES ('admin-media', 'admin-media', false);

-- RLS: allow authenticated inserts (PIN checked at edge function level)
CREATE POLICY "Admin media insert" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'admin-media');
CREATE POLICY "Admin media select" ON storage.objects FOR SELECT USING (bucket_id = 'admin-media');
CREATE POLICY "Admin media delete" ON storage.objects FOR DELETE USING (bucket_id = 'admin-media');
