import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Index from "./pages/Index.tsx";
import NotFound from "./pages/NotFound.tsx";
import FreeHoroscope from "./pages/FreeHoroscope.tsx";
import BirthHoroscope from "./pages/BirthHoroscope.tsx";
import AstrologyConsultation from "./pages/AstrologyConsultation.tsx";
import Porutham from "./pages/Porutham.tsx";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/free-horoscope" element={<FreeHoroscope />} />
          <Route path="/birth-horoscope" element={<BirthHoroscope />} />
          <Route path="/astrology-consultation" element={<AstrologyConsultation />} />
          <Route path="/porutham" element={<Porutham />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
