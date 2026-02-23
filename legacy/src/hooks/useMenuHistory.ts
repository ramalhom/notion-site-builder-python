import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Json } from "@/integrations/supabase/types";

export interface MenuHistoryEntry {
  id: string;
  menu_item_id: string | null;
  action: "create" | "update" | "delete" | "reorder";
  previous_data: Json | null;
  new_data: Json | null;
  changed_by: string | null;
  created_at: string;
}

export function useMenuHistory() {
  return useQuery({
    queryKey: ["menu-history"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("menu_history")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(50);

      if (error) throw error;
      return data as MenuHistoryEntry[];
    },
  });
}

export function useAddMenuHistory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      menu_item_id,
      action,
      previous_data,
      new_data,
    }: {
      menu_item_id?: string | null;
      action: "create" | "update" | "delete" | "reorder";
      previous_data?: Json | null;
      new_data?: Json | null;
    }) => {
      const { data: { user } } = await supabase.auth.getUser();
      
      const { error } = await supabase.from("menu_history").insert({
        menu_item_id: menu_item_id || null,
        action,
        previous_data: previous_data || null,
        new_data: new_data || null,
        changed_by: user?.id || null,
      });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["menu-history"] });
    },
  });
}
