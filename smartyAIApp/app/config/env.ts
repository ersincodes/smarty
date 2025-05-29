import Constants from "expo-constants";

const isDevelopment = __DEV__ || process.env.NODE_ENV === "development";

export const ENV = {
  OPENAI_API_KEY:
    Constants.expoConfig?.extra?.openaiApiKey ||
    process.env.EXPO_PUBLIC_OPENAI_API_KEY ||
    "",
  CLERK_PUBLISHABLE_KEY:
    Constants.expoConfig?.extra?.clerkPublishableKey ||
    process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY ||
    "",
  API_BASE_URL:
    Constants.expoConfig?.extra?.apiBaseUrl ||
    process.env.EXPO_PUBLIC_API_BASE_URL ||
    (isDevelopment
      ? "http://localhost:3000/api" // Local development - YOUR NEXT.JS BACKEND!
      : "https://smarty-teal.vercel.app"), // Production
  IS_DEVELOPMENT: isDevelopment,
};

// Log current environment for debugging
console.log("🚀 Backend Integration Active!");
console.log("Current Environment:", {
  isDevelopment: ENV.IS_DEVELOPMENT,
  apiBaseUrl: ENV.API_BASE_URL,
  message: isDevelopment
    ? "✅ Using local Next.js backend at localhost:3000"
    : "🌐 Using production backend",
});

export default ENV;
