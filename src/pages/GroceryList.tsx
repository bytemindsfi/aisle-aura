import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, X, Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface GroceryItem {
  id: string;
  name: string;
  quantity: number;
  category: string;
  completed: boolean;
}

const GroceryList = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [listName] = useState("Grocery List");
  const [newItemName, setNewItemName] = useState("");
  const [newItemQuantity, setNewItemQuantity] = useState("1");
  const [newItemCategory, setNewItemCategory] = useState("Produce");
  
  const [items, setItems] = useState<GroceryItem[]>([
    { id: "1", name: "Bananas", quantity: 6, category: "Produce", completed: false },
    { id: "2", name: "Tomatoes", quantity: 4, category: "Produce", completed: true },
    { id: "3", name: "Lettuce", quantity: 1, category: "Produce", completed: false },
    { id: "4", name: "Milk", quantity: 1, category: "Dairy", completed: true },
    { id: "5", name: "Greek Yogurt", quantity: 2, category: "Dairy", completed: false },
  ]);

  const categories = ["Produce", "Dairy", "Meat", "Pantry", "Frozen", "Beverages", "Snacks", "Other"];
  
  const totalItems = items.length;
  const completedItems = items.filter(item => item.completed).length;
  const progressPercentage = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;

  const groupedItems = categories.reduce((acc, category) => {
    const categoryItems = items.filter(item => item.category === category);
    if (categoryItems.length > 0) {
      acc[category] = categoryItems;
    }
    return acc;
  }, {} as Record<string, GroceryItem[]>);

  const toggleItemCompleted = (itemId: string) => {
    setItems(items.map(item => 
      item.id === itemId ? { ...item, completed: !item.completed } : item
    ));
  };

  const removeItem = (itemId: string) => {
    setItems(items.filter(item => item.id !== itemId));
    toast({
      title: "Item removed",
      description: "The item has been removed from your list.",
    });
  };

  const addItem = () => {
    if (!newItemName.trim()) return;
    
    const newItem: GroceryItem = {
      id: Date.now().toString(),
      name: newItemName.trim(),
      quantity: parseInt(newItemQuantity) || 1,
      category: newItemCategory,
      completed: false,
    };
    
    setItems([...items, newItem]);
    setNewItemName("");
    setNewItemQuantity("1");
    toast({
      title: "Item added",
      description: `${newItem.name} has been added to your list.`,
    });
  };

  const clearCompleted = () => {
    setItems(items.filter(item => !item.completed));
    toast({
      title: "Completed items cleared",
      description: "All completed items have been removed.",
    });
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      addItem();
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-md mx-auto">
        {/* Header */}
        <div className="sticky top-0 bg-background border-b border-border z-10">
          <div className="p-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => navigate("/lists")}
                  className="p-0 h-8 w-8"
                >
                  <ArrowLeft className="h-4 w-4" />
                </Button>
                <div>
                  <h1 className="text-xl font-bold text-foreground">{listName}</h1>
                  <p className="text-sm text-muted-foreground">
                    {totalItems} items • {completedItems} completed
                  </p>
                </div>
              </div>
            </div>

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
                <Select value={newItemCategory} onValueChange={setNewItemCategory}>
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
              
              <Button onClick={addItem} className="w-full" disabled={!newItemName.trim()}>
                <Plus className="h-4 w-4 mr-2" />
                Add Item
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
                    onClick={clearCompleted}
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
                {categoryItems.map((item) => (
                  <div 
                    key={item.id}
                    className="flex items-center space-x-3 p-3 rounded-lg border border-border bg-card hover:bg-accent/50 transition-colors"
                  >
                    <button
                      onClick={() => toggleItemCompleted(item.id)}
                      className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                        item.completed 
                          ? "bg-success border-success" 
                          : "border-muted-foreground hover:border-success"
                      }`}
                    >
                      {item.completed && (
                        <svg className="w-3 h-3 text-success-foreground" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      )}
                    </button>
                    
                    <div className="flex-1">
                      <span className={`font-medium ${
                        item.completed 
                          ? "line-through text-muted-foreground" 
                          : "text-foreground"
                      }`}>
                        {item.name}
                      </span>
                    </div>
                    
                    <span className="text-sm text-muted-foreground min-w-[20px] text-center">
                      {item.quantity}
                    </span>
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeItem(item.id)}
                      className="p-1 h-8 w-8 text-muted-foreground hover:text-destructive"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
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
              <p className="text-foreground font-medium mb-1">Your list is empty</p>
              <p className="text-sm text-muted-foreground">Add some items to get started!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default GroceryList;