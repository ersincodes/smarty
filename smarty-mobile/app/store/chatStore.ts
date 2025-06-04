import { create } from "zustand";
import { ChatMessage, NoteWithCategory } from "../types";
import { chatApi } from "../config/api";
import aiService from "../services/aiService";
import ENV from "../config/env";
import { useNotesStore } from "./notesStore";

interface ChatState {
  messages: ChatMessage[];
  isLoading: boolean;
  error: string | null;
  isOpen: boolean;
  relatedNotes: NoteWithCategory[];

  // Actions
  sendMessage: (
    content: string,
    getToken?: () => Promise<string | null>
  ) => Promise<void>;
  sendMessageWithNotesContext: (
    content: string,
    getToken?: () => Promise<string | null>
  ) => Promise<void>;
  clearMessages: () => void;
  setIsOpen: (isOpen: boolean) => void;
  clearError: () => void;
  summarizeNotes: (getToken?: () => Promise<string | null>) => Promise<void>;
  findRelatedNotes: (query: string) => NoteWithCategory[];
  categorizeAndOrganize: (
    getToken?: () => Promise<string | null>
  ) => Promise<void>;
}

// Helper function to search notes by content
const searchNotesContent = (
  notes: NoteWithCategory[],
  query: string
): NoteWithCategory[] => {
  if (!query.trim()) return [];

  const searchTerms = query
    .toLowerCase()
    .split(" ")
    .filter((term) => term.length > 2);

  return notes
    .filter((note) => {
      const content = `${note.title} ${note.content} ${
        note.category?.name || ""
      }`.toLowerCase();
      return searchTerms.some((term) => content.includes(term));
    })
    .slice(0, 5); // Limit to 5 most relevant notes
};

// Helper function to create notes context for AI
const createNotesContext = (
  notes: NoteWithCategory[],
  query?: string
): string => {
  if (notes.length === 0) {
    return "The user currently has no notes or no relevant notes found.";
  }

  let context = `The user has ${notes.length} relevant notes:\n\n`;

  notes.forEach((note, index) => {
    const category = note.category ? ` [Category: ${note.category.name}]` : "";
    const date = new Date(note.createdAt).toLocaleDateString();
    context += `${index + 1}. "${note.title}"${category} (${date})\n`;
    context += `   Content: ${note.content.substring(0, 200)}${
      note.content.length > 200 ? "..." : ""
    }\n\n`;
  });

  return context;
};

