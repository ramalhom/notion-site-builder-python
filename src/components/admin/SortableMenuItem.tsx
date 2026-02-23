import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { MenuItem } from "@/hooks/useMenuItems";
import { GripVertical, Pencil, Trash2, ExternalLink, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface SortableMenuItemProps {
  item: MenuItem;
  children?: MenuItem[];
  onEdit: (item: MenuItem) => void;
  onDelete: (item: MenuItem) => void;
}

export function SortableMenuItem({ item, children = [], onEdit, onDelete }: SortableMenuItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <Card
      ref={setNodeRef}
      style={style}
      className={cn(
        !item.is_active && "opacity-50",
        isDragging && "opacity-50 shadow-lg z-50"
      )}
    >
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          <button
            {...attributes}
            {...listeners}
            className="cursor-grab active:cursor-grabbing touch-none"
          >
            <GripVertical className="h-5 w-5 text-muted-foreground" />
          </button>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span className="font-medium">{item.label}</span>
              {!item.is_active && (
                <span className="text-xs text-muted-foreground">(inactif)</span>
              )}
              {item.open_in_new_tab && (
                <ExternalLink className="h-3 w-3 text-muted-foreground" />
              )}
            </div>
            {item.notion_url && (
              <p className="text-xs text-muted-foreground truncate max-w-md">
                {item.notion_url}
              </p>
            )}
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onEdit(item)}
            >
              <Pencil className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onDelete(item)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {children.length > 0 && (
          <div className="mt-3 ml-8 space-y-2">
            {children.map((child) => (
              <div
                key={child.id}
                className={cn(
                  "flex items-center gap-3 p-2 rounded-md bg-muted/50",
                  !child.is_active && "opacity-50"
                )}
              >
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm">{child.label}</span>
                    {!child.is_active && (
                      <span className="text-xs text-muted-foreground">
                        (inactif)
                      </span>
                    )}
                    {child.open_in_new_tab && (
                      <ExternalLink className="h-3 w-3 text-muted-foreground" />
                    )}
                  </div>
                  {child.notion_url && (
                    <p className="text-xs text-muted-foreground truncate max-w-sm">
                      {child.notion_url}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => onEdit(child)}
                  >
                    <Pencil className="h-3 w-3" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => onDelete(child)}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
