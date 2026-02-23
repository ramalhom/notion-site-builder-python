import { Outlet } from "react-router-dom";
import { Header } from "./Header";
import { useSiteConfig } from "@/hooks/useSiteConfig";
import { useEffect } from "react";

export function PublicLayout() {
  const { data: config } = useSiteConfig();

  useEffect(() => {
    if (config?.site_name) {
      document.title = config.site_name;
    }
  }, [config?.site_name]);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <Outlet />
      </main>
    </div>
  );
}
