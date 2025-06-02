export interface Note {
  id: string;
  title: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
  tags: string[];
  category?: string;
  isAIGenerated: boolean;
  aiSummary?: string;
  isFavorite: boolean;
  isArchived: boolean;
}

export interface CreateNoteRequest {
  title: string;
  content: string;
  tags?: string[];
  category?: string;
}

export interface UpdateNoteRequest {
  id: string;
  title?: string;
  content?: string;
  tags?: string[];
  category?: string;
  isFavorite?: boolean;
  isArchived?: boolean;
  aiSummary?: string;
}

export interface AIRequest {
  prompt: string;
  context?: string;
  type: "generate" | "summarize" | "enhance" | "categorize";
}

export interface AIResponse {
  content: string;
  summary?: string;
  suggestedTags?: string[];
  suggestedCategory?: string;
}

export type NoteFilter = {
  category?: string;
  tags?: string[];
  isArchived?: boolean;
  isFavorite?: boolean;
  searchQuery?: string;
};

export type SortOption = "createdAt" | "updatedAt" | "title" | "category";
export type SortDirection = "asc" | "desc";
