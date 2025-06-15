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
  ActivityIndicator,
} from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { Button } from "react-native-paper";
import { Picker } from "@react-native-picker/picker";
import { useAuth } from "@clerk/clerk-expo";
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
  const [isCategoriesLoaded, setIsCategoriesLoaded] = useState(false);

  const insets = useSafeAreaInsets();
  const { getToken } = useAuth();

  const { createNote, updateNote, deleteNote } = useNotesStore();
  const {
    categories,
    fetchCategories,
    isLoading: categoriesLoading,
  } = useCategoriesStore();

  useEffect(() => {
    if (visible) {
      // Reset categories loaded state
      setIsCategoriesLoaded(false);

      // Fetch categories when modal opens
      const loadCategories = async () => {
        if (getToken) {
          try {
            await fetchCategories(getToken);
            setIsCategoriesLoaded(true);
            // Don't log categories here as state hasn't updated yet
          } catch (error) {
            console.error("Failed to fetch categories:", error);
            setIsCategoriesLoaded(true); // Set to true even on error to prevent infinite loading
          }
        }
      };

      loadCategories();

      if (noteToEdit) {
        setTitle(noteToEdit.title);
        setContent(noteToEdit.content || "");
        setCategoryId(noteToEdit.categoryId || null);
      } else {
        setTitle("");
        setContent("");
        setCategoryId(null);
      }
    }
  }, [visible, noteToEdit]);

  const handleSubmit = useCallback(async () => {
    if (!title.trim()) {
      Alert.alert("Error", "Please enter a title for your note.");
      return;
    }

    if (!getToken) {
      Alert.alert("Error", "Authentication required.");
      return;
    }

    setIsSubmitting(true);
    try {
      if (noteToEdit) {
        const updateData: UpdateNoteInput = {
          id: noteToEdit.id,
          title: title.trim(),
          content: content.trim(),
          categoryId: categoryId || undefined,
        };
        await updateNote(updateData, getToken);
      } else {
        const createData: CreateNoteInput = {
          title: title.trim(),
          content: content.trim(),
          categoryId: categoryId || undefined,
        };
        await createNote(createData, getToken);
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
    getToken,
  ]);

  const handleDelete = useCallback(async () => {
    if (!noteToEdit || !getToken) return;

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
              await deleteNote(noteToEdit.id, getToken);
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
  }, [noteToEdit, deleteNote, onDismiss, getToken]);

  const handleBackdropPress = useCallback(() => {
    onDismiss();
  }, [onDismiss]);

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={false}
      presentationStyle="pageSheet"
      onRequestClose={onDismiss}>
      <SafeAreaView style={styles.modalContainer} edges={["top", "bottom"]}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onDismiss} style={styles.cancelButton}>
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
              (!title.trim() || isSubmitting) && styles.saveButtonDisabled,
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
        <KeyboardAvoidingView
          style={styles.keyboardAvoidingView}
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}>
          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollViewContent}
            showsVerticalScrollIndicator={false}
            bounces={false}
            keyboardShouldPersistTaps="handled">
            <View style={styles.formContainer}>
              {/* Category Selector */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Category</Text>
                {Platform.OS === "ios" ? (
                  // iOS-specific implementation
                  <TouchableOpacity
                    style={styles.categorySelector}
                    onPress={() => {
                      // Check if there are categories
                      if (!categories || categories.length === 0) {
                        Alert.alert(
                          "No Categories",
                          "No categories available. You can create categories from the main menu.",
                          [{ text: "OK" }]
                        );
                        return;
                      }

                      // For iOS, we'll show action sheet or modal picker
                      Alert.alert(
                        "Select Category",
                        "Choose a category for your note",
                        [
                          {
                            text: "No Category",
                            onPress: () => setCategoryId(null),
                          },
                          ...(categories?.map((category) => ({
                            text: category.name,
                            onPress: () => setCategoryId(category.id),
                          })) || []),
                          { text: "Cancel", style: "cancel" },
                        ]
                      );
                    }}
                    disabled={categoriesLoading && !isCategoriesLoaded}>
                    <Text
                      style={[
                        styles.categorySelectorText,
                        !categoryId && styles.categorySelectorPlaceholder,
                      ]}>
                      {categoriesLoading && !isCategoriesLoaded
                        ? "Loading categories..."
                        : categoryId
                          ? categories?.find((c) => c.id === categoryId)
                              ?.name || "Select Category"
                          : categories && categories.length === 0
                            ? "No categories available"
                            : "Select Category"}
                    </Text>
                    <Text style={styles.categorySelectorArrow}>▼</Text>
                  </TouchableOpacity>
                ) : (
                  // Android implementation with Picker
                  <View style={styles.pickerWrapper}>
                    {categoriesLoading && !isCategoriesLoaded ? (
                      <View style={styles.loadingContainer}>
                        <ActivityIndicator size="small" color="#007AFF" />
                        <Text style={styles.loadingText}>
                          Loading categories...
                        </Text>
                      </View>
                    ) : categories && categories.length === 0 ? (
                      <View style={styles.noCategoriesContainer}>
                        <Text style={styles.noCategoriesText}>
                          No categories available
                        </Text>
                      </View>
                    ) : (
                      <Picker
                        selectedValue={categoryId ?? "none"}
                        onValueChange={(value: string) =>
                          setCategoryId(value === "none" ? null : value)
                        }
                        enabled={!categoriesLoading || isCategoriesLoaded}
                        style={styles.picker}
                        itemStyle={styles.pickerItem}>
                        <Picker.Item label="No Category" value="none" />
                        {categories?.map((category) => (
                          <Picker.Item
                            key={category.id}
                            label={category.name}
                            value={category.id}
                            color={
                              Platform.OS === "ios" ? undefined : "#1A1A1A"
                            }
                          />
                        )) || []}
                      </Picker>
                    )}
                  </View>
                )}
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
                  scrollEnabled={true}
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
        </KeyboardAvoidingView>
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
    backgroundColor: "#FFFFFF",
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
    backgroundColor: "#FFFFFF",
  },
  scrollViewContent: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 40,
  },
  formContainer: {
    flex: 1,
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
    height: Platform.OS === "ios" ? 180 : 50,
    color: "#1A1A1A",
    backgroundColor: "transparent",
  },
  pickerItem: {
    fontSize: 16,
    height: Platform.OS === "ios" ? 150 : undefined,
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
  categorySelector: {
    backgroundColor: "#F8F9FA",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E8E8E8",
    paddingHorizontal: 16,
    paddingVertical: 14,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  categorySelectorText: {
    fontSize: 16,
    color: "#1A1A1A",
    flex: 1,
  },
  categorySelectorPlaceholder: {
    color: "#A0A0A0",
  },
  categorySelectorArrow: {
    fontSize: 12,
    color: "#666",
    marginLeft: 8,
  },
  loadingContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
  },
  loadingText: {
    marginLeft: 8,
    fontSize: 14,
    color: "#666",
  },
  noCategoriesContainer: {
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  noCategoriesText: {
    fontSize: 16,
    color: "#A0A0A0",
    textAlign: "center",
  },
});

export default AddEditNoteModal;
