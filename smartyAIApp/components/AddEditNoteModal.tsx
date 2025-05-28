import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Alert,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Modal,
  TouchableOpacity,
  Dimensions,
  StatusBar,
} from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { Button, ActivityIndicator } from "react-native-paper";
import { Picker } from "@react-native-picker/picker";
import {
  NoteWithCategory,
  CreateNoteInput,
  UpdateNoteInput,
} from "../app/types";
import { useNotesStore } from "../app/store/notesStore";
import { useCategoriesStore } from "../app/store/categoriesStore";

interface AddEditNoteModalProps {
  visible: boolean;
  onDismiss: () => void;
  noteToEdit?: NoteWithCategory | null;
}

const { height: SCREEN_HEIGHT } = Dimensions.get("window");

const AddEditNoteModal: React.FC<AddEditNoteModalProps> = ({
  visible,
  onDismiss,
  noteToEdit,
}) => {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [categoryId, setCategoryId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const insets = useSafeAreaInsets();

  const { createNote, updateNote, deleteNote } = useNotesStore();
  const {
    categories,
    fetchCategories,
    isLoading: categoriesLoading,
  } = useCategoriesStore();

  useEffect(() => {
    if (visible) {
      fetchCategories();
      if (noteToEdit) {
        setTitle(noteToEdit.title);
        setContent(noteToEdit.content || "");
        setCategoryId(noteToEdit.categoryId);
      } else {
        setTitle("");
        setContent("");
        setCategoryId(null);
      }
    }
  }, [visible, noteToEdit, fetchCategories]);

  const handleSubmit = useCallback(async () => {
    if (!title.trim()) {
      Alert.alert("Error", "Please enter a title for your note.");
      return;
    }

    setIsSubmitting(true);
    try {
      if (noteToEdit) {
        const updateData: UpdateNoteInput = {
          id: noteToEdit.id,
          title: title.trim(),
          content: content.trim(),
          categoryId,
        };
        await updateNote(updateData);
      } else {
        const createData: CreateNoteInput = {
          title: title.trim(),
          content: content.trim(),
          categoryId,
        };
        await createNote(createData);
      }
      onDismiss();
    } catch (error) {
      Alert.alert("Error", "Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }, [
    title,
    content,
    categoryId,
    noteToEdit,
    createNote,
    updateNote,
    onDismiss,
  ]);

  const handleDelete = useCallback(async () => {
    if (!noteToEdit) return;

    Alert.alert(
      "Delete Note",
      "Are you sure you want to delete this note? This action cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            setIsSubmitting(true);
            try {
              await deleteNote(noteToEdit.id);
              onDismiss();
            } catch (error) {
              Alert.alert("Error", "Failed to delete note. Please try again.");
            } finally {
              setIsSubmitting(false);
            }
          },
        },
      ]
    );
  }, [noteToEdit, deleteNote, onDismiss]);

  const handleBackdropPress = useCallback(() => {
    onDismiss();
  }, [onDismiss]);

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      presentationStyle="overFullScreen"
      onRequestClose={onDismiss}>
      <StatusBar
        barStyle="light-content"
        backgroundColor="rgba(0, 0, 0, 0.5)"
      />
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
                  style={styles.cancelButton}>
                  <Text style={styles.cancelText}>Cancel</Text>
                </TouchableOpacity>

                <Text style={styles.headerTitle}>
                  {noteToEdit ? "Edit Note" : "Add Note"}
                </Text>

                <TouchableOpacity
                  onPress={handleSubmit}
                  disabled={isSubmitting || !title.trim()}
                  style={[
                    styles.saveButton,
                    (!title.trim() || isSubmitting) &&
                      styles.saveButtonDisabled,
                  ]}>
                  {isSubmitting ? (
                    <ActivityIndicator size="small" color="white" />
                  ) : (
                    <Text style={styles.saveText}>
                      {noteToEdit ? "Update" : "Create"}
                    </Text>
                  )}
                </TouchableOpacity>
              </View>

              {/* Form Content */}
              <ScrollView
                style={styles.scrollView}
                showsVerticalScrollIndicator={false}
                bounces={false}>
                <View style={styles.formContainer}>
                  {/* Category Selector */}
                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>Category</Text>
                    <View style={styles.pickerWrapper}>
                      <Picker
                        selectedValue={categoryId || "none"}
                        onValueChange={(value: string) =>
                          setCategoryId(value === "none" ? null : value)
                        }
                        enabled={!categoriesLoading}
                        style={styles.picker}>
                        <Picker.Item label="No Category" value="none" />
                        {categories.map((category) => (
                          <Picker.Item
                            key={category.id}
                            label={category.name}
                            value={category.id}
                          />
                        ))}
                      </Picker>
                    </View>
                  </View>

                  {/* Title Input */}
                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>Title</Text>
                    <TextInput
                      style={styles.titleInput}
                      value={title}
                      onChangeText={setTitle}
                      placeholder="Enter note title"
                      placeholderTextColor="#A0A0A0"
                      multiline={false}
                      maxLength={100}
                      accessibilityLabel="Note title input"
                      returnKeyType="next"
                    />
                  </View>

                  {/* Content Input */}
                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>Content</Text>
                    <TextInput
                      style={styles.contentInput}
                      value={content}
                      onChangeText={setContent}
                      placeholder="Write your note here..."
                      placeholderTextColor="#A0A0A0"
                      multiline
                      textAlignVertical="top"
                      accessibilityLabel="Note content input"
                      scrollEnabled={false}
                    />
                  </View>

                  {/* Delete Button for Edit Mode */}
                  {noteToEdit && (
                    <TouchableOpacity
                      onPress={handleDelete}
                      disabled={isSubmitting}
                      style={styles.deleteButton}>
                      <Text style={styles.deleteButtonText}>Delete Note</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </ScrollView>
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
  cancelButton: {
    paddingVertical: 8,
    paddingHorizontal: 4,
    minWidth: 60,
  },
  cancelText: {
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
  saveButton: {
    backgroundColor: "#007AFF",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    minWidth: 60,
    alignItems: "center",
    justifyContent: "center",
  },
  saveButtonDisabled: {
    backgroundColor: "#C0C0C0",
  },
  saveText: {
    fontSize: 16,
    color: "#FFFFFF",
    fontWeight: "600",
  },
  scrollView: {
    flex: 1,
  },
  formContainer: {
    padding: 20,
    paddingBottom: 20,
  },
  inputGroup: {
    marginBottom: 24,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1A1A1A",
    marginBottom: 8,
  },
  pickerWrapper: {
    backgroundColor: "#F8F9FA",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E8E8E8",
    overflow: "hidden",
  },
  picker: {
    height: 50,
    color: "#1A1A1A",
    backgroundColor: "transparent",
  },
  titleInput: {
    backgroundColor: "#F8F9FA",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E8E8E8",
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: "#1A1A1A",
    fontWeight: "500",
  },
  contentInput: {
    backgroundColor: "#F8F9FA",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E8E8E8",
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: "#1A1A1A",
    minHeight: 120,
    maxHeight: 200,
    lineHeight: 22,
  },
  deleteButton: {
    backgroundColor: "#FF3B30",
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 20,
  },
  deleteButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
  },
});

export default AddEditNoteModal;
