import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  View,
  StyleSheet,
  FlatList,
  RefreshControl,
  Alert,
  Text,
  Modal,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  Appbar,
  FAB,
  Portal,
  Searchbar,
  ActivityIndicator,
  Snackbar,
  Button,
} from "react-native-paper";
import { useAuth } from "@clerk/clerk-expo";
import { useNotesStore } from "../store/notesStore";
import { useCategoriesStore } from "../store/categoriesStore";
// import { testApiEndpoints } from "../config/api";
import { NoteWithCategory } from "../types";
import Note from "../../components/Note";
import AddEditNoteModal from "../../components/AddEditNoteModal";
import AIChatModal from "../../components/AIChatModal";
import BackendConnectionTest from "../components/BackendConnectionTest";

const NotesScreen: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showChatModal, setShowChatModal] = useState(false);
  const [showConnectionTest, setShowConnectionTest] = useState(false);
  const [selectedNote, setSelectedNote] = useState<NoteWithCategory | null>(
    null
  );
  const [showEditModal, setShowEditModal] = useState(false);
  const [fabOpen, setFabOpen] = useState(false);
  const hasInitialized = useRef(false);

  const { getToken, signOut, isSignedIn } = useAuth();
  const {
    notes,
    isLoading,
    error,
    fetchNotes,
    clearError,
    refreshNotesCategories,
  } = useNotesStore();
  const { fetchCategories } = useCategoriesStore();

  useEffect(() => {
    if (isSignedIn && !hasInitialized.current) {
      hasInitialized.current = true;
      const loadData = async () => {
        try {
          await fetchCategories(getToken);
          await fetchNotes(getToken);
          // Refresh notes categories after both are loaded to ensure proper mapping
          refreshNotesCategories();
        } catch (error) {
          console.error("Failed to load initial data:", error);
        }
      };
      loadData();
    } else if (!isSignedIn) {
      hasInitialized.current = false;
    }
  }, [isSignedIn]);

  const filteredNotes = (notes || []).filter(
    (note) =>
      note.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      note.content?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      note.category?.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleRefresh = useCallback(async () => {
    if (!isSignedIn) return;

    try {
      await fetchCategories(getToken);
      await fetchNotes(getToken);
      // Refresh notes categories after both are loaded to ensure proper mapping
      refreshNotesCategories();
    } catch (error) {
      Alert.alert("Error", "Failed to refresh notes");
    }
  }, [isSignedIn, getToken]);

  const handleSignOut = useCallback(async () => {
    try {
      await signOut();
    } catch (error) {
      Alert.alert("Error", "Failed to sign out");
    }
  }, [signOut]);

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

  /*
  const handleTestApiEndpoints = useCallback(async () => {
    if (!isSignedIn) {
      Alert.alert("Error", "Please sign in first");
      return;
    }

    console.log("🚀 Starting comprehensive API testing...");
    try {
      // Import the new exploration function
      // const { exploreBackendRoutes } = await import("../config/api");

      // Run both comprehensive testing and backend exploration
      // await exploreBackendRoutes(getToken);
      // await testApiEndpoints(getToken);

      Alert.alert(
        "Debug Complete",
        "Check console for detailed API test results. Look for working endpoints and proper response formats.",
        [
          {
            text: "View Console",
            onPress: () =>
              console.log("💡 Check the console for detailed results!"),
          },
          { text: "OK", style: "default" },
        ]
      );
    } catch (error) {
      console.error("API testing failed:", error);
      Alert.alert("Error", "API testing failed - check console for details");
    }
  }, [isSignedIn, getToken]);
  */

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
        {notes.length === 0 && !isLoading
          ? "The notes feature is being set up on the backend. You can create notes, and they'll be stored locally for now."
          : "Tap the + button to create your first note"}
      </Text>
      {/*
      {notes.length === 0 && !isLoading && (
        <Button
          mode="outlined"
          onPress={handleTestApiEndpoints}
          style={styles.debugButton}
          accessibilityLabel="Test API endpoints">
          🔍 Check Backend Status
        </Button>
      )}
      */}
    </View>
  );

  const renderHeader = () => (
    <View style={styles.headerContainer}>
      <Appbar.Header style={styles.appbar}>
        <Appbar.Content title="Smarty" titleStyle={styles.appbarTitle} />
        <Appbar.Action icon="logout" onPress={handleSignOut} />
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
        {/* Backend Status Info */}
        {notes.length === 0 && !isLoading && !error && (
          <View style={styles.statusBanner}>
            <Text style={styles.statusText}>
              🔧 Backend notes endpoint is being configured. Local note creation
              still works!
            </Text>
          </View>
        )}

        {/* Error State with Debug Button */}
        {error && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>Error: {error}</Text>
            {/*
            <Button
              mode="outlined"
              onPress={handleTestApiEndpoints}
              style={styles.debugButton}>
              🔍 Debug API Endpoints
            </Button>
            */}
          </View>
        )}

        {/* Notes List */}
        {!error &&
          (isLoading && notes.length === 0 ? (
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
          ))}
      </View>

      <Portal>
        <FAB.Group
          open={fabOpen}
          visible
          icon={fabOpen ? "close" : "plus"}
          actions={[
            /*
            {
              icon: "wifi-check",
              label: "Test Backend",
              onPress: () => {
                setShowConnectionTest(true);
                setFabOpen(false);
              },
              style: styles.fabAction,
            },
            */
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

      {/* Backend Connection Test Modal */}
      {/*
      <Portal>
        <Modal
          visible={showConnectionTest}
          onDismiss={() => setShowConnectionTest(false)}
          style={styles.connectionTestModal}>
          <View style={styles.connectionTestContent}>
            <BackendConnectionTest />
            <Button
              mode="outlined"
              onPress={() => setShowConnectionTest(false)}
              style={styles.closeTestButton}>
              Close Test
            </Button>
          </View>
        </Modal>
      </Portal>
      */}

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
  errorContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
  },
  errorText: {
    flex: 1,
    color: "#f44336",
  },
  debugButton: {
    marginTop: 12,
    backgroundColor: "#007AFF",
  },
  statusBanner: {
    backgroundColor: "#fff3cd",
    borderColor: "#ffeaa7",
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    margin: 16,
    alignItems: "center",
  },
  statusText: {
    fontSize: 14,
    color: "#856404",
    textAlign: "center",
    fontWeight: "500",
  },
  connectionTestModal: {
    padding: 20,
    margin: 20,
    backgroundColor: "white",
    borderRadius: 16,
    maxHeight: "80%",
  },
  connectionTestContent: {
    flex: 1,
  },
  closeTestButton: {
    marginTop: 16,
    backgroundColor: "transparent",
    borderColor: "#007AFF",
  },
});

export default NotesScreen;
