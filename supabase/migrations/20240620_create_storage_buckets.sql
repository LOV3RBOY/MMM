-- Create a public bucket for model images that anyone can view
INSERT INTO storage.buckets (id, name, public)
VALUES ('model-images', 'Model Images', true);

-- Create a private bucket for internal documents
INSERT INTO storage.buckets (id, name, public)
VALUES ('model-documents', 'Model Documents', false);

-- Set up access policies for the model-images bucket
CREATE POLICY "Anyone can view model images"
ON storage.objects FOR SELECT
USING (bucket_id = 'model-images');

CREATE POLICY "Authenticated users can upload model images"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'model-images' AND auth.role() = 'authenticated');

CREATE POLICY "Users can update their own model images"
ON storage.objects FOR UPDATE
USING (bucket_id = 'model-images' AND owner = auth.uid())
WITH CHECK (bucket_id = 'model-images' AND owner = auth.uid());

CREATE POLICY "Users can delete their own model images"
ON storage.objects FOR DELETE
USING (bucket_id = 'model-images' AND owner = auth.uid());

-- Set up access policies for the model-documents bucket
CREATE POLICY "Only authenticated users can view model documents"
ON storage.objects FOR SELECT
USING (bucket_id = 'model-documents' AND auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can upload model documents"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'model-documents' AND auth.role() = 'authenticated');

CREATE POLICY "Users can update their own model documents"
ON storage.objects FOR UPDATE
USING (bucket_id = 'model-documents' AND owner = auth.uid())
WITH CHECK (bucket_id = 'model-documents' AND owner = auth.uid());

CREATE POLICY "Users can delete their own model documents"
ON storage.objects FOR DELETE
USING (bucket_id = 'model-documents' AND owner = auth.uid());
