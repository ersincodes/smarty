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
} from "react-native";
import {
  Modal,
  Portal,
  Button,
  Card,
  ActivityIndicator,
  IconButton,
} from "react-native-paper";
import { useChatStore } from "../app/store/chatStore";
import { ChatMessage } from "../app/types";

interface AIChatModalProps {
  visible: boolean;
  onDismiss: () => void;
}

const AIChatModal: React.FC<AIChatModalProps> = ({ visible, onDismiss }) => {
  const [inputText, setInputText] = useState("");
  const flatListRef = useRef<FlatList>(null);

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
    <Portal>
      <Modal
        visible={visible}
        onDismiss={onDismiss}
        contentContainerStyle={styles.modalContainer}>
        <Card style={styles.card}>
          <Card.Title
            title="AI Assistant"
            right={(props) => (
              <View style={styles.headerActions}>
                <IconButton
                  {...props}
                  icon="delete"
                  onPress={handleClearChat}
                  disabled={messages.length === 0}
                />
                <IconButton {...props} icon="close" onPress={onDismiss} />
              </View>
            )}
          />

          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={styles.chatContainer}>
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
          </KeyboardAvoidingView>
        </Card>
      </Modal>
    </Portal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    margin: 20,
    marginTop: 60,
  },
  card: {
    flex: 1,
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
