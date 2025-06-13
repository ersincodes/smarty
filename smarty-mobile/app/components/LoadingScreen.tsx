import React from "react";
import { View, StyleSheet, Image } from "react-native";
import { Text, ActivityIndicator, useTheme } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";

interface LoadingScreenProps {}

const LoadingScreen: React.FC<LoadingScreenProps> = () => {
  const theme = useTheme();

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.content}>
        <View style={styles.logoContainer}>
          <View
            style={[
              styles.logoBackground,
              { backgroundColor: theme.colors.primaryContainer },
            ]}>
            <Image
              source={require("../../assets/images/android-chrome-192x192.png")}
              style={styles.logo}
              resizeMode="contain"
            />
          </View>
        </View>

        <Text
          variant="headlineLarge"
          style={[styles.brandTitle, { color: theme.colors.primary }]}>
          Smarty
        </Text>

        <Text
          variant="bodyLarge"
          style={[styles.subtitle, { color: theme.colors.onSurfaceVariant }]}>
          Advanced AI Intelligence for Personal Knowledge Management
        </Text>

        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text
            variant="bodyMedium"
            style={[
              styles.loadingText,
              { color: theme.colors.onSurfaceVariant },
            ]}>
            Loading...
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  logoContainer: {
    marginBottom: 30,
  },
  logoBackground: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 6,
  },
  logo: {
    width: 80,
    height: 80,
  },
  brandTitle: {
    fontWeight: "900",
    textAlign: "center",
    marginBottom: 16,
    fontSize: 40,
    letterSpacing: -2,
    textShadowColor: "rgba(59, 130, 246, 0.2)",
    textShadowOffset: { width: 0, height: 3 },
    textShadowRadius: 8,
    fontFamily: "System",
    includeFontPadding: false,
  },
  subtitle: {
    textAlign: "center",
    marginBottom: 40,
    lineHeight: 24,
  },
  loadingContainer: {
    alignItems: "center",
    gap: 16,
  },
  loadingText: {
    textAlign: "center",
  },
});

export default LoadingScreen;
