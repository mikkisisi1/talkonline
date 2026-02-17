import { useState, useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { SplashScreen } from "./components/SplashScreen";
import { InstallPrompt } from "./components/InstallPrompt";
import Index from "./pages/Index";
import IdolsPage from "./pages/IdolsPage";
import AdminPortal from "./pages/AdminPortal";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const SPLASH_SHOWN_KEY = 'talkme_splash_shown';

const App = () => {
  const [showSplash, setShowSplash] = useState(() => {
    // Show splash only once per session
    return !sessionStorage.getItem(SPLASH_SHOWN_KEY);
  });

  const handleSplashComplete = () => {
    sessionStorage.setItem(SPLASH_SHOWN_KEY, '1');
    setShowSplash(false);
  };

  if (showSplash) {
    return <SplashScreen onComplete={handleSplashComplete} />;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/idols" element={<IdolsPage />} />
            <Route path="/admin-portal" element={<AdminPortal />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
        <InstallPrompt />
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
