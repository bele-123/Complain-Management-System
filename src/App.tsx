import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { Layout } from "@/components/layout/Layout";
import { ProtectedRoute } from "@/components/layout/ProtectedRoute";
import { Outlet } from "react-router-dom";
import { Dashboard } from "@/pages/Dashboard";
import { ComplaintForm } from "@/pages/ComplaintForm";
import { ComplaintsList } from "@/pages/ComplaintsList";
import ComplaintDetails from "@/pages/ComplaintDetails";
import { ComplaintsSearch } from "@/pages/ComplaintsSearch";
import RoleManagement from "@/pages/RoleManagement";
import { Analytics } from "@/pages/Analytics";
import { UserManagement } from "@/pages/UserManagement";
import { Notifications } from "@/pages/Notifications";
import { Settings } from "@/pages/Settings";
import LoginPage from "@/pages/LoginPage";
import { ComplaintFormAmharic } from "@/components/forms/ComplaintFormAmharic";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<LoginPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route element={<ProtectedRoute><Layout><Outlet /></Layout></ProtectedRoute>}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/complaints/new" element={<ComplaintForm />} />
              <Route path="/complaints/new-amharic" element={<ComplaintFormAmharic />} />
              <Route path="/complaints" element={<ComplaintsList />} />
              <Route path="/complaints/:id" element={<ComplaintDetails />} />
              <Route path="/complaints/search" element={<ComplaintsSearch />} />
              <Route path="/analytics" element={<Analytics />} />
              <Route path="/roles" element={<RoleManagement />} />
              <Route path="/users" element={<UserManagement />} />
              <Route path="/notifications" element={<Notifications />} />
              <Route path="/settings" element={<Settings />} />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;