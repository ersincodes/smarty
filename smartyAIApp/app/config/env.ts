import Constants from "expo-constants";

export const ENV = {
  OPENAI_API_KEY:
    Constants.expoConfig?.extra?.openaiApiKey ||
    process.env.EXPO_PUBLIC_OPENAI_API_KEY ||
    "",
};

export default ENV;
