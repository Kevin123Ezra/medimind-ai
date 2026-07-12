import React from "react";
import { View, Text, TouchableOpacity } from "react-native";

interface MedAlarmProps {
  medicineName: string;
  dosage: string;
  scheduledTime: string;
  status: "pending" | "taken" | "skipped";
  onToggle: (status: "taken" | "skipped") => void;
}

export function MedAlarm({ medicineName, dosage, scheduledTime, status, onToggle }: MedAlarmProps) {
  return (
    <View className="flex-row items-center justify-between p-4 bg-white rounded-xl border border-slate-100 shadow-sm my-1">
      <View>
        <Text className="text-sm font-bold text-slate-800">{medicineName} - {dosage}</Text>
        <Text className="text-xs text-slate-400 mt-0.5">{scheduledTime}</Text>
      </View>
      <View className="flex-row gap-2">
        {status === "pending" ? (
          <>
            <TouchableOpacity onPress={() => onToggle("taken")} className="px-3 py-1.5 bg-emerald-50 rounded-lg">
              <Text className="text-xs font-bold text-emerald-600">Take</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => onToggle("skipped")} className="px-3 py-1.5 bg-rose-50 rounded-lg">
              <Text className="text-xs font-bold text-rose-500">Skip</Text>
            </TouchableOpacity>
          </>
        ) : (
          <Text className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            {status}
          </Text>
        )}
      </View>
    </View>
  );
}
