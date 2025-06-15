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
      : "https://smarty-teal.vercel.app"), // Production - Updated to include /api
  IS_DEVELOPMENT: isDevelopment,
};

// Environment configuration loaded

export default ENV;
