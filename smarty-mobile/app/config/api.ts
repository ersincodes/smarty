import axios, { AxiosError } from "axios";
import {
  CreateNoteInput,
  UpdateNoteInput,
  Note,
  Category,
  ChatMessage,
  CreateNoteResponse,
  UpdateNoteResponse,
  DeleteNoteResponse,
  GetCategoriesResponse,
  CreateCategoryResponse,
  DeleteCategoryResponse,
  ApiError,
  ChatRequest,
} from "../types";
import ENV from "./env";

// Create axios instance with default config
const apiClient = axios.create({
  baseURL: ENV.API_BASE_URL,
  timeout: 30000, // Increased timeout for AI operations
  headers: {
    "Content-Type": "application/json",
  },
});

// Add request interceptor for auth
apiClient.interceptors.request.use(
  (config) => {
    return config;
  },
  (error) => {
    console.error("❌ API Request Error:", error);
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error: AxiosError<ApiError>) => {
    console.error(
      "❌ API Response Error:",
      error.response?.status,
      error.response?.statusText,
      error.response?.data
    );

    const errorMessage =
      error.response?.data?.error ||
      error.response?.data?.message ||
      error.message ||
      "An error occurred";
    throw new Error(errorMessage);
  }
);

// Auth token helper
const getAuthHeaders = async (getToken: () => Promise<string | null>) => {
  try {
    const token = await getToken();
    if (!token) {
      throw new Error("Authentication token not available");
    }

    return {
      Authorization: `Bearer ${token}`,
    };
  } catch (error) {
    console.error("❌ Auth token error:", error);
    throw error;
  }
};

// Generic error handler
export const handleApiError = (error: unknown): string => {
  console.error("API Error:", error);

  if (error instanceof Error) {
    if (error.message.includes("Network request failed")) {
      return "Network error. Please check your internet connection.";
    } else if (error.message.includes("401")) {
      return "Authentication error. Please sign in again.";
    } else if (error.message.includes("403")) {
      return "You don't have permission to perform this action.";
    } else if (error.message.includes("404")) {
      return "The requested resource was not found.";
    } else if (error.message.includes("405")) {
      return "Method not allowed. The API endpoint may have changed.";
    } else if (error.message.includes("500")) {
      return "Server error. Please try again later.";
    }
    return error.message;
  }

  return "An unexpected error occurred.";
};

