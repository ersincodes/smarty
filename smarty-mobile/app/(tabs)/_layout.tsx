import React from "react";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { Tabs } from "expo-router";

import Colors from "@/constants/Colors";
import { useColorScheme } from "@/components/useColorScheme";
import { useClientOnlyValue } from "@/components/useClientOnlyValue";

// You can explore the built-in icon families and icons on the web at https://icons.expo.fyi/
function TabBarIcon(props: {
  name: React.ComponentProps<typeof FontAwesome>["name"];
  color: string;
}) {
  return <FontAwesome size={24} style={{ marginBottom: -3 }} {...props} />;
}

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: "#00E5FF",
        tabBarInactiveTintColor: "rgba(255, 255, 255, 0.6)",
        tabBarStyle: {
          backgroundColor: "#16213e",
          borderTopColor: "rgba(0, 229, 255, 0.3)",
          borderTopWidth: 1,
          height: 84,
          paddingTop: 8,
          paddingBottom: 28,
          shadowColor: "rgba(0, 229, 255, 0.5)",
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.3,
          shadowRadius: 8,
          elevation: 12,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: "600",
          marginTop: 4,
          letterSpacing: 0.3,
        },
        // Disable the static render of the header on web
        // to prevent a hydration error in React Navigation v6.
        headerShown: false,
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: "Notes",
          tabBarIcon: ({ color }) => (
            <TabBarIcon name="sticky-note" color={color} />
          ),
          tabBarAccessibilityLabel: "Notes tab",
        }}
      />
      <Tabs.Screen
        name="add-note"
        options={{
          title: "Add Note",
          tabBarIcon: ({ color }) => <TabBarIcon name="plus" color={color} />,
          tabBarAccessibilityLabel: "Add note tab",
        }}
      />
      <Tabs.Screen
        name="ai-assistant"
        options={{
          title: "Ask Smarty",
          tabBarIcon: ({ color }) => <TabBarIcon name="magic" color={color} />,
          tabBarAccessibilityLabel: "AI Assistant tab",
        }}
      />
      <Tabs.Screen
        name="two"
        options={{
          title: "About",
          tabBarIcon: ({ color }) => (
            <TabBarIcon name="info-circle" color={color} />
          ),
          tabBarAccessibilityLabel: "About tab",
        }}
      />
    </Tabs>
  );
}
