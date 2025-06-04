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

  // Public method for chat functionality
  async chat(
    messages: Array<{ role: string; content: string }>
  ): Promise<string> {
    // If no API key is configured, provide a fallback demo response
    if (!this.apiKey) {
      const lastUserMessage = messages.filter((m) => m.role === "user").pop();
      return this.getMockResponse(lastUserMessage?.content || "");
    }

    return await this.makeRequest(messages);
  }

  // Mock responses for demo purposes when API key is not configured
  private getMockResponse(userMessage: string): string {
    const lowerMessage = userMessage.toLowerCase();

    if (lowerMessage.includes("hello") || lowerMessage.includes("hi")) {
      return "Hello! I'm Smarty, your AI assistant for note-taking and organization. I can help you with your notes in many ways:\n\n• Summarize your note collection\n• Organize and categorize notes\n• Find specific information\n• Provide insights and connections\n• Suggest improvements\n\nHow can I help you today?";
    } else if (
      lowerMessage.includes("summarize") ||
      lowerMessage.includes("summary")
    ) {
      return "📊 **Demo Summary of Your Notes**\n\nI can see you have notes about various topics. Here's what a real summary would include:\n\n**Key Themes:**\n• Work projects and meetings\n• Personal goals and planning\n• Learning and development\n\n**Important Insights:**\n• You're actively tracking multiple projects\n• Focus on productivity and organization\n• Interest in continuous learning\n\n**Action Items:**\n• Follow up on recent meeting decisions\n• Review and update goal progress\n• Organize notes by priority\n\n*Note: This is a demo response. With a configured OpenAI API key, I would analyze your actual notes and provide personalized insights.*";
    } else if (
      lowerMessage.includes("organize") ||
      lowerMessage.includes("category") ||
      lowerMessage.includes("categories")
    ) {
      return "🗂️ **Organization Recommendations**\n\nBased on typical note patterns, here's how I would help organize your notes:\n\n**Suggested Categories:**\n• Work & Projects - for meeting notes and tasks\n• Learning & Development - courses and skills\n• Personal & Goals - objectives and planning\n• Ideas & Inspiration - creative thoughts\n\n**Organization Tips:**\n• Use consistent naming conventions\n• Add relevant tags for cross-referencing\n• Review and archive completed items\n• Group related topics together\n\n**Tagging Strategy:**\n• Priority tags: #urgent, #important\n• Status tags: #in-progress, #completed\n• Topic tags: #work, #personal, #learning\n\n*With your actual notes, I could provide specific recommendations based on your content.*";
    } else if (
      lowerMessage.includes("note") ||
      lowerMessage.includes("notes")
    ) {
      return "📝 **I'm here to help with your notes!**\n\nI can assist you with:\n\n**Analysis & Insights:**\n• Summarize your entire note collection\n• Find patterns and themes across notes\n• Identify important action items\n• Suggest connections between ideas\n\n**Organization & Structure:**\n• Recommend better categorization\n• Suggest tagging strategies\n• Help optimize note layouts\n• Identify gaps in your system\n\n**Search & Discovery:**\n• Find specific information quickly\n• Locate related notes on similar topics\n• Extract key insights from content\n• Track recurring themes\n\nTry asking me to 'summarize notes' or 'organize notes' to see these features in action!";
    } else if (
      lowerMessage.includes("help") ||
      lowerMessage.includes("what can you") ||
      lowerMessage.includes("features")
    ) {
      return "💡 **How I Can Help You**\n\nI'm your intelligent note management assistant with these capabilities:\n\n**🧠 Smart Analysis:**\n• Analyze your note collection for insights\n• Identify key themes and patterns\n• Extract actionable items and follow-ups\n• Find connections between different topics\n\n**🗂️ Organization Assistant:**\n• Suggest optimal category structures\n• Recommend tagging strategies\n• Help improve note organization\n• Identify content gaps to fill\n\n**🔍 Intelligent Search:**\n• Find notes by content or topic\n• Locate related information quickly\n• Search across titles, content, and categories\n• Provide contextual results\n\n**📊 Insights & Summaries:**\n• Generate comprehensive note summaries\n• Provide weekly/monthly reviews\n• Track progress on goals and projects\n• Suggest productivity improvements\n\n**Quick Actions Available:**\n• 'Summarize my notes' - Get overview of all content\n• 'Organize my notes' - Get organization recommendations\n• 'Find notes about [topic]' - Search specific topics\n\nWhat would you like to explore first?";
    } else if (
      lowerMessage.includes("search") ||
      lowerMessage.includes("find")
    ) {
      return "🔍 **Smart Note Search**\n\nI can help you find information in your notes! Here's how:\n\n**Search Capabilities:**\n• Find notes by topic or keyword\n• Search across titles, content, and categories\n• Locate related notes on similar subjects\n• Provide contextual search results\n\n**Example Searches:**\n• 'Find notes about work projects'\n• 'Show me meeting notes from last week'\n• 'What have I written about productivity?'\n• 'Find notes tagged with learning'\n\n**Search Tips:**\n• Be specific about topics or timeframes\n• Mention categories if you know them\n• Ask about themes or recurring subjects\n• Use natural language descriptions\n\n*With access to your actual notes, I would search through your content and show related notes below this response.*\n\nWhat topic would you like me to search for?";
    } else if (
      lowerMessage.includes("brief") ||
      lowerMessage.includes("overview")
    ) {
      return "📋 **Brief Overview of Your Notes**\n\n*This is a demo response showing what I could provide with access to your actual notes:*\n\n**Your Note Collection:**\n• Total notes analyzed: [Your actual count]\n• Main categories covered\n• Recent activity patterns\n\n**Key Highlights:**\n• Most active topics and themes\n• Important insights you've captured\n• Action items requiring attention\n• Goals and projects in progress\n\n**Recent Patterns:**\n• Topics you're focusing on lately\n• Recurring themes across notes\n• Areas of growing interest\n\n**Recommendations:**\n• Suggested organizational improvements\n• Content areas to expand on\n• Productivity optimizations\n\n*With a configured OpenAI API key, I would provide a detailed, personalized brief based on your actual note content. Try the 'Summarize Notes' quick action for a full analysis!*";
    } else {
      return `🤖 **Understanding your request about "${userMessage}"**\n\nI'm designed to be your intelligent note-taking assistant! While I'm currently in demo mode, here's what I can do for you:\n\n**With Your Notes, I Can:**\n• Provide personalized insights based on your content\n• Help organize and categorize your information\n• Find connections between different topics\n• Summarize key themes and action items\n• Suggest improvements to your note system\n\n**Try These Commands:**\n• "Summarize my notes" - Get a comprehensive overview\n• "Organize my notes" - Get organization recommendations\n• "Help me with my notes" - See all available features\n\n**Current Status:**\n• Demo mode active (OpenAI API key not configured)\n• All note management features available\n• Smart fallback responses enabled\n\n*Configure an OpenAI API key in your app settings to unlock full AI capabilities with your actual note content!*\n\nHow else can I help you with note management?`;
    }
  }
}

export default new AIService();