// Notes API - Updated to match your existing Next.js backend
export const notesApi = {
  // Get all notes
  getNotes: async (getToken: () => Promise<string | null>): Promise<Note[]> => {
    try {
      const headers = await getAuthHeaders(getToken);

      const response = await apiClient.get("/notes", { headers });

      // Handle the response format from your backend: { notes: [...] }
      let notes = response.data;
      if (notes && typeof notes === "object" && "notes" in notes) {
        notes = notes.notes; // Unwrap { notes: [...] } format
      }

      // Ensure we return an array
      const noteArray = Array.isArray(notes) ? notes : [];

      return noteArray.map((note) => ({
        ...note,
        createdAt: new Date(note.createdAt),
        updatedAt: new Date(note.updatedAt),
      }));
    } catch (error) {
      console.error("❌ Failed to fetch notes:", error);
      throw error;
    }
  },

  // Get specific note - Your backend doesn't have this yet, so we'll skip it
  getNote: async (
    id: string,
    getToken: () => Promise<string | null>
  ): Promise<Note> => {
    try {
      const headers = await getAuthHeaders(getToken);

      // Since your backend doesn't have /notes/:id, we'll get all notes and filter
      const allNotes = await notesApi.getNotes(getToken);
      const note = allNotes.find((n) => n.id === id);

      if (!note) {
        throw new Error("Note not found");
      }

      return note;
    } catch (error) {
      console.error(`❌ Failed to fetch note ${id}:`, error);
      throw error;
    }
  },

  // Create note - Match your backend's expected format
  createNote: async (
    noteData: CreateNoteInput,
    getToken: () => Promise<string | null>
  ): Promise<Note> => {
    try {
      const headers = await getAuthHeaders(getToken);

      const response = await apiClient.post("/notes", noteData, { headers });

      // Handle the response format: { note: {...} }
      let note = response.data;
      if (note && typeof note === "object" && "note" in note) {
        note = note.note; // Unwrap { note: {...} } format
      }

      return {
        ...note,
        createdAt: new Date(note.createdAt),
        updatedAt: new Date(note.updatedAt),
      };
    } catch (error) {
      console.error("❌ Failed to create note:", error);
      throw error;
    }
  },

  // Update note - Match your backend's expected format (ID in body)
  updateNote: async (
    noteData: UpdateNoteInput,
    getToken: () => Promise<string | null>
  ): Promise<Note> => {
    try {
      const headers = await getAuthHeaders(getToken);

      // Your backend expects the full object including ID in the body
      const response = await apiClient.put("/notes", noteData, { headers });

      // Handle the response format: { note: {...} }
      let note = response.data;
      if (note && typeof note === "object" && "note" in note) {
        note = note.note; // Unwrap { note: {...} } format
      }

      return {
        ...note,
        createdAt: new Date(note.createdAt),
        updatedAt: new Date(note.updatedAt),
      };
    } catch (error) {
      console.error("❌ Failed to update note:", error);
      throw error;
    }
  },

  // Delete note - Match your backend's expected format (ID in body)
  deleteNote: async (
    id: string,
    getToken: () => Promise<string | null>
  ): Promise<void> => {
    try {
      const headers = await getAuthHeaders(getToken);

      // Your backend expects { id } in the request body
      await apiClient.delete("/notes", {
        headers,
        data: { id }, // Send ID in body, not URL
      });
    } catch (error) {
      console.error("❌ Failed to delete note:", error);
      throw error;
    }
  },

  // Search notes using semantic search
  searchNotes: async (
    query: string,
    getToken: () => Promise<string | null>
  ): Promise<Note[]> => {
    try {
      const headers = await getAuthHeaders(getToken);

      const encodedQuery = encodeURIComponent(query);
      const endpoints = [
        `/notes/search?q=${encodedQuery}`, // Target /api/notes/search...
        `/search/notes?q=${encodedQuery}`, // Alternative /api/search/notes...
      ];

      // Try first endpoint
      try {
        const response = await apiClient.get(endpoints[0], { headers });
        let notes = response.data;

        if (notes && typeof notes === "object" && "notes" in notes) {
          notes = notes.notes;
        }

        const noteArray = Array.isArray(notes) ? notes : [];
        return noteArray.map((note) => ({
          ...note,
          createdAt: new Date(note.createdAt),
          updatedAt: new Date(note.updatedAt),
        }));
      } catch (error) {
        // If search endpoint doesn't exist, filter existing notes
        const allNotes = await notesApi.getNotes(getToken);
        const filteredNotes = allNotes.filter(
          (note) =>
            note.title.toLowerCase().includes(query.toLowerCase()) ||
            note.content.toLowerCase().includes(query.toLowerCase())
        );
        return filteredNotes;
      }
    } catch (error) {
      console.error("❌ Failed to search notes:", error);
      throw error;
    }
  },
};

