import React, { useEffect } from "react";
import { Stack, useRouter, useSegments } from "expo-router";
import { PaperProvider } from "react-native-paper";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { StatusBar } from "expo-status-bar";
import { View, Text, ActivityIndicator } from "react-native";
import { HeartPulse } from "lucide-react-native";
import { AuthProvider, useAuth } from "../src/features/auth/context/AuthContext";

// Create QueryClient for React Query
const queryClient = new QueryClient();

function RootLayoutNav() {
  const { user, backendUser, initializing } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  const isSyncing = initializing || (user && !backendUser);

  useEffect(() => {
    if (isSyncing) return;

    const inAuthGroup = segments[0] === "(auth)";

    if (!user && !inAuthGroup) {
      // Redirect to login if user is not authenticated and trying to access tabs
      router.replace("/(auth)/login");
    } else if (user && backendUser && inAuthGroup) {
      // Redirect to tabs if user is authenticated and trying to access auth screens
      router.replace("/(tabs)");
    }
  }, [user, backendUser, segments, isSyncing]);

  if (isSyncing) {
    return (
      <View className="flex-1 justify-center items-center bg-slate-50 p-6">
        <View className="items-center space-y-4">
          <View className="w-16 h-16 rounded-3xl bg-teal-50 flex items-center justify-center border border-teal-100 shadow-md">
            <HeartPulse size={36} color="#0d9488" />
          </View>
          <Text className="text-xl font-bold text-slate-800 tracking-tight mt-4">
            MediMind AI
          </Text>
          <Text className="text-xs text-slate-500 font-medium text-center">
            Establishing secure clinical-grade connection...
          </Text>
          <ActivityIndicator size="small" color="#0d9488" className="mt-6" />
        </View>
      </View>
    );
  }

  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: "#ffffff",
        },
        headerTintColor: "#0f172a",
        headerTitleStyle: {
          fontWeight: "bold",
        },
        headerShadowVisible: false,
      }}
    >
      {/* Main Screens Navigation */}
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="(auth)" options={{ headerShown: false }} />
      <Stack.Screen name="modal" options={{ presentation: "modal", title: "Quick View" }} />
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <QueryClientProvider client={queryClient}>
        <PaperProvider>
          <StatusBar style="auto" />
          <RootLayoutNav />
        </PaperProvider>
      </QueryClientProvider>
    </AuthProvider>
  );
}
