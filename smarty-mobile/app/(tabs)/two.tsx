import React from "react";
import { View, Text, StyleSheet, ScrollView, Image } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Card, Button } from "react-native-paper";

const WelcomeScreen: React.FC = () => {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <Text style={styles.logoText}>Smarty</Text>
          </View>

          <Text style={styles.subtitle}>Note Management & Personal Growth</Text>
        </View>

        <View style={styles.content}>
          <Card style={styles.featureCard}>
            <Card.Content>
              <Text style={styles.featureTitle}>📝 Smart Notes</Text>
              <Text style={styles.featureDescription}>
                Create, organize, and manage your notes with intelligent
                categorization
              </Text>
            </Card.Content>
          </Card>

          <Card style={styles.featureCard}>
            <Card.Content>
              <Text style={styles.featureTitle}>🤖 AI Assistant</Text>
              <Text style={styles.featureDescription}>
                Chat with AI to get insights about your notes and ask questions
              </Text>
            </Card.Content>
          </Card>

          <Card style={styles.featureCard}>
            <Card.Content>
              <Text style={styles.featureTitle}>🔍 Smart Search</Text>
              <Text style={styles.featureDescription}>
                Find your notes quickly with powerful search and semantic
                understanding
              </Text>
            </Card.Content>
          </Card>

          <Card style={styles.featureCard}>
            <Card.Content>
              <Text style={styles.featureTitle}>📱 Cross-Platform</Text>
              <Text style={styles.featureDescription}>
                Access your notes anywhere with seamless synchronization
              </Text>
            </Card.Content>
          </Card>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Built with React Native, OpenAI, Pinecone, and more...
          </Text>

          <View style={styles.techStack}>
            <Text style={styles.techItem}>⚛️ React Native</Text>
            <Text style={styles.techItem}>🧠 OpenAI</Text>
            <Text style={styles.techItem}>🌲 Pinecone</Text>
            <Text style={styles.techItem}>📊 Zustand</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  scrollContent: {
    flexGrow: 1,
    padding: 20,
  },
  header: {
    alignItems: "center",
    marginBottom: 32,
    paddingTop: 20,
  },
  logoContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  logoEmoji: {
    fontSize: 64,
    marginRight: 16,
  },
  logoText: {
    fontSize: 56,
    fontWeight: "900",
    color: "#1D4ED8",
    letterSpacing: -2.2,
    textShadowColor: "rgba(29, 78, 216, 0.25)",
    textShadowOffset: { width: 0, height: 3 },
    textShadowRadius: 8,
    fontFamily: "System",
    textTransform: "none",
    includeFontPadding: false,
  },
  subtitle: {
    fontSize: 19,
    color: "#1E40AF",
    textAlign: "center",
    lineHeight: 26,
    paddingHorizontal: 20,
    fontWeight: "600",
    letterSpacing: 0.2,
    opacity: 0.95,
  },
  content: {
    flex: 1,
    gap: 16,
  },
  featureCard: {
    elevation: 2,
    backgroundColor: "white",
  },
  featureTitle: {
    fontSize: 20,
    fontWeight: "600",
    marginBottom: 8,
    color: "#333",
  },
  featureDescription: {
    fontSize: 16,
    color: "#666",
    lineHeight: 22,
  },
  footer: {
    marginTop: 32,
    alignItems: "center",
  },
  footerText: {
    fontSize: 14,
    color: "#888",
    textAlign: "center",
    marginBottom: 16,
  },
  techStack: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 12,
  },
  techItem: {
    fontSize: 14,
    color: "#007AFF",
    backgroundColor: "#e3f2fd",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    overflow: "hidden",
  },
});

export default WelcomeScreen;
