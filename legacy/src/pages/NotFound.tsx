import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Home, Sparkles, FileText, Zap, ArrowRight } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted flex flex-col items-center justify-center px-4 relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-primary/5 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/5 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 max-w-2xl mx-auto text-center space-y-8">
        {/* 404 Number with gradient */}
        <div className="relative">
          <h1 className="text-[150px] md:text-[200px] font-black leading-none bg-gradient-to-br from-primary via-primary/80 to-primary/40 bg-clip-text text-transparent select-none">
            404
          </h1>
          <div className="absolute inset-0 text-[150px] md:text-[200px] font-black leading-none text-primary/10 blur-xl -z-10">
            404
          </div>
        </div>

        {/* Message */}
        <div className="space-y-4">
          <h2 className="text-2xl md:text-3xl font-bold text-foreground">
            Oups ! Cette page n'existe pas
          </h2>
          <p className="text-muted-foreground text-lg max-w-md mx-auto">
            Mais ne partez pas si vite ! Découvrez <span className="text-primary font-semibold">Notion Site Builder</span>, 
            l'outil qui transforme vos pages Notion en sites web élégants.
          </p>
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4">
          <div className="bg-card/50 backdrop-blur-sm border border-border/50 rounded-xl p-4 space-y-2 hover:border-primary/30 transition-colors">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mx-auto">
              <FileText className="w-5 h-5 text-primary" />
            </div>
            <h3 className="font-semibold text-foreground">Pages Notion</h3>
            <p className="text-sm text-muted-foreground">Publiez directement depuis Notion</p>
          </div>
          
          <div className="bg-card/50 backdrop-blur-sm border border-border/50 rounded-xl p-4 space-y-2 hover:border-primary/30 transition-colors">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mx-auto">
              <Zap className="w-5 h-5 text-primary" />
            </div>
            <h3 className="font-semibold text-foreground">Ultra rapide</h3>
            <p className="text-sm text-muted-foreground">Performance optimisée</p>
          </div>
          
          <div className="bg-card/50 backdrop-blur-sm border border-border/50 rounded-xl p-4 space-y-2 hover:border-primary/30 transition-colors">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mx-auto">
              <Sparkles className="w-5 h-5 text-primary" />
            </div>
            <h3 className="font-semibold text-foreground">Design élégant</h3>
            <p className="text-sm text-muted-foreground">Thèmes personnalisables</p>
          </div>
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
          <Button asChild size="lg" className="group">
            <Link to="/">
              <Home className="w-4 h-4 mr-2" />
              Retour à l'accueil
              <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
            </Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <a href="https://notion.so" target="_blank" rel="noopener noreferrer">
              <Sparkles className="w-4 h-4 mr-2" />
              Découvrir Notion
            </a>
          </Button>
        </div>

        {/* Footer text */}
        <p className="text-sm text-muted-foreground pt-8">
          Propulsé par <span className="font-medium text-primary">Notion Site Builder</span> ✨
        </p>
      </div>
    </div>
  );
};

export default NotFound;
