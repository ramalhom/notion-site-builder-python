-- Create menu_history table for tracking changes
CREATE TABLE public.menu_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  menu_item_id UUID REFERENCES public.menu_items(id) ON DELETE SET NULL,
  action TEXT NOT NULL CHECK (action IN ('create', 'update', 'delete', 'reorder')),
  previous_data JSONB,
  new_data JSONB,
  changed_by UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.menu_history ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to read history
CREATE POLICY "Authenticated users can read menu history"
ON public.menu_history
FOR SELECT
TO authenticated
USING (true);

-- Allow authenticated users to insert history
CREATE POLICY "Authenticated users can insert menu history"
ON public.menu_history
FOR INSERT
TO authenticated
WITH CHECK (true);

-- Create index for faster lookups
CREATE INDEX idx_menu_history_menu_item_id ON public.menu_history(menu_item_id);
CREATE INDEX idx_menu_history_created_at ON public.menu_history(created_at DESC);