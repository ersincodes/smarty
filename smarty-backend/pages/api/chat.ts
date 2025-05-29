import type { NextApiRequest, NextApiResponse } from "next";
import { getAuth } from "@clerk/nextjs/server";

// Types
interface ChatMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

interface ChatRequest {
  messages: ChatMessage[];
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    // Get user authentication
    const { userId } = getAuth(req);

    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    if (req.method !== "POST") {
      res.setHeader("Allow", ["POST"]);
      return res.status(405).json({ error: "Method not allowed" });
    }

    return handleChat(req, res, userId);
  } catch (error) {
    console.error("Chat API Error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}

async function handleChat(
  req: NextApiRequest,
  res: NextApiResponse,
  userId: string
) {
  try {
    const { messages }: ChatRequest = req.body;

    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: "Messages array is required" });
    }

    // Get the latest user message
    const userMessage = messages[messages.length - 1];
    if (!userMessage || userMessage.role !== "user") {
      return res.status(400).json({ error: "Last message must be from user" });
    }

    // Set up streaming response
    res.writeHead(200, {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    });

    // Simulate AI response with streaming
    const mockResponse = `I understand you said: "${userMessage.content}". This is a mock AI response. In a real implementation, this would:

1. Search through your notes using vector embeddings
2. Find relevant context from your existing notes
3. Use OpenAI's API to generate an intelligent response
4. Stream the response back in real-time

For now, I'm just echoing your message to demonstrate the streaming functionality works.`;

    // Stream the response word by word
    const words = mockResponse.split(" ");
    for (let i = 0; i < words.length; i++) {
      const word = words[i] + (i < words.length - 1 ? " " : "");
      res.write(word);

      // Add a small delay to simulate real streaming
      await new Promise((resolve) => setTimeout(resolve, 50));
    }

    res.end();
  } catch (error) {
    console.error("Chat processing error:", error);
    if (!res.headersSent) {
      return res.status(500).json({ error: "Failed to process chat" });
    }
  }
}
