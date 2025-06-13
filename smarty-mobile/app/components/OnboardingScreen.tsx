import React, { useState, useRef } from "react";
import { View, StyleSheet, Dimensions, FlatList, Image } from "react-native";
import {
  Text,
  Button,
  Surface,
  useTheme,
  IconButton,
} from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";

const { width: screenWidth } = Dimensions.get("window");

interface OnboardingItem {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  icon: string;
}

interface OnboardingScreenProps {
  onComplete: () => void;
}

const onboardingData: OnboardingItem[] = [
  {
    id: "1",
    title: "Welcome to Smarty",
    subtitle: "Advanced Intelligence",
    description:
      "Experience the future of personal knowledge management with GPT-powered AI that understands, analyzes, and enhances your thinking.",
    icon: "brain",
  },
  {
    id: "2",
    title: "Intelligent Organization",
    subtitle: "Neural Categorization",
    description:
      "AI automatically organizes your thoughts with semantic understanding, intelligent tagging, and context-aware categorization.",
    icon: "folder-multiple",
  },
  {
    id: "3",
    title: "AI Knowledge Assistant",
    subtitle: "Contextual Intelligence",
    description:
      "Engage in sophisticated conversations with an AI that knows your notes intimately, providing insights, summaries, and strategic analysis.",
    icon: "chat-processing",
  },
  {
    id: "4",
    title: "Enterprise-Grade Sync",
    subtitle: "Seamless Intelligence",
    description:
      "Your AI-enhanced knowledge base synchronizes across all devices with enterprise security and real-time intelligence updates.",
    icon: "sync",
  },
];

const OnboardingScreen: React.FC<OnboardingScreenProps> = ({ onComplete }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);
  const theme = useTheme();

  const handleNext = () => {
    if (currentIndex < onboardingData.length - 1) {
      const nextIndex = currentIndex + 1;
      setCurrentIndex(nextIndex);
      flatListRef.current?.scrollToIndex({ index: nextIndex, animated: true });
    } else {
      onComplete();
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      const prevIndex = currentIndex - 1;
      setCurrentIndex(prevIndex);
      flatListRef.current?.scrollToIndex({ index: prevIndex, animated: true });
    }
  };

  const handleScroll = (event: any) => {
    const slideSize = event.nativeEvent.layoutMeasurement.width;
    const index = Math.round(event.nativeEvent.contentOffset.x / slideSize);
    setCurrentIndex(index);
  };

  const renderOnboardingItem = ({ item }: { item: OnboardingItem }) => (
    <View style={[styles.slide, { width: screenWidth }]}>
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

        <Surface
          style={[
            styles.featureCard,
            { backgroundColor: theme.colors.surface },
          ]}
          elevation={2}>
          <View style={styles.featureCardContent}>
            <View
              style={[
                styles.iconContainer,
                { backgroundColor: theme.colors.primaryContainer },
              ]}>
              <IconButton
                icon={item.icon}
                size={32}
                iconColor={theme.colors.primary}
              />
            </View>

            <Text
              variant="headlineMedium"
              style={[styles.title, { color: theme.colors.onSurface }]}>
              {item.title}
            </Text>

            <Text
              variant="titleMedium"
              style={[styles.subtitle, { color: theme.colors.primary }]}>
              {item.subtitle}
            </Text>

            <Text
              variant="bodyLarge"
              style={[
                styles.description,
                { color: theme.colors.onSurfaceVariant },
              ]}>
              {item.description}
            </Text>
          </View>
        </Surface>
      </View>
    </View>
  );

  const renderDots = () => (
    <View style={styles.dotsContainer}>
      {onboardingData.map((_, index) => (
        <View
          key={index}
          style={[
            styles.dot,
            {
              backgroundColor:
                index === currentIndex
                  ? theme.colors.primary
                  : theme.colors.outline,
              width: index === currentIndex ? 20 : 8,
            },
          ]}
        />
      ))}
    </View>
  );

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <FlatList
        ref={flatListRef}
        data={onboardingData}
        renderItem={renderOnboardingItem}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={handleScroll}
        keyExtractor={(item) => item.id}
        scrollEventThrottle={16}
      />

      {renderDots()}

      <View style={styles.navigationContainer}>
        <Button
          mode="text"
          onPress={handlePrevious}
          disabled={currentIndex === 0}
          style={[styles.navButton, { opacity: currentIndex === 0 ? 0.3 : 1 }]}
          labelStyle={{ color: theme.colors.primary }}>
          Previous
        </Button>

        <Button
          mode="contained"
          onPress={handleNext}
          style={styles.nextButton}
          contentStyle={styles.buttonContent}
          labelStyle={styles.buttonLabel}>
          {currentIndex === onboardingData.length - 1 ? "Get Started" : "Next"}
        </Button>
      </View>

      <Button
        mode="text"
        onPress={onComplete}
        style={styles.skipButton}
        labelStyle={[styles.skipLabel, { color: theme.colors.outline }]}>
        Skip
      </Button>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  slide: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 20,
  },
  content: {
    alignItems: "center",
    paddingVertical: 40,
  },
  logoContainer: {
    marginBottom: 40,
  },
  logoBackground: {
    width: 100,
    height: 100,
    borderRadius: 50,
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
    width: 60,
    height: 60,
  },
  featureCard: {
    width: "100%",
    padding: 32,
    borderRadius: 20,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  featureCardContent: {
    alignItems: "center",
    overflow: "hidden",
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 24,
  },
  title: {
    textAlign: "center",
    fontWeight: "900",
    marginBottom: 8,
    fontSize: 30,
    letterSpacing: -1.2,
    textShadowColor: "rgba(59, 130, 246, 0.12)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
    fontFamily: "System",
    includeFontPadding: false,
  },
  subtitle: {
    textAlign: "center",
    fontWeight: "600",
    marginBottom: 16,
  },
  description: {
    textAlign: "center",
    lineHeight: 24,
    maxWidth: screenWidth * 0.7,
  },
  dotsContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginVertical: 20,
    gap: 8,
  },
  dot: {
    height: 8,
    borderRadius: 4,
  },
  navigationContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  navButton: {
    flex: 1,
  },
  nextButton: {
    flex: 2,
    marginLeft: 16,
    borderRadius: 12,
  },
  buttonContent: {
    paddingVertical: 6,
  },
  buttonLabel: {
    fontSize: 16,
    fontWeight: "600",
  },
  skipButton: {
    alignSelf: "center",
    marginBottom: 20,
  },
  skipLabel: {
    fontSize: 14,
  },
});

export default OnboardingScreen;