// Categories API - Keep existing format since categories might work
export const categoriesApi = {
  // Get all categories
  getCategories: async (
    getToken: () => Promise<string | null>
  ): Promise<Category[]> => {
    try {
      const headers = await getAuthHeaders(getToken);

      const response = await apiClient.get("/categories", { headers });

      let categories = response.data;
      if (
        categories &&
        typeof categories === "object" &&
        "categories" in categories
      ) {
        categories = categories.categories;
      }

      const categoryArray = Array.isArray(categories) ? categories : [];

      return categoryArray.map((category) => ({
        ...category,
        createdAt: category.createdAt
          ? new Date(category.createdAt)
          : new Date(),
        updatedAt: category.updatedAt
          ? new Date(category.updatedAt)
          : new Date(),
      }));
    } catch (error) {
      console.error("❌ Failed to fetch categories:", error);
      throw error;
    }
  },

  // Create category
  createCategory: async (
    categoryData: { name: string; color: string },
    getToken: () => Promise<string | null>
  ): Promise<Category> => {
    try {
      const headers = await getAuthHeaders(getToken);

      const response = await apiClient.post("/categories", categoryData, {
        headers,
      });

      let category = response.data;
      if (category && typeof category === "object" && "category" in category) {
        category = category.category;
      }

      return {
        ...category,
        createdAt: category.createdAt
          ? new Date(category.createdAt)
          : new Date(),
        updatedAt: category.updatedAt
          ? new Date(category.updatedAt)
          : new Date(),
      };
    } catch (error) {
      console.error("❌ Failed to create category:", error);
      throw error;
    }
  },

  // Update category
  updateCategory: async (
    id: string,
    categoryData: Partial<{ name: string; color: string }>,
    getToken: () => Promise<string | null>
  ): Promise<Category> => {
    try {
      const headers = await getAuthHeaders(getToken);

      // Assuming similar pattern to notes
      const response = await apiClient.put(
        "/categories",
        { id, ...categoryData },
        { headers }
      );

      let category = response.data;
      if (category && typeof category === "object" && "category" in category) {
        category = category.category;
      }

      return {
        ...category,
        createdAt: category.createdAt
          ? new Date(category.createdAt)
          : new Date(),
        updatedAt: category.updatedAt
          ? new Date(category.updatedAt)
          : new Date(),
      };
    } catch (error) {
      console.error("❌ Failed to update category:", error);
      throw error;
    }
  },

  // Delete category
  deleteCategory: async (
    id: string,
    getToken: () => Promise<string | null>
  ): Promise<void> => {
    try {
      const headers = await getAuthHeaders(getToken);

      // Similar pattern to notes - ID in body
      await apiClient.delete("/categories", {
        headers,
        data: { id },
      });
    } catch (error) {
      console.error("❌ Failed to delete category:", error);
      throw error;
    }
  },
};

// Chat API - Keep existing since it might work
export const chatApi = {
  // Send chat message
  sendMessage: async (
    messages: ChatMessage[],
    getToken: () => Promise<string | null>
  ): Promise<{ content: string; relatedNotes?: Note[] }> => {
    try {
      const headers = await getAuthHeaders(getToken);

      const endpoints = [
        "/chat", // Target /api/chat
        "/ai/chat", // Alternative /api/ai/chat
      ];

      const response = await apiClient.post(
        endpoints[0],
        { messages },
        { headers }
      );

      return {
        content: response.data.content,
        relatedNotes:
          response.data.relatedNotes?.map((note: any) => ({
            ...note,
            createdAt: new Date(note.createdAt),
            updatedAt: new Date(note.updatedAt),
          })) || [],
      };
    } catch (error) {
      console.error("❌ Failed to send chat message:", error);
      throw error;
    }
  },

  // Get AI suggestions
  getSuggestions: async (
    prompt: string,
    getToken: () => Promise<string | null>
  ): Promise<{ suggestions: string[] }> => {
    try {
      const headers = await getAuthHeaders(getToken);

      const endpoints = [
        "/chat/suggestions", // Target /api/chat/suggestions
        "/ai/suggestions", // Target /api/ai/suggestions
      ];

      const response = await apiClient.post(
        endpoints[0],
        { prompt },
        { headers }
      );

      return response.data;
    } catch (error) {
      console.error("❌ Failed to get AI suggestions:", error);
      throw error;
    }
  },
};

// Health check endpoint
export const healthCheck = async (): Promise<boolean> => {
  try {
    const response = await fetch(`${ENV.API_BASE_URL}/health`);
    return response.ok;
  } catch (error) {
    console.error("Health check failed:", error);
    return false;
  }
};

export default apiClient;
