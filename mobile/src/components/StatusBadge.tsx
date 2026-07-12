import React from "react";
import { View, Text } from "react-native";

type BadgeType = "success" | "warning" | "error" | "info" | "neutral";

interface StatusBadgeProps {
  label: string;
  type?: BadgeType;
  className?: string;
}

export function StatusBadge({ label, type = "neutral", className = "" }: StatusBadgeProps) {
  const getBadgeColors = () => {
    switch (type) {
      case "success":
        return "bg-emerald-50 border-emerald-200 text-emerald-700";
      case "warning":
        return "bg-amber-50 border-amber-200 text-amber-700";
      case "error":
        return "bg-rose-50 border-rose-200 text-rose-700";
      case "info":
        return "bg-teal-50 border-teal-200 text-teal-700";
      case "neutral":
      default:
        return "bg-slate-50 border-slate-200 text-slate-600";
    }
  };

  return (
    <View className={`border px-2.5 py-0.5 rounded-full flex-row items-center justify-center ${getBadgeColors()} ${className}`}>
      <Text className="text-[10px] font-black uppercase tracking-wider text-center">
        {label}
      </Text>
    </View>
  );
}
