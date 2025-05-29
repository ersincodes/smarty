import { Note, Category, CreateNoteInput, UpdateNoteInput } from "../types";
import { format, parseISO } from "date-fns";

/**
 * Utility functions for API data transformation and validation
 */

// Date formatting utilities
export const formatDate = (date: Date | string): string => {
  const dateObj = typeof date === "string" ? parseISO(date) : date;
  return format(dateObj, "MMM dd, yyyy");
};

export const formatDateTime = (date: Date | string): string => {
  const dateObj = typeof date === "string" ? parseISO(date) : date;
  return format(dateObj, "MMM dd, yyyy 'at' h:mm a");
};

export const formatRelativeTime = (date: Date | string): string => {
  const dateObj = typeof date === "string" ? parseISO(date) : date;
  const now = new Date();
  const diffInMs = now.getTime() - dateObj.getTime();
  const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
  const diffInHours = Math.floor(diffInMinutes / 60);
  const diffInDays = Math.floor(diffInHours / 24);

  if (diffInMinutes < 1) return "Just now";
  if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
  if (diffInHours < 24) return `${diffInHours}h ago`;
  if (diffInDays < 7) return `${diffInDays}d ago`;

  return formatDate(dateObj);
};

// Data transformation utilities
export const transformNoteFromApi = (apiNote: any): Note => {
  return {
    ...apiNote,
    createdAt:
      typeof apiNote.createdAt === "string"
        ? parseISO(apiNote.createdAt)
        : apiNote.createdAt,
    updatedAt:
      typeof apiNote.updatedAt === "string"
        ? parseISO(apiNote.updatedAt)
        : apiNote.updatedAt,
  };
};

export const transformCategoryFromApi = (apiCategory: any): Category => {
  return {
    ...apiCategory,
    createdAt:
      typeof apiCategory.createdAt === "string"
        ? parseISO(apiCategory.createdAt)
        : apiCategory.createdAt,
    updatedAt:
      typeof apiCategory.updatedAt === "string"
        ? parseISO(apiCategory.updatedAt)
        : apiCategory.updatedAt,
  };
};

// Validation utilities
export const validateNoteInput = (
  input: CreateNoteInput | UpdateNoteInput
): string[] => {
  const errors: string[] = [];

  if (!input.title || input.title.trim().length === 0) {
    errors.push("Title is required");
  }

  if (!input.content || input.content.trim().length === 0) {
    errors.push("Content is required");
  }

  if (input.title && input.title.length > 200) {
    errors.push("Title must be less than 200 characters");
  }

  if (input.content && input.content.length > 50000) {
    errors.push("Content must be less than 50,000 characters");
  }

  return errors;
};

export const validateCategoryName = (name: string): string[] => {
  const errors: string[] = [];

  if (!name || name.trim().length === 0) {
    errors.push("Category name is required");
  }

  if (name && name.length > 50) {
    errors.push("Category name must be less than 50 characters");
  }

  if (name && !/^[a-zA-Z0-9\s\-_]+$/.test(name)) {
    errors.push(
      "Category name can only contain letters, numbers, spaces, hyphens, and underscores"
    );
  }

  return errors;
};

// Search and filter utilities
export const filterNotes = (
  notes: Note[],
  filters: {
    searchQuery?: string;
    categoryId?: string;
    startDate?: Date;
    endDate?: Date;
  }
): Note[] => {
  return notes.filter((note) => {
    // Search in title and content
    if (filters.searchQuery) {
      const query = filters.searchQuery.toLowerCase();
      const searchable = `${note.title} ${note.content}`.toLowerCase();
      if (!searchable.includes(query)) return false;
    }

    // Filter by category
    if (filters.categoryId && note.categoryId !== filters.categoryId) {
      return false;
    }

    // Filter by date range
    if (filters.startDate && note.createdAt < filters.startDate) {
      return false;
    }

    if (filters.endDate && note.createdAt > filters.endDate) {
      return false;
    }

    return true;
  });
};

