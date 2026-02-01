import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, Outlet } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import DashboardLayout from "./layouts/DashboardLayout";
import DashboardHome from "./pages/dashboard/DashboardHome";
import ChatPage from "./pages/dashboard/Chat";
import MarketplacePage from "./pages/dashboard/Marketplace";
import LibraryPage from "./pages/dashboard/Library";
import SubscriptionPage from "./pages/dashboard/Subscription";
import SettingsPage from "./pages/dashboard/Settings";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminGate from "./pages/admin/AdminGate";
import LoginPage from "./pages/auth/Login";
import RegisterPage from "./pages/auth/Register";
import { AuthProvider, useAuth } from "./context/AuthContext";

const queryClient = new QueryClient();

// Protected Route Component
const ProtectedRoute = () => {
  const { user, isLoading } = useAuth();
  
  if (isLoading) return <div className="flex items-center justify-center h-screen">Loading...</div>;
  if (!user) return <Navigate to="/auth/login" replace />;

  return <Outlet />;
};

// Admin Route Component
const AdminRoute = () => {
  const { user, isLoading } = useAuth();
  
  if (isLoading) return <div className="flex items-center justify-center h-screen">Loading...</div>;
  if (!user) return <Navigate to="/auth/login" replace />;
  // If user is not admin, redirect to Admin Gate
  if (user.role !== 'admin') return <Navigate to="/admin/gate" replace />;

  return <Outlet />;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            
            {/* Auth Routes */}
            <Route path="/auth/login" element={<LoginPage />} />
            <Route path="/auth/register" element={<RegisterPage />} />
            <Route path="/admin/gate" element={<AdminGate />} />

            {/* Dashboard Routes (Protected) */}
            <Route element={<ProtectedRoute />}>
              <Route path="/dashboard" element={<DashboardLayout />}>
                <Route index element={<DashboardHome />} />
                <Route path="chat" element={<ChatPage />} />
                <Route path="store" element={<MarketplacePage />} />
                <Route path="library" element={<LibraryPage />} />
                <Route path="subscription" element={<SubscriptionPage />} />
                <Route path="settings" element={<SettingsPage />} />
                {/* Fallbacks */}
                <Route path="stats" element={<Navigate to="/dashboard" replace />} />
                <Route path="support" element={<Navigate to="/dashboard/chat" replace />} />
              </Route>
            </Route>

            {/* Admin Routes */}
            <Route element={<AdminRoute />}>
                <Route path="/admin" element={<DashboardLayout />}>
                     <Route index element={<AdminDashboard />} />
                </Route>
            </Route>

            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
