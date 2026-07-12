import React from "react";
import { View, Text, Platform } from "react-native";
import { Link, useRouter } from "expo-router";
import { Button } from "../src/components/Button";
import { ShieldAlert, X } from "lucide-react-native";
import { StatusBar } from "expo-status-bar";

export default function QuickViewModal() {
  const router = useRouter();

  return (
    <View className="flex-1 bg-slate-50 p-6 justify-between">
      <StatusBar style={Platform.OS === "ios" ? "light" : "auto"} />
      
      <View className="items-center mt-8 space-y-4">
        <View className="w-16 h-16 rounded-3xl bg-teal-50 items-center justify-center mb-4">
          <ShieldAlert size={36} color="#0d9488" />
        </View>
        <Text className="text-xl font-bold text-slate-900 text-center">
          MediMind Clinical Overview
        </Text>
        <Text className="text-sm text-slate-500 text-center leading-relaxed max-w-sm mt-2">
          This overlay modal displays critical warnings, lab parsing alerts, and medication compliance states requiring immediate clinical attention.
        </Text>
      </View>

      <View className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm space-y-3">
        <Text className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
          Active Status Indicators
        </Text>
        <View className="flex-row justify-between border-b border-slate-50 pb-2">
          <Text className="text-xs font-semibold text-slate-600">BP Readings Logged</Text>
          <Text className="text-xs font-bold text-slate-900">Active Trend</Text>
        </View>
        <View className="flex-row justify-between border-b border-slate-50 pb-2">
          <Text className="text-xs font-semibold text-slate-600">Med Adherence Rate</Text>
          <Text className="text-xs font-bold text-teal-600">92% Compliance</Text>
        </View>
        <View className="flex-row justify-between">
          <Text className="text-xs font-semibold text-slate-600">Pending Lab Reports</Text>
          <Text className="text-xs font-bold text-indigo-600">Ready for Analysis</Text>
        </View>
      </View>

      <View className="space-y-3">
        <Button 
          onPress={() => router.back()} 
          title="Dismiss Overlay" 
          variant="primary"
          icon={<X size={16} color="#ffffff" />}
        />
      </View>
    </View>
  );
}
