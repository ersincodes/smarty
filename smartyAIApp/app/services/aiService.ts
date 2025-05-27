import { AIRequest, AIResponse } from "../types/note";
import ENV from "../config/env";

const OPENAI_API_URL = "https://api.openai.com/v1/chat/completions";

class AIService {
  private apiKey: string;

  constructor() {
    this.apiKey = ENV.OPENAI_API_KEY;
  }

  private async makeRequest(
    messages: Array<{ role: string; content: string }>
  ): Promise<string> {
    if (!this.apiKey) {
      throw new Error("OpenAI API key is not configured");
    }

    try {
      const response = await fetch(OPENAI_API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: "gpt-3.5-turbo",
          messages,
          max_tokens: 1000,
          temperature: 0.7,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          `OpenAI API error: ${errorData.error?.message || response.statusText}`
        );
      }

      const data = await response.json();
      return data.choices[0]?.message?.content || "";
    } catch (error) {
      console.error("AI Service Error:", error);
      throw error;
    }
  }

  async generateNote(prompt: string): Promise<AIResponse> {
    const messages = [
      {
        role: "system",
        content:
          "You are a helpful AI assistant that generates well-structured notes. Return the content in markdown format with clear headings and organization.",
      },
      {
        role: "user",
        content: `Generate a comprehensive note about: ${prompt}`,
      },
    ];

    const content = await this.makeRequest(messages);

    // Generate additional metadata
    const summary = await this.summarizeText(content);
    const tags = await this.suggestTags(content);
    const category = await this.categorizeNote(content);

    return {
      content,
      summary,
      suggestedTags: tags,
      suggestedCategory: category,
    };
  }

  async summarizeText(text: string): Promise<string> {
    const messages = [
      {
        role: "system",
        content:
          "You are a helpful AI assistant that creates concise summaries. Provide a brief, clear summary in 1-2 sentences.",
      },
      {
        role: "user",
        content: `Summarize this text: ${text}`,
      },
    ];

    return await this.makeRequest(messages);
  }

  async enhanceNote(
    originalContent: string,
    instructions: string
  ): Promise<string> {
    const messages = [
      {
        role: "system",
        content:
          "You are a helpful AI assistant that improves and enhances notes. Maintain the original structure while applying the requested improvements.",
      },
      {
        role: "user",
        content: `Original note: ${originalContent}\n\nInstructions: ${instructions}\n\nPlease enhance the note according to the instructions.`,
      },
    ];

    return await this.makeRequest(messages);
  }

  async suggestTags(content: string): Promise<string[]> {
    const messages = [
      {
        role: "system",
        content:
          "You are a helpful AI assistant that suggests relevant tags for notes. Return only a comma-separated list of 3-5 relevant tags.",
      },
      {
        role: "user",
        content: `Suggest tags for this content: ${content}`,
      },
    ];

    const response = await this.makeRequest(messages);
    return response
      .split(",")
      .map((tag) => tag.trim().toLowerCase())
      .filter((tag) => tag.length > 0)
      .slice(0, 5);
  }

  async categorizeNote(content: string): Promise<string> {
    const messages = [
      {
        role: "system",
        content:
          "You are a helpful AI assistant that categorizes notes. Return only one word category like: work, personal, study, ideas, projects, travel, health, finance, etc.",
      },
      {
        role: "user",
        content: `Categorize this content: ${content}`,
      },
    ];

    const response = await this.makeRequest(messages);
    return response.toLowerCase().trim();
  }

  async processAIRequest(request: AIRequest): Promise<AIResponse> {
    switch (request.type) {
      case "generate":
        return await this.generateNote(request.prompt);

      case "summarize":
        const summary = await this.summarizeText(
          request.context || request.prompt
        );
        return { content: summary };

      case "enhance":
        const enhanced = await this.enhanceNote(
          request.context || "",
          request.prompt
        );
        return { content: enhanced };

      case "categorize":
        const category = await this.categorizeNote(
          request.context || request.prompt
        );
        const tags = await this.suggestTags(request.context || request.prompt);
        return {
          content: category,
          suggestedCategory: category,
          suggestedTags: tags,
        };

      default:
        throw new Error(`Unsupported AI request type: ${request.type}`);
    }
  }
}

export default new AIService();
