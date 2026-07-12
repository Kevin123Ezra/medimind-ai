import React from "react";
import { View, Text, TouchableOpacity } from "react-native";

interface ReportCardProps {
  name: string;
  uploadDate: string;
  onPress: () => void;
}

export function ReportCard({ name, uploadDate, onPress }: ReportCardProps) {
  return (
    <TouchableOpacity 
      onPress={onPress}
      className="p-4 bg-white rounded-xl border border-slate-150 flex-row justify-between items-center my-1"
    >
      <View>
        <Text className="text-sm font-semibold text-slate-800">{name}</Text>
        <Text className="text-[10px] text-slate-400 mt-1">Parsed: {uploadDate}</Text>
      </View>
      <Text className="text-xs font-bold text-teal-600">View Explanations →</Text>
    </TouchableOpacity>
  );
}
