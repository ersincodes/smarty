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

// Add request interceptor to log API calls
apiClient.interceptors.request.use(
  (config) => {
    console.log(
      `API Request: ${config.method?.toUpperCase()} ${config.baseURL}${
        config.url
      }`
    );
    return config;
  },
  (error) => {
    console.error("API Request Error:", error);
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => {
    console.log(`API Response: ${response.status} ${response.config.url}`);
    return response;
  },
  (error: AxiosError<ApiError>) => {
    console.error(
      "API Response Error:",
      error.response?.status,
      error.response?.data
    );

    const errorMessage =
      error.response?.data?.error || error.message || "An error occurred";
    throw new Error(errorMessage);
  }
);

// Auth token helper
const getAuthHeaders = async (getToken: () => Promise<string | null>) => {
  const token = await getToken();
  if (!token) {
    throw new Error("Authentication token not available");
  }
  return {
    Authorization: `Bearer ${token}`,
  };
};

// Notes API
export const notesApi = {
  // Get all notes
  getNotes: async (getToken: () => Promise<string | null>): Promise<Note[]> => {
    try {
      console.log("🧪 Using simple endpoint for notes (no auth required)");
      const response = await apiClient.get<{
        notes: Note[];
        success: boolean;
        message: string;
      }>("/notes-simple");
      console.log(
        "✅ GET /notes-simple response:",
        response.status,
        response.data.message
      );
      return response.data.notes;
    } catch (error) {
      console.error("❌ Error fetching notes:", error);
      // Fallback to test endpoint if simple endpoint fails
      try {
        console.log("🔄 Trying fallback test endpoint...");
        const fallbackResponse = await apiClient.get<{ notes: Note[] }>(
          "/notes-test"
        );
        console.log(
          "✅ Fallback GET /notes-test response:",
          fallbackResponse.status
        );
        return fallbackResponse.data.notes;
      } catch (fallbackError) {
        console.error("❌ Fallback also failed:", fallbackError);
        throw error; // Throw original error
      }
    }
  },

  // Create a new note
  createNote: async (
    noteData: CreateNoteInput,
    getToken: () => Promise<string | null>
  ): Promise<Note> => {
    try {
      console.log("🧪 Creating note via simple endpoint");
      const response = await apiClient.post<{
        note: Note;
        success: boolean;
        message: string;
      }>("/notes-simple", noteData);
      console.log("✅ Created note:", response.data.message);
      return response.data.note;
    } catch (error) {
      console.error("❌ Error creating note:", error);
      // Fallback to test endpoint
      try {
        console.log("🔄 Trying fallback test endpoint...");
        const fallbackResponse = await apiClient.post<CreateNoteResponse>(
          "/notes-test",
          noteData
        );
        console.log("✅ Fallback created note via test endpoint");
        return fallbackResponse.data.note;
      } catch (fallbackError) {
        console.error("❌ Fallback creation also failed:", fallbackError);
        throw error;
      }
    }
  },

  // Update a note
  updateNote: async (
    noteData: UpdateNoteInput,
    getToken: () => Promise<string | null>
  ): Promise<Note> => {
    try {
      // For now, use test endpoint for updates since simple endpoint doesn't support updates yet
      console.log("🧪 Updating note via test endpoint");
      const response = await apiClient.put<UpdateNoteResponse>(
        "/notes-test",
        noteData
      );
      console.log("✅ Updated note:", response.data.note);
      return response.data.note;
    } catch (error) {
      console.error("❌ Error updating note:", error);
      throw error;
    }
  },

  // Delete a note
  deleteNote: async (
    id: string,
    getToken: () => Promise<string | null>
  ): Promise<void> => {
    try {
      // For now, use test endpoint for deletes since simple endpoint doesn't support deletes yet
      console.log("🧪 Deleting note via test endpoint");
      await apiClient.delete<DeleteNoteResponse>("/notes-test", {
        data: { id },
      });
      console.log("✅ Deleted note:", id);
    } catch (error) {
      console.error("❌ Error deleting note:", error);
      throw error;
    }
  },
};

// Categories API
export const categoriesApi = {
  // Get all categories
  getCategories: async (
    getToken: () => Promise<string | null>
  ): Promise<Category[]> => {
    try {
      console.log("🧪 Using simple endpoint for categories (no auth required)");
      const response = await apiClient.get<{
        categories: Category[];
        success: boolean;
        message: string;
      }>("/categories-simple");
      console.log(
        "✅ GET /categories-simple response:",
        response.status,
        response.data.message
      );
      return response.data.categories;
    } catch (error) {
      console.error("❌ Error fetching categories:", error);
      // Fallback to auth endpoint if simple endpoint fails
      try {
        console.log("🔄 Trying fallback auth endpoint...");
        const headers = await getAuthHeaders(getToken);
        const fallbackResponse = await apiClient.get<GetCategoriesResponse>(
          "/categories",
          {
            headers,
          }
        );
        console.log(
          "✅ Fallback GET /categories response:",
          fallbackResponse.status
        );
        return fallbackResponse.data.categories;
      } catch (fallbackError) {
        console.error("❌ Fallback also failed:", fallbackError);
        throw error; // Throw original error
      }
    }
  },

  // Create a new category
  createCategory: async (
    name: string,
    getToken: () => Promise<string | null>
  ): Promise<Category> => {
    try {
      console.log("🧪 Creating category via simple endpoint");
      const response = await apiClient.post<{
        category: Category;
        success: boolean;
        message: string;
      }>("/categories-simple", { name });
      console.log("✅ Created category:", response.data.message);
      return response.data.category;
    } catch (error) {
      console.error("❌ Error creating category:", error);
      // Fallback to auth endpoint
      try {
        console.log("🔄 Trying fallback auth endpoint...");
        const headers = await getAuthHeaders(getToken);
        const fallbackResponse = await apiClient.post<CreateCategoryResponse>(
          "/categories",
          { name },
          {
            headers,
          }
        );
        console.log("✅ Fallback created category via auth endpoint");
        return fallbackResponse.data.category;
      } catch (fallbackError) {
        console.error("❌ Fallback creation also failed:", fallbackError);
        throw error;
      }
    }
  },

  // Delete a category
  deleteCategory: async (
    id: string,
    getToken: () => Promise<string | null>
  ): Promise<void> => {
    try {
      console.log("🧪 Deleting category via simple endpoint");
      await apiClient.delete<{
        success: boolean;
        message: string;
      }>("/categories-simple", {
        data: { id },
      });
      console.log("✅ Deleted category:", id);
    } catch (error) {
      console.error("❌ Error deleting category:", error);
      // Fallback to auth endpoint
      try {
        console.log("🔄 Trying fallback auth endpoint...");
        const headers = await getAuthHeaders(getToken);
        await apiClient.delete<DeleteCategoryResponse>("/categories", {
          data: { id },
          headers,
        });
        console.log("✅ Fallback deleted category via auth endpoint");
      } catch (fallbackError) {
        console.error("❌ Fallback deletion also failed:", fallbackError);
        throw error;
      }
    }
  },
};

// Chat API with streaming support
export const chatApi = {
  // Send chat message and get streaming response
  sendMessage: async (
    messages: ChatMessage[],
    getToken: () => Promise<string | null>,
    onChunk?: (chunk: string) => void
  ): Promise<string> => {
    try {
      const token = await getToken();
      if (!token) {
        throw new Error("Authentication token not available");
      }

      const response = await fetch(`${ENV.API_BASE_URL}/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ messages } as ChatRequest),
      });

      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(
          `HTTP error! status: ${response.status}, message: ${errorData}`
        );
      }

      if (!response.body) {
        throw new Error("No response body available");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let fullResponse = "";

      try {
        while (true) {
          const { done, value } = await reader.read();

          if (done) break;

          const chunk = decoder.decode(value, { stream: true });
          fullResponse += chunk;

          // Call the onChunk callback if provided
          if (onChunk) {
            onChunk(chunk);
          }
        }
      } finally {
        reader.releaseLock();
      }

      return fullResponse;
    } catch (error) {
      console.error("Error in chat API:", error);
      throw error;
    }
  },

  // Non-streaming version for simpler use cases
  sendMessageSimple: async (
    messages: ChatMessage[],
    getToken: () => Promise<string | null>
  ): Promise<string> => {
    return chatApi.sendMessage(messages, getToken);
  },
};

// Utility function to handle API errors consistently
export const handleApiError = (error: unknown): string => {
  if (error instanceof Error) {
    return error.message;
  }
  return "An unexpected error occurred";
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

// Utility function to test API endpoints - for development debugging
export const testApiEndpoints = async (
  getToken: () => Promise<string | null>
) => {
  console.log("=== API Endpoint Testing ===");
  const token = await getToken();

  if (!token) {
    console.error("No authentication token available");
    return;
  }

  const endpoints = [
    { method: "GET", url: "/notes", description: "GET notes" },
    {
      method: "POST",
      url: "/notes",
      body: {},
      description: "POST notes (empty body)",
    },
    { method: "GET", url: "/notes/list", description: "GET notes/list" },
    {
      method: "POST",
      url: "/notes/list",
      body: {},
      description: "POST notes/list",
    },
  ];

  for (const endpoint of endpoints) {
    try {
      console.log(`Testing ${endpoint.description}...`);

      const config = {
        method: endpoint.method,
        url: `${ENV.API_BASE_URL}${endpoint.url}`,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        ...(endpoint.body && { data: endpoint.body }),
      };

      const response = await axios(config);
      console.log(
        `✅ ${endpoint.description}: ${response.status} ${response.statusText}`
      );
      console.log("Response data:", response.data);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.log(
          `❌ ${endpoint.description}: ${error.response?.status} ${
            error.response?.statusText || error.message
          }`
        );
        if (error.response?.data) {
          console.log("Error data:", error.response.data);
        }
      } else {
        console.log(`❌ ${endpoint.description}: ${error}`);
      }
    }
    console.log("---");
  }
  console.log("=== End API Testing ===");
};

export default apiClient;
