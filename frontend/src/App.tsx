import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Browse from "./pages/Browse";
import ReportItem from "./pages/ReportItem";
import ItemDetail from "./pages/ItemDetail";
import MyItems from "./pages/MyItems";
import AdminDashboard from "./pages/AdminDashboard";
import StorageManagement from "./pages/StorageManagement";
import Reports from "./pages/Reports";
import AuditLog from "./pages/AuditLog";
import BulkRelease from "./pages/BulkRelease";
import Features from "./pages/Features";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter
        future={{
          v7_startTransition: true,
          v7_relativeSplatPath: true,
        }}
      >
        <Routes>
          {/* Admin routes first to ensure proper matching */}
          <Route path="/admin/bulk-release" element={<BulkRelease />} />
          <Route path="/admin/reports" element={<Reports />} />
          <Route path="/admin/audit" element={<AuditLog />} />
          <Route path="/admin/storage" element={<StorageManagement />} />
          <Route path="/admin" element={<AdminDashboard />} />
          {/* Other routes */}
          <Route path="/auth" element={<Auth />} />
          <Route path="/browse" element={<Browse />} />
          <Route path="/report" element={<ReportItem />} />
          <Route path="/item/:id" element={<ItemDetail />} />
          <Route path="/my-items" element={<MyItems />} />
          <Route path="/features" element={<Features />} />
          <Route path="/" element={<Index />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
