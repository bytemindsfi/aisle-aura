import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import AuthLayout from "@/components/AuthLayout";
import { useToast } from "@/hooks/use-toast";
import { useLoginMutation } from "@/redux/aisle-aura.ts";
import supabase from "@/lib/supabase";
import { Capacitor } from '@capacitor/core';
import { SocialLogin } from '@capgo/capacitor-social-login';

const SignIn = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const [login] = useLoginMutation();

  // Check for OAuth callback on component mount (web only)
  useEffect(() => {
    const checkOAuthCallback = async () => {
      if (window.location.hash) {
        setIsLoading(true);
        await new Promise(resolve => setTimeout(resolve, 1000));

        const { data: { session }, error } = await supabase.auth.getSession();

        if (session) {
          toast({
            title: "Welcome!",
            description: "You've been signed in successfully with Apple.",
          });
          navigate('/lists');
        } else if (error) {
          toast({
            title: "Sign In Error",
            description: error.message,
            variant: "destructive",
          });
          setIsLoading(false);
        } else {
          setIsLoading(false);
        }
      }
    };
    checkOAuthCallback();
  }, [navigate, toast]);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    const { data, error } = await login({ email, password });
    if (error) {
      toast({
        title: "Unknown error",
        description: "Please try again later.",
      });
      return;
    }
    if (data) {
      toast({
        title: "Welcome back!",
        description: "You've been signed in successfully.",
      });
      navigate("/lists");
    }
  };

  const handleAppleSignIn = async () => {
    try {
      setIsLoading(true);
      const isNative = Capacitor.isNativePlatform();

      if (isNative) {
        const result = await SocialLogin.login({
          provider: 'apple',
          options: {
            scopes: ['email', 'name'],
          },
        });

        const idToken = result.result?.idToken;

        if (!idToken) {
          throw new Error('No identity token received from Apple');
        }

        const { data, error } = await supabase.auth.signInWithIdToken({
          provider: 'apple',
          token: idToken,
        });

        if (error) {
          throw error;
        }

        if (data?.session) {
          toast({
            title: "Welcome!",
            description: "You've been signed in successfully.",
          });
          navigate('/lists');
        }
      } else {
        const { error } = await supabase.auth.signInWithOAuth({
          provider: 'apple',
          options: {
            redirectTo: `${window.location.origin}/lists`,
          },
        });

        if (error) {
          throw error;
        }
      }

      setIsLoading(false);

    } catch (error: any) {
      toast({
        title: "Apple Sign In Error",
        description: error.message || "Failed to sign in with Apple",
        variant: "destructive",
      });
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      setIsLoading(true);
      const isNative = Capacitor.isNativePlatform();

      if (isNative) {
        const result = await SocialLogin.login({
          provider: 'google',
          options: {
            scopes: ['email', 'profile'],
          },
        });

        const idToken = result.result?.idToken;

        if (!idToken) {
          throw new Error('No identity token received from Google');
        }

        const { data, error } = await supabase.auth.signInWithIdToken({
          provider: 'google',
          token: idToken,
        });

        if (error) {
          throw error;
        }

        if (data?.session) {
          toast({
            title: "Welcome!",
            description: "You've been signed in successfully.",
          });
          navigate('/lists');
        }
      } else {
        const { error } = await supabase.auth.signInWithOAuth({
          provider: 'google',
          options: {
            redirectTo: `${window.location.origin}/lists`,
          },
        });

        if (error) {
          throw error;
        }
      }

      setIsLoading(false);

    } catch (error: any) {
      toast({
        title: "Google Sign In Error",
        description: error.message || "Failed to sign in with Google",
        variant: "destructive",
      });
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout>
      <div className="space-y-6">
        <div className="flex space-x-1 border-b border-border">
          <button className="flex-1 pb-2 text-center font-medium text-foreground border-b-2 border-primary">
            Sign In
          </button>
          <Link
            to="/signup"
            className="flex-1 pb-2 text-center font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            Sign Up
          </Link>
        </div>

        <form onSubmit={handleSignIn} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <div className="flex items-center justify-end">
            <Link
              to="/forgot-password"
              className="text-sm text-success hover:underline"
            >
              Forgot password?
            </Link>
          </div>

          <Button
            type="submit"
            className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
          >
            Sign In
          </Button>
        </form>

        <div className="space-y-4">
          <div className="relative">
            <Separator />
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="bg-background px-2 text-xs text-muted-foreground">
                or continue with
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Button
              variant="outline"
              onClick={handleGoogleSignIn}
              disabled={isLoading}
              className="w-full"
            >
              <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
              </svg>
              Google
            </Button>
            <Button
              variant="outline"
              onClick={handleAppleSignIn}
              disabled={isLoading}
              className="w-full"
            >
              <svg
                className="mr-2 h-4 w-4"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
              </svg>
              {isLoading ? "Signing in..." : "Apple"}
            </Button>
          </div>
        </div>

        <p className="text-center text-sm text-muted-foreground">
          Don't have an account?{" "}
          <Link to="/signup" className="text-success hover:underline">
            Sign up for free
          </Link>
        </p>
      </div>
    </AuthLayout>
  );
};

export default SignIn;
