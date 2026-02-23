-- Add columns for site logo (emoji or image)
ALTER TABLE public.site_config 
ADD COLUMN logo_type text DEFAULT 'none' CHECK (logo_type IN ('none', 'emoji', 'image')),
ADD COLUMN logo_emoji text,
ADD COLUMN logo_image_url text;

-- Create storage bucket for site images
INSERT INTO storage.buckets (id, name, public) 
VALUES ('site-assets', 'site-assets', true);

-- Allow anyone to view site assets
CREATE POLICY "Anyone can view site assets"
ON storage.objects FOR SELECT
USING (bucket_id = 'site-assets');

-- Allow authenticated users to upload site assets
CREATE POLICY "Authenticated users can upload site assets"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'site-assets');

-- Allow authenticated users to update site assets
CREATE POLICY "Authenticated users can update site assets"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'site-assets');

-- Allow authenticated users to delete site assets
CREATE POLICY "Authenticated users can delete site assets"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'site-assets');