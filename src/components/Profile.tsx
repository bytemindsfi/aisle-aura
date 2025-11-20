import { LogOutIcon, UserCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Spinner } from "@/components/ui/Spinner.tsx";

interface ProfileProps {
  user: any;
  logout: () => void;
  isOpen: boolean;
  onClose: () => void;
}

const Profile = ({ user, isOpen, logout, onClose }: ProfileProps) => {
  if (!user) {
    return <Spinner fullscreen />;
  }
  return (
    <Dialog open={isOpen} onOpenChange={onClose} modal={true}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>User's Profile</DialogTitle>
          <DialogDescription>Your details</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4 rounded-lg">
          <div className="flex gap-x-4 items-center">
            <UserCircle className="h-12 w-12" />
            <p className="text-sm font-medium text-muted-foreground"></p>
          </div>
          <div className="flex gap-x-4 items-center">
            <h3 className="text-sm font-medium text-muted-foreground">Name</h3>
            <p className="text-sm font-medium text-muted-foreground">
              {user.first_name} {user.last_name}
            </p>
          </div>
          <div className="flex gap-x-4 items-center">
            <h3 className="text-sm font-medium text-muted-foreground">Email</h3>
            <p className="text-sm font-medium text-muted-foreground">
              {user.email}
            </p>
          </div>
          <div className="flex gap-x-4 items-center">
            <h3 className="text-sm font-medium text-muted-foreground">
              Joined
            </h3>
            <p className="text-sm font-medium text-muted-foreground">
              {new Date(user.created_at).toLocaleDateString("fi")}
            </p>
          </div>
        </div>
        <div className="flex justify-end">
          <Button variant="outline" onClick={logout}>
            <LogOutIcon className="h-4 w-4 text-muted-foreground" /> Logout
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default Profile;
