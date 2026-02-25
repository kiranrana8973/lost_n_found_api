export interface Student {
  _id: string;
  name: string;
  email: string;
  username: string;
  phoneNumber: string;
  batchId: Batch | string;
  profilePicture: string;
  role?: string;
  createdAt: string;
}

export interface Batch {
  _id: string;
  batchName: string;
  status: "active" | "completed" | "cancelled";
  createdAt: string;
}

export interface Category {
  _id: string;
  name: string;
  description?: string;
  status: "active" | "inactive";
  createdAt: string;
}

export interface Item {
  _id: string;
  itemName: string;
  description: string;
  type: "lost" | "found";
  category: Category | string;
  location: string;
  media: string;
  mediaType: "photo" | "video";
  reportedBy: Student | string;
  claimedBy: Student | string | null;
  isClaimed: boolean;
  status: "available" | "claimed" | "resolved";
  createdAt: string;
  updatedAt: string;
}

export interface Comment {
  _id: string;
  text: string;
  item: string;
  commentedBy: Student | string;
  mentionedUsers: Student[];
  parentComment: string | null;
  isReply: boolean;
  likes: Student[];
  isEdited: boolean;
  editedAt: string | null;
  replyCount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  count: number;
  total: number;
  page: number;
  pages: number;
  data: T[];
}

export interface LoginResponse {
  success: boolean;
  token: string;
  refreshToken: string;
  data: Student;
}

export interface ItemFilters {
  page?: number;
  limit?: number;
  type?: "lost" | "found";
  status?: "available" | "claimed" | "resolved";
  category?: string;
}
