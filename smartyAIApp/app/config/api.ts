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

// Add request interceptor to log API calls and add auth
apiClient.interceptors.request.use(
  (config) => {
    console.log(
      `🌐 API Request: ${config.method?.toUpperCase()} ${config.baseURL}${
        config.url
      }`
    );
    // Log headers for debugging auth issues
    console.log("🔑 Request headers:", config.headers);
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
    console.log(`✅ API Response: ${response.status} ${response.config.url}`);
    console.log(
      "📦 Response data preview:",
      typeof response.data === "object"
        ? JSON.stringify(response.data).substring(0, 200) + "..."
        : response.data?.toString().substring(0, 200) + "..."
    );
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

// Auth token helper with better debugging
const getAuthHeaders = async (getToken: () => Promise<string | null>) => {
  try {
    const token = await getToken();
    if (!token) {
      throw new Error("Authentication token not available");
    }

    console.log("🔐 Auth token length:", token.length);
    console.log("🔐 Auth token preview:", token.substring(0, 50) + "...");

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
      console.log("🔐 Fetching notes with authentication");

      const response = await apiClient.get("/notes", { headers });

      // Handle the response format from your backend: { notes: [...] }
      let notes = response.data;
      if (notes && typeof notes === "object" && "notes" in notes) {
        notes = notes.notes; // Unwrap { notes: [...] } format
      }

      // Ensure we return an array
      const noteArray = Array.isArray(notes) ? notes : [];

      console.log(`✅ Successfully fetched ${noteArray.length} notes`);
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
      console.log(`🔐 Fetching note with ID: ${id}`);

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
      console.log("🔐 Creating new note:", noteData.title);

      const response = await apiClient.post("/notes", noteData, { headers });

      // Handle the response format: { note: {...} }
      let note = response.data;
      if (note && typeof note === "object" && "note" in note) {
        note = note.note; // Unwrap { note: {...} } format
      }

      console.log("✅ Successfully created note");
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
      console.log(`🔐 Updating note: ${noteData.id}`);

      // Your backend expects the full object including ID in the body
      const response = await apiClient.put("/notes", noteData, { headers });

      // Handle the response format: { note: {...} }
      let note = response.data;
      if (note && typeof note === "object" && "note" in note) {
        note = note.note; // Unwrap { note: {...} } format
      }

      console.log("✅ Successfully updated note");
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
      console.log(`🔐 Deleting note: ${id}`);

      // Your backend expects { id } in the request body
      await apiClient.delete("/notes", {
        headers,
        data: { id }, // Send ID in body, not URL
      });

      console.log("✅ Successfully deleted note");
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
      console.log(`🔍 Searching notes with query: "${query}"`);

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
        console.log(`✅ Found ${noteArray.length} notes matching query`);
        return noteArray.map((note) => ({
          ...note,
          createdAt: new Date(note.createdAt),
          updatedAt: new Date(note.updatedAt),
        }));
      } catch (error) {
        // If search endpoint doesn't exist, filter existing notes
        console.log("🔍 Search endpoint not available, filtering locally");
        const allNotes = await notesApi.getNotes(getToken);
        const filteredNotes = allNotes.filter(
          (note) =>
            note.title.toLowerCase().includes(query.toLowerCase()) ||
            note.content.toLowerCase().includes(query.toLowerCase())
        );
        console.log(`✅ Found ${filteredNotes.length} notes matching query`);
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
      console.log("🔐 Fetching categories with authentication");

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

      console.log(`✅ Successfully fetched ${categoryArray.length} categories`);
      return categoryArray.map((category) => ({
        ...category,
        createdAt: new Date(category.createdAt),
        updatedAt: new Date(category.updatedAt),
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
      console.log("🔐 Creating new category:", categoryData.name);

      const response = await apiClient.post("/categories", categoryData, {
        headers,
      });

      let category = response.data;
      if (category && typeof category === "object" && "category" in category) {
        category = category.category;
      }

      console.log("✅ Successfully created category");
      return {
        ...category,
        createdAt: new Date(category.createdAt),
        updatedAt: new Date(category.updatedAt),
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
      console.log(`🔐 Updating category: ${id}`);

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

      console.log("✅ Successfully updated category");
      return {
        ...category,
        createdAt: new Date(category.createdAt),
        updatedAt: new Date(category.updatedAt),
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
      console.log(`🔐 Deleting category: ${id}`);

      // Similar pattern to notes - ID in body
      await apiClient.delete("/categories", {
        headers,
        data: { id },
      });

      console.log("✅ Successfully deleted category");
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
      console.log("🔐 Sending chat message to AI");

      const endpoints = [
        "/chat", // Target /api/chat
        "/ai/chat", // Alternative /api/ai/chat
      ];

      const response = await apiClient.post(
        endpoints[0],
        { messages },
        { headers }
      );

      console.log("✅ Successfully received AI response");
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
      console.log("🔐 Getting AI suggestions");

      const endpoints = [
        "/chat/suggestions", // Target /api/chat/suggestions
        "/ai/suggestions", // Target /api/ai/suggestions
      ];

      const response = await apiClient.post(
        endpoints[0],
        { prompt },
        { headers }
      );

      console.log("✅ Successfully received AI suggestions");
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
