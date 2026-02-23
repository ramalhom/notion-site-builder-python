import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Menu, X, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSiteConfig } from "@/hooks/useSiteConfig";
import { useMenuItems, MenuItem } from "@/hooks/useMenuItems";
import { cn } from "@/lib/utils";

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [openSubmenu, setOpenSubmenu] = useState<string | null>(null);
  const location = useLocation();
  const navigate = useNavigate();
  const { data: config } = useSiteConfig();
  const { data: menuItems = [] } = useMenuItems();

  const level1Items = menuItems.filter((item) => item.level === 1);

  const getChildren = (parentId: string) =>
    menuItems.filter((item) => item.parent_id === parentId && item.level === 2);

  const getItemPath = (item: MenuItem) => item.slug || `/page/${item.id}`;

  const isActive = (item: MenuItem) => {
    const path = getItemPath(item);
    return location.pathname === path;
  };

  // Handle click on menu item - force navigation even if already on the same page
  const handleMenuClick = (e: React.MouseEvent, item: MenuItem) => {
    const path = getItemPath(item);
    if (item.open_in_new_tab) return; // Let the link handle it
    
    e.preventDefault();
    // Navigate with a unique key to force component remount
    navigate(path, { replace: location.pathname === path });
  };

  return (
    <header className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border">
      <div className="container flex h-16 items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          {config?.logo_type === "emoji" && config.logo_emoji && (
            <span className="text-2xl">{config.logo_emoji}</span>
          )}
          {config?.logo_type === "image" && config.logo_image_url && (
            <img
              src={config.logo_image_url}
              alt="Logo"
              className="h-8 w-8 object-contain"
            />
          )}
          <span className="text-xl font-semibold text-foreground">
            {config?.site_name || "Mon Site"}
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-1">
          {level1Items.map((item) => {
            const children = getChildren(item.id);
            const hasChildren = children.length > 0;

            if (hasChildren) {
              return (
                <div
                  key={item.id}
                  className="relative"
                  onMouseEnter={() => setOpenSubmenu(item.id)}
                  onMouseLeave={() => setOpenSubmenu(null)}
                >
                  <Button
                    variant="ghost"
                    className={cn(
                      "flex items-center gap-1 text-muted-foreground hover:text-foreground",
                      openSubmenu === item.id && "bg-accent"
                    )}
                  >
                    {item.emoji && <span className="mr-1">{item.emoji}</span>}
                    {item.label}
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                  {openSubmenu === item.id && (
                    <div className="absolute top-full left-0 mt-1 w-48 bg-popover border border-border rounded-md shadow-lg py-1">
                      {item.notion_url && (
                        <Link
                          to={getItemPath(item)}
                          onClick={(e) => handleMenuClick(e, item)}
                          className={cn(
                            "block px-4 py-2 text-sm hover:bg-accent",
                            isActive(item) && "bg-accent text-accent-foreground"
                          )}
                        >
                          {item.label}
                        </Link>
                      )}
                      {children.map((child) => (
                        <Link
                          key={child.id}
                          to={getItemPath(child)}
                          target={child.open_in_new_tab ? "_blank" : undefined}
                          rel={child.open_in_new_tab ? "noopener noreferrer" : undefined}
                          onClick={(e) => handleMenuClick(e, child)}
                          className={cn(
                            "block px-4 py-2 text-sm hover:bg-accent",
                            isActive(child) && "bg-accent text-accent-foreground"
                          )}
                        >
                          {child.label}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              );
            }

            return (
              <Link
                key={item.id}
                to={getItemPath(item)}
                target={item.open_in_new_tab ? "_blank" : undefined}
                rel={item.open_in_new_tab ? "noopener noreferrer" : undefined}
                onClick={(e) => handleMenuClick(e, item)}
              >
                <Button
                  variant="ghost"
                  className={cn(
                    "text-muted-foreground hover:text-foreground",
                    isActive(item) && "bg-accent text-accent-foreground"
                  )}
                >
                  {item.emoji && <span className="mr-1">{item.emoji}</span>}
                  {item.label}
                </Button>
              </Link>
            );
          })}
        </nav>

        {/* Mobile Menu Button */}
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>
      </div>

      {/* Mobile Navigation */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-border bg-background">
          <nav className="container py-4 flex flex-col gap-2">
            {level1Items.map((item) => {
              const children = getChildren(item.id);
              const hasChildren = children.length > 0;

              return (
                <div key={item.id}>
                  {hasChildren ? (
                    <>
                      <button
                        onClick={() =>
                          setOpenSubmenu(openSubmenu === item.id ? null : item.id)
                        }
                        className="flex items-center justify-between w-full px-3 py-2 text-left text-muted-foreground hover:text-foreground"
                      >
                        <span>
                          {item.emoji && <span className="mr-1">{item.emoji}</span>}
                          {item.label}
                        </span>
                        <ChevronDown
                          className={cn(
                            "h-4 w-4 transition-transform",
                            openSubmenu === item.id && "rotate-180"
                          )}
                        />
                      </button>
                      {openSubmenu === item.id && (
                        <div className="pl-4 flex flex-col gap-1">
                          {item.notion_url && (
                            <Link
                              to={getItemPath(item)}
                              onClick={(e) => {
                                handleMenuClick(e, item);
                                setMobileMenuOpen(false);
                              }}
                              className={cn(
                                "px-3 py-2 text-sm text-muted-foreground hover:text-foreground",
                                isActive(item) && "text-foreground font-medium"
                              )}
                            >
                              {item.label}
                            </Link>
                          )}
                          {children.map((child) => (
                            <Link
                              key={child.id}
                              to={getItemPath(child)}
                              target={child.open_in_new_tab ? "_blank" : undefined}
                              rel={child.open_in_new_tab ? "noopener noreferrer" : undefined}
                              onClick={(e) => {
                                handleMenuClick(e, child);
                                setMobileMenuOpen(false);
                              }}
                              className={cn(
                                "px-3 py-2 text-sm text-muted-foreground hover:text-foreground",
                                isActive(child) && "text-foreground font-medium"
                              )}
                            >
                              {child.label}
                            </Link>
                          ))}
                        </div>
                      )}
                    </>
                  ) : (
                    <Link
                      to={getItemPath(item)}
                      target={item.open_in_new_tab ? "_blank" : undefined}
                      rel={item.open_in_new_tab ? "noopener noreferrer" : undefined}
                      onClick={(e) => {
                        handleMenuClick(e, item);
                        setMobileMenuOpen(false);
                      }}
                      className={cn(
                        "block px-3 py-2 text-muted-foreground hover:text-foreground",
                        isActive(item) && "text-foreground font-medium"
                      )}
                    >
                      {item.emoji && <span className="mr-1">{item.emoji}</span>}
                      {item.label}
                    </Link>
                  )}
                </div>
              );
            })}
          </nav>
        </div>
      )}
    </header>
  );
}
