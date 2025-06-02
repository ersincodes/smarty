import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@clerk/clerk-expo";
import {
  Note,
  Category,
  CreateNoteInput,
  UpdateNoteInput,
  ChatMessage,
  ChatResponse,
} from "../types";
import {
  notesApi,
  categoriesApi,
  chatApi,
  handleApiError,
} from "../config/api";

// Generic API hook state
interface ApiState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

// Notes hooks
export const useNotes = () => {
  const [state, setState] = useState<ApiState<Note[]>>({
    data: null,
    loading: false,
    error: null,
  });
  const { getToken } = useAuth();

  const fetchNotes = useCallback(async () => {
    setState((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const notes = await notesApi.getNotes(getToken);
      setState({ data: notes, loading: false, error: null });
    } catch (error) {
      console.log("⚠️ Unexpected error in useNotes.fetchNotes:", error);
      setState({
        data: [],
        loading: false,
        error: handleApiError(error),
      });
    }
  }, [getToken]);

  const createNote = useCallback(
    async (noteData: CreateNoteInput): Promise<Note | null> => {
      setState((prev) => ({ ...prev, loading: true, error: null }));
      try {
        const newNote = await notesApi.createNote(noteData, getToken);
        // Refresh the notes list
        await fetchNotes();
        return newNote;
      } catch (error) {
        setState((prev) => ({
          ...prev,
          loading: false,
          error: handleApiError(error),
        }));
        return null;
      }
    },
    [getToken, fetchNotes]
  );

  const updateNote = useCallback(
    async (noteData: UpdateNoteInput): Promise<Note | null> => {
      setState((prev) => ({ ...prev, loading: true, error: null }));
      try {
        const updatedNote = await notesApi.updateNote(noteData, getToken);
        // Refresh the notes list
        await fetchNotes();
        return updatedNote;
      } catch (error) {
        setState((prev) => ({
          ...prev,
          loading: false,
          error: handleApiError(error),
        }));
        return null;
      }
    },
    [getToken, fetchNotes]
  );

  const deleteNote = useCallback(
    async (id: string): Promise<boolean> => {
      setState((prev) => ({ ...prev, loading: true, error: null }));
      try {
        await notesApi.deleteNote(id, getToken);
        // Refresh the notes list
        await fetchNotes();
        return true;
      } catch (error) {
        setState((prev) => ({
          ...prev,
          loading: false,
          error: handleApiError(error),
        }));
        return false;
      }
    },
    [getToken, fetchNotes]
  );

  const searchNotes = useCallback(
    async (query: string): Promise<Note[]> => {
      setState((prev) => ({ ...prev, loading: true, error: null }));
      try {
        const searchResults = await notesApi.searchNotes(query, getToken);
        setState((prev) => ({ ...prev, loading: false, error: null }));
        return searchResults;
      } catch (error) {
        setState((prev) => ({
          ...prev,
          loading: false,
          error: handleApiError(error),
        }));
        return [];
      }
    },
    [getToken]
  );

  useEffect(() => {
    fetchNotes();
  }, [fetchNotes]);

  return {
    notes: state.data || [],
    loading: state.loading,
    error: state.error,
    fetchNotes,
    createNote,
    updateNote,
    deleteNote,
    searchNotes,
  };
};

// Individual note hook
export const useNote = (id: string) => {
  const [state, setState] = useState<ApiState<Note>>({
    data: null,
    loading: false,
    error: null,
  });
  const { getToken } = useAuth();

  const fetchNote = useCallback(async () => {
    if (!id) return;

    setState((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const note = await notesApi.getNote(id, getToken);
      setState({ data: note, loading: false, error: null });
    } catch (error) {
      setState({
        data: null,
        loading: false,
        error: handleApiError(error),
      });
    }
  }, [id, getToken]);

  useEffect(() => {
    fetchNote();
  }, [fetchNote]);

  return {
    note: state.data,
    loading: state.loading,
    error: state.error,
    refetch: fetchNote,
  };
};

// Categories hooks
export const useCategories = () => {
  const [state, setState] = useState<ApiState<Category[]>>({
    data: null,
    loading: false,
    error: null,
  });
  const { getToken } = useAuth();

  const fetchCategories = useCallback(async () => {
    setState((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const categories = await categoriesApi.getCategories(getToken);
      setState({ data: categories, loading: false, error: null });
    } catch (error) {
      setState({
        data: [],
        loading: false,
        error: handleApiError(error),
      });
    }
  }, [getToken]);

  const createCategory = useCallback(
    async (categoryData: {
      name: string;
      color: string;
    }): Promise<Category | null> => {
      setState((prev) => ({ ...prev, loading: true, error: null }));
      try {
        const newCategory = await categoriesApi.createCategory(
          categoryData,
          getToken
        );
        // Refresh the categories list
        await fetchCategories();
        return newCategory;
      } catch (error) {
        setState((prev) => ({
          ...prev,
          loading: false,
          error: handleApiError(error),
        }));
        return null;
      }
    },
    [getToken, fetchCategories]
  );

  const updateCategory = useCallback(
    async (
      id: string,
      categoryData: Partial<{ name: string; color: string }>
    ): Promise<Category | null> => {
      setState((prev) => ({ ...prev, loading: true, error: null }));
      try {
        const updatedCategory = await categoriesApi.updateCategory(
          id,
          categoryData,
          getToken
        );
        // Refresh the categories list
        await fetchCategories();
        return updatedCategory;
      } catch (error) {
        setState((prev) => ({
          ...prev,
          loading: false,
          error: handleApiError(error),
        }));
        return null;
      }
    },
    [getToken, fetchCategories]
  );

  const deleteCategory = useCallback(
    async (id: string): Promise<boolean> => {
      setState((prev) => ({ ...prev, loading: true, error: null }));
      try {
        await categoriesApi.deleteCategory(id, getToken);
        // Refresh the categories list
        await fetchCategories();
        return true;
      } catch (error) {
        setState((prev) => ({
          ...prev,
          loading: false,
          error: handleApiError(error),
        }));
        return false;
      }
    },
    [getToken, fetchCategories]
  );

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  return {
    categories: state.data || [],
    loading: state.loading,
    error: state.error,
    fetchCategories,
    createCategory,
    updateCategory,
    deleteCategory,
  };
};

// Chat hook with enhanced response handling
export const useChat = () => {
  const [state, setState] = useState<{
    messages: ChatMessage[];
    loading: boolean;
    error: string | null;
  }>({
    messages: [],
    loading: false,
    error: null,
  });
  const { getToken } = useAuth();

  const sendMessage = useCallback(
    async (newMessage: string): Promise<ChatResponse | null> => {
      const userMessage: ChatMessage = {
        role: "user",
        content: newMessage,
      };

      // Add user message immediately
      setState((prev) => ({
        ...prev,
        messages: [...prev.messages, userMessage],
        loading: true,
        error: null,
      }));

      try {
        const messages = [...state.messages, userMessage];
        const response = await chatApi.sendMessage(messages, getToken);

        const assistantMessage: ChatMessage = {
          role: "assistant",
          content: response.content,
        };

        setState((prev) => ({
          ...prev,
          messages: [...prev.messages, assistantMessage],
          loading: false,
          error: null,
        }));

        return response;
      } catch (error) {
        setState((prev) => ({
          ...prev,
          loading: false,
          error: handleApiError(error),
        }));
        return null;
      }
    },
    [state.messages, getToken]
  );

  const getSuggestions = useCallback(
    async (prompt: string): Promise<string[]> => {
      try {
        const response = await chatApi.getSuggestions(prompt, getToken);
        return response.suggestions;
      } catch (error) {
        console.error("Failed to get suggestions:", error);
        return [];
      }
    },
    [getToken]
  );

  const clearMessages = useCallback(() => {
    setState({
      messages: [],
      loading: false,
      error: null,
    });
  }, []);

  return {
    messages: state.messages,
    loading: state.loading,
    error: state.error,
    sendMessage,
    getSuggestions,
    clearMessages,
  };
};

// Utility hook for API health check
export const useApiHealth = () => {
  const [isHealthy, setIsHealthy] = useState<boolean | null>(null);
  const [checking, setChecking] = useState(false);

  const checkHealth = useCallback(async () => {
    setChecking(true);
    try {
      const { healthCheck } = await import("../config/api");
      const healthy = await healthCheck();
      setIsHealthy(healthy);
    } catch (error) {
      setIsHealthy(false);
    } finally {
      setChecking(false);
    }
  }, []);

  useEffect(() => {
    checkHealth();
  }, [checkHealth]);

  return {
    isHealthy,
    checking,
    checkHealth,
  };
};
