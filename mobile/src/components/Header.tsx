import React from "react";
import { View, Text, Platform } from "react-native";

interface HeaderProps {
  title: string;
  subtitle?: string;
  rightElement?: React.ReactNode;
}

export function Header({ title, subtitle, rightElement }: HeaderProps) {
  return (
    <View className={`bg-white border-b border-slate-100 px-5 py-4 flex-row justify-between items-center ${
      Platform.OS === "ios" ? "pt-12" : "pt-4"
    }`}>
      <View className="flex-1 pr-4">
        <Text className="text-lg font-black text-slate-900 tracking-tight">
          {title}
        </Text>
        {subtitle && (
          <Text className="text-xs text-slate-400 mt-0.5 font-medium">
            {subtitle}
          </Text>
        )}
      </View>
      {rightElement && (
        <View className="shrink-0">
          {rightElement}
        </View>
      )}
    </View>
  );
}
