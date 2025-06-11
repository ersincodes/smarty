import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  Modal,
  StatusBar,
  Dimensions,
  ScrollView,
} from "react-native";
import { Button, ActivityIndicator, Chip } from "react-native-paper";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { useAuth } from "@clerk/clerk-expo";
import { useChatStore } from "../app/store/chatStore";
import { useNotesStore } from "../app/store/notesStore";
import { ChatMessage } from "../app/types";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");

interface AIChatModalProps {
  visible: boolean;
  onDismiss: () => void;
}

const AIChatModal: React.FC<AIChatModalProps> = ({ visible, onDismiss }) => {
  const [inputText, setInputText] = useState("");
  const flatListRef = useRef<FlatList>(null);
  const insets = useSafeAreaInsets();
  const { getToken } = useAuth();

  const {
    messages,
    isLoading,
    error,
    relatedNotes,
    sendMessageWithNotesContext,
    clearMessages,
    clearError,
    summarizeNotes,
    categorizeAndOrganize,
  } = useChatStore();

  const { notes } = useNotesStore();

  useEffect(() => {
    if (visible && error) {
      clearError();
    }
  }, [visible, error, clearError]);

  useEffect(() => {
    // Scroll to bottom when new messages are added
    if (messages.length > 0 && flatListRef.current) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages]);

  const handleSendMessage = useCallback(async () => {
    if (!inputText.trim() || isLoading) return;

    const messageText = inputText.trim();
    setInputText("");

    try {
      // Use the enhanced context-aware send message
      await sendMessageWithNotesContext(messageText, getToken);
    } catch (error) {
      // Error is handled in the store
    }
  }, [inputText, isLoading, sendMessageWithNotesContext, getToken]);

  const handleQuickAction = useCallback(
    async (action: string) => {
      try {
        switch (action) {
          case "summarize":
            await summarizeNotes(getToken);
            break;
          case "organize":
            await categorizeAndOrganize(getToken);
            break;
          case "help":
            await sendMessageWithNotesContext(
              "How can you help me with my notes? What features are available?",
              getToken
            );
            break;
        }
      } catch (error) {
        // Error handled in store
      }
    },
    [
      summarizeNotes,
      categorizeAndOrganize,
      sendMessageWithNotesContext,
      getToken,
    ]
  );

  const handleClearChat = useCallback(() => {
    clearMessages();
  }, [clearMessages]);

  const handleBackdropPress = useCallback(() => {
    // Prevent dismissing when loading
    if (!isLoading) {
      onDismiss();
    }
  }, [isLoading, onDismiss]);

  const renderMessage = useCallback(({ item }: { item: ChatMessage }) => {
    const isUser = item.role === "user";

    return (
      <View
        style={[
          styles.messageContainer,
          isUser ? styles.userMessage : styles.assistantMessage,
        ]}>
        <View
          style={[
            styles.messageBubble,
            isUser ? styles.userBubble : styles.assistantBubble,
          ]}>
          <Text
            style={[
              styles.messageText,
              isUser ? styles.userText : styles.assistantText,
            ]}>
            {item.content}
          </Text>
        </View>
      </View>
    );
  }, []);

  const renderQuickActions = () => (
    <View style={styles.quickActionsContainer}>
      <Text style={styles.quickActionsTitle}>Quick Actions</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.quickActionsScroll}>
        <Chip
          icon="chart-line"
          onPress={() => handleQuickAction("summarize")}
          style={styles.quickActionChip}
          textStyle={styles.quickActionText}
          disabled={isLoading || notes.length === 0}>
          Summarize Notes
        </Chip>
        <Chip
          icon="sort-variant"
          onPress={() => handleQuickAction("organize")}
          style={styles.quickActionChip}
          textStyle={styles.quickActionText}
          disabled={isLoading || notes.length === 0}>
          Organize Notes
        </Chip>
        <Chip
          icon="help-circle"
          onPress={() => handleQuickAction("help")}
          style={styles.quickActionChip}
          textStyle={styles.quickActionText}
          disabled={isLoading}>
          How can you help?
        </Chip>
      </ScrollView>
    </View>
  );

  const renderRelatedNotes = () => {
    if (!relatedNotes || relatedNotes.length === 0) return null;

    return (
      <View style={styles.relatedNotesContainer}>
        <Text style={styles.relatedNotesTitle}>
          📝 Related Notes ({relatedNotes.length})
        </Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.relatedNotesScroll}>
          {relatedNotes.map((note) => (
            <View key={note.id} style={styles.relatedNoteItem}>
              <Text style={styles.relatedNoteTitle} numberOfLines={1}>
                {note.title}
              </Text>
              {note.category && (
                <Text style={styles.relatedNoteCategory}>
                  {note.category.name}
                </Text>
              )}
            </View>
          ))}
        </ScrollView>
      </View>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Text style={styles.emptyStateIcon}>🤖</Text>
      <Text style={styles.emptyStateTitle}>
        Hi! I'm your AI assistant for notes
      </Text>
      <Text style={styles.emptyStateText}>
        I can help you with your {notes.length} notes! Ask me to:
        {"\n"}• Summarize your notes
        {"\n"}• Organize and categorize them
        {"\n"}• Find specific information
        {"\n"}• Answer questions about your content
      </Text>
      {notes.length === 0 && (
        <Text style={styles.emptyStateSubtext}>
          Create some notes first, then I can help you manage them!
        </Text>
      )}
    </View>
  );

  const renderLoadingMessage = () => {
    if (!isLoading || messages.length === 0) return null;

    return (
      <View style={[styles.messageContainer, styles.assistantMessage]}>
        <View style={[styles.messageBubble, styles.assistantBubble]}>
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="small" color="#666" />
            <Text style={styles.loadingText}>Analyzing your notes...</Text>
          </View>
        </View>
      </View>
    );
  };

  const renderErrorMessage = () => {
    if (!error) return null;

    return (
      <View style={[styles.messageContainer, styles.assistantMessage]}>
        <View style={[styles.messageBubble, styles.errorBubble]}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      </View>
    );
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      presentationStyle="overFullScreen"
      onRequestClose={onDismiss}>
      <StatusBar barStyle="dark-content" backgroundColor="rgba(0, 0, 0, 0.5)" />
      <View style={styles.modalContainer}>
        <TouchableOpacity
          style={styles.backdrop}
          activeOpacity={1}
          onPress={handleBackdropPress}
        />

        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.keyboardAvoidingView}
          keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}>
          <SafeAreaView style={styles.safeAreaContainer} edges={["bottom"]}>
            <View
              style={[
                styles.modalContent,
                { paddingBottom: Math.max(insets.bottom, 20) },
              ]}>
              {/* Handle Bar */}
              <View style={styles.handleBar} />

              {/* Header */}
              <View style={styles.header}>
                <TouchableOpacity
                  onPress={onDismiss}
                  style={styles.closeButton}>
                  <Text style={styles.closeText}>Close</Text>
                </TouchableOpacity>

                <Text style={styles.headerTitle}>AI Assistant</Text>

                <TouchableOpacity
                  onPress={handleClearChat}
                  disabled={messages.length === 0}
                  style={[
                    styles.clearButton,
                    messages.length === 0 && styles.clearButtonDisabled,
                  ]}>
                  <Text
                    style={[
                      styles.clearText,
                      messages.length === 0 && styles.clearTextDisabled,
                    ]}>
                    Clear
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Notes Context Info */}
              {notes.length > 0 && (
                <View style={styles.contextInfo}>
                  <Text style={styles.contextText}>
                    💡 I have access to your {notes.length} notes and can
                    provide personalized help
                  </Text>
                </View>
              )}

              {/* Quick Actions */}
              {messages.length === 0 && renderQuickActions()}

              {/* Related Notes */}
              {renderRelatedNotes()}

              {/* Chat Content */}
              <View style={styles.chatContainer}>
                <View style={styles.messagesContainer}>
                  <FlatList
                    ref={flatListRef}
                    data={messages}
                    renderItem={renderMessage}
                    keyExtractor={(item, index) => item.id || index.toString()}
                    ListEmptyComponent={renderEmptyState}
                    ListFooterComponent={() => (
                      <>
                        {renderLoadingMessage()}
                        {renderErrorMessage()}
                      </>
                    )}
                    style={styles.messagesList}
                    contentContainerStyle={styles.messagesContent}
                    showsVerticalScrollIndicator={false}
                    keyboardShouldPersistTaps="handled"
                  />
                </View>

                <View style={styles.inputContainer}>
                  <TextInput
                    style={styles.textInput}
                    value={inputText}
                    onChangeText={setInputText}
                    placeholder={
                      notes.length > 0
                        ? "Ask about your notes..."
                        : "Ask me anything..."
                    }
                    multiline
                    maxLength={500}
                    editable={!isLoading}
                    accessibilityLabel="Chat message input"
                    placeholderTextColor="#999"
                  />
                  <Button
                    mode="contained"
                    onPress={handleSendMessage}
                    disabled={!inputText.trim() || isLoading}
                    style={styles.sendButton}
                    compact>
                    Send
                  </Button>
                </View>
              </View>
            </View>
          </SafeAreaView>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    paddingTop: SCREEN_HEIGHT * 0.1,
  },
  backdrop: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  keyboardAvoidingView: {
    maxHeight: SCREEN_HEIGHT * 0.85,
    flex: 1,
  },
  safeAreaContainer: {
    backgroundColor: "transparent",
    flex: 1,
  },
  modalContent: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    maxHeight: SCREEN_HEIGHT * 0.8,
    minHeight: SCREEN_HEIGHT * 0.65,
    marginHorizontal: 10,
    flex: 1,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: -4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 10,
  },
  handleBar: {
    width: 40,
    height: 4,
    backgroundColor: "#E0E0E0",
    borderRadius: 2,
    alignSelf: "center",
    marginTop: 12,
    marginBottom: 8,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  closeButton: {
    paddingVertical: 8,
    paddingHorizontal: 4,
    minWidth: 60,
  },
  closeText: {
    fontSize: 16,
    color: "#007AFF",
    fontWeight: "500",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1A1A1A",
    textAlign: "center",
  },
  clearButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    minWidth: 60,
    alignItems: "center",
    justifyContent: "center",
  },
  clearButtonDisabled: {
    opacity: 0.5,
  },
  clearText: {
    fontSize: 16,
    color: "#007AFF",
    fontWeight: "500",
  },
  clearTextDisabled: {
    color: "#C0C0C0",
  },
  contextInfo: {
    backgroundColor: "#E3F2FD",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderLeftWidth: 4,
    borderLeftColor: "#2196F3",
    marginHorizontal: 16,
    marginTop: 8,
    borderRadius: 8,
  },
  contextText: {
    fontSize: 14,
    color: "#1976D2",
    fontWeight: "500",
  },
  quickActionsContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  quickActionsTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#666",
    marginBottom: 8,
  },
  quickActionsScroll: {
    paddingHorizontal: 4,
  },
  quickActionChip: {
    marginRight: 8,
    backgroundColor: "#F5F5F5",
  },
  quickActionText: {
    fontSize: 12,
    color: "#007AFF",
  },
  relatedNotesContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: "#F8F9FA",
    borderBottomWidth: 1,
    borderBottomColor: "#E9ECEF",
  },
  relatedNotesTitle: {
    fontSize: 12,
    fontWeight: "600",
    color: "#495057",
    marginBottom: 8,
  },
  relatedNotesScroll: {
    paddingHorizontal: 4,
  },
  relatedNoteItem: {
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    marginRight: 8,
    minWidth: 120,
    maxWidth: 160,
    borderWidth: 1,
    borderColor: "#E9ECEF",
  },
  relatedNoteTitle: {
    fontSize: 12,
    fontWeight: "500",
    color: "#343A40",
  },
  relatedNoteCategory: {
    fontSize: 10,
    color: "#6C757D",
    marginTop: 2,
  },
  chatContainer: {
    flex: 1,
  },
  messagesContainer: {
    flex: 1,
    paddingHorizontal: 16,
  },
  messagesList: {
    flex: 1,
  },
  messagesContent: {
    paddingVertical: 8,
  },
  messageContainer: {
    marginVertical: 4,
  },
  userMessage: {
    alignItems: "flex-end",
  },
  assistantMessage: {
    alignItems: "flex-start",
  },
  messageBubble: {
    maxWidth: "80%",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
  },
  userBubble: {
    backgroundColor: "#007AFF",
  },
  assistantBubble: {
    backgroundColor: "#f0f0f0",
  },
  errorBubble: {
    backgroundColor: "#ffebee",
    borderColor: "#f44336",
    borderWidth: 1,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 20,
  },
  userText: {
    color: "white",
  },
  assistantText: {
    color: "#333",
  },
  errorText: {
    color: "#d32f2f",
  },
  loadingContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  loadingText: {
    marginLeft: 8,
    color: "#666",
    fontSize: 14,
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  emptyStateIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    textAlign: "center",
    marginBottom: 12,
  },
  emptyStateText: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    lineHeight: 20,
  },
  emptyStateSubtext: {
    fontSize: 12,
    color: "#999",
    textAlign: "center",
    marginTop: 12,
    fontStyle: "italic",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "flex-end",
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: "#F0F0F0",
    backgroundColor: "white",
    minHeight: 70,
  },
  textInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#E8E8E8",
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginRight: 8,
    maxHeight: 80,
    minHeight: 40,
    fontSize: 16,
    backgroundColor: "#F8F9FA",
    color: "#1A1A1A",
    lineHeight: 20,
  },
  sendButton: {
    borderRadius: 20,
    backgroundColor: "#007AFF",
    minHeight: 40,
    justifyContent: "center",
  },
});

export default AIChatModal;
