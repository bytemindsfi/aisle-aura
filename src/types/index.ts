export interface INewUser {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  agreeToTerms: boolean;
}

export interface ILoginUser {
  email: string;
  password: string;
}

export interface IProfile {
  first_name: string;
  last_name: string;
  email: string;
  password: string;
  agreeToTerms: boolean;
}

export interface List {
  id?: string;
  user_id?: string;
  name: string;
  is_pinned: boolean;
  is_shared: boolean;
  status: "active" | "archived" | "deleted" | "completed";
  created_at?: string;
  updated_at?: string;
}

export interface ListItem {
  id?: string;
  list_id?: string;
  name: string;
    quantity: number ;       // Add this
    category: string | null; // Add this
  is_completed: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface ListWithStats extends List {
  total_items: number;
  completed_items: number;
  first_items: string[];
}

interface GroceryList {
  id: string;
  name: string;
  updatedAt: string;
  totalItems: number;
  completedItems: number;
  isPinned?: boolean;
  isShared?: boolean;
  items: string[];
  status: "active" | "completed";
}

export interface NewListInput extends List{
    items: ListItem[];
}
