import React, { useState, useCallback } from "react";
import { View, StyleSheet, StatusBar, Image, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { Button } from "react-native-paper";
import { useRouter } from "expo-router";
import { useAuth } from "@clerk/clerk-expo";
import AddEditNoteModal from "../../components/AddEditNoteModal";
import Colors from "../../constants/Colors";

const AddNoteScreen: React.FC = () => {
  const [showAddModal, setShowAddModal] = useState(true);
  const router = useRouter();
  const { signOut } = useAuth();

  const handleCloseAddModal = useCallback(() => {
    setShowAddModal(false);
    router.replace("/");
  }, [router]);

  const handleSignOut = useCallback(async () => {
    try {
      await signOut();
    } catch (error) {
      console.error("Failed to sign out:", error);
    }
  }, [signOut]);

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
                <Text style={styles.appTitle}>Add Note</Text>
                <Text style={styles.appSubtitle}>
                  Create a new note to capture your thoughts
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
          <View style={styles.instructionContainer}>
            <View style={styles.instructionIconContainer}>
              <Text style={styles.instructionIcon}>✍️</Text>
            </View>
            <Text style={styles.instructionTitle}>Ready to create?</Text>
            <Text style={styles.instructionText}>
              Tap the button below to start writing your note. You can add a
              title, content, and organize it with categories.
            </Text>
            <Button
              mode="contained"
              onPress={() => setShowAddModal(true)}
              style={styles.createButton}
              labelStyle={styles.createButtonLabel}
              accessibilityLabel="Create new note">
              Create New Note
            </Button>
          </View>
        </View>

        <AddEditNoteModal
          visible={showAddModal}
          onDismiss={handleCloseAddModal}
        />
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
    fontSize: 24,
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
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
  },
  instructionContainer: {
    alignItems: "center",
    maxWidth: 320,
  },
  instructionIconContainer: {
    backgroundColor: "rgba(0, 229, 255, 0.2)",
    borderRadius: 24,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: "rgba(0, 229, 255, 0.3)",
  },
  instructionIcon: {
    fontSize: 32,
    textAlign: "center",
  },
  instructionTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#FFFFFF",
    marginBottom: 12,
    textAlign: "center",
  },
  instructionText: {
    fontSize: 16,
    color: "rgba(255, 255, 255, 0.7)",
    textAlign: "center",
    lineHeight: 24,
    marginBottom: 32,
  },
  createButton: {
    backgroundColor: "#00E5FF",
    borderRadius: 12,
    paddingVertical: 8,
    paddingHorizontal: 24,
    shadowColor: "rgba(0, 229, 255, 0.5)",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  createButtonLabel: {
    fontSize: 16,
    fontWeight: "700",
    color: "white",
    letterSpacing: 0.3,
  },
});

export default AddNoteScreen;
