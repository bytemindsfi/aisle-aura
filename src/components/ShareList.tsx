import { useState } from "react";
import { X, Mail, UserPlus, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import {
  useGetListMembersQuery,
  useAddListMembersMutation,
  useRemoveListMemberMutation,
} from "@/redux/aisle-aura";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface ShareListProps {
  listId: string;
  listName: string;
  isOpen: boolean;
  onClose: () => void;
}

const ShareList = ({ listId, listName, isOpen, onClose }: ShareListProps) => {
  const { toast } = useToast();
  const [email, setEmail] = useState("");

  const { data: members = [], isLoading } = useGetListMembersQuery(listId, {
    skip: !isOpen,
  });

  const [addMembers, { isLoading: isAdding }] = useAddListMembersMutation();
  const [removeMember, { isLoading: isRemoving }] =
    useRemoveListMemberMutation();

  const validateEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const handleAddMember = async () => {
    const trimmedEmail = email.trim().toLowerCase();

    if (!trimmedEmail) {
      toast({
        title: "Error",
        description: "Please enter an email address",
        variant: "destructive",
      });
      return;
    }

    if (!validateEmail(trimmedEmail)) {
      toast({
        title: "Invalid email",
        description: "Please enter a valid email address",
        variant: "destructive",
      });
      return;
    }

    // Check if already a member
    if (members.some((m) => m.email === trimmedEmail)) {
      toast({
        title: "Already shared",
        description: "This user already has access to this list",
        variant: "destructive",
      });
      return;
    }

    try {
      await addMembers({ listId, emails: [trimmedEmail] }).unwrap();
      setEmail("");
      toast({
        title: "Member added",
        description: `${trimmedEmail} has been invited to this list`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add member. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleRemoveMember = async (memberId: string, memberEmail: string) => {
    try {
      await removeMember(memberId).unwrap();
      toast({
        title: "Member removed",
        description: `${memberEmail} no longer has access to this list`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to remove member",
        variant: "destructive",
      });
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleAddMember();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Share "{listName}"</DialogTitle>
          <DialogDescription>
            Add people by email to collaborate on this list
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Add Member Input */}
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="email"
                placeholder="Enter email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyPress={handleKeyPress}
                className="pl-10"
                disabled={isAdding}
              />
            </div>
            <Button
              onClick={handleAddMember}
              disabled={isAdding || !email.trim()}
              size="default"
            >
              {isAdding ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  <UserPlus className="h-4 w-4 mr-2" />
                  Add
                </>
              )}
            </Button>
          </div>

          {/* Members List */}
          <div className="space-y-2">
            <h3 className="text-sm font-medium text-muted-foreground">
              People with access ({members.length})
            </h3>

            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : members.length === 0 ? (
              <div className="text-center py-8">
                <UserPlus className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground">
                  No one has been invited yet
                </p>
              </div>
            ) : (
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {members.map((member) => (
                  <div
                    key={member.id}
                    className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                  >
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <span className="text-sm font-medium text-primary">
                          {member.email.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">
                          {member.email}
                        </p>
                        <p
                          className={cn(
                            "text-xs",
                            member.status === "active"
                              ? "text-success"
                              : "text-muted-foreground",
                          )}
                        >
                          {member.status === "active" ? "Active" : "Pending"}
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        handleRemoveMember(member.id, member.email)
                      }
                      disabled={isRemoving}
                      className="text-muted-foreground hover:text-destructive flex-shrink-0"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Info Message */}
          {members.length > 0 && (
            <div className="text-xs text-muted-foreground bg-muted/50 p-3 rounded-lg">
              <p>• Users with "Active" status can view and edit this list</p>
              <p>
                • Users with "Pending" status will receive an invitation email
              </p>
            </div>
          )}
        </div>

        <div className="flex justify-end">
          <Button variant="outline" onClick={onClose}>
            Done
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ShareList;
