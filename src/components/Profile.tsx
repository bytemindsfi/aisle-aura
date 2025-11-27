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
import { Link } from "react-router-dom";

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
        <div className="py-4 rounded-lg">
          <Link
            to="https://buymeacoffee.com/byteminds"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 py-2 text-md text-gray-700 hover:bg-gray-100"
          >
            ☕ Buy us a coffee
          </Link>
        </div>
        <div className="flex justify-end">
          <Button
            variant="secondary"
            onClick={logout}
            className="bg-red-500 text-white hover:bg-red-450"
          >
            <LogOutIcon className="h-4 w-4 text-white" /> Logout
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default Profile;
