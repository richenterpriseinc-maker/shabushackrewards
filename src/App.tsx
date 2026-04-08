import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";

import Locations from "./pages/Locations";
import Deals from "./pages/Deals";
import Rewards from "./pages/Rewards";
import Join from "./pages/Join";
import BirthdayWheel from "./pages/BirthdayWheel";
import Login from "./pages/Login";
import OwnerDashboard from "./pages/OwnerDashboard";
import StaffPanel from "./pages/StaffPanel";
import ResetPassword from "./pages/ResetPassword";
import Profile from "./pages/Profile";
import NotFound from "./pages/NotFound";
import ScrollToTop from "./components/ScrollToTop";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <ScrollToTop />
        <Routes>
          <Route path="/" element={<Index />} />
          
          <Route path="/locations" element={<Locations />} />
          <Route path="/deals" element={<Deals />} />
          <Route path="/rewards" element={<Rewards />} />
          <Route path="/join" element={<Join />} />
          <Route path="/birthday" element={<BirthdayWheel />} />
          <Route path="/login" element={<Login />} />
          <Route path="/owner" element={<OwnerDashboard />} />
          <Route path="/staff" element={<StaffPanel />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
