import React from "react";
import { View, Text } from "react-native";

export function MetricChart() {
  return (
    <View className="p-4 bg-slate-50 border border-slate-100 rounded-xl items-center justify-center h-48 my-2">
      <Text className="text-xs font-semibold text-slate-500">Cardiovascular Trend SVG Chart Mockup</Text>
      <Text className="text-[10px] text-slate-400 mt-1">Rendered with NativeWind and custom SVGs</Text>
    </View>
  );
}
