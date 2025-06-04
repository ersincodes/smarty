import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  View,
  StyleSheet,
  FlatList,
  RefreshControl,
  Alert,
  Text,
  Modal,
  StatusBar,
  Image,
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
import Colors from "../../constants/Colors";

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
      <View style={styles.emptyStateIconContainer}>
        <Text style={styles.emptyStateIcon}>✨</Text>
      </View>
      <Text style={styles.emptyStateTitle}>
        {searchQuery ? "No matching notes" : "Start your journey"}
      </Text>
      <Text style={styles.emptyStateText}>
        {searchQuery
          ? `No notes found for "${searchQuery}". Try a different search term.`
          : "Capture your thoughts, ideas, and inspiration. Your first note is just a tap away."}
      </Text>
      {!searchQuery && notes.length === 0 && !isLoading && (
        <View style={styles.emptyStateActions}>
          <Button
            mode="contained"
            onPress={() => setShowAddModal(true)}
            style={styles.createFirstNoteButton}
            labelStyle={styles.createFirstNoteButtonText}
            accessibilityLabel="Create your first note">
            Create First Note
          </Button>
        </View>
      )}
    </View>
  );

  const renderHeader = () => (
    <View style={styles.headerContainer}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor={Colors.background.primary}
      />
      <View style={styles.headerContent}>
        <View style={styles.headerTop}>
          <View style={styles.titleContainer}>
            <View style={styles.titleWithLogo}>
              <Image
                source={require("../../assets/images/apple-touch-icon.png")}
                style={styles.logo}
                accessibilityLabel="Smarty app logo"
              />
              <View style={styles.titleTextContainer}>
                <Text style={styles.appTitle}>Smarty</Text>
                <Text style={styles.appSubtitle}>
                  {notes.length} {notes.length === 1 ? "note" : "notes"}
                </Text>
              </View>
            </View>
          </View>
          <Button
            mode="text"
            onPress={handleSignOut}
            textColor={Colors.text.tertiary}
            compact
            accessibilityLabel="Sign out">
            Sign Out
          </Button>
        </View>

        <View style={styles.searchContainer}>
          <Searchbar
            placeholder="Search notes, content, or categories..."
            onChangeText={setSearchQuery}
            value={searchQuery}
            style={styles.searchbar}
            inputStyle={styles.searchInput}
            iconColor={Colors.text.tertiary}
            placeholderTextColor={Colors.text.tertiary}
            accessibilityLabel="Search notes"
          />
        </View>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {renderHeader()}

      <View style={styles.content}>
        {/* Backend Status Info */}
        {notes.length === 0 && !isLoading && !error && !searchQuery && (
          <View style={styles.statusBanner}>
            <Text style={styles.statusEmoji}>🔧</Text>
            <Text style={styles.statusText}>
              Backend setup in progress. Local notes are working perfectly!
            </Text>
          </View>
        )}

        {/* Error State */}
        {error && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorIcon}>⚠️</Text>
            <View style={styles.errorTextContainer}>
              <Text style={styles.errorTitle}>Something went wrong</Text>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          </View>
        )}

        {/* Notes List */}
        {!error &&
          (isLoading && notes.length === 0 ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={Colors.primary[500]} />
              <Text style={styles.loadingText}>Loading your notes...</Text>
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
                  colors={[Colors.primary[500]]}
                  tintColor={Colors.primary[500]}
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
            {
              icon: "robot",
              label: "AI Chat",
              onPress: () => {
                setShowChatModal(true);
                setFabOpen(false);
              },
              style: styles.fabAction,
              labelStyle: styles.fabActionLabel,
            },
            {
              icon: "note-plus",
              label: "Add Note",
              onPress: () => {
                setShowAddModal(true);
                setFabOpen(false);
              },
              style: styles.fabAction,
              labelStyle: styles.fabActionLabel,
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
        style={styles.snackbar}
        action={{
          label: "Dismiss",
          onPress: clearError,
        }}>
        {error}
      </Snackbar>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.secondary,
  },
  headerContainer: {
    backgroundColor: Colors.background.primary,
    paddingBottom: 8,
    shadowColor: Colors.gray[900],
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  headerContent: {
    paddingHorizontal: 20,
    paddingTop: 12,
  },
  headerTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  titleContainer: {
    flex: 1,
  },
  titleWithLogo: {
    flexDirection: "row",
    alignItems: "center",
  },
  logo: {
    width: 48,
    height: 48,
    marginRight: 12,
    borderRadius: 8,
  },
  titleTextContainer: {
    flex: 1,
  },
  appTitle: {
    fontSize: 28,
    fontWeight: "800",
    color: Colors.primary[600],
    letterSpacing: -0.5,
  },
  appSubtitle: {
    fontSize: 14,
    color: Colors.text.tertiary,
    marginTop: 2,
    fontWeight: "500",
  },
  searchContainer: {
    marginHorizontal: -4,
  },
  searchbar: {
    backgroundColor: Colors.background.primary,
    borderRadius: 12,
    elevation: 0,
    shadowColor: Colors.gray[900],
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    borderWidth: 1,
    borderColor: Colors.gray[200],
  },
  searchInput: {
    fontSize: 16,
    color: Colors.text.primary,
  },
  content: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: Colors.text.secondary,
    fontWeight: "500",
  },
  listContainer: {
    paddingVertical: 12,
    paddingBottom: 100, // Extra space for FAB
  },
  emptyListContainer: {
    flex: 1,
    paddingBottom: 100, // Extra space for FAB
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
  },
  emptyStateIconContainer: {
    backgroundColor: Colors.primary[100],
    borderRadius: 24,
    padding: 16,
    marginBottom: 24,
  },
  emptyStateIcon: {
    fontSize: 32,
    textAlign: "center",
  },
  emptyStateTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: Colors.text.primary,
    marginBottom: 12,
    textAlign: "center",
  },
  emptyStateText: {
    fontSize: 16,
    color: Colors.text.secondary,
    textAlign: "center",
    lineHeight: 24,
    maxWidth: 280,
  },
  emptyStateActions: {
    marginTop: 32,
  },
  createFirstNoteButton: {
    backgroundColor: Colors.primary[500],
    borderRadius: 12,
    paddingVertical: 4,
  },
  createFirstNoteButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.text.inverse,
  },
  fab: {
    backgroundColor: Colors.primary[500],
    borderRadius: 16,
  },
  fabAction: {
    backgroundColor: Colors.primary[500],
    borderRadius: 12,
  },
  fabActionLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.text.primary,
  },
  snackbar: {
    backgroundColor: Colors.error[500],
    marginBottom: 16,
    marginHorizontal: 16,
    borderRadius: 8,
  },
  errorContainer: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: Colors.error[50],
    borderColor: Colors.error[200],
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    margin: 16,
  },
  errorIcon: {
    fontSize: 20,
    marginTop: 2,
  },
  errorTextContainer: {
    flex: 1,
    marginLeft: 12,
  },
  errorTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.error[700],
    marginBottom: 4,
  },
  errorText: {
    fontSize: 14,
    color: Colors.error[600],
    lineHeight: 20,
  },
  statusBanner: {
    backgroundColor: Colors.warning[50],
    borderColor: Colors.warning[200],
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    margin: 16,
    flexDirection: "row",
    alignItems: "center",
  },
  statusEmoji: {
    fontSize: 20,
    marginRight: 12,
  },
  statusText: {
    fontSize: 14,
    color: Colors.warning[700],
    fontWeight: "500",
    flex: 1,
    lineHeight: 20,
  },
  connectionTestModal: {
    padding: 20,
    margin: 20,
    backgroundColor: Colors.background.primary,
    borderRadius: 16,
    maxHeight: "80%",
  },
  connectionTestContent: {
    flex: 1,
  },
  closeTestButton: {
    marginTop: 16,
    backgroundColor: "transparent",
    borderColor: Colors.primary[500],
  },
});

export default NotesScreen;
