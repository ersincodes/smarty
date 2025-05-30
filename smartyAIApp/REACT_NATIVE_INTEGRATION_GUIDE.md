# AI Note App - React Native Integration Guide

## 🚀 Overview

This guide provides complete instructions for integrating your AI Note App backend with a React Native application. The backend provides REST API endpoints for note management, AI-powered chat, and semantic search capabilities.

## 📋 Prerequisites

- ✅ Backend deployed and running
- ✅ React Native development environment setup
- ✅ Clerk account for authentication
- ✅ Your backend URL and environment variables

---

## 🔧 Setup Instructions

### 1. Install Required Dependencies

```bash
# Core networking and authentication
npm install @clerk/clerk-expo

# State management (optional but recommended)
npm install zustand @tanstack/react-query

# Navigation (if needed)
npm install @react-navigation/native @react-navigation/stack

# For Expo projects
npx expo install expo-secure-store expo-crypto
```

### 2. Environment Configuration

Create a `.env` file in your React Native project:

```env
# Your deployed backend URL
EXPO_PUBLIC_API_BASE_URL=https://your-deployed-backend.com/api

# Clerk configuration (same as your backend)
EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...

# Development URLs (optional)
EXPO_PUBLIC_DEV_API_URL=http://localhost:3000/api
```

---

## 🏗️ API Client Implementation

### Core API Client

Create `src/services/apiClient.ts`:

```typescript
import { Platform } from "react-native";
import Constants from "expo-constants";

// Types
export interface Note {
  id: string;
  title: string;
  content: string;
  categoryId?: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  id: string;
  name: string;
  color: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export interface ChatResponse {
  content: string;
  relatedNotes?: Note[];
}

export interface CreateNoteRequest {
  title: string;
  content: string;
  categoryId?: string;
}

export interface UpdateNoteRequest {
  title?: string;
  content?: string;
  categoryId?: string;
}

export interface CreateCategoryRequest {
  name: string;
  color: string;
}

// API Client Class
class ApiClient {
  private baseURL: string;
  private authToken: string | null = null;

  constructor() {
    const isDev = __DEV__;
    const devUrl =
      Constants.expoConfig?.extra?.devApiUrl || "http://localhost:3000/api";
    const prodUrl = Constants.expoConfig?.extra?.apiBaseUrl;

    this.baseURL = isDev
      ? Platform.OS === "android"
        ? devUrl.replace("localhost", "10.0.2.2")
        : devUrl
      : prodUrl;

    if (!this.baseURL) {
      throw new Error("API_BASE_URL not configured");
    }
  }

  setAuthToken(token: string | null) {
    this.authToken = token;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      ...options.headers,
    };

    if (this.authToken) {
      headers.Authorization = `Bearer ${this.authToken}`;
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      const contentType = response.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        return response.json();
      }

      return response.text() as unknown as T;
    } catch (error) {
      console.error(`API Error [${endpoint}]:`, error);
      throw error;
    }
  }

  // =================== NOTES API ===================

  /**
   * Get all notes for the authenticated user
   */
  async getNotes(): Promise<Note[]> {
    return this.request<Note[]>("/notes");
  }

  /**
   * Get a specific note by ID
   */
  async getNote(id: string): Promise<Note> {
    return this.request<Note>(`/notes/${id}`);
  }

  /**
   * Create a new note
   */
  async createNote(noteData: CreateNoteRequest): Promise<Note> {
    return this.request<Note>("/notes", {
      method: "POST",
      body: JSON.stringify(noteData),
    });
  }

  /**
   * Update an existing note
   */
  async updateNote(id: string, noteData: UpdateNoteRequest): Promise<Note> {
    return this.request<Note>(`/notes/${id}`, {
      method: "PUT",
      body: JSON.stringify(noteData),
    });
  }

  /**
   * Delete a note
   */
  async deleteNote(id: string): Promise<void> {
    return this.request<void>(`/notes/${id}`, {
      method: "DELETE",
    });
  }

  /**
   * Search notes using semantic search
   */
  async searchNotes(query: string): Promise<Note[]> {
    const encodedQuery = encodeURIComponent(query);
    return this.request<Note[]>(`/notes/search?q=${encodedQuery}`);
  }

  // =================== CATEGORIES API ===================

  /**
   * Get all categories for the authenticated user
   */
  async getCategories(): Promise<Category[]> {
    return this.request<Category[]>("/categories");
  }

  /**
   * Create a new category
   */
  async createCategory(categoryData: CreateCategoryRequest): Promise<Category> {
    return this.request<Category>("/categories", {
      method: "POST",
      body: JSON.stringify(categoryData),
    });
  }

  /**
   * Update an existing category
   */
  async updateCategory(
    id: string,
    categoryData: Partial<CreateCategoryRequest>,
  ): Promise<Category> {
    return this.request<Category>(`/categories/${id}`, {
      method: "PUT",
      body: JSON.stringify(categoryData),
    });
  }

  /**
   * Delete a category
   */
  async deleteCategory(id: string): Promise<void> {
    return this.request<void>(`/categories/${id}`, {
      method: "DELETE",
    });
  }

  // =================== CHAT API ===================

  /**
   * Send a chat message to the AI assistant
   */
  async sendChatMessage(messages: ChatMessage[]): Promise<ChatResponse> {
    return this.request<ChatResponse>("/chat", {
      method: "POST",
      body: JSON.stringify({ messages }),
    });
  }

  /**
   * Get AI suggestions for note content
   */
  async getAISuggestions(prompt: string): Promise<{ suggestions: string[] }> {
    return this.request<{ suggestions: string[] }>("/chat/suggestions", {
      method: "POST",
      body: JSON.stringify({ prompt }),
    });
  }
}

// Export singleton instance
export const apiClient = new ApiClient();
```

