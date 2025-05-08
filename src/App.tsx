
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { AuthProvider } from "@/contexts/AuthContext";
import { TransactionProvider } from "@/contexts/TransactionContext";
import { AdminProvider } from "@/contexts/AdminContext";
import { InvestmentProvider } from "@/contexts/InvestmentContext";
import { useEffect, useState } from "react";
import { checkSupabaseConnection, initializeAdminUsers, setupDatabaseTables } from "@/integrations/supabase/client";
import { checkDatabaseInitialization } from "@/utils/database-init";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";

// Import all components used in routes
import Navbar from "@/components/Navbar";
import MobileNav from "@/components/MobileNav";
import LandingPage from "@/pages/LandingPage";
import LoginPage from "@/pages/LoginPage";
import RegisterPage from "@/pages/RegisterPage";
import Dashboard from "@/pages/Dashboard";
import DepositPage from "@/pages/DepositPage";
import WithdrawPage from "@/pages/WithdrawPage";
import TransactionsPage from "@/pages/TransactionsPage";
import PlansPage from "@/pages/PlansPage";
import ReferralPage from "@/pages/ReferralPage";
import NotFound from "@/pages/NotFound";
import ProtectedRoute from "@/components/ProtectedRoute";
import AdminLayout from "@/pages/admin/AdminLayout";
import AdminDashboard from "@/pages/admin/AdminDashboard";
import AdminUsers from "@/pages/admin/AdminUsers";
import AdminAddUser from "@/pages/admin/AdminAddUser";
import AdminTransactions from "@/pages/admin/AdminTransactions";
import AdminSettings from "@/pages/admin/AdminSettings";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      retryDelay: 1000,
      staleTime: 30000
    }
  }
});

// Component to initialize backend services
const InitServices = () => {
  const [isDbInitialized, setIsDbInitialized] = useState<boolean | null>(null);
  
  useEffect(() => {
    const init = async () => {
      try {
        // Check connection first
        const isConnected = await checkSupabaseConnection();
        
        if (isConnected) {
          // Check if database is properly initialized
          const isInitialized = await checkDatabaseInitialization();
          setIsDbInitialized(isInitialized);
          
          // Initialize admin users after successful connection
          if (isInitialized) {
            await setupDatabaseTables();
            await initializeAdminUsers();
          }
        } else {
          setIsDbInitialized(false);
        }
      } catch (error) {
        console.error("Error during service initialization:", error);
        setIsDbInitialized(false);
      }
    };
    
    init();
  }, []);
  
  // If initialization check has completed and failed, show a warning
  if (isDbInitialized === false) {
    return (
      <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 w-full max-w-md">
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Database Connection Issue</AlertTitle>
          <AlertDescription>
            There was a problem connecting to the database. Some features may be unavailable.
          </AlertDescription>
        </Alert>
      </div>
    );
  }
  
  return null;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <AuthProvider>
        <TransactionProvider>
          <InvestmentProvider>
            <AdminProvider>
              <TooltipProvider>
                <InitServices />
                <Toaster />
                <Sonner />
                <BrowserRouter>
                  <Navbar />
                  <MobileNav />
                  <Routes>
                    {/* Public routes */}
                    <Route path="/" element={<LandingPage />} />
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/register" element={<RegisterPage />} />
                    
                    {/* Protected user routes */}
                    <Route path="/dashboard" element={
                      <ProtectedRoute>
                        <Dashboard />
                      </ProtectedRoute>
                    } />
                    <Route path="/deposit" element={
                      <ProtectedRoute>
                        <DepositPage />
                      </ProtectedRoute>
                    } />
                    <Route path="/withdraw" element={
                      <ProtectedRoute>
                        <WithdrawPage />
                      </ProtectedRoute>
                    } />
                    <Route path="/transactions" element={
                      <ProtectedRoute>
                        <TransactionsPage />
                      </ProtectedRoute>
                    } />
                    <Route path="/plans" element={
                      <ProtectedRoute>
                        <PlansPage />
                      </ProtectedRoute>
                    } />
                    <Route path="/referral" element={
                      <ProtectedRoute>
                        <ReferralPage />
                      </ProtectedRoute>
                    } />
                    
                    {/* Protected admin routes */}
                    <Route path="/admin" element={
                      <ProtectedRoute requireAdmin>
                        <AdminLayout />
                      </ProtectedRoute>
                    }>
                      <Route index element={<AdminDashboard />} />
                      <Route path="users" element={<AdminUsers />} />
                      <Route path="users/new" element={<AdminAddUser />} />
                      <Route path="transactions" element={<AdminTransactions />} />
                      <Route path="settings" element={<AdminSettings />} />
                    </Route>
                    
                    {/* 404 route */}
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </BrowserRouter>
              </TooltipProvider>
            </AdminProvider>
          </InvestmentProvider>
        </TransactionProvider>
      </AuthProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
