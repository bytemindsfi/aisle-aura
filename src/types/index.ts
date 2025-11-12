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
  quantity: number; // Add this
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

export interface ListDetail {
  id: string;
  name: string;
  updatedAt: string;
  totalItems: number;
  completedItems: number;
  isPinned?: boolean;
  isShared?: boolean;
  list_items: ListItem[];
  status: "active" | "archived" | "deleted" | "completed";
}

export interface NewListInput extends List {
  items: ListItem[];
}

export interface IListMember {
    id: string;
    list_id: string;
    email: string;
    user_id: string | null; // null if user hasn't joined yet
    invited_by_user_id: string;
    status: 'pending' | 'active';
    invitation_token: string | null;
    created_at: string;
    updated_at: string;
}

export interface IShareListRequest {
    list_id: string;
    emails: string[]; // Just email addresses
}

export interface IAcceptInvitationRequest {
    invitation_token: string;
}
