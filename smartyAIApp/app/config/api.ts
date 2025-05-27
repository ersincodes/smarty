import axios from "axios";
import {
  CreateNoteInput,
  UpdateNoteInput,
  Note,
  Category,
  ChatMessage,
} from "../types";

const API_BASE_URL = "https://smarty-teal.vercel.app/api";

// Create axios instance with default config
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Notes API
export const notesApi = {
  // Get all notes
  getNotes: async (): Promise<Note[]> => {
    const response = await apiClient.get("/notes");
    return response.data;
  },

  // Create a new note
  createNote: async (noteData: CreateNoteInput): Promise<Note> => {
    const response = await apiClient.post("/notes", noteData);
    return response.data.note;
  },

  // Update a note
  updateNote: async (noteData: UpdateNoteInput): Promise<Note> => {
    const response = await apiClient.put("/notes", noteData);
    return response.data.note;
  },

  // Delete a note
  deleteNote: async (id: string): Promise<void> => {
    await apiClient.delete("/notes", { data: { id } });
  },
};

// Categories API
export const categoriesApi = {
  // Get all categories
  getCategories: async (): Promise<Category[]> => {
    const response = await apiClient.get("/categories");
    return response.data;
  },

  // Create a new category
  createCategory: async (name: string): Promise<Category> => {
    const response = await apiClient.post("/categories", { name });
    return response.data.category;
  },
};

// Chat API
export const chatApi = {
  // Send chat message
  sendMessage: async (messages: ChatMessage[]): Promise<string> => {
    const response = await apiClient.post("/chat", { messages });
    return response.data.content;
  },
};

// Set auth token for API requests
export const setAuthToken = (token: string) => {
  apiClient.defaults.headers.common["Authorization"] = `Bearer ${token}`;
};

// Remove auth token
export const removeAuthToken = () => {
  delete apiClient.defaults.headers.common["Authorization"];
};

export default apiClient;