export const useChatStore = create<ChatState>((set, get) => ({
  messages: [],
  isLoading: false,
  error: null,
  isOpen: false,
  relatedNotes: [],

  sendMessage: async (
    content: string,
    getToken?: () => Promise<string | null>
  ) => {
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
      let responseContent: string;

      // First try to use the backend chat API if getToken is provided
      if (getToken) {
        try {
          const response = await chatApi.sendMessage(updatedMessages, getToken);

          // Handle the response format properly
          responseContent =
            typeof response === "string" ? response : response.content;

          if (!responseContent) {
            throw new Error("Empty response from backend");
          }

          console.log("✅ Successfully received AI response from backend");
        } catch (backendError) {
          console.log(
            "🔄 Backend chat failed, falling back to local AI service:",
            backendError
          );

          // Fallback to local OpenAI service (with mock responses if no API key)
          const aiMessages = updatedMessages.map((msg) => ({
            role: msg.role,
            content: msg.content,
          }));

          // Add system message for context
          const messagesWithSystem = [
            {
              role: "system",
              content:
                "You are Smarty, a helpful AI assistant for note-taking and organization. Provide helpful, concise responses to user questions about their notes and general queries.",
            },
            ...aiMessages,
          ];

          responseContent = await aiService.chat(messagesWithSystem);
          console.log(
            "✅ Successfully received AI response from local service"
          );
        }
      } else {
        // Use local AI service directly (with mock responses if no API key)
        const aiMessages = updatedMessages.map((msg) => ({
          role: msg.role,
          content: msg.content,
        }));

        // Add system message for context
        const messagesWithSystem = [
          {
            role: "system",
            content:
              "You are Smarty, a helpful AI assistant for note-taking and organization. Provide helpful, concise responses to user questions about their notes and general queries.",
          },
          ...aiMessages,
        ];

        responseContent = await aiService.chat(messagesWithSystem);
        console.log("✅ Successfully received AI response from local service");
      }

      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: responseContent,
      };

      set({
        messages: [...updatedMessages, assistantMessage],
        isLoading: false,
      });
    } catch (error) {
      console.error("❌ Chat error:", error);
      set({
        error:
          error instanceof Error ? error.message : "Failed to send message",
        isLoading: false,
      });
    }
  },

  sendMessageWithNotesContext: async (
    content: string,
    getToken?: () => Promise<string | null>
  ) => {
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: "user",
      content,
    };

    // Get current notes from notes store
    const notesState = useNotesStore.getState();
    const allNotes = notesState.notes;

    // Find related notes based on user query
    const relatedNotes = searchNotesContent(allNotes, content);

    // Add user message immediately
    const currentMessages = get().messages;
    const updatedMessages = [...currentMessages, userMessage];
    set({
      messages: updatedMessages,
      isLoading: true,
      error: null,
      relatedNotes: relatedNotes,
    });

    try {
      let responseContent: string;

      // Create context from user's notes
      const notesContext = createNotesContext(
        relatedNotes.length > 0 ? relatedNotes : allNotes.slice(0, 10)
      );

      // Enhanced system message with notes context
      const systemMessage = {
        role: "system",
        content: `You are Smarty, an intelligent AI assistant that helps users with their personal notes and organization. You have access to the user's notes and can provide personalized responses.

NOTES CONTEXT:
${notesContext}

CAPABILITIES:
- Summarize and analyze notes
- Find connections between ideas
- Suggest organization improvements
- Answer questions about note content
- Provide insights based on user's data

INSTRUCTIONS:
- Always be helpful and personalized based on the user's actual notes
- If asked about notes, reference specific titles and content
- Provide actionable insights and suggestions
- Be concise but thorough
- If no relevant notes are found, suggest creating new ones on the topic`,
      };

      // Try backend first, then fall back to local AI with enhanced context
      if (getToken) {
        try {
          // For backend, send enhanced messages with context
          const enhancedMessages: ChatMessage[] = [
            { role: "system", content: systemMessage.content },
            ...updatedMessages.map((msg) => ({
              role: msg.role as "user" | "assistant" | "system",
              content: msg.content,
            })),
          ];

          const response = await chatApi.sendMessage(
            enhancedMessages,
            getToken
          );
          responseContent =
            typeof response === "string" ? response : response.content;

          if (!responseContent) {
            throw new Error("Empty response from backend");
          }

          console.log(
            "✅ Successfully received AI response from backend with notes context"
          );
        } catch (backendError) {
          console.log(
            "🔄 Backend chat failed, using local AI with notes context:",
            backendError
          );

          const aiMessages = [
            systemMessage,
            ...updatedMessages.map((msg) => ({
              role: msg.role,
              content: msg.content,
            })),
          ];

          responseContent = await aiService.chat(aiMessages);
          console.log(
            "✅ Successfully received AI response from local service with notes context"
          );
        }
      } else {
        // Use local AI service with full notes context
        const aiMessages = [
          systemMessage,
          ...updatedMessages.map((msg) => ({
            role: msg.role,
            content: msg.content,
          })),
        ];

        responseContent = await aiService.chat(aiMessages);
        console.log(
          "✅ Successfully received AI response from local service with notes context"
        );
      }

      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: responseContent,
      };

      set({
        messages: [...updatedMessages, assistantMessage],
        isLoading: false,
      });
    } catch (error) {
      console.error("❌ Chat error:", error);
      set({
        error:
          error instanceof Error ? error.message : "Failed to send message",
        isLoading: false,
      });
    }
  },

  summarizeNotes: async (getToken?: () => Promise<string | null>) => {
    const notesState = useNotesStore.getState();
    const allNotes = notesState.notes;

    if (allNotes.length === 0) {
      const noNotesMessage: ChatMessage = {
        id: Date.now().toString(),
        role: "assistant",
        content:
          "You don't have any notes yet. Create your first note to get started with AI-powered insights and summaries!",
      };

      set({
        messages: [...get().messages, noNotesMessage],
      });
      return;
    }

    set({ isLoading: true, error: null });

    try {
      const notesContext = createNotesContext(allNotes);

      const summaryPrompt = {
        role: "user",
        content:
          "Please provide a comprehensive summary of all my notes, including key themes, insights, and actionable items.",
      };

      const systemMessage = {
        role: "system",
        content: `You are Smarty, analyzing the user's complete note collection. Provide a comprehensive summary that includes:

1. **Overview**: Total number of notes and main topics
2. **Key Themes**: Common patterns and subjects
3. **Important Insights**: Notable ideas and concepts
4. **Action Items**: Tasks or follow-ups mentioned
5. **Suggestions**: How to better organize or expand on these notes

NOTES TO ANALYZE:
${notesContext}

Be thorough but organized in your response.`,
      };

      const messages = [systemMessage, summaryPrompt];
      const responseContent = await aiService.chat(messages);

      const summaryMessage: ChatMessage = {
        id: Date.now().toString(),
        role: "assistant",
        content: responseContent,
      };

      set({
        messages: [...get().messages, summaryMessage],
        isLoading: false,
      });
    } catch (error) {
      console.error("❌ Summary error:", error);
      set({
        error:
          error instanceof Error ? error.message : "Failed to generate summary",
        isLoading: false,
      });
    }
  },

  categorizeAndOrganize: async (getToken?: () => Promise<string | null>) => {
    const notesState = useNotesStore.getState();
    const allNotes = notesState.notes;

    if (allNotes.length === 0) {
      const noNotesMessage: ChatMessage = {
        id: Date.now().toString(),
        role: "assistant",
        content:
          "You don't have any notes to organize yet. Create some notes first, and I'll help you categorize and organize them effectively!",
      };

      set({
        messages: [...get().messages, noNotesMessage],
      });
      return;
    }

    set({ isLoading: true, error: null });

    try {
      const notesContext = createNotesContext(allNotes);

      const organizePrompt = {
        role: "user",
        content:
          "Please analyze my notes and suggest how to better categorize and organize them. Provide specific recommendations for categories, tags, and organization strategies.",
      };

      const systemMessage = {
        role: "system",
        content: `You are Smarty, helping the user organize their note collection. Analyze their notes and provide:

1. **Suggested Categories**: Recommended category structure
2. **Note Groupings**: Which notes should be grouped together
3. **Tagging Strategy**: Useful tags for cross-referencing
4. **Organization Tips**: Best practices for their specific content
5. **Missing Areas**: Topics they might want to add notes about

NOTES TO ANALYZE:
${notesContext}

Provide actionable, specific recommendations.`,
      };

      const messages = [systemMessage, organizePrompt];
      const responseContent = await aiService.chat(messages);

      const organizeMessage: ChatMessage = {
        id: Date.now().toString(),
        role: "assistant",
        content: responseContent,
      };

      set({
        messages: [...get().messages, organizeMessage],
        isLoading: false,
      });
    } catch (error) {
      console.error("❌ Organization error:", error);
      set({
        error:
          error instanceof Error
            ? error.message
            : "Failed to analyze organization",
        isLoading: false,
      });
    }
  },

  findRelatedNotes: (query: string): NoteWithCategory[] => {
    const notesState = useNotesStore.getState();
    return searchNotesContent(notesState.notes, query);
  },

  clearMessages: () => {
    set({ messages: [], error: null, relatedNotes: [] });
  },

  setIsOpen: (isOpen: boolean) => {
    set({ isOpen });
  },

  clearError: () => {
    set({ error: null });
  },
}));
