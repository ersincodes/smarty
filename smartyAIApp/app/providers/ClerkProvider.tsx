import React from "react";
import { ClerkProvider as ClerkProviderBase } from "@clerk/clerk-expo";
import * as SecureStore from "expo-secure-store";
import ENV from "../config/env";

const tokenCache = {
  async getToken(key: string) {
    try {
      return SecureStore.getItemAsync(key);
    } catch (err) {
      return null;
    }
  },
  async saveToken(key: string, value: string) {
    try {
      return SecureStore.setItemAsync(key, value);
    } catch (err) {
      return;
    }
  },
};

interface ClerkProviderProps {
  children: React.ReactNode;
}

const ClerkProvider: React.FC<ClerkProviderProps> = ({ children }) => {
  return (
    <ClerkProviderBase
      publishableKey={ENV.CLERK_PUBLISHABLE_KEY}
      tokenCache={tokenCache}>
      {children}
    </ClerkProviderBase>
  );
};

export default ClerkProvider;
