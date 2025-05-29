export interface Note {
  id: string;
  title: string;
  content: string;
  userId: string;
  categoryId: string | null;
  createdAt: Date;
  updatedAt: Date;
  category?: Category | null;
}

export interface Category {
  id: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface NoteWithCategory extends Note {
  category: Category | null;
}

export interface CreateNoteInput {
  title: string;
  content: string;
  categoryId?: string;
}

export interface UpdateNoteInput {
  id: string;
  title: string;
  content: string;
  categoryId?: string;
}

export interface ChatMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

export interface ChatRequest {
  messages: ChatMessage[];
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
}

// API Response types that match the backend
export interface CreateNoteResponse {
  note: Note;
}

export interface UpdateNoteResponse {
  note: Note;
}

export interface DeleteNoteResponse {
  message: string;
}

export interface GetCategoriesResponse {
  categories: Category[];
}

export interface CreateCategoryResponse {
  category: Category;
}

export interface DeleteCategoryResponse {
  message: string;
}

// Error response type
export interface ApiError {
  error: string;
}

// Chat streaming types
export interface StreamingChatResponse {
  content: string;
  done: boolean;
}

// Auth types for API calls
export interface AuthenticatedApiCall {
  getToken: () => Promise<string | null>;
}
