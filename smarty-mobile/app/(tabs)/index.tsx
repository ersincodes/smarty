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
import { LinearGradient } from "expo-linear-gradient";
import {
  Appbar,
  Searchbar,
  ActivityIndicator,
  Snackbar,
  Button,
  FAB,
} from "react-native-paper";
import { useAuth } from "@clerk/clerk-expo";
import { useNotesStore } from "../store/notesStore";
import { useCategoriesStore } from "../store/categoriesStore";
import { NoteWithCategory } from "../types";
import Note from "../../components/Note";
import AddEditNoteModal from "../../components/AddEditNoteModal";
import Colors from "../../constants/Colors";

const NotesScreen: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedNote, setSelectedNote] = useState<NoteWithCategory | null>(
    null
  );
  const [showEditModal, setShowEditModal] = useState(false);
  const [expandedNoteId, setExpandedNoteId] = useState<string | null>(null);
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
          // Error handling is managed by the store
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

  const handleNoteExpand = useCallback((noteId: string) => {
    setExpandedNoteId(noteId);
  }, []);

  const handleNoteCollapse = useCallback(() => {
    setExpandedNoteId(null);
  }, []);

  const renderNote = useCallback(
    ({ item }: { item: NoteWithCategory }) => (
      <Note
        note={item}
        onPress={() => handleNotePress(item)}
        isExpanded={expandedNoteId === item.id}
        onExpand={() => handleNoteExpand(item.id)}
        onCollapse={handleNoteCollapse}
      />
    ),
    [handleNotePress, expandedNoteId, handleNoteExpand, handleNoteCollapse]
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
        <View style={styles.emptyStateLoader}>
          <ActivityIndicator size="large" color={Colors.primary[500]} />
          <Text style={styles.emptyStateLoaderText}>Setting things up...</Text>
        </View>
      )}
    </View>
  );

  const renderHeader = () => (
    <View style={styles.headerContainer}>
      <StatusBar barStyle="light-content" backgroundColor="#1a1a2e" />
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
                  AI-Powered Intelligence • {notes.length}{" "}
                  {notes.length === 1 ? "note" : "notes"}
                </Text>
              </View>
            </View>
          </View>
          <Button
            mode="text"
            onPress={handleSignOut}
            textColor="rgba(255, 255, 255, 0.8)"
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
            iconColor="rgba(255, 255, 255, 0.7)"
            placeholderTextColor="rgba(255, 255, 255, 0.6)"
            accessibilityLabel="Search notes"
          />
        </View>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={
          ["#1a1a2e", "#16213e", "#0f3460"] as [string, string, ...string[]]
        }
        style={styles.backgroundGradient}>
        {renderHeader()}

        <View style={styles.content}>
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

        <AddEditNoteModal
          visible={showEditModal}
          onDismiss={handleCloseEditModal}
          noteToEdit={selectedNote}
        />

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

        {/* Floating Collapse Button */}
        {expandedNoteId && (
          <FAB
            icon="chevron-up"
            style={styles.collapseButton}
            onPress={handleNoteCollapse}
            accessibilityLabel="Collapse expanded note"
            accessibilityHint="Tap to collapse the currently expanded note"
          />
        )}
      </LinearGradient>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#1a1a2e",
  },
  backgroundGradient: {
    flex: 1,
  },
  headerContainer: {
    backgroundColor: "transparent",
    paddingBottom: 8,
    shadowColor: "rgba(0, 229, 255, 0.3)",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 3,
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
    fontSize: 36,
    fontWeight: "800",
    color: "#00E5FF",
    letterSpacing: -0.5,
    textShadowColor: "rgba(0, 229, 255, 0.8)",
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 5,
    fontFamily: "SF Pro Display",
    textDecorationLine: "none",
    includeFontPadding: false,
    elevation: 2,
  },
  appSubtitle: {
    fontSize: 13,
    color: "rgba(255, 255, 255, 0.8)",
    marginTop: 1,
    fontWeight: "600",
    letterSpacing: 0.3,
    opacity: 0.9,
  },
  searchContainer: {
    marginHorizontal: -4,
  },
  searchbar: {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 12,
    elevation: 0,
    shadowColor: "rgba(0, 229, 255, 0.3)",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    borderWidth: 1,
    borderColor: "rgba(0, 229, 255, 0.3)",
  },
  searchInput: {
    fontSize: 16,
    color: "#FFFFFF",
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
    color: "rgba(255, 255, 255, 0.8)",
    fontWeight: "500",
  },
  listContainer: {
    paddingVertical: 12,
    paddingBottom: 20,
  },
  emptyListContainer: {
    flex: 1,
    paddingBottom: 20,
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
  },
  emptyStateIconContainer: {
    backgroundColor: "rgba(0, 229, 255, 0.2)",
    borderRadius: 24,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: "rgba(0, 229, 255, 0.3)",
  },
  emptyStateIcon: {
    fontSize: 32,
    textAlign: "center",
  },
  emptyStateTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#FFFFFF",
    marginBottom: 12,
    textAlign: "center",
  },
  emptyStateText: {
    fontSize: 16,
    color: "rgba(255, 255, 255, 0.7)",
    textAlign: "center",
    lineHeight: 24,
    maxWidth: 280,
  },
  emptyStateLoader: {
    marginTop: 32,
    alignItems: "center",
  },
  emptyStateLoaderText: {
    fontSize: 16,
    color: "rgba(255, 255, 255, 0.8)",
    fontWeight: "500",
    marginTop: 12,
    textAlign: "center",
  },

  snackbar: {
    backgroundColor: "rgba(239, 68, 68, 0.9)",
    marginBottom: 16,
    marginHorizontal: 16,
    borderRadius: 8,
  },
  errorContainer: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: "rgba(239, 68, 68, 0.1)",
    borderColor: "rgba(239, 68, 68, 0.3)",
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
    color: "rgba(239, 68, 68, 0.9)",
    marginBottom: 4,
  },
  errorText: {
    fontSize: 14,
    color: "rgba(239, 68, 68, 0.8)",
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
  collapseButton: {
    position: "absolute",
    bottom: 20,
    right: 16,
    backgroundColor: "#00E5FF",
    borderRadius: 28,
    elevation: 6,
    shadowColor: "rgba(0, 229, 255, 0.5)",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
  },
});

export default NotesScreen;
