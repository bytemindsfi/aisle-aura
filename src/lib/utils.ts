import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Helper function to generate token
export function generateToken(): string {
    return btoa(
        Array.from(crypto.getRandomValues(new Uint8Array(32)))
            .map((b) => String.fromCharCode(b))
            .join('')
    );
}

export const sample_list_data = [
  {
    id: "1",
    name: "Weekly Shopping",
    updatedAt: "Updated 2 hours ago",
    totalItems: 7,
    completedItems: 1,
    isPinned: true,
    status: "active",
    items: ["Milk", "Bread", "Eggs", "+4 more items"],
  },
  {
    id: "2",
    name: "Costco Run",
    updatedAt: "Updated yesterday",
    totalItems: 5,
    completedItems: 2,
    status: "active",
    items: ["Paper Towels", "Toilet Paper", "Chicken Breast", "+2 more items"],
  },
  {
    id: "3",
    name: "Birthday Party",
    updatedAt: "Created 3 days ago",
    totalItems: 9,
    completedItems: 0,
    status: "active",
    items: ["Cake Mix", "Candles", "Party Plates", "+6 more items"],
  },
  {
    id: "4",
    name: "Quick Groceries",
    updatedAt: "Completed 5 days ago",
    totalItems: 3,
    completedItems: 3,
    status: "completed",
    items: ["Bananas", "Yogurt", "Orange Juice"],
  },
  {
    id: "5",
    name: "Family Shopping",
    updatedAt: "Updated 1 hour ago",
    totalItems: 3,
    completedItems: 0,
    isShared: true,
    status: "active",
    items: ["Cereal", "Snacks", "Fruit"],
  },
];
