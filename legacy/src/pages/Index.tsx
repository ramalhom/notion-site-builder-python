import { Link, useLocation } from "react-router-dom";
import { useSiteConfig } from "@/hooks/useSiteConfig";
import { useMenuItems } from "@/hooks/useMenuItems";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight, FileText, Settings } from "lucide-react";
import { NotionPage } from "@/components/NotionPage";

export default function Index() {
  const location = useLocation();
  const { data: config, isLoading: isLoadingConfig } = useSiteConfig();
  const { data: menuItems = [], isLoading: isLoadingMenu } = useMenuItems();

  // Show nothing while loading to prevent flash
  if (isLoadingConfig || isLoadingMenu) {
    return null;
  }

  // Check if there's a home page (slug = "/")
  const homePage = menuItems.find((item) => item.slug === "/" && item.notion_url);

  // If a home page exists, display the Notion page directly
  if (homePage) {
    return (
      <>
        <NotionPage key={location.key} url={homePage.notion_url!} />
        <Link 
          to="/auth" 
          className="fixed bottom-4 left-4 z-50"
        >
          <Button 
            variant="ghost" 
            size="sm" 
            className="opacity-30 hover:opacity-100 transition-opacity text-xs gap-1"
          >
            <Settings className="h-3 w-3" />
            Admin
          </Button>
        </Link>
      </>
    );
  }

  const firstPage = menuItems.find((item) => item.notion_url);

  return (
    <div className="container py-12 md:py-24">
      <div className="max-w-3xl mx-auto text-center">
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-6">
          Bienvenue sur {config?.site_name || "votre site"}
        </h1>
        <p className="text-xl text-muted-foreground mb-8">
          Un site simple et élégant alimenté par vos pages Notion.
        </p>

        <div className="flex flex-wrap gap-4 justify-center mb-12">
          {firstPage && (
            <Link to={firstPage.slug || `/page/${firstPage.id}`}>
              <Button size="lg" className="gap-2">
                Voir le contenu
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          )}
          <Link to="/auth">
            <Button variant="outline" size="lg" className="gap-2">
              <Settings className="h-4 w-4" />
              Administration
            </Button>
          </Link>
        </div>

        {menuItems.length === 0 && (
          <Card className="max-w-md mx-auto">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Premiers pas
              </CardTitle>
              <CardDescription>
                Votre site est prêt ! Commencez par ajouter des pages.
              </CardDescription>
            </CardHeader>
            <CardContent className="text-left space-y-3 text-sm text-muted-foreground">
              <p>
                1. <strong>Publiez</strong> vos pages Notion en cliquant sur
                "Partager" → "Publier sur le web".
              </p>
              <p>
                2. <strong>Copiez</strong> l'URL de la page publiée.
              </p>
              <p>
                3. <strong>Connectez-vous</strong> à l'administration et ajoutez vos
                éléments de menu.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
