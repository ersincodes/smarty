import React, { useEffect, useRef } from "react";
import { View, StyleSheet, Image, Animated } from "react-native";
import { Text, useTheme } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";

interface CustomSplashScreenProps {}

const CustomSplashScreen: React.FC<CustomSplashScreenProps> = () => {
  const theme = useTheme();
  const logoScale = useRef(new Animated.Value(0.8)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const textOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Animate logo entrance
    Animated.sequence([
      Animated.parallel([
        Animated.timing(logoOpacity, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(logoScale, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
      ]),
      Animated.timing(textOpacity, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();
  }, [logoScale, logoOpacity, textOpacity]);

  return (
    <LinearGradient
      colors={["#1a1a2e", "#16213e", "#0f3460"]}
      style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.content}>
          <Animated.View
            style={[
              styles.logoContainer,
              {
                opacity: logoOpacity,
                transform: [{ scale: logoScale }],
              },
            ]}>
            <View style={styles.logoBackground}>
              <Image
                source={require("../../assets/images/android-chrome-192x192.png")}
                style={styles.logo}
                resizeMode="contain"
              />
            </View>
          </Animated.View>

          <Animated.View
            style={[styles.textContainer, { opacity: textOpacity }]}>
            <Text variant="headlineLarge" style={styles.brandTitle}>
              Smarty
            </Text>

            <Text variant="bodyLarge" style={styles.subtitle}>
              Advanced AI Intelligence for Personal Knowledge Management
            </Text>
          </Animated.View>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  logoContainer: {
    marginBottom: 50,
  },
  logoBackground: {
    width: 160,
    height: 160,
    borderRadius: 80,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 229, 255, 0.1)",
    borderWidth: 2,
    borderColor: "rgba(0, 229, 255, 0.3)",
    shadowColor: "#00E5FF",
    shadowOffset: {
      width: 0,
      height: 12,
    },
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 15,
  },
  logo: {
    width: 100,
    height: 100,
  },
  textContainer: {
    alignItems: "center",
  },
  brandTitle: {
    fontWeight: "900",
    textAlign: "center",
    marginBottom: 20,
    fontSize: 50,
    letterSpacing: 4,
    color: "#00E5FF",
    textShadowColor: "rgba(0, 229, 255, 0.6)",
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 20,
    fontFamily: "System",
    includeFontPadding: false,
  },
  subtitle: {
    textAlign: "center",
    lineHeight: 26,
    color: "rgba(255, 255, 255, 0.85)",
    fontSize: 16,
  },
});

export default CustomSplashScreen;
