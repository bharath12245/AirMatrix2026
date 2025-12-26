import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import FlightsPage from "./pages/FlightsPage";
import SeatSelectionPage from "./pages/SeatSelectionPage";
import PassengerDetailsPage from "./pages/PassengerDetailsPage";
import PaymentPage from "./pages/PaymentPage";
import ConfirmationPage from "./pages/ConfirmationPage";
import DashboardPage from "./pages/DashboardPage";
import CancellationPage from "./pages/CancellationPage";
import AuthPage from "./pages/AuthPage";
import ProtectedRoute from "./components/ProtectedRoute";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/auth" element={<AuthPage />} />
          <Route path="/" element={<ProtectedRoute><Index /></ProtectedRoute>} />
          <Route path="/flights" element={<ProtectedRoute><FlightsPage /></ProtectedRoute>} />
          <Route path="/seats" element={<ProtectedRoute><SeatSelectionPage /></ProtectedRoute>} />
          <Route path="/passengers" element={<ProtectedRoute><PassengerDetailsPage /></ProtectedRoute>} />
          <Route path="/payment" element={<ProtectedRoute><PaymentPage /></ProtectedRoute>} />
          <Route path="/confirmation" element={<ProtectedRoute><ConfirmationPage /></ProtectedRoute>} />
          <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
          <Route path="/cancel" element={<ProtectedRoute><CancellationPage /></ProtectedRoute>} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
