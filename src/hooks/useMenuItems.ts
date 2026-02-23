import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface MenuItem {
  id: string;
  label: string;
  level: number;
  parent_id: string | null;
  sort_order: number;
  is_active: boolean;
  notion_url: string | null;
  slug: string | null;
  open_in_new_tab: boolean;
  emoji: string | null;
  created_at: string;
  updated_at: string;
}

export function useMenuItems(includeInactive = false) {
  return useQuery({
    queryKey: ["menu-items", includeInactive],
    queryFn: async () => {
      let query = supabase
        .from("menu_items")
        .select("*")
        .order("sort_order", { ascending: true });

      if (!includeInactive) {
        query = query.eq("is_active", true);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data as MenuItem[];
    },
  });
}

export function useCreateMenuItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (item: Omit<MenuItem, "id" | "created_at" | "updated_at">) => {
      const { data, error } = await supabase
        .from("menu_items")
        .insert(item)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["menu-items"] });
    },
  });
}

export function useUpdateMenuItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      ...updates
    }: Partial<MenuItem> & { id: string }) => {
      const { data, error } = await supabase
        .from("menu_items")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["menu-items"] });
    },
  });
}

export function useDeleteMenuItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("menu_items").delete().eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["menu-items"] });
    },
  });
}
