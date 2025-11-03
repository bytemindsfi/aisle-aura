import { Navigate } from "react-router-dom";
import { UserCircle, LogOutIcon } from "lucide-react";
import { useLogoutMutation } from "@/redux/aisle-aura.ts";
import { useAuth } from "@/hooks/use-auth.tsx";
import { useProfile } from "@/hooks/use-profile.ts";
import { Spinner } from "@/components/ui/Spinner.tsx";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const [logout] = useLogoutMutation();
  const { user, isAuthenticated, loading } = useAuth();
  const { profile } = useProfile(user?.id);

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
        className="h-fit max-w-md mx-auto flex justify-between px-4"
        style={{
          paddingTop: "max(1rem, env(safe-area-inset-top))",
        }}
      >
        <div className="w-fit text-muted-foreground flex gap-1">
          <UserCircle className="h-6 w-6" />
          <p>{profile ? profile.first_name : null}</p>
        </div>
        <div
          className="h-fit w-fit bg-muted p-2 rounded-full cursor-pointer"
          onClick={() => logout({})}
        >
          <LogOutIcon className="h-4 w-4 text-muted-foreground" />
        </div>
      </div>
      {children}
    </>
  );
};

export default ProtectedRoute;
