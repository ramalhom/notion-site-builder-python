-- Site configuration table
CREATE TABLE public.site_config (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  site_name TEXT NOT NULL DEFAULT 'Mon Site',
  global_css TEXT DEFAULT '',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Menu items table with 2-level hierarchy
CREATE TABLE public.menu_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  label TEXT NOT NULL,
  level INTEGER NOT NULL DEFAULT 1 CHECK (level IN (1, 2)),
  parent_id UUID REFERENCES public.menu_items(id) ON DELETE CASCADE,
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  notion_url TEXT,
  slug TEXT,
  open_in_new_tab BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.site_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.menu_items ENABLE ROW LEVEL SECURITY;

-- Public read access for site_config (visitors need to see site name and CSS)
CREATE POLICY "Anyone can read site config"
  ON public.site_config
  FOR SELECT
  USING (true);

-- Public read access for active menu items
CREATE POLICY "Anyone can read active menu items"
  ON public.menu_items
  FOR SELECT
  USING (is_active = true);

-- Admin policies (authenticated users can manage everything)
CREATE POLICY "Authenticated users can manage site config"
  ON public.site_config
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can read all menu items"
  ON public.menu_items
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert menu items"
  ON public.menu_items
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update menu items"
  ON public.menu_items
  FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can delete menu items"
  ON public.menu_items
  FOR DELETE
  TO authenticated
  USING (true);

-- Function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Triggers for automatic timestamp updates
CREATE TRIGGER update_site_config_updated_at
  BEFORE UPDATE ON public.site_config
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_menu_items_updated_at
  BEFORE UPDATE ON public.menu_items
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default site config
INSERT INTO public.site_config (site_name, global_css)
VALUES ('Mon Site', '/* CSS pour masquer l''en-tête Notion */
.notion-topbar, 
.notion-cursor-listener > div:first-child > div:first-child,
[class*="notion-topbar"],
.super-navbar__cta {
  display: none !important;
}

/* Largeur du contenu */
.notion-page-content {
  max-width: 900px;
  margin: 0 auto;
  padding: 20px;
}');