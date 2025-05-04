
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

import Navbar from "@/components/Navbar";
import MobileNav from "@/components/MobileNav";
import ProtectedRoute from "@/components/ProtectedRoute";

import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import Dashboard from "./pages/Dashboard";
import DepositPage from "./pages/DepositPage";
import WithdrawPage from "./pages/WithdrawPage";
import TransactionsPage from "./pages/TransactionsPage";
import PlansPage from "./pages/PlansPage";
import ReferralPage from "./pages/ReferralPage";

import AdminLayout from "./pages/admin/AdminLayout";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminAddUser from "./pages/admin/AdminAddUser";
import AdminTransactions from "./pages/admin/AdminTransactions";
import AdminSettings from "./pages/admin/AdminSettings";

import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <AuthProvider>
        <TransactionProvider>
          <InvestmentProvider>
            <AdminProvider>
              <TooltipProvider>
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