export const sortNotes = (
  notes: Note[],
  sortBy: "title" | "createdAt" | "updatedAt" = "updatedAt",
  sortOrder: "asc" | "desc" = "desc"
): Note[] => {
  return [...notes].sort((a, b) => {
    let valueA: any;
    let valueB: any;

    switch (sortBy) {
      case "title":
        valueA = a.title.toLowerCase();
        valueB = b.title.toLowerCase();
        break;
      case "createdAt":
        valueA = a.createdAt.getTime();
        valueB = b.createdAt.getTime();
        break;
      case "updatedAt":
        valueA = a.updatedAt.getTime();
        valueB = b.updatedAt.getTime();
        break;
      default:
        return 0;
    }

    if (sortOrder === "asc") {
      return valueA < valueB ? -1 : valueA > valueB ? 1 : 0;
    } else {
      return valueA > valueB ? -1 : valueA < valueB ? 1 : 0;
    }
  });
};

// Content utilities
export const truncateContent = (
  content: string,
  maxLength: number = 150
): string => {
  if (content.length <= maxLength) return content;
  return content.substring(0, maxLength).trim() + "...";
};

export const extractFirstParagraph = (content: string): string => {
  const paragraphs = content.split("\n").filter((p) => p.trim().length > 0);
  return paragraphs[0] || "";
};

export const countWords = (text: string): number => {
  return text
    .trim()
    .split(/\s+/)
    .filter((word) => word.length > 0).length;
};

export const estimateReadingTime = (text: string): number => {
  const wordsPerMinute = 200;
  const wordCount = countWords(text);
  return Math.ceil(wordCount / wordsPerMinute);
};

// Retry utility for API calls
export const retryApiCall = async <T>(
  apiCall: () => Promise<T>,
  maxRetries: number = 3,
  delayMs: number = 1000
): Promise<T> => {
  let lastError: Error;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await apiCall();
    } catch (error) {
      lastError = error as Error;

      if (attempt === maxRetries) {
        throw lastError;
      }

      // Wait before retrying
      await new Promise((resolve) =>
        setTimeout(resolve, delayMs * Math.pow(2, attempt))
      );
    }
  }

  throw lastError!;
};

// Network status utilities
export const isOnline = (): boolean => {
  if (typeof navigator !== "undefined" && navigator.onLine !== undefined) {
    return navigator.onLine;
  }
  return true; // Assume online if we can't determine
};

// Cache utilities for API responses
interface CacheItem<T> {
  data: T;
  timestamp: number;
  expiresIn: number;
}

class SimpleCache {
  private cache = new Map<string, CacheItem<any>>();

  set<T>(key: string, data: T, expiresInMs: number = 5 * 60 * 1000): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      expiresIn: expiresInMs,
    });
  }

  get<T>(key: string): T | null {
    const item = this.cache.get(key);

    if (!item) return null;

    const isExpired = Date.now() - item.timestamp > item.expiresIn;

    if (isExpired) {
      this.cache.delete(key);
      return null;
    }

    return item.data as T;
  }

  clear(): void {
    this.cache.clear();
  }

  delete(key: string): boolean {
    return this.cache.delete(key);
  }
}

export const apiCache = new SimpleCache();

// Error categorization
export const categorizeApiError = (
  error: Error
): {
  type: "network" | "auth" | "validation" | "server" | "unknown";
  isRetryable: boolean;
} => {
  const message = error.message.toLowerCase();

  if (message.includes("network") || message.includes("fetch")) {
    return { type: "network", isRetryable: true };
  }

  if (message.includes("auth") || message.includes("401")) {
    return { type: "auth", isRetryable: false };
  }

  if (message.includes("400") || message.includes("validation")) {
    return { type: "validation", isRetryable: false };
  }

  if (message.includes("500") || message.includes("server")) {
    return { type: "server", isRetryable: true };
  }

  return { type: "unknown", isRetryable: false };
};

// Batch operations utility
export const batchApiCalls = async <T, R>(
  items: T[],
  apiCall: (item: T) => Promise<R>,
  batchSize: number = 5,
  delayBetweenBatches: number = 100
): Promise<R[]> => {
  const results: R[] = [];

  for (let i = 0; i < items.length; i += batchSize) {
    const batch = items.slice(i, i + batchSize);
    const batchPromises = batch.map((item) => apiCall(item));

    try {
      const batchResults = await Promise.all(batchPromises);
      results.push(...batchResults);
    } catch (error) {
      console.error(
        `Batch API call failed for batch starting at index ${i}:`,
        error
      );
      throw error;
    }

    // Add delay between batches to avoid overwhelming the server
    if (i + batchSize < items.length && delayBetweenBatches > 0) {
      await new Promise((resolve) => setTimeout(resolve, delayBetweenBatches));
    }
  }

  return results;
};
