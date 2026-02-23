import { useMenuHistory } from "@/hooks/useMenuHistory";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2, Plus, Pencil, Trash2, ArrowUpDown } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";
import { Json } from "@/integrations/supabase/types";

const actionIcons = {
  create: Plus,
  update: Pencil,
  delete: Trash2,
  reorder: ArrowUpDown,
};

const actionLabels = {
  create: "Création",
  update: "Modification",
  delete: "Suppression",
  reorder: "Réorganisation",
};

const actionColors = {
  create: "text-green-600 bg-green-100",
  update: "text-blue-600 bg-blue-100",
  delete: "text-red-600 bg-red-100",
  reorder: "text-purple-600 bg-purple-100",
};

export function MenuHistoryPanel() {
  const { data: history = [], isLoading } = useMenuHistory();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (history.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        Aucun historique disponible.
      </div>
    );
  }

  return (
    <ScrollArea className="h-[400px]">
      <div className="space-y-3 pr-4">
        {history.map((entry) => {
          const Icon = actionIcons[entry.action];
          const label = actionLabels[entry.action];
          const colorClass = actionColors[entry.action];
          const getLabel = (data: Json | null): string | undefined => {
            if (data && typeof data === 'object' && !Array.isArray(data) && 'label' in data) {
              return data.label as string;
            }
            return undefined;
          };
          const itemLabel = getLabel(entry.new_data) || getLabel(entry.previous_data) || "Élément";

          return (
            <div
              key={entry.id}
              className="flex items-start gap-3 p-3 rounded-lg border bg-card"
            >
              <div className={`p-2 rounded-full ${colorClass}`}>
                <Icon className="h-4 w-4" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-sm">{label}</span>
                  <span className="text-muted-foreground text-sm">•</span>
                  <span className="text-sm text-muted-foreground truncate">
                    {itemLabel}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {formatDistanceToNow(new Date(entry.created_at), {
                    addSuffix: true,
                    locale: fr,
                  })}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </ScrollArea>
  );
}
