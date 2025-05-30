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

// Enhanced API utility for trying multiple endpoint patterns
const tryMultipleEndpoints = async <T>(
  endpoints: string[],
  headers: Record<string, string>,
  method: "GET" | "POST" | "PUT" | "DELETE" = "GET",
  data?: any
): Promise<T> => {
  for (const endpoint of endpoints) {
    try {
      console.log(`🔍 Trying endpoint: ${method} ${endpoint}`);

      const config: any = {
        method,
        url: endpoint,
        headers,
      };

      if (data && (method === "POST" || method === "PUT")) {
        config.data = data;
      }

      const response = await apiClient(config);

      console.log(`✅ Success with ${endpoint}:`, response.status);

      // Handle different response patterns from Next.js Route Handlers
      let responseData = response.data;

      // If it's wrapped in a success object, unwrap it
      if (responseData && typeof responseData === "object") {
        if ("data" in responseData) {
          responseData = responseData.data;
        }
        // Handle potential Next.js App Router response patterns
        if ("notes" in responseData) {
          responseData = responseData.notes;
        }
        if ("categories" in responseData) {
          responseData = responseData.categories;
        }
      }

      return responseData;
    } catch (error) {
      console.log(
        `❌ ${endpoint} failed:`,
        error instanceof Error ? error.message : error
      );
      // Continue to next endpoint
    }
  }

  throw new Error(`All endpoints failed: ${endpoints.join(", ")}`);
};

// Notes API - Updated with multiple endpoint patterns
export const notesApi = {
  // Get all notes
  getNotes: async (getToken: () => Promise<string | null>): Promise<Note[]> => {
    try {
      const headers = await getAuthHeaders(getToken);
      console.log("🔐 Fetching notes with authentication");

      // Try multiple endpoint patterns that might exist
      const endpoints = [
        "/notes", // Direct route handler (e.g., ENV.API_BASE_URL + "/notes")
      ];

      const notes = await tryMultipleEndpoints<Note[]>(
        endpoints,
        headers,
        "GET"
      );

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

  // Get specific note
  getNote: async (
    id: string,
    getToken: () => Promise<string | null>
  ): Promise<Note> => {
    try {
      const headers = await getAuthHeaders(getToken);
      console.log(`🔐 Fetching note with ID: ${id}`);

      const endpoints = [`/notes/${id}`]; // Target /api/notes/:id

      const note = await tryMultipleEndpoints<Note>(endpoints, headers, "GET");

      return {
        ...note,
        createdAt: new Date(note.createdAt),
        updatedAt: new Date(note.updatedAt),
      };
    } catch (error) {
      console.error(`❌ Failed to fetch note ${id}:`, error);
      throw error;
    }
  },

  // Create note
  createNote: async (
    noteData: CreateNoteInput,
    getToken: () => Promise<string | null>
  ): Promise<Note> => {
    try {
      const headers = await getAuthHeaders(getToken);
      console.log("🔐 Creating new note:", noteData.title);

      const endpoints = ["/notes"]; // Target /api/notes

      const note = await tryMultipleEndpoints<Note>(
        endpoints,
        headers,
        "POST",
        noteData
      );

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

  // Update note
  updateNote: async (
    noteData: UpdateNoteInput,
    getToken: () => Promise<string | null>
  ): Promise<Note> => {
    try {
      const headers = await getAuthHeaders(getToken);
      console.log(`🔐 Updating note: ${noteData.id}`);

      const { id, ...updateData } = noteData;
      const endpoints = [`/notes/${id}`]; // Target /api/notes/:id

      const note = await tryMultipleEndpoints<Note>(
        endpoints,
        headers,
        "PUT",
        updateData
      );

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

  // Delete note
  deleteNote: async (
    id: string,
    getToken: () => Promise<string | null>
  ): Promise<void> => {
    try {
      const headers = await getAuthHeaders(getToken);
      console.log(`🔐 Deleting note: ${id}`);

      const endpoints = [`/notes/${id}`]; // Target /api/notes/:id

      await tryMultipleEndpoints<void>(endpoints, headers, "DELETE");

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

      const notes = await tryMultipleEndpoints<Note[]>(
        endpoints,
        headers,
        "GET"
      );
      const noteArray = Array.isArray(notes) ? notes : [];

      console.log(`✅ Found ${noteArray.length} notes matching query`);
      return noteArray.map((note) => ({
        ...note,
        createdAt: new Date(note.createdAt),
        updatedAt: new Date(note.updatedAt),
      }));
    } catch (error) {
      console.error("❌ Failed to search notes:", error);
      throw error;
    }
  },
};

// Categories API - Updated with multiple endpoint patterns
export const categoriesApi = {
  // Get all categories
  getCategories: async (
    getToken: () => Promise<string | null>
  ): Promise<Category[]> => {
    try {
      const headers = await getAuthHeaders(getToken);
      console.log("🔐 Fetching categories with authentication");

      const endpoints = [
        "/categories", // Target /api/categories
        "/categories/list", // Alternative /api/categories/list
      ];

      const categories = await tryMultipleEndpoints<Category[]>(
        endpoints,
        headers,
        "GET"
      );
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

      const endpoints = ["/categories"]; // Target /api/categories

      const category = await tryMultipleEndpoints<Category>(
        endpoints,
        headers,
        "POST",
        categoryData
      );

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

      const endpoints = [`/categories/${id}`]; // Target /api/categories/:id

      const category = await tryMultipleEndpoints<Category>(
        endpoints,
        headers,
        "PUT",
        categoryData
      );

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

      const endpoints = [`/categories/${id}`]; // Target /api/categories/:id

      await tryMultipleEndpoints<void>(endpoints, headers, "DELETE");

      console.log("✅ Successfully deleted category");
    } catch (error) {
      console.error("❌ Failed to delete category:", error);
      throw error;
    }
  },
};

// Chat API - Updated with multiple endpoint patterns
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

      const response = await tryMultipleEndpoints<{
        content: string;
        relatedNotes?: Note[];
      }>(endpoints, headers, "POST", { messages });

      console.log("✅ Successfully received AI response");
      return {
        content: response.content,
        relatedNotes:
          response.relatedNotes?.map((note) => ({
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

      const response = await tryMultipleEndpoints<{ suggestions: string[] }>(
        endpoints,
        headers,
        "POST",
        { prompt }
      );

      console.log("✅ Successfully received AI suggestions");
      return response;
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