---

## 🔐 Authentication Hook

Create `src/hooks/useApiAuth.ts`:

```typescript
import { useAuth } from "@clerk/clerk-expo";
import { useEffect, useCallback } from "react";
import { apiClient } from "../services/apiClient";

export const useApiAuth = () => {
  const { getToken, isSignedIn, userId } = useAuth();

  const setupAuthToken = useCallback(async () => {
    if (isSignedIn && userId) {
      try {
        const token = await getToken();
        apiClient.setAuthToken(token);
        return token;
      } catch (error) {
        console.error("Failed to get auth token:", error);
        apiClient.setAuthToken(null);
        return null;
      }
    } else {
      apiClient.setAuthToken(null);
      return null;
    }
  }, [isSignedIn, userId, getToken]);

  useEffect(() => {
    setupAuthToken();
  }, [setupAuthToken]);

  return {
    setupAuthToken,
    isAuthenticated: isSignedIn,
    userId,
  };
};
```

---

## 📱 React Native Components Examples

### Notes List Component

Create `src/components/NotesList.tsx`:

```typescript
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  TextInput,
  Alert,
  RefreshControl,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { useApiAuth } from '../hooks/useApiAuth';
import { apiClient, Note } from '../services/apiClient';

interface NotesListProps {
  onNotePress?: (note: Note) => void;
  onCreateNote?: () => void;
}

const NotesList: React.FC<NotesListProps> = ({ onNotePress, onCreateNote }) => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchLoading, setSearchLoading] = useState(false);

  const { isAuthenticated } = useApiAuth();

  // Filter notes locally when not searching
  const filteredNotes = useMemo(() => {
    if (searchQuery.trim() === '') return notes;
    return notes.filter(note =>
      note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      note.content.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [notes, searchQuery]);

  const fetchNotes = useCallback(async () => {
    if (!isAuthenticated) return;

    try {
      setLoading(true);
      const fetchedNotes = await apiClient.getNotes();
      setNotes(fetchedNotes);
    } catch (error) {
      console.error('Failed to fetch notes:', error);
      Alert.alert('Error', 'Failed to load notes. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchNotes();
    setRefreshing(false);
  }, [fetchNotes]);

  const handleSemanticSearch = useCallback(async () => {
    if (!searchQuery.trim() || !isAuthenticated) return;

    try {
      setSearchLoading(true);
      const searchResults = await apiClient.searchNotes(searchQuery);
      setNotes(searchResults);
    } catch (error) {
      console.error('Search failed:', error);
      Alert.alert('Search Error', 'Failed to search notes. Please try again.');
    } finally {
      setSearchLoading(false);
    }
  }, [searchQuery, isAuthenticated]);

  const handleDeleteNote = useCallback(async (noteId: string) => {
    Alert.alert(
      'Delete Note',
      'Are you sure you want to delete this note?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await apiClient.deleteNote(noteId);
              setNotes(prevNotes => prevNotes.filter(note => note.id !== noteId));
            } catch (error) {
              console.error('Failed to delete note:', error);
              Alert.alert('Error', 'Failed to delete note.');
            }
          },
        },
      ]
    );
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      fetchNotes();
    }
  }, [isAuthenticated, fetchNotes]);

  const renderNoteItem = useCallback(({ item }: { item: Note }) => (
    <TouchableOpacity
      style={styles.noteItem}
      onPress={() => onNotePress?.(item)}
      accessibilityLabel={`Note: ${item.title}`}
      accessibilityHint="Tap to open note"
      accessibilityRole="button"
    >
      <View style={styles.noteContent}>
        <Text style={styles.noteTitle} numberOfLines={1}>
          {item.title}
        </Text>
        <Text style={styles.notePreview} numberOfLines={2}>
          {item.content}
        </Text>
        <Text style={styles.noteDate}>
          {new Date(item.updatedAt).toLocaleDateString()}
        </Text>
      </View>
      <TouchableOpacity
        style={styles.deleteButton}
        onPress={() => handleDeleteNote(item.id)}
        accessibilityLabel="Delete note"
        accessibilityRole="button"
      >
        <Text style={styles.deleteButtonText}>×</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  ), [onNotePress, handleDeleteNote]);

  if (!isAuthenticated) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.messageText}>Please sign in to view notes</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search notes or ask AI..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          onSubmitEditing={handleSemanticSearch}
          accessibilityLabel="Search notes"
          accessibilityHint="Enter text to search notes or use AI search"
        />
        {searchLoading && (
          <ActivityIndicator style={styles.searchLoader} size="small" color="#007AFF" />
        )}
      </View>

      {onCreateNote && (
        <TouchableOpacity
          style={styles.createButton}
          onPress={onCreateNote}
          accessibilityLabel="Create new note"
          accessibilityRole="button"
        >
          <Text style={styles.createButtonText}>+ New Note</Text>
        </TouchableOpacity>
      )}

      <FlatList
        data={filteredNotes}
        renderItem={renderNoteItem}
        keyExtractor={(item) => item.id}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.centerContainer}>
            <Text style={styles.messageText}>
              {loading ? 'Loading notes...' : 'No notes found'}
            </Text>
          </View>
        }
        contentContainerStyle={filteredNotes.length === 0 ? styles.emptyList : undefined}
        accessibilityLabel="Notes list"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: 'white',
  },
  searchInput: {
    flex: 1,
    backgroundColor: '#f1f3f4',
    padding: 12,
    borderRadius: 8,
    fontSize: 16,
    color: '#333',
  },
  searchLoader: {
    marginLeft: 8,
  },
  createButton: {
    backgroundColor: '#007AFF',
    margin: 16,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  createButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  noteItem: {
    backgroundColor: 'white',
    marginHorizontal: 16,
    marginVertical: 4,
    padding: 16,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'flex-start',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  noteContent: {
    flex: 1,
  },
  noteTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  notePreview: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 8,
  },
  noteDate: {
    fontSize: 12,
    color: '#999',
  },
  deleteButton: {
    padding: 8,
    marginLeft: 8,
  },
  deleteButtonText: {
    color: '#ff4444',
    fontSize: 20,
    fontWeight: 'bold',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  messageText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  emptyList: {
    flexGrow: 1,
  },
});

export default NotesList;
```

