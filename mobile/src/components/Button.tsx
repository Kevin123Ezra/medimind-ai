import React from "react";
import { TouchableOpacity, Text, ActivityIndicator, View } from "react-native";

interface ButtonProps {
  onPress: () => void;
  title: string;
  variant?: "primary" | "secondary" | "accent" | "outline";
  loading?: boolean;
  disabled?: boolean;
  icon?: React.ReactNode;
  className?: string;
}

export function Button({
  onPress,
  title,
  variant = "primary",
  loading = false,
  disabled = false,
  icon,
  className = "",
}: ButtonProps) {
  const getVariantStyles = () => {
    switch (variant) {
      case "secondary":
        return "bg-indigo-600 active:bg-indigo-700 disabled:bg-indigo-300";
      case "accent":
        return "bg-rose-600 active:bg-rose-700 disabled:bg-rose-300";
      case "outline":
        return "bg-transparent border border-slate-200 active:bg-slate-50";
      case "primary":
      default:
        return "bg-teal-600 active:bg-teal-700 disabled:bg-teal-300";
    }
  };

  const getTextStyles = () => {
    if (variant === "outline") {
      return "text-slate-700 font-semibold";
    }
    return "text-white font-bold";
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.7}
      className={`h-12 rounded-xl flex-row justify-center items-center px-4 ${getVariantStyles()} ${className}`}
    >
      {loading ? (
        <ActivityIndicator size="small" color={variant === "outline" ? "#0d9488" : "#ffffff"} />
      ) : (
        <View className="flex-row items-center justify-center">
          {icon && <View className="mr-2">{icon}</View>}
          <Text className={`text-sm tracking-wide ${getTextStyles()}`}>
            {title}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
}
