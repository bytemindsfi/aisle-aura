import { useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useNavigate,
} from "react-router-dom";
import ProtectedRoute from "@/components/ProtectedRoute";
import SignIn from "./pages/SignIn";
import SignUp from "./pages/SignUp";
import Lists from "./pages/Lists";
import GroceryList from "./pages/GroceryList.tsx";
import NotFound from "./pages/NotFound";
import Invitations from "@/pages/Invitations.tsx";
import { Capacitor } from '@capacitor/core';
import { SocialLogin } from '@capgo/capacitor-social-login';

const queryClient = new QueryClient();

const AppRoutes = () => {
  useEffect(() => {
    // Initialize social login plugin on native platforms
    if (Capacitor.isNativePlatform()) {
      SocialLogin.initialize({
        apple: {
          // Use Services ID for Supabase compatibility
          // This must match the client_id configured in your Apple Developer Portal
          clientId: 'com.byteminds.aisleaura.signin'
        }
      }).then(() => {
        console.log('[App] Social Login plugin initialized');
      }).catch((error) => {
        console.error('[App] Failed to initialize Social Login:', error);
      });
    }
  }, []);

  return (
    <Routes>
      <Route path="/" element={<Navigate to="/lists" replace />} />
      <Route path="/signin" element={<SignIn />} />
      <Route path="/signup" element={<SignUp />} />
      <Route
        path="/lists"
        element={
          <ProtectedRoute>
            <Lists />
          </ProtectedRoute>
        }
      />
      <Route
        path="/lists/:id"
        element={
          <ProtectedRoute>
            <GroceryList />
          </ProtectedRoute>
        }
      />
      <Route
        path="/invitations"
        element={
          <ProtectedRoute>
            <Invitations />
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
