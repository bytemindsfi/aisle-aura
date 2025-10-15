import { Navigate } from "react-router-dom";
import { UserCircle, LogOutIcon } from "lucide-react";
import { useLogoutMutation} from "@/redux/aisle-aura.ts";
import {useAuth} from "@/hooks/use-auth.tsx";
import {useProfile} from "@/hooks/use-profile.ts";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const isAuthenticated = localStorage.getItem("isAuthenticated") === "true";
  const [logout] = useLogoutMutation();
  const {user} = useAuth();
    const { profile } = useProfile(user?.id)
  if (!isAuthenticated) {
    return <Navigate to="/signin" replace />;
  }

  return (
    <>
      <div className="max-w-md mx-auto flex justify-between px-4 pt-4">
        <div className="h-fit w-fit text-muted-foreground flex gap-1">
          <UserCircle className="h-6 w-6" />
          <p>{profile?profile.first_name : null}</p>
        </div>
        <div className="h-fit w-fit bg-muted p-2 rounded-full cursor-pointer" onClick={()=>logout({})}>
          <LogOutIcon className="h-4 w-4 text-muted-foreground"/>
        </div>
      </div>
      {children}
    </>
  );
};

export default ProtectedRoute;
