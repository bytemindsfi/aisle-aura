import { useState } from "react";
import { Navigate } from "react-router-dom";
import { UserCircle, LogOutIcon } from "lucide-react";
import { useLogoutMutation } from "@/redux/aisle-aura.ts";
import { useAuth } from "@/hooks/use-auth.tsx";
import { useProfile } from "@/hooks/use-profile.ts";
import { Spinner } from "@/components/ui/Spinner.tsx";
import Profile from "@/components/Profile.tsx";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const [logout] = useLogoutMutation();
  const { user, isAuthenticated, loading } = useAuth();
  const { profile } = useProfile(user?.id);
  const [isProfileDialogOpen, setIsProfileDialogOpen] = useState(false);

  // Show loading spinner while checking auth state
  if (loading) {
    return <Spinner fullscreen />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/signin" replace />;
  }

  return (
    <>
      <div
        className="h-fit max-w-md md:max-w-4xl lg:max-w-6xl mx-auto flex justify-end px-4"
        style={{
          paddingTop: "max(1rem, env(safe-area-inset-top))",
        }}
      >
        <div
          className="w-fit text-muted-foreground flex gap-1 items-center cursor-pointer hover:text-foreground transition-colors"
          onClick={() => setIsProfileDialogOpen(!isProfileDialogOpen)}
        >
          <UserCircle className="h-6 w-6 md:h-7 md:w-7" />
          <p className="text-sm md:text-base font-medium">{profile ? profile.first_name : null}</p>
        </div>
      </div>
      <div>{children}</div>
      <Profile
        user={profile}
        logout={() => logout({})}
        isOpen={isProfileDialogOpen}
        onClose={() => setIsProfileDialogOpen(false)}
      />
    </>
  );
};

export default ProtectedRoute;
