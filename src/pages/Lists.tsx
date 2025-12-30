import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Search, Plus, Pin, Users } from "lucide-react";
import { useAuth } from "@/hooks/use-auth.tsx";
import { useProfile } from "@/hooks/use-profile.ts";
import {
  useGetListWithStatsQuery,
  useGetSharedListsWithStatsQuery,
} from "@/redux/aisle-aura.ts";
import { Spinner } from "@/components/ui/Spinner.tsx";
import supabase from "@/lib/supabase.ts";
import { useToast } from "@/hooks/use-toast.ts";

const Lists = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [lists, setLists] = useState([]);
  const { user } = useAuth();
  const { profile } = useProfile(user?.id);
  const {
    data: ownedLists = [],
    isLoading,
    isError,
  } = useGetListWithStatsQuery();
  const { data: sharedLists = [], isLoading: isLoadingShared } =
    useGetSharedListsWithStatsQuery();
  const { toast } = useToast();

  useEffect(() => {
    const checkPendingInvitations = async () => {
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();
      if (!user) return;

      // Check for pending invitations with this email
      const { data: invitations, error: invError } = await supabase
        .from("list_members")
        .select("id, list_id, email, invitation_token, status, created_at")
        .eq("email", user.email.toLowerCase())
        .eq("status", "pending");

      if (invitations && invitations.length > 0) {
        // Show notification
        toast({
          title: `You have ${invitations.length} pending invitation(s)!`,
          description: "Accept them to start collaborating",
          action: (
            <Button onClick={() => navigate("/invitations")}>View</Button>
          ),
        });
      }
    };

    checkPendingInvitations();
  }, [navigate, toast]);

  useEffect(() => {
    if (lists.length === 0 && ownedLists && sharedLists)
      setLists(() => [...ownedLists, ...sharedLists]);
  }, [ownedLists, sharedLists, lists]);

  if (isLoading || isLoadingShared) return <Spinner fullscreen={true} />;
  if (isError) return <Spinner fullscreen={true} />;

  const tabs = [
    { id: "all", label: "All", count: lists.length },
    {
      id: "active",
      label: "Active",
      count: lists.filter((l) => l.status === "active").length,
    },
    {
      id: "completed",
      label: "Completed",
      count: lists.filter((l) => l.status === "completed").length,
    },
    {
      id: "shared",
      label: "Shared",
      count: lists.filter((l) => l.is_shared).length,
    },
  ];

  const filteredLists = lists.filter((list) => {
    const matchesSearch = list.name
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesTab =
      activeTab === "all" ||
      (activeTab === "active" && list.status === "active") ||
      (activeTab === "completed" && list.status === "completed") ||
      (activeTab === "shared" && list.is_shared);
    return matchesSearch && matchesTab;
  });

  const total_items = lists.reduce((acc, list) => acc + list.total_items, 0);
  const activeLists = lists.filter((l) => l.status === "active").length;

  const getProgressPercentage = (completed: number, total: number) => {
    return total > 0 ? Math.round((completed / total) * 100) : 0;
  };

  const handleCreateNewList = () => {
    navigate("/lists/new");
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-md md:max-w-4xl lg:max-w-6xl mx-auto">
        {/* Header */}
        <div className="p-4 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-foreground">{`${profile ? profile.first_name + "'s" : "My"} Lists`}</h1>
              <p className="text-sm md:text-base text-muted-foreground">
                {activeLists} active lists • {total_items} total items
              </p>
            </div>
            <Button
              onClick={handleCreateNewList}
              size="sm"
              className="bg-primary text-primary-foreground md:text-base md:h-10 md:px-6"
            >
              <Plus className="h-4 w-4 md:h-5 md:w-5 mr-2" />
              New List
            </Button>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search lists..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Tabs */}
          <div className="w-full flex gap-0.5 bg-muted p-1 rounded-lg">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 flex flex-col items-center justify-center py-1.5 rounded-md text-[12px] 
                        sm:text-xs font-medium transition-colors ${
                          activeTab === tab.id
                            ? "bg-background text-foreground shadow-sm"
                            : "text-muted-foreground hover:text-foreground"
                        }`}
              >
                <span className="leading-tight">{tab.label}</span>
                <Badge
                  variant="secondary"
                  className="mt-0.5 h-3.5 min-w-[16px] px-1 text-[12px] leading-none"
                >
                  {tab.count}
                </Badge>
              </button>
            ))}
          </div>
        </div>

        {/* Lists Grid */}
        <div className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredLists.map((list) => (
            <Card
              key={list.id}
              onClick={() => navigate(`/lists/${list.id}`)}
              className={`cursor-pointer transition-all hover:shadow-md ${
                list.is_pinned ? "ring-2 ring-warning/20 bg-warning/5" : ""
              }`}
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <h3 className="font-semibold text-foreground">
                        {list.name}
                      </h3>
                      {list.is_pinned && (
                        <Pin className="h-4 w-4 text-warning fill-current" />
                      )}
                      {list.is_shared && (
                        <Users className="h-4 w-4 text-info" />
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {new Date(list.updated_at).toLocaleString("en")}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">
                      {list.completed_items}/{list.total_items}
                    </p>
                  </div>
                </div>

                {/* Items Preview */}
                <div className="mb-3">
                  <div className="space-y-1">
                    {list.first_items.map((item, index) => (
                      <>
                        <div
                          key={index - item}
                          className="flex items-center space-x-2"
                        >
                          <div
                            className={`w-4 h-4 rounded border-2 flex items-center justify-center ${
                              index < list.completed_items
                                ? "bg-success border-success"
                                : "border-muted-foreground"
                            }`}
                          >
                            {index < list.completed_items && (
                              <svg
                                className="w-2.5 h-2.5 text-success-foreground"
                                fill="currentColor"
                                viewBox="0 0 20 20"
                              >
                                <path
                                  fillRule="evenodd"
                                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                  clipRule="evenodd"
                                />
                              </svg>
                            )}
                          </div>
                          <span
                            className={`text-sm ${
                              index < list.completed_items
                                ? "line-through text-muted-foreground"
                                : "text-foreground"
                            }`}
                          >
                            {item}
                          </span>
                        </div>
                        {list.first_items.length - 1 == index &&
                        list.total_items - list.first_items.length !== 0 ? (
                          <p className="text-sm text-muted-foreground">{`+ ${list.total_items - list.first_items.length} other items`}</p>
                        ) : (
                          <></>
                        )}
                      </>
                    ))}
                  </div>
                </div>

                {/* Progress */}
                <div className="space-y-2">
                  <Progress
                    value={getProgressPercentage(
                      list.completed_items,
                      list.total_items,
                    )}
                    className="h-2"
                  />
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-muted-foreground">
                      {getProgressPercentage(
                        list.completed_items,
                        list.total_items,
                      )}
                      % complete
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          {/* Create New List Card */}
          <Card
            className="border-2 border-dashed border-muted-foreground/25 cursor-pointer hover:border-muted-foreground/50 transition-colors"
            onClick={handleCreateNewList}
          >
            <CardContent className="p-8 text-center">
              <div className="mb-3">
                <div className="mx-auto w-12 h-12 bg-muted rounded-full flex items-center justify-center">
                  <Plus className="h-6 w-6 text-muted-foreground" />
                </div>
              </div>
              <h3 className="font-medium text-foreground mb-1">
                Create New List
              </h3>
              <p className="text-sm text-muted-foreground">
                Start a new shopping list
              </p>
            </CardContent>
          </Card>
          </div>

          {filteredLists.length === 0 && (
            <div className="text-center py-12">
              <div className="mb-4">
                <div className="mx-auto w-12 h-12 bg-muted rounded-full flex items-center justify-center">
                  <Search className="h-6 w-6 text-muted-foreground" />
                </div>
              </div>
              <p className="text-muted-foreground">No lists found</p>
              <p className="text-sm text-muted-foreground mt-1">
                Try adjusting your search or filters
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Lists;
