import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  StyleSheet,
  FlatList,
  RefreshControl,
  Alert,
  Text,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  Appbar,
  FAB,
  Portal,
  Searchbar,
  ActivityIndicator,
  Snackbar,
} from "react-native-paper";
import { useNotesStore } from "../store/notesStore";
import { useCategoriesStore } from "../store/categoriesStore";
import { NoteWithCategory } from "../types";
import Note from "../../components/Note";
import AddEditNoteModal from "../../components/AddEditNoteModal";
import AIChatModal from "../../components/AIChatModal";

const NotesScreen: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showChatModal, setShowChatModal] = useState(false);
  const [selectedNote, setSelectedNote] = useState<NoteWithCategory | null>(
    null
  );
  const [showEditModal, setShowEditModal] = useState(false);
  const [fabOpen, setFabOpen] = useState(false);

  const { notes, isLoading, error, fetchNotes, clearError } = useNotesStore();

  const { fetchCategories } = useCategoriesStore();

  useEffect(() => {
    fetchNotes();
    fetchCategories();
  }, [fetchNotes, fetchCategories]);

  const filteredNotes = notes.filter(
    (note) =>
      note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      note.content?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      note.category?.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleRefresh = useCallback(async () => {
    try {
      await fetchNotes();
      await fetchCategories();
    } catch (error) {
      Alert.alert("Error", "Failed to refresh notes");
    }
  }, [fetchNotes, fetchCategories]);

  const handleNotePress = useCallback((note: NoteWithCategory) => {
    setSelectedNote(note);
    setShowEditModal(true);
  }, []);

  const handleCloseEditModal = useCallback(() => {
    setShowEditModal(false);
    setSelectedNote(null);
  }, []);

  const handleCloseAddModal = useCallback(() => {
    setShowAddModal(false);
  }, []);

  const handleCloseChatModal = useCallback(() => {
    setShowChatModal(false);
  }, []);

  const handleFabStateChange = useCallback(({ open }: { open: boolean }) => {
    setFabOpen(open);
  }, []);

  const renderNote = useCallback(
    ({ item }: { item: NoteWithCategory }) => (
      <Note note={item} onPress={() => handleNotePress(item)} />
    ),
    [handleNotePress]
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Text style={styles.emptyStateIcon}>📝</Text>
      <Text style={styles.emptyStateTitle}>No notes yet</Text>
      <Text style={styles.emptyStateText}>
        Tap the + button to create your first note
      </Text>
    </View>
  );

  const renderHeader = () => (
    <View style={styles.headerContainer}>
      <Appbar.Header style={styles.appbar}>
        <Appbar.Content title="Smarty" titleStyle={styles.appbarTitle} />
      </Appbar.Header>

      <View style={styles.searchContainer}>
        <Searchbar
          placeholder="Search notes..."
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={styles.searchbar}
          accessibilityLabel="Search notes"
        />
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {renderHeader()}

      <View style={styles.content}>
        {isLoading && notes.length === 0 ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" />
            <Text style={styles.loadingText}>Loading notes...</Text>
          </View>
        ) : (
          <FlatList
            data={filteredNotes}
            renderItem={renderNote}
            keyExtractor={(item) => item.id}
            ListEmptyComponent={renderEmptyState}
            refreshControl={
              <RefreshControl
                refreshing={isLoading}
                onRefresh={handleRefresh}
                colors={["#007AFF"]}
              />
            }
            contentContainerStyle={
              filteredNotes.length === 0
                ? styles.emptyListContainer
                : styles.listContainer
            }
            showsVerticalScrollIndicator={false}
          />
        )}
      </View>

      <Portal>
        <FAB.Group
          open={fabOpen}
          visible
          icon={fabOpen ? "close" : "plus"}
          actions={[
            {
              icon: "robot",
              label: "AI Chat",
              onPress: () => {
                setShowChatModal(true);
                setFabOpen(false);
              },
              style: styles.fabAction,
            },
            {
              icon: "note-plus",
              label: "Add Note",
              onPress: () => {
                setShowAddModal(true);
                setFabOpen(false);
              },
              style: styles.fabAction,
            },
          ]}
          onStateChange={handleFabStateChange}
          fabStyle={styles.fab}
        />
      </Portal>

      <AddEditNoteModal
        visible={showAddModal}
        onDismiss={handleCloseAddModal}
      />

      <AddEditNoteModal
        visible={showEditModal}
        onDismiss={handleCloseEditModal}
        noteToEdit={selectedNote}
      />

      <AIChatModal visible={showChatModal} onDismiss={handleCloseChatModal} />

      <Snackbar
        visible={!!error}
        onDismiss={clearError}
        duration={4000}
        style={styles.snackbar}>
        {error}
      </Snackbar>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  headerContainer: {
    backgroundColor: "white",
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  appbar: {
    backgroundColor: "white",
    elevation: 0,
  },
  appbarTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#007AFF",
  },
  searchContainer: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  searchbar: {
    elevation: 2,
  },
  content: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: "#666",
  },
  listContainer: {
    paddingVertical: 8,
  },
  emptyListContainer: {
    flex: 1,
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
  },
  emptyStateIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyStateTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    lineHeight: 24,
  },
  fab: {
    backgroundColor: "#007AFF",
  },
  fabAction: {
    backgroundColor: "#007AFF",
  },
  snackbar: {
    backgroundColor: "#f44336",
  },
});

export default NotesScreen;
