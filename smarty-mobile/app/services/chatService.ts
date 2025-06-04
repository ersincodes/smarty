import { ChatMessage, Note } from "../types";
import { chatApi, handleApiError } from "../config/api";

class ChatService {
  /**
   * Send a message and get response
   * @param messages - Array of chat messages
   * @param getToken - Function to get auth token
   * @returns Promise resolving to the complete response with content and related notes
   */
  async sendMessage(
    messages: ChatMessage[],
    getToken: () => Promise<string | null>
  ): Promise<{ content: string; relatedNotes?: Note[] }> {
    try {
      return await chatApi.sendMessage(messages, getToken);
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Send a message and get only the content string
   * @param messages - Array of chat messages
   * @param getToken - Function to get auth token
   * @returns Promise resolving to the content string
   */
  async sendMessageSimple(
    messages: ChatMessage[],
    getToken: () => Promise<string | null>
  ): Promise<string> {
    try {
      const response = await chatApi.sendMessage(messages, getToken);
      return response.content;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Legacy method for backward compatibility
   * @deprecated Use sendMessage instead
   */
  async sendMessageLegacy(
    messages: ChatMessage[],
    getToken: () => Promise<string | null>
  ): Promise<ReadableStream> {
    const token = await getToken();

    if (!token) {
      throw new Error("Authentication required");
    }

    const response = await fetch(
      `${
        process.env.EXPO_PUBLIC_API_BASE_URL || "https://smarty-teal.vercel.app"
      }/chat`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ messages }),
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    if (!response.body) {
      throw new Error("No response body");
    }

    return response.body;
  }

  /**
   * Stream response generator (legacy method for backward compatibility)
   * @deprecated Use the onChunk callback in sendMessage instead
   */
  async *streamResponse(
    stream: ReadableStream
  ): AsyncGenerator<string, void, unknown> {
    const reader = stream.getReader();
    const decoder = new TextDecoder();

    try {
      while (true) {
        const { done, value } = await reader.read();

        if (done) {
          break;
        }

        const chunk = decoder.decode(value, { stream: true });
        yield chunk;
      }
    } finally {
      reader.releaseLock();
    }
  }

  /**
   * Create a system message for AI context
   * @param content - System message content
   * @returns ChatMessage with system role
   */
  createSystemMessage(content: string): ChatMessage {
    return {
      role: "system",
      content,
    };
  }

  /**
   * Create a user message
   * @param content - User message content
   * @returns ChatMessage with user role
   */
  createUserMessage(content: string): ChatMessage {
    return {
      role: "user",
      content,
    };
  }

  /**
   * Create an assistant message
   * @param content - Assistant message content
   * @returns ChatMessage with assistant role
   */
  createAssistantMessage(content: string): ChatMessage {
    return {
      role: "assistant",
      content,
    };
  }

  /**
   * Prepare messages for AI chat with notes context
   * @param userMessage - The user's message
   * @param context - Optional context from notes
   * @returns Array of formatted messages
   */
  prepareMessagesWithContext(
    userMessage: string,
    context?: string
  ): ChatMessage[] {
    const messages: ChatMessage[] = [];

    if (context) {
      messages.push(
        this.createSystemMessage(
          `You are a helpful AI assistant with access to the user's notes. Use the following context from their notes to provide relevant and personalized responses:\n\n${context}\n\nRespond helpfully based on this context and the user's question.`
        )
      );
    }

    messages.push(this.createUserMessage(userMessage));
    return messages;
  }
}

export default new ChatService();
