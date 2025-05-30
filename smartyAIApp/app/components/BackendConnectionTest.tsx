import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import { useAuth } from "@clerk/clerk-expo";
import { notesApi, categoriesApi, chatApi } from "../config/api";

interface TestResult {
  test: string;
  status: "pending" | "success" | "error";
  message: string;
  duration?: number;
  details?: string;
}

const BackendConnectionTest: React.FC = () => {
  const [testing, setTesting] = useState(false);
  const [results, setResults] = useState<TestResult[]>([]);
  const { getToken, isSignedIn } = useAuth();

  const addResult = (result: TestResult) => {
    setResults((prev) => [...prev, result]);
  };

  const updateResult = (index: number, updates: Partial<TestResult>) => {
    setResults((prev) =>
      prev.map((result, i) =>
        i === index ? { ...result, ...updates } : result
      )
    );
  };

  // Basic diagnostic tests
  const runDiagnostics = async () => {
    if (!isSignedIn) {
      Alert.alert(
        "Authentication Required",
        "Please sign in to test backend connection."
      );
      return;
    }

    setTesting(true);
    setResults([]);

    const diagnosticTests = [
      {
        name: "Authentication Token",
        test: async () => {
          const token = await getToken();
          if (!token) throw new Error("No authentication token available");

          // Log the token structure for debugging
          console.log("🔑 Token preview:", token.substring(0, 50) + "...");
          console.log("🔑 Token length:", token.length);

          return `Token available (${token.substring(0, 20)}...) - Length: ${
            token.length
          }`;
        },
      },
      {
        name: "Backend Ping",
        test: async () => {
          try {
            const response = await fetch("https://smarty-teal.vercel.app/");
            const text = await response.text();
            console.log(
              "🏓 Backend root response:",
              response.status,
              text.substring(0, 100)
            );
            return `Backend accessible - Status: ${response.status}`;
          } catch (error) {
            throw new Error(`Cannot reach backend: ${error}`);
          }
        },
      },
      {
        name: "API Root Check",
        test: async () => {
          try {
            const response = await fetch("https://smarty-teal.vercel.app/api");
            const text = await response.text();
            console.log(
              "🔍 API root response:",
              response.status,
              text.substring(0, 200)
            );
            return `API root accessible - Status: ${response.status}`;
          } catch (error) {
            throw new Error(`Cannot reach API root: ${error}`);
          }
        },
      },
      {
        name: "Raw Notes Endpoint Test",
        test: async () => {
          const token = await getToken();
          const headers = {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          };

          console.log("🔧 Testing notes endpoint with headers:", headers);

          try {
            const response = await fetch(
              "https://smarty-teal.vercel.app/api/notes",
              {
                method: "GET",
                headers,
              }
            );

            const responseText = await response.text();
            console.log("📝 Notes endpoint raw response:", {
              status: response.status,
              statusText: response.statusText,
              headers: Object.fromEntries(response.headers.entries()),
              body: responseText.substring(0, 500),
            });

            if (!response.ok) {
              throw new Error(`HTTP ${response.status}: ${responseText}`);
            }

            return `Notes endpoint responded - Status: ${response.status}`;
          } catch (error) {
            throw new Error(`Notes endpoint failed: ${error}`);
          }
        },
      },
      {
        name: "Raw Categories Endpoint Test",
        test: async () => {
          const token = await getToken();
          const headers = {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          };

          try {
            const response = await fetch(
              "https://smarty-teal.vercel.app/api/categories",
              {
                method: "GET",
                headers,
              }
            );

            const responseText = await response.text();
            console.log("📂 Categories endpoint raw response:", {
              status: response.status,
              statusText: response.statusText,
              body: responseText.substring(0, 500),
            });

            if (!response.ok) {
              throw new Error(`HTTP ${response.status}: ${responseText}`);
            }

            // Try to parse as JSON
            let parsedData;
            try {
              parsedData = JSON.parse(responseText);
              console.log("📂 Categories parsed data:", parsedData);
            } catch (e) {
              console.log("📂 Categories response is not JSON");
            }

            return `Categories endpoint responded - Status: ${
              response.status
            }, Data type: ${typeof parsedData}`;
          } catch (error) {
            throw new Error(`Categories endpoint failed: ${error}`);
          }
        },
      },
      {
        name: "Alternative Endpoints Check",
        test: async () => {
          const token = await getToken();
          const headers = {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          };

          const alternativeEndpoints = [
            "https://smarty-teal.vercel.app/notes",
            "https://smarty-teal.vercel.app/api/user/notes",
            "https://smarty-teal.vercel.app/api/notes/list",
          ];

          const results = [];
          for (const endpoint of alternativeEndpoints) {
            try {
              const response = await fetch(endpoint, {
                method: "GET",
                headers,
              });
              results.push(`${endpoint}: ${response.status}`);
              console.log(
                `🔍 Alternative endpoint ${endpoint}:`,
                response.status
              );
            } catch (error) {
              results.push(`${endpoint}: Error`);
            }
          }

          return `Alternative endpoints tested: ${results.join(", ")}`;
        },
      },
    ];

    for (let i = 0; i < diagnosticTests.length; i++) {
      const testItem = diagnosticTests[i];

      addResult({
        test: testItem.name,
        status: "pending",
        message: "Running...",
      });

      const startTime = Date.now();

      try {
        const message = await testItem.test();
        const duration = Date.now() - startTime;

        updateResult(i, {
          status: "success",
          message,
          duration,
        });
      } catch (error) {
        const duration = Date.now() - startTime;
        const errorMessage =
          error instanceof Error ? error.message : "Unknown error";

        updateResult(i, {
          status: "error",
          message: errorMessage,
          duration,
        });
      }

      // Small delay between tests
      await new Promise((resolve) => setTimeout(resolve, 500));
    }

    setTesting(false);
  };

  const getStatusColor = (status: TestResult["status"]) => {
    switch (status) {
      case "success":
        return "#4CAF50";
      case "error":
        return "#F44336";
      case "pending":
        return "#FF9800";
      default:
        return "#9E9E9E";
    }
  };

  const getStatusIcon = (status: TestResult["status"]) => {
    switch (status) {
      case "success":
        return "✅";
      case "error":
        return "❌";
      case "pending":
        return "⏳";
      default:
        return "⏸️";
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Backend Diagnostics</Text>
        <Text style={styles.subtitle}>
          Debug authentication and API structure issues
        </Text>
      </View>

      <View style={styles.infoCard}>
        <Text style={styles.infoTitle}>Current Configuration:</Text>
        <Text style={styles.infoText}>
          📡 Backend: https://smarty-teal.vercel.app/api
        </Text>
        <Text style={styles.infoText}>
          🔐 Auth Status: {isSignedIn ? "Signed In" : "Not Signed In"}
        </Text>
        <Text style={styles.infoText}>
          🔧 Test Mode: Diagnostic (Authentication & Structure)
        </Text>
      </View>

      <TouchableOpacity
        style={[styles.testButton, testing && styles.testButtonDisabled]}
        onPress={runDiagnostics}
        disabled={testing || !isSignedIn}
        accessibilityLabel="Run backend diagnostics"
        accessibilityRole="button">
        {testing ? (
          <ActivityIndicator size="small" color="white" />
        ) : (
          <Text style={styles.testButtonText}>
            {!isSignedIn ? "Sign In Required" : "Run Diagnostics"}
          </Text>
        )}
      </TouchableOpacity>

      {results.length > 0 && (
        <View style={styles.resultsContainer}>
          <Text style={styles.resultsTitle}>Diagnostic Results:</Text>
          {results.map((result, index) => (
            <View key={index} style={styles.resultItem}>
              <View style={styles.resultHeader}>
                <Text style={styles.resultIcon}>
                  {getStatusIcon(result.status)}
                </Text>
                <Text style={styles.resultTest}>{result.test}</Text>
                {result.duration && (
                  <Text style={styles.resultDuration}>{result.duration}ms</Text>
                )}
              </View>
              <Text
                style={[
                  styles.resultMessage,
                  { color: getStatusColor(result.status) },
                ]}>
                {result.message}
              </Text>
            </View>
          ))}
        </View>
      )}

      <View style={styles.footer}>
        <Text style={styles.footerText}>
          🔧 This diagnostic test helps identify authentication issues and API
          structure mismatches. Check the console for detailed response
          information.
        </Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  header: {
    padding: 20,
    backgroundColor: "white",
    borderBottomWidth: 1,
    borderBottomColor: "#e1e1e1",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
  },
  infoCard: {
    margin: 16,
    padding: 16,
    backgroundColor: "white",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#e1e1e1",
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: "#666",
    marginBottom: 4,
  },
  testButton: {
    backgroundColor: "#007AFF",
    marginHorizontal: 16,
    marginVertical: 8,
    padding: 16,
    borderRadius: 8,
    alignItems: "center",
  },
  testButtonDisabled: {
    backgroundColor: "#ccc",
  },
  testButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  resultsContainer: {
    margin: 16,
    padding: 16,
    backgroundColor: "white",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#e1e1e1",
  },
  resultsTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    marginBottom: 16,
  },
  resultItem: {
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  resultHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  resultIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  resultTest: {
    flex: 1,
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
  },
  resultDuration: {
    fontSize: 12,
    color: "#999",
  },
  resultMessage: {
    fontSize: 13,
    marginLeft: 24,
    fontFamily: "monospace",
  },
  footer: {
    margin: 16,
    padding: 16,
    backgroundColor: "#fff3cd",
    borderRadius: 8,
  },
  footerText: {
    fontSize: 14,
    color: "#856404",
    textAlign: "center",
    lineHeight: 20,
  },
});

export default BackendConnectionTest;
