// src/pages/Invitations.tsx
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast.ts";
import { Button } from "@/components/ui/button.tsx";
import {
  useAcceptInvitationMutation,
  useGetPendingInvitationsQuery,
} from "@/redux/aisle-aura.ts";
import {
  ArrowLeft,
  Mail,
  Users,
  CheckCircle,
  Loader2,
  Inbox,
} from "lucide-react";
import { Spinner } from "@/components/ui/Spinner.tsx";
import { cn } from "@/lib/utils.ts";

const Invitations = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const { data: invitations, isLoading } = useGetPendingInvitationsQuery();
  const [acceptInvitation, { isLoading: isAccepting }] =
    useAcceptInvitationMutation();

  const handleAccept = async (token: string, listName: string) => {
    try {
      const result = await acceptInvitation(token).unwrap();
      toast({
        title: "Invitation accepted!",
        description: `You now have access to "${listName}"`,
      });
      // Navigate to the list after accepting
      navigate(`/lists/${result.list_id}`);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to accept invitation. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return <Spinner fullscreen />;
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-md md:max-w-3xl lg:max-w-4xl mx-auto">
        {/* Header */}
        <div
          className="sticky top-0 bg-background border-b border-border z-10"
          style={{ paddingTop: "max(1rem, env(safe-area-inset-top))" }}
        >
          <div className="p-4">
            <div className="flex items-center gap-3 mb-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate("/lists")}
                className="p-0 h-8 w-8"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-foreground">
                  Invitations
                </h1>
                <p className="text-sm text-muted-foreground">
                  {invitations?.length || 0} pending
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-4">
          {!invitations || invitations.length === 0 ? (
            // Empty State
            <div className="text-center py-16">
              <div className="mb-6">
                <div className="mx-auto w-16 h-16 bg-muted rounded-full flex items-center justify-center">
                  <Inbox className="h-8 w-8 text-muted-foreground" />
                </div>
              </div>
              <h2 className="text-xl font-semibold text-foreground mb-2">
                No pending invitations
              </h2>
              <p className="text-muted-foreground mb-6">
                When someone shares a list with you, it will appear here
              </p>
              <Button onClick={() => navigate("/lists")} variant="outline">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Lists
              </Button>
            </div>
          ) : (
            // Invitations List
            <div className="space-y-3">
              {invitations.map((inv) => (
                <div
                  key={inv.id}
                  className={cn(
                    "p-4 rounded-lg border bg-card transition-all",
                    isAccepting
                      ? "opacity-50"
                      : "hover:shadow-md hover:border-primary/20",
                  )}
                >
                  {/* Invitation Header */}
                  <div className="flex items-start gap-3 mb-3">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Users className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-foreground mb-1">
                        {inv.lists?.name || "Unknown List"}
                      </h3>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Mail className="h-3 w-3" />
                        <span className="truncate">{inv.email}</span>
                      </div>
                    </div>
                  </div>

                  {/* Invitation Details */}
                  <div className="mb-4 p-3 bg-muted/50 rounded-md">
                    <p className="text-sm text-muted-foreground">
                      You've been invited to collaborate on this shopping list.
                      Accept to start adding and editing items together.
                    </p>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2">
                    <Button
                      onClick={() =>
                        handleAccept(
                          inv.invitation_token!,
                          inv.lists?.name || "this list",
                        )
                      }
                      disabled={isAccepting}
                      className="flex-1"
                    >
                      {isAccepting ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Accepting...
                        </>
                      ) : (
                        <>
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Accept Invitation
                        </>
                      )}
                    </Button>
                  </div>

                  {/* Timestamp */}
                  <p className="text-xs text-muted-foreground mt-3">
                    Invited{" "}
                    {new Date(inv.created_at).toLocaleDateString("en", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Invitations;
