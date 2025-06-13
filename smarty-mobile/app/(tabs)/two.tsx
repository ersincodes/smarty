import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  Dimensions,
  StatusBar,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Card, Button } from "react-native-paper";
import { LinearGradient } from "expo-linear-gradient";

const { width } = Dimensions.get("window");

interface FeatureCardProps {
  icon: string;
  title: string;
  description: string;
  gradient: [string, string, ...string[]];
  iconBg: string;
}

const FeatureCard: React.FC<FeatureCardProps> = ({
  icon,
  title,
  description,
  gradient,
  iconBg,
}) => (
  <Card style={styles.featureCard} elevation={0}>
    <LinearGradient colors={gradient} style={styles.cardGradient}>
      <View style={styles.cardContent}>
        <View style={[styles.iconContainer, { backgroundColor: iconBg }]}>
          <Text style={styles.iconText}>{icon}</Text>
        </View>
        <View style={styles.textContent}>
          <Text style={styles.featureTitle}>{title}</Text>
          <Text style={styles.featureDescription}>{description}</Text>
        </View>
      </View>
    </LinearGradient>
  </Card>
);

const WelcomeScreen: React.FC = () => {
  const features = [
    {
      icon: "✨",
      title: "Smart Notes",
      description:
        "Create, organize, and manage your notes with intelligent categorization",
      gradient: ["#667eea", "#764ba2"] as [string, string, ...string[]],
      iconBg: "rgba(255, 255, 255, 0.9)",
    },
    {
      icon: "🧠",
      title: "AI Assistant",
      description:
        "Chat with AI to get insights about your notes and ask questions",
      gradient: ["#f093fb", "#f5576c"] as [string, string, ...string[]],
      iconBg: "rgba(255, 255, 255, 0.9)",
    },
    {
      icon: "🔍",
      title: "Smart Search",
      description:
        "Find your notes quickly with powerful search and semantic understanding",
      gradient: ["#4facfe", "#00f2fe"] as [string, string, ...string[]],
      iconBg: "rgba(255, 255, 255, 0.9)",
    },
    {
      icon: "📱",
      title: "Cross-Platform",
      description: "Access your notes anywhere with seamless synchronization",
      gradient: ["#43e97b", "#38f9d7"] as [string, string, ...string[]],
      iconBg: "rgba(255, 255, 255, 0.9)",
    },
  ];

  const techStack = [
    { name: "React Native", icon: "⚛️", color: "#61DAFB" },
    { name: "OpenAI", icon: "🧠", color: "#00A67E" },
    { name: "Pinecone", icon: "🌲", color: "#10B981" },
    { name: "Zustand", icon: "📊", color: "#8B5CF6" },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1a1a2e" />
      <LinearGradient
        colors={
          ["#1a1a2e", "#16213e", "#0f3460"] as [string, string, ...string[]]
        }
        style={styles.backgroundGradient}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}>
          {/* Header Section */}
          <View style={styles.header}>
            <View style={styles.logoContainer}>
              <View style={styles.logoWrapper}>
                <Text style={styles.logoText}>Smarty</Text>
              </View>
            </View>

            <View style={styles.subtitleContainer}>
              <Text style={styles.subtitle}>AI-Powered Intelligence</Text>
              <Text style={styles.tagline}>
                Note Management • Personal Growth
              </Text>
            </View>
          </View>

          {/* Features Section */}
          <View style={styles.featuresSection}>
            <Text style={styles.sectionTitle}>Powerful Features</Text>
            <View style={styles.featuresGrid}>
              {features.map((feature, index) => (
                <FeatureCard
                  key={index}
                  icon={feature.icon}
                  title={feature.title}
                  description={feature.description}
                  gradient={feature.gradient}
                  iconBg={feature.iconBg}
                />
              ))}
            </View>
          </View>

          {/* Tech Stack Section */}
          <View style={styles.techSection}>
            <Text style={styles.sectionTitle}>Built With Modern Tech</Text>
            <View style={styles.techGrid}>
              {techStack.map((tech, index) => (
                <View key={index} style={styles.techItem}>
                  <Text style={styles.techIcon}>{tech.icon}</Text>
                  <Text style={[styles.techName, { color: tech.color }]}>
                    {tech.name}
                  </Text>
                </View>
              ))}
            </View>
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>
              Experience the future of note-taking with AI-powered intelligence
            </Text>
          </View>
        </ScrollView>
      </LinearGradient>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#1a1a2e", // Fallback color matching gradient start
  },
  backgroundGradient: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    minHeight: "100%",
    paddingHorizontal: 20,
    paddingBottom: 100, // Extra padding to account for tab bar
  },

  // Header Styles
  header: {
    alignItems: "center",
    paddingTop: 40,
    paddingBottom: 50,
  },
  logoContainer: {
    marginBottom: 24,
    alignItems: "center",
  },
  logoWrapper: {
    position: "relative",
    alignItems: "center",
  },
  logoText: {
    fontSize: 56,
    fontWeight: "900",
    color: "#00E5FF",
    letterSpacing: -2.5,
    textShadowColor: "rgba(0, 229, 255, 0.8)",
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 5,
    fontFamily: "System",
    zIndex: 2,
  },

  subtitleContainer: {
    alignItems: "center",
  },
  subtitle: {
    fontSize: 18,
    color: "#FFFFFF",
    fontWeight: "600",
    marginBottom: 8,
    letterSpacing: 0.5,
  },
  tagline: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.7)",
    fontWeight: "500",
    letterSpacing: 0.3,
  },

  // Features Section
  featuresSection: {
    marginBottom: 40,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#FFFFFF",
    textAlign: "center",
    marginBottom: 30,
    letterSpacing: 0.5,
  },
  featuresGrid: {
    gap: 20,
  },
  featureCard: {
    borderRadius: 20,
    backgroundColor: "transparent",
  },
  cardGradient: {
    borderRadius: 20,
    padding: 2,
  },
  cardContent: {
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    borderRadius: 18,
    padding: 20,
    flexDirection: "row",
    alignItems: "center",
  },
  iconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  iconText: {
    fontSize: 24,
  },
  textContent: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1a1a2e",
    marginBottom: 6,
    letterSpacing: 0.3,
  },
  featureDescription: {
    fontSize: 14,
    color: "#4a5568",
    lineHeight: 20,
    letterSpacing: 0.2,
  },

  // Tech Stack Section
  techSection: {
    marginBottom: 40,
  },
  techGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 16,
  },
  techItem: {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 20,
    alignItems: "center",
    minWidth: (width - 60) / 2 - 8,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
  },
  techIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  techName: {
    fontSize: 14,
    fontWeight: "600",
    letterSpacing: 0.3,
  },

  // Footer
  footer: {
    alignItems: "center",
    paddingTop: 20,
  },
  footerText: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.6)",
    textAlign: "center",
    lineHeight: 20,
    letterSpacing: 0.3,
    maxWidth: 280,
  },
});

export default WelcomeScreen;
