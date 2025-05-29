import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@clerk/clerk-expo";
import {
  Note,
  Category,
  CreateNoteInput,
  UpdateNoteInput,
  ChatMessage,
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
      setState({ data: null, loading: false, error: handleApiError(error) });
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

  // Auto-fetch notes on mount
  useEffect(() => {
    fetchNotes();
  }, [fetchNotes]);

  return {
    notes: state.data,
    loading: state.loading,
    error: state.error,
    fetchNotes,
    createNote,
    updateNote,
    deleteNote,
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
      setState({ data: null, loading: false, error: handleApiError(error) });
    }
  }, [getToken]);

  const createCategory = useCallback(
    async (name: string): Promise<Category | null> => {
      setState((prev) => ({ ...prev, loading: true, error: null }));
      try {
        const newCategory = await categoriesApi.createCategory(name, getToken);
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

  // Auto-fetch categories on mount
  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  return {
    categories: state.data,
    loading: state.loading,
    error: state.error,
    fetchCategories,
    createCategory,
    deleteCategory,
  };
};

// Chat hook with streaming support
export const useChat = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const { getToken } = useAuth();

  const sendMessage = useCallback(
    async (
      userMessage: string,
      onStreamChunk?: (chunk: string) => void
    ): Promise<string | null> => {
      setLoading(true);
      setError(null);
      setIsStreaming(!!onStreamChunk);

      // Add user message to the conversation
      const newUserMessage: ChatMessage = {
        role: "user",
        content: userMessage,
      };

      const updatedMessages = [...messages, newUserMessage];
      setMessages(updatedMessages);

      try {
        let assistantResponse = "";

        if (onStreamChunk) {
          // Streaming version
          assistantResponse = await chatApi.sendMessage(
            updatedMessages,
            getToken,
            (chunk) => {
              onStreamChunk(chunk);
            }
          );
        } else {
          // Non-streaming version
          assistantResponse = await chatApi.sendMessageSimple(
            updatedMessages,
            getToken
          );
        }

        // Add assistant response to the conversation
        const assistantMessage: ChatMessage = {
          role: "assistant",
          content: assistantResponse,
        };

        setMessages([...updatedMessages, assistantMessage]);
        setLoading(false);
        setIsStreaming(false);
        return assistantResponse;
      } catch (error) {
        setError(handleApiError(error));
        setLoading(false);
        setIsStreaming(false);
        return null;
      }
    },
    [messages, getToken]
  );

  const clearMessages = useCallback(() => {
    setMessages([]);
    setError(null);
  }, []);

  const removeLastMessage = useCallback(() => {
    setMessages((prev) => prev.slice(0, -1));
  }, []);

  return {
    messages,
    loading,
    error,
    isStreaming,
    sendMessage,
    clearMessages,
    removeLastMessage,
  };
};

// Hook for individual note operations (useful for detail views)
export const useNote = (noteId?: string) => {
  const [state, setState] = useState<ApiState<Note>>({
    data: null,
    loading: false,
    error: null,
  });
  const { getToken } = useAuth();

  const fetchNote = useCallback(
    async (id: string) => {
      setState((prev) => ({ ...prev, loading: true, error: null }));
      try {
        // Since there's no single note endpoint, we'll fetch all notes and find the one we need
        const notes = await notesApi.getNotes(getToken);
        const note = notes.find((n) => n.id === id);
        if (note) {
          setState({ data: note, loading: false, error: null });
        } else {
          setState({ data: null, loading: false, error: "Note not found" });
        }
      } catch (error) {
        setState({ data: null, loading: false, error: handleApiError(error) });
      }
    },
    [getToken]
  );

  const updateNote = useCallback(
    async (noteData: UpdateNoteInput): Promise<Note | null> => {
      setState((prev) => ({ ...prev, loading: true, error: null }));
      try {
        const updatedNote = await notesApi.updateNote(noteData, getToken);
        setState({ data: updatedNote, loading: false, error: null });
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
    [getToken]
  );

  const deleteNote = useCallback(
    async (id: string): Promise<boolean> => {
      setState((prev) => ({ ...prev, loading: true, error: null }));
      try {
        await notesApi.deleteNote(id, getToken);
        setState({ data: null, loading: false, error: null });
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
    [getToken]
  );

  // Auto-fetch note when noteId is provided
  useEffect(() => {
    if (noteId) {
      fetchNote(noteId);
    }
  }, [noteId, fetchNote]);

  return {
    note: state.data,
    loading: state.loading,
    error: state.error,
    fetchNote,
    updateNote,
    deleteNote,
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
