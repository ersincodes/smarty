import React, { useState } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  Alert,
  Image,
  Dimensions,
  Platform,
  StatusBar,
} from "react-native";
import { Button, Text, Surface, TextInput, useTheme } from "react-native-paper";
import { useSignIn, useSignUp } from "@clerk/clerk-expo";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";

const { width: screenWidth } = Dimensions.get("window");

interface AuthScreenProps {}

const AuthScreen: React.FC<AuthScreenProps> = () => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [pendingVerification, setPendingVerification] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Forgot password states
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState("");
  const [resetCode, setResetCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [pendingPasswordReset, setPendingPasswordReset] = useState(false);

  const theme = useTheme();

  const { signIn, setActive } = useSignIn();
  const { signUp, setActive: setActiveSignUp } = useSignUp();

  const handleToggleMode = () => {
    setIsSignUp(!isSignUp);
    setEmail("");
    setPassword("");
    setVerificationCode("");
    setPendingVerification(false);
    // Reset forgot password states
    setIsForgotPassword(false);
    setForgotPasswordEmail("");
    setResetCode("");
    setNewPassword("");
    setPendingPasswordReset(false);
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

  // Forgot password handlers
  const handleForgotPassword = () => {
    setIsForgotPassword(true);
    setForgotPasswordEmail(email); // Pre-fill with current email if available
  };

  const handleBackToSignIn = () => {
    setIsForgotPassword(false);
    setForgotPasswordEmail("");
    setResetCode("");
    setNewPassword("");
    setPendingPasswordReset(false);
  };

  const handleInitiatePasswordReset = async () => {
    if (!signIn || !forgotPasswordEmail.trim()) {
      Alert.alert("Error", "Please enter your email address");
      return;
    }

    setIsLoading(true);
    try {
      await signIn.create({
        identifier: forgotPasswordEmail,
      });

      const firstFactor = signIn.supportedFirstFactors?.find((factor) => {
        return factor.strategy === "reset_password_email_code";
      });

      if (firstFactor) {
        await signIn.prepareFirstFactor({
          strategy: "reset_password_email_code",
          emailAddressId: firstFactor.emailAddressId,
        });

        setPendingPasswordReset(true);
        Alert.alert(
          "Check your email",
          "We've sent a password reset code to your email address. Please enter it below along with your new password."
        );
      } else {
        Alert.alert(
          "Error",
          "Password reset is not available for this account. Please contact support."
        );
      }
    } catch (error: any) {
      console.error("Password reset error:", error);
      Alert.alert(
        "Error",
        error.errors?.[0]?.message ||
          "Failed to initiate password reset. Please check your email address and try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleCompletePasswordReset = async () => {
    if (!signIn || !resetCode.trim() || !newPassword.trim()) {
      Alert.alert("Error", "Please enter the reset code and your new password");
      return;
    }

    setIsLoading(true);
    try {
      const result = await signIn.attemptFirstFactor({
        strategy: "reset_password_email_code",
        code: resetCode,
        password: newPassword,
      });

      if (result.status === "complete") {
        await setActive({ session: result.createdSessionId });
        Alert.alert(
          "Success",
          "Your password has been reset successfully and you are now signed in."
        );
      }
    } catch (error: any) {
      console.error("Password reset completion error:", error);
      Alert.alert(
        "Error",
        error.errors?.[0]?.message ||
          "Failed to reset password. Please check your reset code and try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

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
              style={[styles.title, { color: "#FFFFFF" }]}>
              Welcome to
            </Text>
            <Text
              variant="headlineLarge"
              style={[styles.brandTitle, { color: "#00E5FF" }]}>
              Smarty
            </Text>
          </View>

          {/* Form Section */}
          <Surface
            style={[
              styles.formSurface,
              { backgroundColor: "rgba(255, 255, 255, 0.1)" },
            ]}
            elevation={0}>
            <View style={styles.formContent}>
              {!pendingVerification && !isForgotPassword ? (
                <>
                  <Text
                    variant="headlineSmall"
                    style={[styles.formTitle, { color: "#FFFFFF" }]}>
                    {isSignUp ? "Create Account" : "Sign In"}
                  </Text>

                  <View style={styles.formContainer}>
                    <TextInput
                      label="Email Address"
                      value={email}
                      onChangeText={setEmail}
                      mode="flat"
                      keyboardType="email-address"
                      autoCapitalize="none"
                      autoComplete="email"
                      returnKeyType="next"
                      style={styles.input}
                      disabled={isLoading}
                      left={<TextInput.Icon icon="email-outline" />}
                      contentStyle={styles.inputContent}
                      outlineStyle={styles.inputOutline}
                      theme={{
                        colors: {
                          primary: "#00E5FF",
                          onSurfaceVariant: "rgba(255, 255, 255, 0.7)",
                          onSurface: "#FFFFFF",
                          surfaceVariant: "rgba(255, 255, 255, 0.1)",
                          outline: "rgba(0, 229, 255, 0.3)",
                        },
                      }}
                      accessibilityLabel="Email address input"
                      accessibilityHint="Enter your email address to sign in or create an account"
                    />

                    <TextInput
                      label="Password"
                      value={password}
                      onChangeText={setPassword}
                      mode="flat"
                      secureTextEntry
                      autoComplete={
                        isSignUp ? "new-password" : "current-password"
                      }
                      returnKeyType="done"
                      style={styles.input}
                      disabled={isLoading}
                      left={<TextInput.Icon icon="lock-outline" />}
                      contentStyle={styles.inputContent}
                      outlineStyle={styles.inputOutline}
                      theme={{
                        colors: {
                          primary: "#00E5FF",
                          onSurfaceVariant: "rgba(255, 255, 255, 0.7)",
                          onSurface: "#FFFFFF",
                          surfaceVariant: "rgba(255, 255, 255, 0.1)",
                          outline: "rgba(0, 229, 255, 0.3)",
                        },
                      }}
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
                        isSignUp
                          ? "Create new account button"
                          : "Sign in button"
                      }
                      accessibilityHint={
                        isSignUp
                          ? "Tap to create your new Smarty account"
                          : "Tap to sign in to your Smarty account"
                      }>
                      {isSignUp ? "Create Account" : "Sign In"}
                    </Button>

                    {!isSignUp && (
                      <Button
                        mode="text"
                        onPress={handleForgotPassword}
                        style={styles.forgotButton}
                        labelStyle={{ color: "#00E5FF" }}>
                        Forgot Password?
                      </Button>
                    )}
                  </View>
                </>
              ) : isForgotPassword ? (
                <>
                  <Text
                    variant="headlineSmall"
                    style={[styles.formTitle, { color: "#FFFFFF" }]}>
                    {pendingPasswordReset
                      ? "Reset Password"
                      : "Forgot Password"}
                  </Text>

                  <View style={styles.verificationContainer}>
                    <View
                      style={[
                        styles.verificationIconContainer,
                        { backgroundColor: "rgba(255, 152, 0, 0.2)" },
                      ]}>
                      <Text
                        style={[styles.verificationIcon, { color: "#FF9800" }]}>
                        🔐
                      </Text>
                    </View>

                    {!pendingPasswordReset ? (
                      <>
                        <Text
                          variant="bodyMedium"
                          style={[
                            styles.verificationText,
                            { color: "rgba(255, 255, 255, 0.8)" },
                          ]}>
                          Enter your email address and we'll send you a code to
                          reset your password
                        </Text>

                        <TextInput
                          label="Email Address"
                          value={forgotPasswordEmail}
                          onChangeText={setForgotPasswordEmail}
                          mode="flat"
                          keyboardType="email-address"
                          autoCapitalize="none"
                          autoComplete="email"
                          returnKeyType="done"
                          style={[
                            styles.input,
                            {
                              height: 60,
                              maxHeight: 60,
                              minHeight: 60,
                              flex: 0,
                              width: "100%",
                              alignSelf: "stretch",
                            },
                          ]}
                          disabled={isLoading}
                          left={<TextInput.Icon icon="email-outline" />}
                          theme={{
                            colors: {
                              primary: "#00E5FF",
                              onSurfaceVariant: "rgba(255, 255, 255, 0.9)",
                              onSurface: "#FFFFFF",
                              surfaceVariant: "rgba(255, 255, 255, 0.1)",
                              outline: "rgba(0, 229, 255, 0.5)",
                              background: "rgba(255, 255, 255, 0.1)",
                              surface: "rgba(255, 255, 255, 0.1)",
                            },
                          }}
                          textColor="#FFFFFF"
                          placeholderTextColor="rgba(255, 255, 255, 0.6)"
                          accessibilityLabel="Email address for password reset"
                          accessibilityHint="Enter your email address to receive a password reset code"
                        />

                        <Button
                          mode="contained"
                          onPress={handleInitiatePasswordReset}
                          loading={isLoading}
                          disabled={!forgotPasswordEmail.trim() || isLoading}
                          style={styles.submitButton}
                          contentStyle={styles.buttonContent}
                          labelStyle={styles.buttonLabel}>
                          Send Reset Code
                        </Button>
                      </>
                    ) : (
                      <>
                        <Text
                          variant="bodyMedium"
                          style={[
                            styles.verificationText,
                            { color: "rgba(255, 255, 255, 0.8)" },
                          ]}>
                          We've sent a reset code to
                        </Text>
                        <Text
                          variant="bodyMedium"
                          style={[styles.emailText, { color: "#00E5FF" }]}>
                          {forgotPasswordEmail}
                        </Text>
                        <Text
                          variant="bodySmall"
                          style={[
                            styles.verificationSubtext,
                            { color: "rgba(255, 255, 255, 0.7)" },
                          ]}>
                          Enter the code and your new password below
                        </Text>

                        <TextInput
                          label="Reset Code"
                          value={resetCode}
                          onChangeText={(text) => {
                            // Only allow numeric input and limit to 6 digits
                            const numericText = text.replace(/[^0-9]/g, "");
                            setResetCode(numericText);
                          }}
                          mode="flat"
                          keyboardType="number-pad"
                          returnKeyType="next"
                          style={[
                            styles.input,
                            {
                              height: 60,
                              maxHeight: 60,
                              minHeight: 60,
                              flex: 0,
                              width: "100%",
                              alignSelf: "stretch",
                              textAlign: "center",
                            },
                          ]}
                          disabled={isLoading}
                          placeholder="123456"
                          maxLength={6}
                          left={<TextInput.Icon icon="shield-check-outline" />}
                          theme={{
                            colors: {
                              primary: "#00E5FF",
                              onSurfaceVariant: "rgba(255, 255, 255, 0.9)",
                              onSurface: "#FFFFFF",
                              surfaceVariant: "rgba(255, 255, 255, 0.1)",
                              outline: "rgba(0, 229, 255, 0.5)",
                              background: "rgba(255, 255, 255, 0.1)",
                              surface: "rgba(255, 255, 255, 0.1)",
                            },
                          }}
                          textColor="#FFFFFF"
                          placeholderTextColor="rgba(255, 255, 255, 0.6)"
                          accessibilityLabel="Password reset code input"
                          accessibilityHint="Enter the 6-digit reset code sent to your email"
                        />

                        <TextInput
                          label="New Password"
                          value={newPassword}
                          onChangeText={setNewPassword}
                          mode="flat"
                          secureTextEntry
                          autoComplete="new-password"
                          returnKeyType="done"
                          style={[
                            styles.input,
                            {
                              height: 60,
                              maxHeight: 60,
                              minHeight: 60,
                              flex: 0,
                              width: "100%",
                              alignSelf: "stretch",
                            },
                          ]}
                          disabled={isLoading}
                          left={<TextInput.Icon icon="lock-outline" />}
                          theme={{
                            colors: {
                              primary: "#00E5FF",
                              onSurfaceVariant: "rgba(255, 255, 255, 0.9)",
                              onSurface: "#FFFFFF",
                              surfaceVariant: "rgba(255, 255, 255, 0.1)",
                              outline: "rgba(0, 229, 255, 0.5)",
                              background: "rgba(255, 255, 255, 0.1)",
                              surface: "rgba(255, 255, 255, 0.1)",
                            },
                          }}
                          textColor="#FFFFFF"
                          placeholderTextColor="rgba(255, 255, 255, 0.6)"
                          accessibilityLabel="New password input"
                          accessibilityHint="Enter your new password"
                        />

                        <Button
                          mode="contained"
                          onPress={handleCompletePasswordReset}
                          loading={isLoading}
                          disabled={
                            !resetCode.trim() ||
                            !newPassword.trim() ||
                            isLoading
                          }
                          style={styles.submitButton}
                          contentStyle={styles.buttonContent}
                          labelStyle={styles.buttonLabel}>
                          Reset Password
                        </Button>
                      </>
                    )}

                    <Button
                      mode="text"
                      onPress={handleBackToSignIn}
                      disabled={isLoading}
                      style={styles.backButton}
                      labelStyle={{ color: "#00E5FF" }}>
                      Back to Sign In
                    </Button>
                  </View>
                </>
              ) : (
                <>
                  <Text
                    variant="headlineSmall"
                    style={[styles.formTitle, { color: "#FFFFFF" }]}>
                    Verify Email
                  </Text>

                  <View style={styles.verificationContainer}>
                    <View
                      style={[
                        styles.verificationIconContainer,
                        { backgroundColor: "rgba(0, 229, 255, 0.2)" },
                      ]}>
                      <Text
                        style={[styles.verificationIcon, { color: "#00E5FF" }]}>
                        ✉️
                      </Text>
                    </View>

                    <Text
                      variant="bodyMedium"
                      style={[
                        styles.verificationText,
                        { color: "rgba(255, 255, 255, 0.8)" },
                      ]}>
                      We've sent a verification code to
                    </Text>
                    <Text
                      variant="bodyMedium"
                      style={[styles.emailText, { color: "#00E5FF" }]}>
                      {email}
                    </Text>
                    <Text
                      variant="bodySmall"
                      style={[
                        styles.verificationSubtext,
                        { color: "rgba(255, 255, 255, 0.7)" },
                      ]}>
                      Please enter the 6-digit code below
                    </Text>

                    <TextInput
                      label="Code"
                      value={verificationCode}
                      onChangeText={(text) => {
                        // Only allow numeric input and limit to 6 digits
                        const numericText = text.replace(/[^0-9]/g, "");
                        setVerificationCode(numericText);
                      }}
                      mode="flat"
                      keyboardType="number-pad"
                      returnKeyType="done"
                      style={[styles.input, styles.verificationCodeInput]}
                      disabled={isLoading}
                      placeholder="123456"
                      maxLength={6}
                      left={<TextInput.Icon icon="shield-check-outline" />}
                      contentStyle={[
                        styles.inputContent,
                        styles.verificationCodeContent,
                      ]}
                      outlineStyle={styles.inputOutline}
                      theme={{
                        colors: {
                          primary: "#00E5FF",
                          onSurfaceVariant: "rgba(255, 255, 255, 0.7)",
                          onSurface: "#FFFFFF",
                          surfaceVariant: "rgba(255, 255, 255, 0.1)",
                          outline: "rgba(0, 229, 255, 0.3)",
                        },
                      }}
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
                        mode="text"
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
            </View>
          </Surface>

          {/* Toggle Section */}
          {!pendingVerification && !isForgotPassword && (
            <View style={styles.toggleSection}>
              <Text
                variant="bodyMedium"
                style={[
                  styles.toggleText,
                  { color: "rgba(255, 255, 255, 0.8)" },
                ]}>
                {isSignUp
                  ? "Already have an account?"
                  : "Don't have an account?"}
              </Text>
              <Button
                mode="text"
                onPress={handleToggleMode}
                labelStyle={[styles.toggleButtonLabel, { color: "#00E5FF" }]}
                contentStyle={styles.toggleButtonContent}>
                {isSignUp ? "Sign In" : "Sign Up"}
              </Button>
            </View>
          )}

          {/* Footer */}
          <View style={styles.footer}>
            <Text
              variant="bodySmall"
              style={[
                styles.footerText,
                { color: "rgba(255, 255, 255, 0.6)" },
              ]}>
              By continuing, you agree to our Terms of Service and Privacy
              Policy
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
    backgroundColor: "#1a1a2e",
  },
  backgroundGradient: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  heroSection: {
    alignItems: "center",
    paddingTop: 30,
    paddingBottom: 20,
  },
  logoContainer: {
    marginBottom: 20,
  },
  logoBackground: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 229, 255, 0.2)",
    borderWidth: 2,
    borderColor: "rgba(0, 229, 255, 0.3)",
    shadowColor: "rgba(0, 229, 255, 0.5)",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
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
    fontWeight: "800",
    textAlign: "center",
    marginBottom: 24,
    fontSize: 36,
    letterSpacing: -1,
    textShadowColor: "rgba(0, 229, 255, 0.8)",
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 5,
    fontFamily: "SF Pro Display",
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
    borderWidth: 1,
    borderColor: "rgba(0, 229, 255, 0.3)",
    shadowColor: "rgba(0, 229, 255, 0.3)",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 5,
  },
  formTitle: {
    textAlign: "center",
    marginBottom: 24,
    fontWeight: "600",
  },
  formContent: {
    overflow: "hidden",
  },
  formContainer: {
    gap: 16,
  },
  input: {
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    marginBottom: 4,
  },
  inputContent: {
    paddingLeft: 8,
    color: "#FFFFFF",
  },
  inputOutline: {
    borderRadius: 12,
    borderWidth: 2,
  },
  submitButton: {
    marginTop: 16,
    borderRadius: 12,
    backgroundColor: "#00E5FF",
    shadowColor: "rgba(0, 229, 255, 0.5)",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
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
    flex: 0,
    width: "100%",
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
    maxWidth: screenWidth * 1,
    alignSelf: "center",
    lineHeight: 18,
  },
  verificationCodeInput: {
    textAlign: "center",
    height: 60,
    maxHeight: 60,
  },
  verificationCodeContent: {
    textAlign: "center",
    fontSize: 20,
    fontWeight: "600",
    letterSpacing: 2,
    fontFamily: Platform.OS === "ios" ? "Menlo" : "monospace",
  },
});

export default AuthScreen;
