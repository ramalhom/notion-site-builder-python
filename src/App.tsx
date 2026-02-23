import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { PublicLayout } from "@/components/layout/PublicLayout";
import Index from "./pages/Index";
import PageView from "./pages/PageView";
import Auth from "./pages/Auth";
import AdminLayout from "./pages/admin/AdminLayout";
import SiteConfigPage from "./pages/admin/SiteConfigPage";
import MenuManagementPage from "./pages/admin/MenuManagementPage";
import ProfilePage from "./pages/admin/ProfilePage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          {/* Public routes with shared layout */}
          <Route element={<PublicLayout />}>
            <Route path="/" element={<Index />} />
            <Route path="/page/:id" element={<PageView />} />
            <Route path="/:slug" element={<PageView />} />
          </Route>

          {/* Auth route */}
          <Route path="/auth" element={<Auth />} />

          {/* Admin routes */}
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<SiteConfigPage />} />
            <Route path="menu" element={<MenuManagementPage />} />
            <Route path="profile" element={<ProfilePage />} />
          </Route>

          {/* Catch-all */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
