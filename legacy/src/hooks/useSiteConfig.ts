import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface SiteConfig {
  id: string;
  site_name: string;
  logo_type: "none" | "emoji" | "image";
  logo_emoji: string | null;
  logo_image_url: string | null;
  created_at: string;
  updated_at: string;
}

export function useSiteConfig() {
  return useQuery({
    queryKey: ["site-config"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("site_config")
        .select("*")
        .limit(1)
        .maybeSingle();

      if (error) throw error;
      return data as SiteConfig | null;
    },
  });
}

export function useUpdateSiteConfig() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      site_name,
      logo_type,
      logo_emoji,
      logo_image_url,
    }: {
      id: string;
      site_name?: string;
      logo_type?: "none" | "emoji" | "image";
      logo_emoji?: string | null;
      logo_image_url?: string | null;
    }) => {
      const { data, error } = await supabase
        .from("site_config")
        .update({ site_name, logo_type, logo_emoji, logo_image_url })
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["site-config"] });
    },
  });
}
