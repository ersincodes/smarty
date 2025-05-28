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
} from "react-native";
import { Button, ActivityIndicator } from "react-native-paper";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { useChatStore } from "../app/store/chatStore";
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

  const { messages, isLoading, error, sendMessage, clearMessages, clearError } =
    useChatStore();

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
      await sendMessage(messageText);
    } catch (error) {
      // Error is handled in the store
    }
  }, [inputText, isLoading, sendMessage]);

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

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Text style={styles.emptyStateIcon}>🤖</Text>
      <Text style={styles.emptyStateText}>
        Ask Smarty anything about your notes...
      </Text>
    </View>
  );

  const renderLoadingMessage = () => {
    if (!isLoading || messages.length === 0) return null;

    return (
      <View style={[styles.messageContainer, styles.assistantMessage]}>
        <View style={[styles.messageBubble, styles.assistantBubble]}>
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="small" color="#666" />
            <Text style={styles.loadingText}>Thinking...</Text>
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
          <Text style={styles.errorText}>
            Something went wrong. Please try again.
          </Text>
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
          style={styles.keyboardAvoidingView}>
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

              {/* Chat Content */}
              <View style={styles.chatContainer}>
                <View style={styles.messagesContainer}>
                  <FlatList
                    ref={flatListRef}
                    data={messages}
                    renderItem={renderMessage}
                    keyExtractor={(item) => item.id}
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
                  />
                </View>

                <View style={styles.inputContainer}>
                  <TextInput
                    style={styles.textInput}
                    value={inputText}
                    onChangeText={setInputText}
                    placeholder="Ask anything..."
                    multiline
                    maxLength={500}
                    editable={!isLoading}
                    accessibilityLabel="Chat message input"
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
    justifyContent: "flex-end",
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
    maxHeight: SCREEN_HEIGHT * 0.9,
  },
  safeAreaContainer: {
    backgroundColor: "transparent",
  },
  modalContent: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: SCREEN_HEIGHT * 0.85,
    minHeight: SCREEN_HEIGHT * 0.6,
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
  headerActions: {
    flexDirection: "row",
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
  },
  emptyStateIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyStateText: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "flex-end",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: "#e0e0e0",
    backgroundColor: "white",
  },
  textInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
    maxHeight: 100,
    fontSize: 16,
    backgroundColor: "#f9f9f9",
  },
  sendButton: {
    borderRadius: 20,
  },
});

export default AIChatModal;
