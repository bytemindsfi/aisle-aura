import { useCallback, useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowLeft, X, Plus, Pin, Trash2, Share2, Archive } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  useAddNewListMutation,
  useGetListByIdQuery,
  useAddItemToListMutation,
  useToggleListItemMutation,
  useDeleteListItemMutation,
  useUpdateListNameMutation,
  useDeleteListMutation,
  useUpdateListPinMutation,
  useUpdateListArchiveMutation,
  useUpdateListStatusMutation,
} from "@/redux/aisle-aura.ts";
import { ListItem, NewListInput } from "@/types";
import { Spinner } from "@/components/ui/Spinner.tsx";
import { cn } from "@/lib/utils.ts";
import ShareList from "@/components/ShareList.tsx";

const GroceryList = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const isNewList = id === "new";
  const [listName, setListName] = useState<string>(isNewList ? "New List" : "");
  const [newItemName, setNewItemName] = useState<string>("");
  const [newItemQuantity, setNewItemQuantity] = useState<string>("1");
  const [newItemCategory, setNewItemCategory] = useState<string>("Produce");
  const [isShareDialogOpen, setIsShareDialogOpen] = useState<boolean>(false);
  const [localItems, setLocalItems] = useState<Partial<ListItem[]> | []>([]);
  const {
    data: list,
    isLoading,
    error,
    refetch,
  } = useGetListByIdQuery(id!, {
    skip: isNewList,
  });
  const [addNewList, { isLoading: isCreating }] = useAddNewListMutation();
  const [addItem, { isLoading: isAddingItem }] = useAddItemToListMutation();
  const [toggleItem] = useToggleListItemMutation();
  const [deleteItem] = useDeleteListItemMutation();
  const [updateListName] = useUpdateListNameMutation();
  const [deleteList] = useDeleteListMutation();
  const [updateListPin] = useUpdateListPinMutation();
  const [updateListArchive] = useUpdateListArchiveMutation();
  const [updateListStatus] = useUpdateListStatusMutation();
  const isPinned = list?.is_pinned ?? false;
  const isArchived = list?.status === "completed";
  const items = isNewList ? localItems : list?.list_items || [];
  const totalItems = items.length;
  const completedItems = items.filter((item) => item.is_completed).length;
  const progressPercentage =
    totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;

  const categories = [
    "Produce",
    "Dairy",
    "Meat",
    "Bakery",
    "Beverages",
    "Snacks",
    "Frozen",
    "Pantry",
    "Personal Care",
    "Household",
    "Other",
  ];

  const handleUpdateListStatus = useCallback(
    async (id: string, status: "completed" | "active") => {
      try {
        await updateListStatus({ listId: id, status }).unwrap();
        refetch();
      } catch (err) {
        console.error("Failed to update list status:", err);
      }
    },
    [updateListStatus, refetch],
  );

  useEffect(() => {
    if (list && !isNewList) {
      setListName(list.name);
    }
  }, [list, isNewList]);

  useEffect(() => {
    if (isNewList || !list) return;

    const shouldBeCompleted = totalItems > 0 && completedItems === totalItems;
    const currentStatus = list.status;

    // Only update if status needs to change
    if (shouldBeCompleted && currentStatus !== "completed") {
      handleUpdateListStatus(id!, "completed");
    } else if (!shouldBeCompleted && currentStatus === "completed") {
      handleUpdateListStatus(id!, "active");
    }
  }, [totalItems, completedItems, list, isNewList, id, handleUpdateListStatus]);

  // Handle loading and error states
  if (isLoading) return <Spinner fullscreen={true} />;

  if (error && !isNewList) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-destructive mb-4">Failed to load list</p>
          <Button onClick={() => navigate("/lists")}>Back to Lists</Button>
        </div>
      </div>
    );
  }

  const groupedItems = categories.reduce(
    (acc, category) => {
      const categoryItems = items.filter((item) => item.category === category);
      if (categoryItems.length > 0) {
        acc[category] = categoryItems;
      }
      return acc;
    },
    {} as Record<string, ListItem[]>,
  );

  const handleToggleItem = async (itemId: string, currentStatus: boolean) => {
    if (isNewList) {
      setLocalItems(
        localItems.map((item, index) =>
          index.toString() === itemId
            ? { ...item, is_completed: !currentStatus }
            : item,
        ),
      );
    } else {
      // For existing lists, call mutation
      try {
        await toggleItem({ itemId, isCompleted: !currentStatus }).unwrap();
        // Refetch list to update stats
        refetch();
      } catch (err) {
        toast({
          title: "Error",
          description: "Failed to update item.",
          variant: "destructive",
        });
      }
    }
  };

  const handleRemoveItem = async (itemId: string) => {
    if (isNewList) {
      setLocalItems(
        localItems.filter((_, index) => index.toString() !== itemId),
      );
      toast({
        title: "Item removed",
        description: "The item has been removed from your list.",
      });
    } else {
      // For existing lists, call mutation
      try {
        await deleteItem(itemId).unwrap();
        // Refetch list to update stats
        refetch();
        toast({
          title: "Item removed",
          description: "The item has been removed from your list.",
        });
      } catch (err) {
        toast({
          title: "Error",
          description: "Failed to remove item.",
          variant: "destructive",
        });
      }
    }
  };

  const handleAddItem = async () => {
    if (!newItemName.trim()) return;

    const newItem = {
      name: newItemName.trim(),
      quantity: parseInt(newItemQuantity) || 1,
      category: newItemCategory,
      is_completed: false,
    };

    if (isNewList) {
      setLocalItems([...localItems, newItem]);
      setNewItemName("");
      setNewItemQuantity("1");
      toast({
        title: "Item added",
        description: `${newItem.name} has been added to your list.`,
      });
    } else {
      // For existing lists, call mutation
      try {
        await addItem({
          listId: id!,
          name: newItem.name,
          quantity: newItem.quantity,
          category: newItem.category,
        }).unwrap();
        setNewItemName("");
        setNewItemQuantity("1");
        // Refetch list to update stats
        refetch();
        toast({
          title: "Item added",
          description: `${newItem.name} has been added to your list.`,
        });
      } catch (err) {
        toast({
          title: "Error",
          description: "Failed to add item.",
          variant: "destructive",
        });
      }
    }
  };

  const handleClearCompleted = async () => {
    if (isNewList) {
      setLocalItems(localItems.filter((item) => !item.is_completed));
      toast({
        title: "Completed items cleared",
        description: "All completed items have been removed.",
      });
    } else {
      // Delete all completed items
      const completedItemIds = items
        .filter((item) => item.is_completed)
        .map((item) => item.id);

      try {
        await Promise.all(
          completedItemIds.map((itemId) => deleteItem(itemId).unwrap()),
        );
        // Refetch list to update stats
        refetch();
        toast({
          title: "Completed items cleared",
          description: "All completed items have been removed.",
        });
      } catch (err) {
        toast({
          title: "Error",
          description: "Failed to clear completed items.",
          variant: "destructive",
        });
      }
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleAddItem();
    }
  };

  const handleSave = async () => {
    if (isNewList) {
      // Create new list
      if (!listName.trim()) {
        toast({
          title: "Error",
          description: "Please enter a list name.",
          variant: "destructive",
        });
        return;
      }

      try {
        const newList: NewListInput = {
          name: listName.trim(),
          is_shared: false,
          is_pinned: false,
          items: localItems,
        };

        await addNewList(newList).unwrap();

        toast({
          title: "List created",
          description: `${listName} has been created successfully.`,
        });
        navigate("/lists");
      } catch (err: any) {
        console.log(err.message);
        toast({
          title: "Error",
          description: "Failed to create list. Please try again.",
          variant: "destructive",
        });
      }
    } else {
      // Update existing list name if changed
      if (listName.trim() && listName !== list?.name) {
        try {
          await updateListName({ listId: id!, name: listName.trim() }).unwrap();
          toast({
            title: "List updated",
            description: "List name has been updated.",
          });
        } catch (err) {
          toast({
            title: "Error",
            description: "Failed to update list name.",
            variant: "destructive",
          });
        }
      }
      navigate("/lists");
    }
  };

  const handleDeleteList = async () => {
    if (isNewList) return;

    try {
      await deleteList(list!.id).unwrap();
      toast({
        title: "List deleted",
        description: "The list has been deleted.",
      });
      navigate("/lists");
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to delete list.",
        variant: "destructive",
      });
    }
  };

  const handlePin = async () => {
    if (isNewList) return;

    const newPinStatus = !isPinned;

    try {
      await updateListPin({ listId: id!, isPinned: newPinStatus }).unwrap();
      toast({
        title: newPinStatus ? "List pinned" : "List unpinned",
        description: newPinStatus
          ? "This list will appear at the top"
          : "This list is no longer pinned",
      });
      // Refetch to update list object and icon state
      refetch();
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to update pin status.",
        variant: "destructive",
      });
    }
  };

  const handleArchive = async () => {
    if (isNewList) return;

    const newStatus = isArchived ? "active" : "completed";

    try {
      await updateListArchive({ listId: id!, status: newStatus }).unwrap();
      toast({
        title: isArchived ? "List restored" : "List archived",
        description: isArchived
          ? "This list is now active again"
          : "This list has been archived",
      });
      // Refetch to update list object and icon state
      refetch();
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to update archive status.",
        variant: "destructive",
      });
    }
  };

  const handleShare = () => {
    setIsShareDialogOpen(true);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-md md:max-w-3xl lg:max-w-4xl mx-auto">
        <div>
          {/* Header */}
          <div className="sticky top-0 bg-background border-b border-border z-10">
            <div className="p-4">
              <div className="w-full flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2 flex-1 min-w-0">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleSave}
                    className="p-0 h-8 w-8 flex-shrink-0"
                    disabled={isCreating}
                  >
                    <ArrowLeft className="h-4 w-4" />
                  </Button>
                  <div className="flex-1 min-w-0">
                    <input
                      placeholder="List name"
                      value={listName}
                      onChange={(evt) => setListName(evt.currentTarget.value)}
                      type="text"
                      maxLength={50}
                      className="w-full text-xl font-semibold text-foreground bg-transparent border-none appearance-none focus:outline-none truncate"
                      title={listName}
                    />
                    <p className="text-sm text-muted-foreground">
                      {totalItems} items • {completedItems} completed
                    </p>
                  </div>
                </div>
              </div>

              {/* Action Bar - Only show for existing lists */}
              {!isNewList && (
                <div className="flex items-center justify-around px-4 py-2 mb-4 bg-muted/30 rounded-lg">
                  <button
                    onClick={handlePin}
                    className={cn(
                      "flex flex-col items-center gap-1 p-2 rounded-lg transition-colors min-w-[60px]",
                      isPinned
                        ? "text-warning"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted/50",
                    )}
                  >
                    <Pin
                      className={cn("h-5 w-5", isPinned && "fill-current")}
                    />
                    <span className="text-[10px] font-medium">
                      {isPinned ? "Pinned" : "Pin"}
                    </span>
                  </button>

                  <button
                    onClick={handleShare}
                    className="flex flex-col items-center gap-1 p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors min-w-[60px]"
                  >
                    <Share2 className="h-5 w-5" />
                    <span className="text-[10px] font-medium">Share</span>
                  </button>

                  <button
                    onClick={handleArchive}
                    className={cn(
                      "flex flex-col items-center gap-1 p-2 rounded-lg transition-colors min-w-[60px]",
                      isArchived
                        ? "text-blue-600"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted/50",
                    )}
                  >
                    <Archive className="h-5 w-5" />
                    <span className="text-[10px] font-medium">
                      {isArchived ? "Archived" : "Archive"}
                    </span>
                  </button>

                  <button
                    onClick={handleDeleteList}
                    className="flex flex-col items-center gap-1 p-2 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors min-w-[60px]"
                  >
                    <Trash2 className="h-5 w-5" />
                    <span className="text-[10px] font-medium">Delete</span>
                  </button>
                </div>
              )}

              {/* Add Item Form */}
              <div className="space-y-3">
                <div className="flex space-x-2">
                  <Input
                    placeholder="Add item..."
                    value={newItemName}
                    onChange={(e) => setNewItemName(e.target.value)}
                    onKeyPress={handleKeyPress}
                    className="flex-1"
                  />
                  <Input
                    type="number"
                    min="1"
                    max="99"
                    value={newItemQuantity}
                    onChange={(e) => setNewItemQuantity(e.target.value)}
                    className="w-16"
                  />
                  <Select
                    value={newItemCategory}
                    onValueChange={setNewItemCategory}
                  >
                    <SelectTrigger className="w-28">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <Button
                  onClick={handleAddItem}
                  className="w-full"
                  disabled={!newItemName.trim() || isAddingItem}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  {isAddingItem ? "Adding..." : "Add Item"}
                </Button>
              </div>

              {/* Progress */}
              <div className="mt-4 space-y-2">
                <Progress value={progressPercentage} className="h-2" />
                <div className="flex justify-between items-center">
                  <span className="text-sm text-success font-medium">
                    {progressPercentage}% complete
                  </span>
                  {completedItems > 0 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleClearCompleted}
                      className="text-muted-foreground hover:text-foreground"
                    >
                      Clear completed
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Items List */}
          <div className="p-4 space-y-6">
            {Object.entries(groupedItems).map(([category, categoryItems]) => (
              <div key={category}>
                <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wide mb-3">
                  {category}
                </h2>
                <div className="space-y-2">
                  {categoryItems.map((item, index) => {
                    const itemKey = isNewList ? index.toString() : item.id;

                    return (
                      <div
                        key={itemKey}
                        className="flex items-center space-x-3 p-3 rounded-lg border border-border bg-card hover:bg-accent/50 transition-colors"
                      >
                        <button
                          onClick={() =>
                            handleToggleItem(itemKey, item.is_completed)
                          }
                          className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                            item.is_completed
                              ? "bg-success border-success"
                              : "border-muted-foreground hover:border-success"
                          }`}
                        >
                          {item.is_completed && (
                            <svg
                              className="w-3 h-3 text-success-foreground"
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
                        </button>

                        <div className="flex-1 min-w-0">
                          <span
                            className={`font-medium ${
                              item.is_completed
                                ? "line-through text-muted-foreground"
                                : "text-foreground"
                            }`}
                          >
                            {item.name}
                          </span>
                        </div>

                        <span className="text-sm text-muted-foreground min-w-[20px] text-center">
                          {item.quantity}
                        </span>

                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveItem(itemKey)}
                          className="p-1 h-8 w-8 text-muted-foreground hover:text-destructive"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}

            {items.length === 0 && (
              <div className="text-center py-12">
                <div className="mb-4">
                  <div className="mx-auto w-12 h-12 bg-muted rounded-full flex items-center justify-center">
                    <Plus className="h-6 w-6 text-muted-foreground" />
                  </div>
                </div>
                <p className="text-foreground font-medium mb-1">
                  Your list is empty
                </p>
                <p className="text-sm text-muted-foreground">
                  Add some items to get started!
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Share Dialog */}
        {!isNewList && (
          <ShareList
            listId={id!}
            listName={listName}
            isOpen={isShareDialogOpen}
            onClose={() => setIsShareDialogOpen(false)}
          />
        )}
      </div>
    </div>
  );
};

export default GroceryList;
