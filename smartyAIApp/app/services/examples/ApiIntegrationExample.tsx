import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  StyleSheet,
} from "react-native";
import { useNotes, useCategories, useChat } from "../apiHooks";
import {
  formatRelativeTime,
  truncateContent,
  validateNoteInput,
  validateCategoryName,
} from "../apiUtils";
import { CreateNoteInput, UpdateNoteInput } from "../../types";

/**
 * Complete example component demonstrating API integration
 * This shows how to use all the new API hooks and utilities
 */
const ApiIntegrationExample: React.FC = () => {
  // State for note form
  const [noteTitle, setNoteTitle] = useState("");
  const [noteContent, setNoteContent] = useState("");
  const [selectedCategoryId, setSelectedCategoryId] = useState<
    string | undefined
  >();
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);

  // State for category form
  const [categoryName, setCategoryName] = useState("");

  // State for chat
  const [chatMessage, setChatMessage] = useState("");
  const [streamingResponse, setStreamingResponse] = useState("");

  // API hooks
  const {
    notes,
    loading: notesLoading,
    error: notesError,
    createNote,
    updateNote,
    deleteNote,
    fetchNotes,
  } = useNotes();

  const {
    categories,
    loading: categoriesLoading,
    error: categoriesError,
    createCategory,
    deleteCategory,
  } = useCategories();

  const {
    messages,
    loading: chatLoading,
    error: chatError,
    sendMessage,
    clearMessages,
  } = useChat();

  // Note operations
  const handleCreateNote = useCallback(async () => {
    const noteData: CreateNoteInput = {
      title: noteTitle.trim(),
      content: noteContent.trim(),
      categoryId: selectedCategoryId,
    };

    const validationErrors = validateNoteInput(noteData);
    if (validationErrors.length > 0) {
      Alert.alert("Validation Error", validationErrors.join("\n"));
      return;
    }

    try {
      const result = await createNote(noteData);
      if (result) {
        Alert.alert("Success", "Note created successfully!");
        setNoteTitle("");
        setNoteContent("");
        setSelectedCategoryId(undefined);
      }
    } catch (error) {
      Alert.alert("Error", "Failed to create note");
    }
  }, [noteTitle, noteContent, selectedCategoryId, createNote]);

  const handleUpdateNote = useCallback(async () => {
    if (!editingNoteId) return;

    const noteData: UpdateNoteInput = {
      id: editingNoteId,
      title: noteTitle.trim(),
      content: noteContent.trim(),
      categoryId: selectedCategoryId,
    };

    const validationErrors = validateNoteInput(noteData);
    if (validationErrors.length > 0) {
      Alert.alert("Validation Error", validationErrors.join("\n"));
      return;
    }

    try {
      const result = await updateNote(noteData);
      if (result) {
        Alert.alert("Success", "Note updated successfully!");
        setEditingNoteId(null);
        setNoteTitle("");
        setNoteContent("");
        setSelectedCategoryId(undefined);
      }
    } catch (error) {
      Alert.alert("Error", "Failed to update note");
    }
  }, [editingNoteId, noteTitle, noteContent, selectedCategoryId, updateNote]);

  const handleDeleteNote = useCallback(
    async (noteId: string) => {
      Alert.alert("Delete Note", "Are you sure you want to delete this note?", [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              const success = await deleteNote(noteId);
              if (success) {
                Alert.alert("Success", "Note deleted successfully!");
              }
            } catch (error) {
              Alert.alert("Error", "Failed to delete note");
            }
          },
        },
      ]);
    },
    [deleteNote]
  );

  const handleEditNote = useCallback((note: any) => {
    setEditingNoteId(note.id);
    setNoteTitle(note.title);
    setNoteContent(note.content);
    setSelectedCategoryId(note.categoryId);
  }, []);

  // Category operations
  const handleCreateCategory = useCallback(async () => {
    const validationErrors = validateCategoryName(categoryName);
    if (validationErrors.length > 0) {
      Alert.alert("Validation Error", validationErrors.join("\n"));
      return;
    }

    try {
      const result = await createCategory(categoryName.trim());
      if (result) {
        Alert.alert("Success", "Category created successfully!");
        setCategoryName("");
      }
    } catch (error) {
      Alert.alert("Error", "Failed to create category");
    }
  }, [categoryName, createCategory]);

  const handleDeleteCategory = useCallback(
    async (categoryId: string) => {
      Alert.alert(
        "Delete Category",
        "Are you sure you want to delete this category?",
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Delete",
            style: "destructive",
            onPress: async () => {
              try {
                const success = await deleteCategory(categoryId);
                if (success) {
                  Alert.alert("Success", "Category deleted successfully!");
                }
              } catch (error) {
                Alert.alert("Error", "Failed to delete category");
              }
            },
          },
        ]
      );
    },
    [deleteCategory]
  );

  // Chat operations
  const handleSendMessage = useCallback(async () => {
    if (!chatMessage.trim()) return;

    const userMessage = chatMessage.trim();
    setChatMessage("");
    setStreamingResponse("");

    try {
      await sendMessage(userMessage, (chunk) => {
        setStreamingResponse((prev) => prev + chunk);
      });
      setStreamingResponse("");
    } catch (error) {
      Alert.alert("Error", "Failed to send message");
    }
  }, [chatMessage, sendMessage]);

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>API Integration Example</Text>

      {/* Notes Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Notes Management</Text>

        {/* Note Form */}
        <View style={styles.form}>
          <TextInput
            style={styles.input}
            placeholder="Note title"
            value={noteTitle}
            onChangeText={setNoteTitle}
          />

          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Note content"
            value={noteContent}
            onChangeText={setNoteContent}
            multiline
            numberOfLines={4}
          />

          {/* Category Picker */}
          <Text style={styles.label}>Category (Optional):</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <TouchableOpacity
              style={[
                styles.categoryChip,
                !selectedCategoryId && styles.categoryChipSelected,
              ]}
              onPress={() => setSelectedCategoryId(undefined)}>
              <Text style={styles.categoryChipText}>None</Text>
            </TouchableOpacity>
            {categories?.map((category) => (
              <TouchableOpacity
                key={category.id}
                style={[
                  styles.categoryChip,
                  selectedCategoryId === category.id &&
                    styles.categoryChipSelected,
                ]}
                onPress={() => setSelectedCategoryId(category.id)}>
                <Text style={styles.categoryChipText}>{category.name}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <TouchableOpacity
            style={styles.button}
            onPress={editingNoteId ? handleUpdateNote : handleCreateNote}
            disabled={notesLoading}>
            {notesLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>
                {editingNoteId ? "Update Note" : "Create Note"}
              </Text>
            )}
          </TouchableOpacity>

          {editingNoteId && (
            <TouchableOpacity
              style={[styles.button, styles.cancelButton]}
              onPress={() => {
                setEditingNoteId(null);
                setNoteTitle("");
                setNoteContent("");
                setSelectedCategoryId(undefined);
              }}>
              <Text style={styles.buttonText}>Cancel Edit</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Notes List */}
        {notesError && (
          <Text style={styles.errorText}>Error: {notesError}</Text>
        )}

        {notes?.map((note) => (
          <View key={note.id} style={styles.noteCard}>
            <Text style={styles.noteTitle}>{note.title}</Text>
            <Text style={styles.noteContent}>
              {truncateContent(note.content, 100)}
            </Text>
            <Text style={styles.noteDate}>
              {formatRelativeTime(note.updatedAt)}
            </Text>
            {note.category && (
              <Text style={styles.noteCategory}>#{note.category.name}</Text>
            )}

            <View style={styles.noteActions}>
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => handleEditNote(note)}>
                <Text style={styles.actionButtonText}>Edit</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.actionButton, styles.deleteButton]}
                onPress={() => handleDeleteNote(note.id)}>
                <Text style={styles.actionButtonText}>Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </View>

      {/* Categories Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Categories Management</Text>

        <View style={styles.form}>
          <TextInput
            style={styles.input}
            placeholder="Category name"
            value={categoryName}
            onChangeText={setCategoryName}
          />

          <TouchableOpacity
            style={styles.button}
            onPress={handleCreateCategory}
            disabled={categoriesLoading}>
            {categoriesLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Create Category</Text>
            )}
          </TouchableOpacity>
        </View>

        {categoriesError && (
          <Text style={styles.errorText}>Error: {categoriesError}</Text>
        )}

        {categories?.map((category) => (
          <View key={category.id} style={styles.categoryCard}>
            <Text style={styles.categoryName}>{category.name}</Text>
            <TouchableOpacity
              style={[styles.actionButton, styles.deleteButton]}
              onPress={() => handleDeleteCategory(category.id)}>
              <Text style={styles.actionButtonText}>Delete</Text>
            </TouchableOpacity>
          </View>
        ))}
      </View>

      {/* Chat Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>AI Chat</Text>

        <View style={styles.chatContainer}>
          <ScrollView style={styles.messagesContainer}>
            {messages.map((message, index) => (
              <View
                key={index}
                style={[
                  styles.messageItem,
                  message.role === "user"
                    ? styles.userMessage
                    : styles.assistantMessage,
                ]}>
                <Text style={styles.messageRole}>
                  {message.role === "user" ? "You" : "AI"}:
                </Text>
                <Text style={styles.messageContent}>{message.content}</Text>
              </View>
            ))}

            {streamingResponse && (
              <View style={[styles.messageItem, styles.assistantMessage]}>
                <Text style={styles.messageRole}>AI:</Text>
                <Text style={styles.messageContent}>{streamingResponse}</Text>
              </View>
            )}
          </ScrollView>

          <View style={styles.chatInputContainer}>
            <TextInput
              style={[styles.input, styles.chatInput]}
              placeholder="Ask about your notes..."
              value={chatMessage}
              onChangeText={setChatMessage}
              multiline
            />
            <TouchableOpacity
              style={styles.sendButton}
              onPress={handleSendMessage}
              disabled={chatLoading}>
              {chatLoading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.buttonText}>Send</Text>
              )}
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={[styles.button, styles.clearButton]}
            onPress={clearMessages}>
            <Text style={styles.buttonText}>Clear Chat</Text>
          </TouchableOpacity>

          {chatError && (
            <Text style={styles.errorText}>Error: {chatError}</Text>
          )}
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#f5f5f5",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  section: {
    marginBottom: 30,
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 16,
    color: "#333",
  },
  form: {
    marginBottom: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    fontSize: 16,
  },
  textArea: {
    height: 100,
    textAlignVertical: "top",
  },
  label: {
    fontSize: 14,
    fontWeight: "500",
    marginBottom: 8,
    color: "#666",
  },
  categoryChip: {
    backgroundColor: "#e0e0e0",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 12,
  },
  categoryChipSelected: {
    backgroundColor: "#007AFF",
  },
  categoryChipText: {
    fontSize: 14,
    color: "#333",
  },
  button: {
    backgroundColor: "#007AFF",
    padding: 14,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 8,
  },
  cancelButton: {
    backgroundColor: "#666",
  },
  clearButton: {
    backgroundColor: "#FF3B30",
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  noteCard: {
    backgroundColor: "#f9f9f9",
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: "#007AFF",
  },
  noteTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
    color: "#333",
  },
  noteContent: {
    fontSize: 14,
    color: "#666",
    marginBottom: 8,
  },
  noteDate: {
    fontSize: 12,
    color: "#999",
    marginBottom: 4,
  },
  noteCategory: {
    fontSize: 12,
    color: "#007AFF",
    fontWeight: "500",
    marginBottom: 8,
  },
  noteActions: {
    flexDirection: "row",
    gap: 8,
  },
  actionButton: {
    backgroundColor: "#007AFF",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
  },
  deleteButton: {
    backgroundColor: "#FF3B30",
  },
  actionButtonText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "500",
  },
  categoryCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#f9f9f9",
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  categoryName: {
    fontSize: 16,
    color: "#333",
  },
  chatContainer: {
    height: 400,
  },
  messagesContainer: {
    flex: 1,
    marginBottom: 12,
    maxHeight: 200,
  },
  messageItem: {
    marginBottom: 12,
    padding: 8,
    borderRadius: 8,
  },
  userMessage: {
    backgroundColor: "#007AFF",
    alignSelf: "flex-end",
    maxWidth: "80%",
  },
  assistantMessage: {
    backgroundColor: "#e0e0e0",
    alignSelf: "flex-start",
    maxWidth: "80%",
  },
  messageRole: {
    fontSize: 12,
    fontWeight: "600",
    marginBottom: 4,
    color: "#666",
  },
  messageContent: {
    fontSize: 14,
    color: "#333",
  },
  chatInputContainer: {
    flexDirection: "row",
    alignItems: "flex-end",
    marginBottom: 12,
  },
  chatInput: {
    flex: 1,
    marginRight: 8,
    marginBottom: 0,
  },
  sendButton: {
    backgroundColor: "#007AFF",
    padding: 12,
    borderRadius: 8,
    minWidth: 60,
    alignItems: "center",
  },
  errorText: {
    color: "#FF3B30",
    fontSize: 14,
    marginBottom: 8,
    textAlign: "center",
  },
});

export default ApiIntegrationExample;
