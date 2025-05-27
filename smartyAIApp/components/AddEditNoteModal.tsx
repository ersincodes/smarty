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
} from "react-native";
import {
  Modal,
  Portal,
  Button,
  Card,
  ActivityIndicator,
} from "react-native-paper";
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

const AddEditNoteModal: React.FC<AddEditNoteModalProps> = ({
  visible,
  onDismiss,
  noteToEdit,
}) => {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [categoryId, setCategoryId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  return (
    <Portal>
      <Modal
        visible={visible}
        onDismiss={onDismiss}
        contentContainerStyle={styles.modalContainer}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.keyboardAvoidingView}>
          <Card style={styles.card}>
            <Card.Title title={noteToEdit ? "Edit Note" : "Add Note"} />
            <Card.Content>
              <ScrollView
                style={styles.scrollView}
                showsVerticalScrollIndicator={false}>
                <View style={styles.formContainer}>
                  <Text style={styles.label}>Category</Text>
                  <View style={styles.pickerContainer}>
                    <Picker
                      selectedValue={categoryId || "none"}
                      onValueChange={(value: string) =>
                        setCategoryId(value === "none" ? null : value)
                      }
                      enabled={!categoriesLoading}
                      style={styles.picker}>
                      <Picker.Item label="None" value="none" />
                      {categories.map((category) => (
                        <Picker.Item
                          key={category.id}
                          label={category.name}
                          value={category.id}
                        />
                      ))}
                    </Picker>
                  </View>

                  <Text style={styles.label}>Note Title</Text>
                  <TextInput
                    style={styles.titleInput}
                    value={title}
                    onChangeText={setTitle}
                    placeholder="Enter note title"
                    multiline={false}
                    accessibilityLabel="Note title input"
                  />

                  <Text style={styles.label}>Note Content</Text>
                  <TextInput
                    style={styles.contentInput}
                    value={content}
                    onChangeText={setContent}
                    placeholder="Enter note content"
                    multiline
                    textAlignVertical="top"
                    accessibilityLabel="Note content input"
                  />
                </View>
              </ScrollView>
            </Card.Content>
            <Card.Actions style={styles.actions}>
              {noteToEdit && (
                <Button
                  mode="outlined"
                  onPress={handleDelete}
                  disabled={isSubmitting}
                  buttonColor="#ff4444"
                  textColor="white"
                  style={styles.deleteButton}>
                  Delete
                </Button>
              )}
              <View style={styles.rightActions}>
                <Button
                  mode="outlined"
                  onPress={onDismiss}
                  disabled={isSubmitting}
                  style={styles.cancelButton}>
                  Cancel
                </Button>
                <Button
                  mode="contained"
                  onPress={handleSubmit}
                  disabled={isSubmitting || !title.trim()}
                  style={styles.submitButton}>
                  {isSubmitting ? (
                    <ActivityIndicator size="small" color="white" />
                  ) : noteToEdit ? (
                    "Update"
                  ) : (
                    "Create"
                  )}
                </Button>
              </View>
            </Card.Actions>
          </Card>
        </KeyboardAvoidingView>
      </Modal>
    </Portal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    margin: 20,
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  card: {
    maxHeight: "90%",
  },
  scrollView: {
    maxHeight: 400,
  },
  formContainer: {
    paddingVertical: 8,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
    marginTop: 16,
    color: "#333",
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    backgroundColor: "#f9f9f9",
  },
  picker: {
    height: 50,
  },
  titleInput: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: "#f9f9f9",
  },
  contentInput: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    minHeight: 120,
    backgroundColor: "#f9f9f9",
  },
  actions: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  deleteButton: {
    flex: 0,
  },
  rightActions: {
    flexDirection: "row",
    gap: 8,
  },
  cancelButton: {
    marginRight: 8,
  },
  submitButton: {
    minWidth: 80,
  },
});

export default AddEditNoteModal;