### AI Chat Component

Create `src/components/AIChat.tsx`:

```typescript
import React, { useState, useCallback, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { useApiAuth } from '../hooks/useApiAuth';
import { apiClient, ChatMessage } from '../services/apiClient';

interface AIChatProps {
  onNoteReference?: (noteId: string) => void;
}

const AIChat: React.FC<AIChatProps> = ({ onNoteReference }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const flatListRef = useRef<FlatList>(null);

  const { isAuthenticated } = useApiAuth();

  const handleSendMessage = useCallback(async () => {
    if (!inputText.trim() || !isAuthenticated || loading) return;

    const userMessage: ChatMessage = {
      role: 'user',
      content: inputText.trim(),
    };

    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInputText('');
    setLoading(true);

    try {
      const response = await apiClient.sendChatMessage(newMessages);

      const assistantMessage: ChatMessage = {
        role: 'assistant',
        content: response.content,
      };

      setMessages(prev => [...prev, assistantMessage]);

      // Scroll to bottom
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    } catch (error) {
      console.error('Chat error:', error);
      const errorMessage: ChatMessage = {
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.',
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  }, [inputText, messages, isAuthenticated, loading]);

  const renderMessage = useCallback(({ item, index }: { item: ChatMessage; index: number }) => (
    <View
      style={[
        styles.messageContainer,
        item.role === 'user' ? styles.userMessage : styles.assistantMessage,
      ]}
    >
      <Text style={styles.messageText}>{item.content}</Text>
    </View>
  ), []);

  if (!isAuthenticated) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.messageText}>Please sign in to use AI chat</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderMessage}
        keyExtractor={(_, index) => index.toString()}
        style={styles.messagesList}
        contentContainerStyle={styles.messagesContent}
        ListEmptyComponent={
          <View style={styles.centerContainer}>
            <Text style={styles.placeholderText}>
              Ask me anything about your notes!
            </Text>
          </View>
        }
      />

      {loading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color="#007AFF" />
          <Text style={styles.loadingText}>AI is thinking...</Text>
        </View>
      )}

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.textInput}
          value={inputText}
          onChangeText={setInputText}
          placeholder="Ask about your notes..."
          multiline
          maxLength={500}
          accessibilityLabel="Chat input"
          accessibilityHint="Enter your message to chat with AI"
        />
        <TouchableOpacity
          style={[styles.sendButton, (!inputText.trim() || loading) && styles.sendButtonDisabled]}
          onPress={handleSendMessage}
          disabled={!inputText.trim() || loading}
          accessibilityLabel="Send message"
          accessibilityRole="button"
        >
          <Text style={styles.sendButtonText}>Send</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  messagesList: {
    flex: 1,
    padding: 16,
  },
  messagesContent: {
    flexGrow: 1,
  },
  messageContainer: {
    marginVertical: 4,
    padding: 12,
    borderRadius: 12,
    maxWidth: '80%',
  },
  userMessage: {
    backgroundColor: '#007AFF',
    alignSelf: 'flex-end',
  },
  assistantMessage: {
    backgroundColor: 'white',
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: '#e1e1e1',
  },
  messageText: {
    fontSize: 16,
    lineHeight: 22,
    color: '#333',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
  },
  loadingText: {
    marginLeft: 8,
    color: '#666',
    fontSize: 14,
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#e1e1e1',
  },
  textInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#e1e1e1',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    maxHeight: 100,
    textAlignVertical: 'top',
  },
  sendButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    marginLeft: 8,
    justifyContent: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: '#ccc',
  },
  sendButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    fontSize: 16,
    color: '#999',
    textAlign: 'center',
  },
});

export default AIChat;
```

