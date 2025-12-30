import { LogOutIcon, UserCircle, Trash2 } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Spinner } from "@/components/ui/Spinner.tsx";
import { useDeleteAccountMutation } from "@/redux/aisle-aura";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

interface ProfileProps {
  user: any;
  logout: () => void;
  isOpen: boolean;
  onClose: () => void;
}

const Profile = ({ user, isOpen, logout, onClose }: ProfileProps) => {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteAccount, { isLoading: isDeletingAccount }] = useDeleteAccountMutation();
  const navigate = useNavigate();

  const handleDeleteAccount = async () => {
    try {
      await deleteAccount().unwrap();
      toast.success("Account deleted successfully");
      setShowDeleteConfirm(false);
      onClose();
      navigate("/signin");
    } catch (error: any) {
      toast.error(error?.error || "Failed to delete account. Please try again.");
      console.error("Delete account error:", error);
    }
  };

  if (!user) {
    return <Spinner fullscreen />;
  }

  return (
    <>
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

          {/* Delete Account Section */}
          <div className="border-t pt-4 mt-4">
            <div className="mb-4">
              <h3 className="text-sm font-medium text-muted-foreground mb-1">
                Danger Zone
              </h3>
              <p className="text-xs text-muted-foreground">
                Once you delete your account, there is no going back. Please be certain.
              </p>
            </div>
            <Button
              variant="outline"
              onClick={() => setShowDeleteConfirm(true)}
              className="w-full border-red-300 text-red-600 hover:bg-red-50 hover:text-red-700"
              disabled={isDeletingAccount}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete Account
            </Button>
          </div>

          <div className="flex justify-end pt-2">
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

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete your
              account and remove all your data from our servers, including:
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>All your grocery lists</li>
                <li>All items in your lists</li>
                <li>Your profile information</li>
                <li>All shared list memberships</li>
              </ul>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeletingAccount}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteAccount}
              disabled={isDeletingAccount}
              className="bg-red-600 hover:bg-red-700"
            >
              {isDeletingAccount ? "Deleting..." : "Yes, delete my account"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default Profile;
