import { useEffect } from "react";
import { Outlet, Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Loader2, Settings, Menu as MenuIcon, LogOut, Home, User } from "lucide-react";
import { cn } from "@/lib/utils";

export default function AdminLayout() {
  const { user, loading, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!loading && !user) {
      navigate("/auth");
    }
  }, [user, loading, navigate]);

  const handleSignOut = async () => {
    await signOut();
    navigate("/auth");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const navItems = [
    { path: "/admin", label: "Configuration", icon: Settings },
    { path: "/admin/menu", label: "Menu", icon: MenuIcon },
    { path: "/admin/profile", label: "Profil", icon: User },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-muted/30">
      <header className="bg-background border-b border-border sticky top-0 z-50">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-6">
            <Link to="/admin" className="font-semibold text-lg">
              Administration
            </Link>
            <nav className="hidden md:flex items-center gap-1">
              {navItems.map((item) => (
                <Link key={item.path} to={item.path}>
                  <Button
                    variant="ghost"
                    size="sm"
                    className={cn(
                      "gap-2",
                      location.pathname === item.path && "bg-accent"
                    )}
                  >
                    <item.icon className="h-4 w-4" />
                    {item.label}
                  </Button>
                </Link>
              ))}
            </nav>
          </div>
          <div className="flex items-center gap-2">
            <Link to="/" target="_blank">
              <Button variant="outline" size="sm" className="gap-2">
                <Home className="h-4 w-4" />
                Voir le site
              </Button>
            </Link>
            <Button variant="ghost" size="sm" onClick={handleSignOut} className="gap-2">
              <LogOut className="h-4 w-4" />
              Déconnexion
            </Button>
          </div>
        </div>
      </header>

      {/* Mobile navigation */}
      <nav className="md:hidden flex items-center gap-1 p-2 bg-background border-b border-border overflow-x-auto">
        {navItems.map((item) => (
          <Link key={item.path} to={item.path}>
            <Button
              variant="ghost"
              size="sm"
              className={cn(
                "gap-2 whitespace-nowrap",
                location.pathname === item.path && "bg-accent"
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Button>
          </Link>
        ))}
      </nav>

      <main className="flex-1 container py-6">
        <Outlet />
      </main>
    </div>
  );
}