---

## ⚙️ Configuration Setup

### Expo Configuration

Update your `app.config.js` or `expo.json`:

```javascript
export default {
  expo: {
    // ... other config
    extra: {
      apiBaseUrl: process.env.EXPO_PUBLIC_API_BASE_URL,
      devApiUrl: process.env.EXPO_PUBLIC_DEV_API_URL,
      clerkPublishableKey: process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY,
    },
  },
};
```

### App Root Setup

Update your `App.tsx`:

```typescript
import { ClerkProvider } from '@clerk/clerk-expo';
import Constants from 'expo-constants';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import MainNavigator from './src/navigation/MainNavigator';

const queryClient = new QueryClient();

export default function App() {
  const clerkPublishableKey = Constants.expoConfig?.extra?.clerkPublishableKey;

  if (!clerkPublishableKey) {
    throw new Error('Missing Clerk Publishable Key');
  }

  return (
    <ClerkProvider publishableKey={clerkPublishableKey}>
      <QueryClientProvider client={queryClient}>
        <SafeAreaProvider>
          <MainNavigator />
          <StatusBar style="auto" />
        </SafeAreaProvider>
      </QueryClientProvider>
    </ClerkProvider>
  );
}
```

---

## 🐛 Error Handling

### Network Error Handler

Create `src/utils/errorHandler.ts`:

