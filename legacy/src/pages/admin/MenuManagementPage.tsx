import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import {
  useMenuItems,
  useCreateMenuItem,
  useUpdateMenuItem,
  useDeleteMenuItem,
  MenuItem,
} from "@/hooks/useMenuItems";
import { useAddMenuHistory } from "@/hooks/useMenuHistory";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Plus, History } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { SortableMenuItem } from "@/components/admin/SortableMenuItem";
import { MenuHistoryPanel } from "@/components/admin/MenuHistoryPanel";
import { Json } from "@/integrations/supabase/types";

interface MenuItemFormData {
  label: string;
  level: number;
  parent_id: string | null;
  notion_url: string;
  slug: string;
  is_active: boolean;
  open_in_new_tab: boolean;
  sort_order: number;
  emoji: string;
}

const defaultFormData: MenuItemFormData = {
  label: "",
  level: 1,
  parent_id: null,
  notion_url: "",
  slug: "",
  is_active: true,
  open_in_new_tab: false,
  sort_order: 0,
  emoji: "",
};

export default function MenuManagementPage() {
  const queryClient = useQueryClient();
  const { data: menuItems = [], isLoading } = useMenuItems(true);
  const createMenuItem = useCreateMenuItem();
  const updateMenuItem = useUpdateMenuItem();
  const deleteMenuItem = useDeleteMenuItem();
  const addHistory = useAddMenuHistory();
  const { toast } = useToast();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [formData, setFormData] = useState<MenuItemFormData>(defaultFormData);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<MenuItem | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const level1Items = menuItems
    .filter((item) => item.level === 1)
    .sort((a, b) => a.sort_order - b.sort_order);

  const getChildren = (parentId: string) =>
    menuItems
      .filter((item) => item.parent_id === parentId && item.level === 2)
      .sort((a, b) => a.sort_order - b.sort_order);

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = level1Items.findIndex((item) => item.id === active.id);
      const newIndex = level1Items.findIndex((item) => item.id === over.id);

      const newOrder = arrayMove(level1Items, oldIndex, newIndex);

      // Save previous order for history
      const previousOrder = level1Items.map(item => ({ id: item.id, label: item.label, sort_order: item.sort_order }));

      // Update all affected items
      const updates = newOrder.map((item, index) => ({
        id: item.id,
        sort_order: index,
      }));

      try {
        // Update each item's sort_order
        for (const update of updates) {
          await supabase
            .from("menu_items")
            .update({ sort_order: update.sort_order })
            .eq("id", update.id);
        }

        // Add to history
        await addHistory.mutateAsync({
          action: "reorder",
          previous_data: previousOrder as unknown as Json,
          new_data: updates as unknown as Json,
        });

        // Invalidate cache to refresh the list
        await queryClient.invalidateQueries({ queryKey: ["menu-items"] });

        toast({
          title: "Réorganisé",
          description: "L'ordre du menu a été mis à jour.",
        });
      } catch (error) {
        toast({
          title: "Erreur",
          description: "Impossible de réorganiser le menu.",
          variant: "destructive",
        });
      }
    }
  };

  const handleOpenDialog = (item?: MenuItem) => {
    if (item) {
      setEditingItem(item);
      setFormData({
        label: item.label,
        level: item.level,
        parent_id: item.parent_id,
        notion_url: item.notion_url || "",
        slug: item.slug || "",
        is_active: item.is_active,
        open_in_new_tab: item.open_in_new_tab,
        sort_order: item.sort_order,
        emoji: item.emoji || "",
      });
    } else {
      setEditingItem(null);
      setFormData({
        ...defaultFormData,
        sort_order: menuItems.length,
      });
    }
    setIsDialogOpen(true);
  };

  const handleSave = async () => {
    if (!formData.label.trim()) {
      toast({
        title: "Erreur",
        description: "Le libellé est requis.",
        variant: "destructive",
      });
      return;
    }

    try {
      if (editingItem) {
        const result = await updateMenuItem.mutateAsync({
          id: editingItem.id,
          ...formData,
          parent_id: formData.level === 1 ? null : formData.parent_id,
        });

        // Add to history
        await addHistory.mutateAsync({
          menu_item_id: editingItem.id,
          action: "update",
          previous_data: editingItem as unknown as Json,
          new_data: result as unknown as Json,
        });

        toast({
          title: "Enregistré",
          description: "L'élément de menu a été mis à jour.",
        });
      } else {
        const result = await createMenuItem.mutateAsync({
          ...formData,
          parent_id: formData.level === 1 ? null : formData.parent_id,
        });

        // Add to history
        await addHistory.mutateAsync({
          menu_item_id: result.id,
          action: "create",
          new_data: result as unknown as Json,
        });

        toast({
          title: "Créé",
          description: "L'élément de menu a été créé.",
        });
      }
      setIsDialogOpen(false);
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Une erreur est survenue.",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async () => {
    if (!itemToDelete) return;

    try {
      // Add to history before deleting
      await addHistory.mutateAsync({
        menu_item_id: itemToDelete.id,
        action: "delete",
        previous_data: itemToDelete as unknown as Json,
      });

      await deleteMenuItem.mutateAsync(itemToDelete.id);
      toast({
        title: "Supprimé",
        description: "L'élément de menu a été supprimé.",
      });
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Une erreur est survenue.",
        variant: "destructive",
      });
    }
    setDeleteDialogOpen(false);
    setItemToDelete(null);
  };

  const confirmDelete = (item: MenuItem) => {
    setItemToDelete(item);
    setDeleteDialogOpen(true);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Gestion du menu</h1>
          <p className="text-muted-foreground">
            Glissez-déposez pour réordonner les éléments.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline">
                <History className="mr-2 h-4 w-4" />
                Historique
              </Button>
            </SheetTrigger>
            <SheetContent>
              <SheetHeader>
                <SheetTitle>Historique des modifications</SheetTitle>
                <SheetDescription>
                  Les 50 dernières modifications du menu.
                </SheetDescription>
              </SheetHeader>
              <div className="mt-6">
                <MenuHistoryPanel />
              </div>
            </SheetContent>
          </Sheet>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => handleOpenDialog()}>
                <Plus className="mr-2 h-4 w-4" />
                Ajouter
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>
                  {editingItem ? "Modifier l'élément" : "Nouvel élément"}
                </DialogTitle>
                <DialogDescription>
                  {editingItem
                    ? "Modifiez les informations de cet élément."
                    : "Ajoutez un nouvel élément au menu."}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label htmlFor="label">Libellé *</Label>
                  <Input
                    id="label"
                    value={formData.label}
                    onChange={(e) =>
                      setFormData({ ...formData, label: e.target.value })
                    }
                    placeholder="Accueil"
                  />
                </div>

                {formData.level === 1 && (
                  <div className="space-y-2">
                    <Label htmlFor="emoji">Émoji (optionnel)</Label>
                    <div className="flex items-center gap-2">
                      <Input
                        id="emoji"
                        value={formData.emoji}
                        onChange={(e) =>
                          setFormData({ ...formData, emoji: e.target.value })
                        }
                        placeholder="🏠"
                        className="w-20"
                      />
                      <div className="flex gap-1 flex-wrap">
                        {['🏠', '📚', '📝', '⚙️', '📊', '💡', '🎯', '📁', '📌'].map((emoji) => (
                          <button
                            key={emoji}
                            type="button"
                            onClick={() => setFormData({ ...formData, emoji })}
                            className="p-1.5 hover:bg-muted rounded text-lg transition-colors"
                            title={`Sélectionner ${emoji}`}
                          >
                            {emoji}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="level">Niveau</Label>
                  <Select
                    value={formData.level.toString()}
                    onValueChange={(value) =>
                      setFormData({
                        ...formData,
                        level: parseInt(value),
                        parent_id: value === "1" ? null : formData.parent_id,
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">Niveau 1 (Principal)</SelectItem>
                      <SelectItem value="2">Niveau 2 (Sous-menu)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {formData.level === 2 && (
                  <div className="space-y-2">
                    <Label htmlFor="parent">Parent</Label>
                    <Select
                      value={formData.parent_id || ""}
                      onValueChange={(value) =>
                        setFormData({ ...formData, parent_id: value || null })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner un parent" />
                      </SelectTrigger>
                      <SelectContent>
                        {level1Items.map((item) => (
                          <SelectItem key={item.id} value={item.id}>
                            {item.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="notion_url">URL Notion publiée</Label>
                  <Input
                    id="notion_url"
                    value={formData.notion_url}
                    onChange={(e) =>
                      setFormData({ ...formData, notion_url: e.target.value })
                    }
                    placeholder="https://votre-page.notion.site/..."
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="slug">Slug (optionnel)</Label>
                  <Input
                    id="slug"
                    value={formData.slug}
                    onChange={(e) =>
                      setFormData({ ...formData, slug: e.target.value })
                    }
                    placeholder="/ma-page"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="is_active">Actif</Label>
                  <Switch
                    id="is_active"
                    checked={formData.is_active}
                    onCheckedChange={(checked) =>
                      setFormData({ ...formData, is_active: checked })
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="open_in_new_tab">Ouvrir dans un nouvel onglet</Label>
                  <Switch
                    id="open_in_new_tab"
                    checked={formData.open_in_new_tab}
                    onCheckedChange={(checked) =>
                      setFormData({ ...formData, open_in_new_tab: checked })
                    }
                  />
                </div>

                <div className="flex gap-2 pt-4">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => setIsDialogOpen(false)}
                  >
                    Annuler
                  </Button>
                  <Button
                    className="flex-1"
                    onClick={handleSave}
                    disabled={createMenuItem.isPending || updateMenuItem.isPending}
                  >
                    {(createMenuItem.isPending || updateMenuItem.isPending) && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    Enregistrer
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {menuItems.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <p className="text-muted-foreground mb-4">
              Aucun élément de menu. Commencez par en créer un.
            </p>
            <Button onClick={() => handleOpenDialog()}>
              <Plus className="mr-2 h-4 w-4" />
              Créer le premier élément
            </Button>
          </CardContent>
        </Card>
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={level1Items.map((item) => item.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="space-y-2">
              {level1Items.map((item) => (
                <SortableMenuItem
                  key={item.id}
                  item={item}
                  children={getChildren(item.id)}
                  onEdit={handleOpenDialog}
                  onDelete={confirmDelete}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer cet élément ?</AlertDialogTitle>
            <AlertDialogDescription>
              Cette action est irréversible. L'élément "{itemToDelete?.label}" et
              tous ses sous-éléments seront supprimés.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Supprimer</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
