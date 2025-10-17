-- Create storage bucket for scenario PDFs (PRIVATE)
INSERT INTO storage.buckets (id, name, public)
VALUES ('scenarios', 'scenarios', false)
ON CONFLICT (id) DO NOTHING;

-- Allow authenticated users to upload their own scenarios
CREATE POLICY "Users can upload their own scenarios"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'scenarios' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Allow authenticated users to update their own scenarios
CREATE POLICY "Users can update their own scenarios"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'scenarios' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Allow authenticated users to delete their own scenarios
CREATE POLICY "Users can delete their own scenarios"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'scenarios' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Allow authenticated users to read ONLY their own scenarios
CREATE POLICY "Users can read only their own scenarios"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'scenarios'
  AND auth.uid()::text = (storage.foldername(name))[1]
);
