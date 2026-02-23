import { useParams, useLocation } from "react-router-dom";
import { useMenuItems } from "@/hooks/useMenuItems";
import { NotionPage } from "@/components/NotionPage";
import { Loader2 } from "lucide-react";
import NotFound from "@/pages/NotFound";

export default function PageView() {
  const { id, slug } = useParams();
  const location = useLocation();
  const { data: menuItems = [], isLoading } = useMenuItems();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const page = menuItems.find((item) => {
    if (id) return item.id === id;
    if (slug) return item.slug === `/${slug}`;
    return false;
  });

  if (!page) {
    return <NotFound />;
  }

  // Use location.key to force iframe reload when clicking on the same menu item
  return <NotionPage key={location.key} url={page.notion_url || ""} title={page.label} />;
}
