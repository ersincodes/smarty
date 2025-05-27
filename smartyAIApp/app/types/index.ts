export interface Note {
  id: string;
  title: string;
  content: string | null;
  userId: string;
  createdAt: string;
  updatedAt: string;
  categoryId: string | null;
  category?: Category | null;
}

export interface Category {
  id: string;
  name: string;
}

export interface NoteWithCategory extends Note {
  category: Category | null;
}

export interface CreateNoteInput {
  title: string;
  content: string;
  categoryId?: string | null;
}

export interface UpdateNoteInput extends CreateNoteInput {
  id: string;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
}
