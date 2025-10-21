import { Toaster as SonnerToaster } from "@/components/ui/sonner";
import { Toaster as HotToaster } from "react-hot-toast";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import BorrowFlow from "./pages/BorrowFlow";
import ReturnFlow from "./pages/ReturnFlow";
import Dashboard from "./pages/admin/Dashboard";
import Items from "./pages/admin/Items";
import Borrowings from "./pages/admin/Borrowings";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <HotToaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: 'hsl(var(--card))',
            color: 'hsl(var(--card-foreground))',
            border: '1px solid hsl(var(--border))',
          },
        }}
      />
      <SonnerToaster />
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/borrow" element={<BorrowFlow />} />
          <Route path="/return" element={<ReturnFlow />} />
          
          {/* Admin Routes - using obscure URL */}
          <Route path="/tkj-mgmt-2025/dashboard" element={<Dashboard />} />
          <Route path="/tkj-mgmt-2025/items" element={<Items />} />
          <Route path="/tkj-mgmt-2025/borrowings" element={<Borrowings />} />
          
          {/* Catch-all */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
