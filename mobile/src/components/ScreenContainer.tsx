import React from "react";
import { View, ScrollView, SafeAreaView, ActivityIndicator, Platform } from "react-native";

interface ScreenContainerProps {
  children: React.ReactNode;
  scrollable?: boolean;
  loading?: boolean;
  className?: string;
}

export function ScreenContainer({
  children,
  scrollable = false,
  loading = false,
  className = "",
}: ScreenContainerProps) {
  const containerClasses = `flex-1 bg-slate-50 ${className}`;

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-slate-50">
        <ActivityIndicator size="large" color="#0d9488" />
      </View>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      {scrollable ? (
        <ScrollView
          className={containerClasses}
          contentContainerStyle={{ flexGrow: 1, padding: 16 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {children}
        </ScrollView>
      ) : (
        <View className={`${containerClasses} p-4`}>{children}</View>
      )}
    </SafeAreaView>
  );
}
