import React, { useState } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  Alert,
  Image,
  Dimensions,
  Platform,
} from "react-native";
import { Button, Text, Surface, TextInput, useTheme } from "react-native-paper";
import { useSignIn, useSignUp } from "@clerk/clerk-expo";
import { SafeAreaView } from "react-native-safe-area-context";

const { width: screenWidth } = Dimensions.get("window");

interface AuthScreenProps {}

const AuthScreen: React.FC<AuthScreenProps> = () => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [pendingVerification, setPendingVerification] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const theme = useTheme();

  const { signIn, setActive } = useSignIn();
  const { signUp, setActive: setActiveSignUp } = useSignUp();

  const handleToggleMode = () => {
    setIsSignUp(!isSignUp);
    setEmail("");
    setPassword("");
    setVerificationCode("");
    setPendingVerification(false);
  };

  const handleSignIn = async () => {
    if (!signIn) return;

    setIsLoading(true);
    try {
      const result = await signIn.create({
        identifier: email,
        password,
      });

      if (result.status === "complete") {
        await setActive({ session: result.createdSessionId });
      }
    } catch (error: any) {
      Alert.alert("Error", error.errors?.[0]?.message || "Failed to sign in");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignUp = async () => {
    if (!signUp) return;

    setIsLoading(true);
    try {
      await signUp.create({
        emailAddress: email,
        password,
      });

      // Send email verification
      await signUp.prepareEmailAddressVerification({ strategy: "email_code" });

      setPendingVerification(true);
      Alert.alert(
        "Check your email",
        "We've sent a verification code to your email address. Please enter it below to complete your registration."
      );
    } catch (error: any) {
      Alert.alert("Error", error.errors?.[0]?.message || "Failed to sign up");
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyEmail = async () => {
    if (!signUp) return;

    setIsLoading(true);
    try {
      const result = await signUp.attemptEmailAddressVerification({
        code: verificationCode,
      });

      if (result.status === "complete") {
        await setActiveSignUp({ session: result.createdSessionId });
      }
    } catch (error: any) {
      Alert.alert(
        "Error",
        error.errors?.[0]?.message || "Failed to verify email"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendCode = async () => {
    if (!signUp) return;

    try {
      await signUp.prepareEmailAddressVerification({ strategy: "email_code" });
      Alert.alert(
        "Code sent",
        "A new verification code has been sent to your email."
      );
    } catch (error: any) {
      Alert.alert(
        "Error",
        error.errors?.[0]?.message || "Failed to resend code"
      );
    }
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled">
        {/* Hero Section */}
        <View style={styles.heroSection}>
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
            style={[styles.title, { color: theme.colors.onBackground }]}>
            Welcome to
          </Text>
          <Text
            variant="headlineLarge"
            style={[styles.brandTitle, { color: theme.colors.primary }]}>
            Smarty AI
          </Text>
          <Text
            variant="bodyLarge"
            style={[styles.subtitle, { color: theme.colors.onSurfaceVariant }]}>
            Advanced AI Intelligence for Personal Knowledge Management
          </Text>
        </View>

        {/* Form Section */}
        <Surface
          style={[
            styles.formSurface,
            { backgroundColor: theme.colors.surface },
          ]}
          elevation={2}>
          {!pendingVerification ? (
            <>
              <Text
                variant="headlineSmall"
                style={[styles.formTitle, { color: theme.colors.onSurface }]}>
                {isSignUp ? "Create Account" : "Sign In"}
              </Text>

              <View style={styles.formContainer}>
                <TextInput
                  label="Email Address"
                  value={email}
                  onChangeText={setEmail}
                  mode="outlined"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoComplete="email"
                  returnKeyType="next"
                  style={styles.input}
                  disabled={isLoading}
                  left={<TextInput.Icon icon="email-outline" />}
                  contentStyle={styles.inputContent}
                  accessibilityLabel="Email address input"
                  accessibilityHint="Enter your email address to sign in or create an account"
                />

                <TextInput
                  label="Password"
                  value={password}
                  onChangeText={setPassword}
                  mode="outlined"
                  secureTextEntry
                  autoComplete={isSignUp ? "new-password" : "current-password"}
                  returnKeyType="done"
                  style={styles.input}
                  disabled={isLoading}
                  left={<TextInput.Icon icon="lock-outline" />}
                  contentStyle={styles.inputContent}
                  accessibilityLabel="Password input"
                  accessibilityHint={
                    isSignUp
                      ? "Choose a secure password for your new account"
                      : "Enter your password to sign in"
                  }
                />

                <Button
                  mode="contained"
                  onPress={isSignUp ? handleSignUp : handleSignIn}
                  loading={isLoading}
                  disabled={!email || !password || isLoading}
                  style={styles.submitButton}
                  contentStyle={styles.buttonContent}
                  labelStyle={styles.buttonLabel}
                  accessibilityLabel={
                    isSignUp ? "Create new account button" : "Sign in button"
                  }
                  accessibilityHint={
                    isSignUp
                      ? "Tap to create your new Smarty AI account"
                      : "Tap to sign in to your Smarty AI account"
                  }>
                  {isSignUp ? "Create Account" : "Sign In"}
                </Button>

                {!isSignUp && (
                  <Button
                    mode="text"
                    onPress={() => {
                      /* Add forgot password functionality */
                    }}
                    style={styles.forgotButton}
                    labelStyle={{ color: theme.colors.primary }}>
                    Forgot Password?
                  </Button>
                )}
              </View>
            </>
          ) : (
            <>
              <Text
                variant="headlineSmall"
                style={[styles.formTitle, { color: theme.colors.onSurface }]}>
                Verify Email
              </Text>

              <View style={styles.verificationContainer}>
                <View
                  style={[
                    styles.verificationIconContainer,
                    { backgroundColor: theme.colors.primaryContainer },
                  ]}>
                  <Text
                    style={[
                      styles.verificationIcon,
                      { color: theme.colors.primary },
                    ]}>
                    ✉️
                  </Text>
                </View>

                <Text
                  variant="bodyMedium"
                  style={[
                    styles.verificationText,
                    { color: theme.colors.onSurfaceVariant },
                  ]}>
                  We've sent a verification code to
                </Text>
                <Text
                  variant="bodyMedium"
                  style={[styles.emailText, { color: theme.colors.primary }]}>
                  {email}
                </Text>
                <Text
                  variant="bodySmall"
                  style={[
                    styles.verificationSubtext,
                    { color: theme.colors.onSurfaceVariant },
                  ]}>
                  Please enter the 6-digit code below
                </Text>

                <TextInput
                  label="Verification Code"
                  value={verificationCode}
                  onChangeText={setVerificationCode}
                  mode="outlined"
                  keyboardType="number-pad"
                  returnKeyType="done"
                  style={styles.input}
                  disabled={isLoading}
                  placeholder="Enter 6-digit code"
                  maxLength={6}
                  left={<TextInput.Icon icon="numeric" />}
                  contentStyle={styles.inputContent}
                  accessibilityLabel="Email verification code input"
                  accessibilityHint="Enter the 6-digit verification code sent to your email"
                />

                <Button
                  mode="contained"
                  onPress={handleVerifyEmail}
                  loading={isLoading}
                  disabled={!verificationCode || isLoading}
                  style={styles.submitButton}
                  contentStyle={styles.buttonContent}
                  labelStyle={styles.buttonLabel}>
                  Verify Email
                </Button>

                <View style={styles.verificationActions}>
                  <Button
                    mode="outlined"
                    onPress={handleResendCode}
                    disabled={isLoading}
                    style={styles.resendButton}>
                    Resend Code
                  </Button>

                  <Button
                    mode="text"
                    onPress={() => {
                      setPendingVerification(false);
                      setVerificationCode("");
                    }}
                    disabled={isLoading}
                    style={styles.backButton}>
                    Back to Sign Up
                  </Button>
                </View>
              </View>
            </>
          )}
        </Surface>

        {/* Toggle Section */}
        {!pendingVerification && (
          <View style={styles.toggleSection}>
            <Text
              variant="bodyMedium"
              style={[
                styles.toggleText,
                { color: theme.colors.onSurfaceVariant },
              ]}>
              {isSignUp ? "Already have an account?" : "Don't have an account?"}
            </Text>
            <Button
              mode="text"
              onPress={handleToggleMode}
              labelStyle={[
                styles.toggleButtonLabel,
                { color: theme.colors.primary },
              ]}
              contentStyle={styles.toggleButtonContent}>
              {isSignUp ? "Sign In" : "Sign Up"}
            </Button>
          </View>
        )}

        {/* Footer */}
        <View style={styles.footer}>
          <Text
            variant="bodySmall"
            style={[styles.footerText, { color: theme.colors.outline }]}>
            By continuing, you agree to our Terms of Service and Privacy Policy
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  heroSection: {
    alignItems: "center",
    paddingTop: 40,
    paddingBottom: 40,
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
  title: {
    fontWeight: "300",
    textAlign: "center",
    marginBottom: 4,
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
    maxWidth: screenWidth * 0.8,
    lineHeight: 24,
  },
  formSurface: {
    marginBottom: 24,
    borderRadius: 20,
    paddingVertical: 32,
    paddingHorizontal: 24,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  formTitle: {
    textAlign: "center",
    marginBottom: 24,
    fontWeight: "600",
  },
  formContainer: {
    gap: 16,
  },
  input: {
    backgroundColor: "transparent",
  },
  inputContent: {
    paddingLeft: 8,
  },
  submitButton: {
    marginTop: 8,
    borderRadius: 12,
  },
  buttonContent: {
    paddingVertical: 6,
  },
  buttonLabel: {
    fontSize: 16,
    fontWeight: "600",
  },
  forgotButton: {
    alignSelf: "center",
    marginTop: 8,
  },
  verificationContainer: {
    alignItems: "center",
    gap: 12,
  },
  verificationIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  verificationIcon: {
    fontSize: 32,
  },
  verificationText: {
    textAlign: "center",
  },
  emailText: {
    textAlign: "center",
    fontWeight: "600",
    marginBottom: 8,
  },
  verificationSubtext: {
    textAlign: "center",
    marginBottom: 16,
  },
  verificationActions: {
    gap: 12,
    width: "100%",
    marginTop: 8,
  },
  resendButton: {
    borderRadius: 12,
  },
  backButton: {
    alignSelf: "center",
  },
  toggleSection: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 24,
  },
  toggleText: {
    textAlign: "center",
  },
  toggleButtonLabel: {
    fontWeight: "600",
  },
  toggleButtonContent: {
    paddingHorizontal: 8,
  },
  footer: {
    marginTop: "auto",
    paddingTop: 20,
  },
  footerText: {
    textAlign: "center",
    maxWidth: screenWidth * 0.8,
    alignSelf: "center",
    lineHeight: 18,
  },
});

export default AuthScreen;
