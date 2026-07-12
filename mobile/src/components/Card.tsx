import React from "react";
import { View, TouchableOpacity, Text } from "react-native";

interface CardProps {
  children: React.ReactNode;
  onPress?: () => void;
  className?: string;
  title?: string;
  subtitle?: string;
}

export function Card({
  children,
  onPress,
  className = "",
  title,
  subtitle,
}: CardProps) {
  const CardContainer = onPress ? TouchableOpacity : View;

  return (
    // @ts-ignore
    <CardContainer
      onPress={onPress}
      activeOpacity={onPress ? 0.8 : 1}
      className={`bg-white rounded-2xl border border-slate-100 p-5 mb-4 shadow-sm ${className}`}
    >
      {(title || subtitle) && (
        <View className="mb-3 border-b border-slate-50 pb-2">
          {title && (
            <Text className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              {title}
            </Text>
          )}
          {subtitle && (
            <Text className="text-xs text-slate-400 mt-0.5">
              {subtitle}
            </Text>
          )}
        </View>
      )}
      {children}
    </CardContainer>
  );
}