```typescript
import { Alert } from "react-native";

export const handleApiError = (error: unknown, context?: string) => {
  console.error(`API Error${context ? ` [${context}]` : ""}:`, error);

  if (error instanceof Error) {
    if (error.message.includes("Network request failed")) {
      Alert.alert(
        "Network Error",
        "Please check your internet connection and try again.",
      );
    } else if (error.message.includes("401")) {
      Alert.alert(
        "Authentication Error",
        "Your session has expired. Please sign in again.",
      );
    } else if (error.message.includes("403")) {
      Alert.alert(
        "Permission Error",
        "You do not have permission to perform this action.",
      );
    } else if (error.message.includes("404")) {
      Alert.alert("Not Found", "The requested resource was not found.");
    } else if (error.message.includes("500")) {
      Alert.alert(
        "Server Error",
        "Something went wrong on our end. Please try again later.",
      );
    } else {
      Alert.alert("Error", error.message || "An unexpected error occurred.");
    }
  } else {
    Alert.alert("Error", "An unexpected error occurred.");
  }
};
```

---

## 🧪 Testing

### API Connection Test

Create a test function to verify connectivity:

```typescript
// src/utils/testConnection.ts
import { apiClient } from "../services/apiClient";

export const testApiConnection = async (): Promise<boolean> => {
  try {
    await apiClient.getNotes();
    console.log("✅ API connection successful");
    return true;
  } catch (error) {
    console.error("❌ API connection failed:", error);
    return false;
  }
};

// Usage in a component
const handleTestConnection = async () => {
  const isConnected = await testApiConnection();
  Alert.alert(
    "Connection Test",
    isConnected ? "API connection successful!" : "API connection failed!",
  );
};
```

---

## 📚 Available API Endpoints

### Notes

- `GET /api/notes` - Get all notes
- `GET /api/notes/:id` - Get specific note
- `POST /api/notes` - Create note
- `PUT /api/notes/:id` - Update note
- `DELETE /api/notes/:id` - Delete note
- `GET /api/notes/search?q=query` - Semantic search

### Categories

- `GET /api/categories` - Get all categories
- `POST /api/categories` - Create category
- `PUT /api/categories/:id` - Update category
- `DELETE /api/categories/:id` - Delete category

### Chat

- `POST /api/chat` - Send chat message
- `POST /api/chat/suggestions` - Get AI suggestions

---

## 🚀 Quick Start Checklist

- [ ] Install dependencies (`@clerk/clerk-expo`, etc.)
- [ ] Set up environment variables
- [ ] Copy API client code
- [ ] Configure Clerk authentication
- [ ] Test API connection
- [ ] Implement your UI components
- [ ] Add error handling
- [ ] Test on both platforms (iOS/Android)

---

## 🔧 Troubleshooting

### Common Issues

1. **Network Timeout**: Increase timeout or check internet connection
2. **Auth Errors**: Verify Clerk configuration and token refresh
3. **CORS Issues**: Ensure backend CORS is configured for your domain
4. **Android Localhost**: Use `10.0.2.2` instead of `localhost`

### Debug Mode

Enable detailed logging:

```typescript
// Add to your API client
private debug = __DEV__;

private log(message: string, data?: any) {
  if (this.debug) {
    console.log(`[API] ${message}`, data || '');
  }
}
```

---

## 📝 Notes

- All endpoints require authentication via Clerk
- The backend supports real-time AI chat with context from your notes
- Semantic search uses vector embeddings for intelligent results
- Categories help organize notes with color coding
- Error handling is built into all API calls

Happy coding! 🎉
