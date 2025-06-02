import { create } from "zustand";
import { ChatMessage } from "../types";
import { chatApi } from "../config/api";

interface ChatState {
  messages: ChatMessage[];
  isLoading: boolean;
  error: string | null;
  isOpen: boolean;

  // Actions
  sendMessage: (content: string) => Promise<void>;
  clearMessages: () => void;
  setIsOpen: (isOpen: boolean) => void;
  clearError: () => void;
}

export const useChatStore = create<ChatState>((set, get) => ({
  messages: [],
  isLoading: false,
  error: null,
  isOpen: false,

  sendMessage: async (content: string) => {
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: "user",
      content,
    };

    // Add user message immediately
    const currentMessages = get().messages;
    const updatedMessages = [...currentMessages, userMessage];
    set({ messages: updatedMessages, isLoading: true, error: null });

    try {
      const response = await chatApi.sendMessage(updatedMessages);

      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: response,
      };

      set({
        messages: [...updatedMessages, assistantMessage],
        isLoading: false,
      });
    } catch (error) {
      set({
        error:
          error instanceof Error ? error.message : "Failed to send message",
        isLoading: false,
      });
    }
  },

  clearMessages: () => {
    set({ messages: [] });
  },

  setIsOpen: (isOpen: boolean) => {
    set({ isOpen });
  },

  clearError: () => {
    set({ error: null });
  },
}));
