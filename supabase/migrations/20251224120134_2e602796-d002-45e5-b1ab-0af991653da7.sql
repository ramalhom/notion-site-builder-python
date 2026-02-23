-- Add emoji column to menu_items table
ALTER TABLE public.menu_items 
ADD COLUMN emoji text NULL;