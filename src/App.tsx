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
import { App as CapacitorApp } from '@capacitor/app';
import { Capacitor } from '@capacitor/core';
import { Browser } from '@capacitor/browser';
import supabase from "@/lib/supabase";
import { establishSessionFromOAuthUrl } from "@/lib/oauth-handler";
import { useToast } from "@/hooks/use-toast";

const queryClient = new QueryClient();

const AppRoutes = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    // Only setup deep link listener on native platforms
    if (!Capacitor.isNativePlatform()) return;

    console.log('[App] Setting up deep link listener for OAuth callback');

    // Listen for app URL open events (deep links)
    const listener = CapacitorApp.addListener('appUrlOpen', async (data) => {
      console.log('[App] Deep link received:', data.url);

      try {
        // Close the in-app browser
        try {
          await Browser.close();
        } catch (error) {
          // Browser might not be open, that's fine
          console.log('[App] Browser close skipped (not open)');
        }

        // Check if this is an OAuth callback
        if (data.url.includes('access_token') || data.url.includes('refresh_token')) {
          console.log('[App] OAuth callback detected');

          // Establish session from the deep link URL tokens
          const sessionEstablished = await establishSessionFromOAuthUrl(supabase, data.url);

          if (sessionEstablished) {
            console.log('[App] Session established, navigating to lists');
            // Give Supabase a moment to update state
            setTimeout(() => {
              toast({
                title: "Welcome!",
                description: "You've been signed in successfully.",
              });
              navigate('/lists');
            }, 500);
          } else {
            console.error('[App] Failed to establish session from OAuth callback');
            toast({
              title: "Sign In Error",
              description: "Failed to process OAuth callback. Please try again.",
              variant: "destructive",
            });
            navigate('/signin');
          }
        } else {
          // Handle other deep links as needed
          console.log('[App] Non-OAuth deep link received');
        }
      } catch (error) {
        console.error('[App] Error handling deep link:', error);
        toast({
          title: "Error",
          description: "An error occurred processing your sign-in request.",
          variant: "destructive",
        });
        navigate('/signin');
      }
    });

    return () => {
      listener.remove();
    };
  }, [navigate, toast]);

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
