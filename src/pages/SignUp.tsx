import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import AuthLayout from "@/components/AuthLayout";
import { useToast } from "@/hooks/use-toast";
import { useRegisterMutation } from "@/redux/aisle-aura.ts";
import supabase from "@/lib/supabase";
import { Capacitor } from '@capacitor/core';

const SignUp = () => {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const [register] = useRegisterMutation();

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!agreeToTerms) {
      toast({
        title: "Terms & Privacy",
        description: "Please agree to the Terms & Privacy to continue.",
        variant: "destructive",
      });
      return;
    }
    if (!email) {
      toast({
        title: "Email",
        description: "Please fill your email address.",
        variant: "destructive",
      });
      return;
    }
    if (!password) {
      toast({
        title: "Password",
        description: "Please fill your Password",
        variant: "destructive",
      });
      return;
    }
    if (password !== confirmPassword) {
      toast({
        title: "Password Mismatch",
        description: "Passwords do not match. Please try again.",
        variant: "destructive",
      });
      return;
    }
    if (password.length < 6) {
      toast({
        title: "Password Too Short",
        description: "Password must be at least 6 characters long.",
        variant: "destructive",
      });
      return;
    }
    const { data, error } = await register({
      email,
      password,
      firstName,
      lastName,
      agreeToTerms,
    });
    if (error) {
      console.log("Error with registration", error);
      toast({
        title: "Unknown error",
        description: "Please try again later.",
      });
      return;
    }
    if (data) {
      toast({
        title: "Welcome!",
        description: "Your account has been created successfully.",
      });
      navigate("/lists");
    }
  };

  const handleAppleSignUp = async () => {
    try {
      setIsLoading(true);

      // Check if user is already signed in
      const { data: { session } } = await supabase.auth.getSession();

      // Use custom scheme for Capacitor mobile apps, fallback to web URL
      const isNative = Capacitor.isNativePlatform();
      const redirectTo = isNative
        ? 'com.byteminds.aisleaura://lists'  // Deep link for mobile
        : `${window.location.origin}/lists`; // Web URL for browser

      // If user is already signed in, link the Apple identity
      if (session?.user) {
        const { error: linkError } = await supabase.auth.linkIdentity({
          provider: 'apple',
          options: {
            redirectTo,
            skipBrowserRedirect: isNative,
          },
        });

        if (linkError) {
          // Check if it's an "identity already exists" error
          if (linkError.message.includes('Identity is already linked')) {
            toast({
              title: "Already Linked",
              description: "This Apple ID is already linked to your account.",
            });
          } else {
            toast({
              title: "Link Error",
              description: linkError.message,
              variant: "destructive",
            });
          }
        } else {
          toast({
            title: "Success",
            description: "Apple Sign In linked to your account!",
          });
        }
        return;
      }

      // Otherwise, sign up with Apple
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'apple',
        options: {
          redirectTo,
          skipBrowserRedirect: isNative,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        },
      });

      if (error) {
        // Handle "User already registered" error
        if (error.message.includes('already registered') || error.message.includes('already exists')) {
          toast({
            title: "Account Exists",
            description: "An account with this email already exists. Please sign in with your email and password, then link your Apple ID from your profile.",
            variant: "destructive",
          });
        } else {
          toast({
            title: "Apple Sign Up Error",
            description: error.message,
            variant: "destructive",
          });
        }
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to sign up with Apple",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignUp = async () => {
    toast({
      title: "Google Sign Up",
      description: "Google signup would be implemented here.",
    });
  };

  return (
    <AuthLayout>
      <div className="space-y-6">
        <div className="flex space-x-1 border-b border-border">
          <Link
            to="/signin"
            className="flex-1 pb-2 text-center font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            Sign In
          </Link>
          <button className="flex-1 pb-2 text-center font-medium text-foreground border-b-2 border-primary">
            Sign Up
          </button>
        </div>

        <form onSubmit={handleSignUp} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="firstName">First Name</Label>
              <Input
                id="firstName"
                placeholder="John"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">Last Name</Label>
              <Input
                id="lastName"
                placeholder="Doe"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                required
              />
            </div>
          </div>

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
              placeholder="Create a password (min. 6 characters)"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirm Password</Label>
            <Input
              id="confirmPassword"
              type="password"
              placeholder="Confirm your password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              minLength={6}
            />
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="terms"
              checked={agreeToTerms}
              onCheckedChange={(checked) => setAgreeToTerms(checked as boolean)}
            />
            <Label htmlFor="terms" className="text-sm text-muted-foreground">
              I agree to the Terms & Privacy
            </Label>
          </div>

          <Button
            type="submit"
            className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
          >
            Create Account
          </Button>
        </form>

        <div className="space-y-4">
          <div className="relative">
            <Separator />
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="bg-background px-2 text-xs text-muted-foreground">
                or sign up with
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Button
              variant="outline"
              onClick={handleGoogleSignUp}
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
              onClick={handleAppleSignUp}
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
              {isLoading ? "Signing up..." : "Apple"}
            </Button>
          </div>
        </div>

        <p className="text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link to="/signin" className="text-success hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </AuthLayout>
  );
};

export default SignUp;
