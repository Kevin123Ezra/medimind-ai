import React, { useState } from "react";
import { View, Text, ScrollView, Platform, TouchableOpacity, Alert, Switch } from "react-native";
import { ScreenContainer } from "../../src/components/ScreenContainer";
import { Card } from "../../src/components/Card";
import { Button } from "../../src/components/Button";
import { StatusBadge } from "../../src/components/StatusBadge";
import { 
  User, 
  PhoneCall, 
  ShieldAlert, 
  Heart, 
  Globe, 
  LogOut, 
  Mail, 
  Bell, 
  Shield, 
  Settings, 
  Activity, 
  HeartPulse,
  ChevronRight,
  Smartphone
} from "lucide-react-native";
import { useAuth } from "../../src/features/auth/hooks/useAuth";

export default function ProfileScreen() {
  const { user, logout } = useAuth();
  
  // Interactive state for App Preferences / Settings Shortcut
  const [pushEnabled, setPushEnabled] = useState(true);
  const [biometricsEnabled, setBiometricsEnabled] = useState(true);
  const [marketingEnabled, setMarketingEnabled] = useState(false);

  const profile = {
    firstName: "Alexander",
    lastName: "Miller",
    bloodType: "A-Positive (A+)",
    allergies: ["Penicillin", "Sulfonamides", "Peanuts"],
    dob: "Oct 12, 1988",
    gender: "Male",
    height: "182 cm",
    weight: "78 kg",
    preferredPharmacy: "CVS Pharmacy #4820",
    languagePreference: "English (US)",
    emergencyContact: {
      name: "Sarah Miller",
      relation: "Spouse",
      phone: "+1 (555) 234-5678",
    },
  };

  const handleLogout = async () => {
    Alert.alert(
      "Confirm Logout",
      "Are you sure you want to sign out from your clinical portal session?",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Logout", 
          style: "destructive", 
          onPress: async () => {
            try {
              await logout();
            } catch (error: any) {
              Alert.alert("Logout Error", error.message || "Failed to log out.");
            }
          }
        }
      ]
    );
  };

  const simulateCall = () => {
    Alert.alert(
      "Emergency Contact",
      `Simulating clinical emergency dialer call to ${profile.emergencyContact.name} (${profile.emergencyContact.phone})...`,
      [{ text: "End Simulation Call" }]
    );
  };

  return (
    <ScreenContainer scrollable className="bg-slate-50">
      {/* Patient Avatar Header */}
      <View className="items-center mb-6 mt-4">
        <View className="relative">
          <View className="w-24 h-24 bg-teal-50 border-2 border-teal-100 rounded-full justify-center items-center shadow-md">
            <User size={44} color="#0d9488" />
          </View>
          <View className="absolute bottom-1 right-1 bg-teal-500 w-5 h-5 rounded-full border-2 border-white items-center justify-center">
            <View className="w-1.5 h-1.5 bg-white rounded-full" />
          </View>
        </View>
        <Text className="text-xl font-black text-slate-900 mt-4 tracking-tight">
          {profile.firstName} {profile.lastName}
        </Text>
        <View className="flex-row items-center mt-1 bg-slate-100/80 px-3 py-1 rounded-full border border-slate-200/50">
          <Mail size={12} color="#64748b" className="mr-1.5" />
          <Text className="text-xs text-slate-500 font-bold">
            {user?.email || "clinical.companion@medimind.ai"}
          </Text>
        </View>
        <Text className="text-[10px] text-slate-400 mt-1.5 font-bold uppercase tracking-wider">
          Patient ID: #MM-9831 • DOB: {profile.dob}
        </Text>
      </View>

      {/* HEALTH SUMMARY SECTION */}
      <View className="flex-row justify-between items-center mb-3 mt-2">
        <Text className="text-xs font-black text-slate-400 uppercase tracking-widest px-1">
          Patient Health Summary
        </Text>
        <StatusBadge label="Clinical Record Locked" type="success" />
      </View>

      <Card className="border-l-4 border-l-teal-500 mb-5">
        <View className="flex-row justify-between items-center pb-3 border-b border-slate-100/60 mb-3">
          <View className="flex-row items-center">
            <Activity size={18} color="#0d9488" />
            <Text className="text-sm font-extrabold text-slate-800 ml-2">
              Clinical Vitals Summary
            </Text>
          </View>
          <Text className="text-xs font-bold text-teal-600">Stable Condition</Text>
        </View>

        {/* Height Weight Blood */}
        <View className="flex-row justify-between mb-4 mt-1">
          <View className="flex-1 items-center py-2 bg-slate-50 rounded-2xl mr-2 border border-slate-100">
            <Text className="text-[10px] font-bold text-slate-400 uppercase">Height</Text>
            <Text className="text-sm font-black text-slate-800 mt-0.5">{profile.height}</Text>
          </View>
          <View className="flex-1 items-center py-2 bg-slate-50 rounded-2xl mr-2 border border-slate-100">
            <Text className="text-[10px] font-bold text-slate-400 uppercase">Weight</Text>
            <Text className="text-sm font-black text-slate-800 mt-0.5">{profile.weight}</Text>
          </View>
          <View className="flex-1 items-center py-2 bg-slate-50 rounded-2xl border border-slate-100">
            <Text className="text-[10px] font-bold text-slate-400 uppercase">Blood Type</Text>
            <Text className="text-sm font-black text-slate-800 mt-0.5">A+</Text>
          </View>
        </View>

        {/* Allergies segment */}
        <View className="mb-3">
          <View className="flex-row items-center mb-2">
            <ShieldAlert size={14} color="#f43f5e" />
            <Text className="text-xs font-bold text-slate-700 ml-1.5">
              Active Medical Allergies:
            </Text>
          </View>
          <View className="flex-row flex-wrap gap-1.5">
            {profile.allergies.map((allergy, idx) => (
              <View key={idx} className="bg-rose-50 border border-rose-100 px-2.5 py-1 rounded-xl">
                <Text className="text-[10px] font-bold text-rose-600">{allergy}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Pharmacy preference */}
        <View className="bg-slate-50/50 p-2.5 rounded-xl border border-slate-100/50 flex-row justify-between items-center mt-1">
          <Text className="text-[11px] font-bold text-slate-500">Preferred Pharmacy:</Text>
          <Text className="text-[11px] font-extrabold text-slate-700">{profile.preferredPharmacy}</Text>
        </View>
      </Card>

      {/* EMERGENCY CONTACT SECTION */}
      <Text className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3 px-1">
        Emergency Representatives
      </Text>

      <Card className="border-l-4 border-l-rose-500 mb-5">
        <View className="flex-row justify-between items-center">
          <View className="flex-1 pr-3">
            <View className="flex-row items-center mb-1">
              <Text className="text-sm font-extrabold text-slate-800">
                {profile.emergencyContact.name}
              </Text>
              <View className="bg-rose-50 px-2 py-0.5 rounded-full border border-rose-100 ml-2">
                <Text className="text-[9px] font-bold text-rose-600">
                  {profile.emergencyContact.relation}
                </Text>
              </View>
            </View>
            <Text className="text-xs text-slate-500">
              Primary authorization for critical care decisions.
            </Text>
            <Text className="text-xs font-bold text-slate-700 mt-1">
              {profile.emergencyContact.phone}
            </Text>
          </View>
          
          <TouchableOpacity 
            onPress={simulateCall}
            className="w-11 h-11 bg-rose-50 border border-rose-100 rounded-2xl justify-center items-center"
          >
            <PhoneCall size={18} color="#e11d48" />
          </TouchableOpacity>
        </View>
      </Card>

      {/* PATIENT APP SETTINGS / SHORTCUTS SECTION */}
      <Text className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3 px-1">
        Patient Portal Settings
      </Text>

      <Card className="mb-6 space-y-4">
        {/* push settings */}
        <View className="flex-row justify-between items-center pb-3 border-b border-slate-100/60 flex-row">
          <View className="flex-row items-center flex-1 pr-2">
            <View className="w-8 h-8 rounded-xl bg-teal-50 justify-center items-center mr-2.5">
              <Bell size={15} color="#0d9488" />
            </View>
            <View>
              <Text className="text-xs font-bold text-slate-800">Medication Alarms</Text>
              <Text className="text-[10px] text-slate-400 mt-0.5">Push notification alerts</Text>
            </View>
          </View>
          <Switch
            value={pushEnabled}
            onValueChange={setPushEnabled}
            trackColor={{ false: "#cbd5e1", true: "#99f6e4" }}
            thumbColor={pushEnabled ? "#0d9488" : "#f1f5f9"}
          />
        </View>

        {/* biometric settings */}
        <View className="flex-row justify-between items-center pb-3 border-b border-slate-100/60 flex-row">
          <View className="flex-row items-center flex-1 pr-2">
            <View className="w-8 h-8 rounded-xl bg-indigo-50 justify-center items-center mr-2.5">
              <Shield size={15} color="#4f46e5" />
            </View>
            <View>
              <Text className="text-xs font-bold text-slate-800">Secure Biometric Login</Text>
              <Text className="text-[10px] text-slate-400 mt-0.5">Use FaceID or TouchID</Text>
            </View>
          </View>
          <Switch
            value={biometricsEnabled}
            onValueChange={setBiometricsEnabled}
            trackColor={{ false: "#cbd5e1", true: "#c7d2fe" }}
            thumbColor={biometricsEnabled ? "#4f46e5" : "#f1f5f9"}
          />
        </View>

        {/* marketing settings */}
        <View className="flex-row justify-between items-center pb-3 border-b border-slate-100/60 flex-row">
          <View className="flex-row items-center flex-1 pr-2">
            <View className="w-8 h-8 rounded-xl bg-amber-50 justify-center items-center mr-2.5">
              <Smartphone size={15} color="#d97706" />
            </View>
            <View>
              <Text className="text-xs font-bold text-slate-800">Clinical Research Digests</Text>
              <Text className="text-[10px] text-slate-400 mt-0.5">Receive newsletter research</Text>
            </View>
          </View>
          <Switch
            value={marketingEnabled}
            onValueChange={setMarketingEnabled}
            trackColor={{ false: "#cbd5e1", true: "#fde68a" }}
            thumbColor={marketingEnabled ? "#d97706" : "#f1f5f9"}
          />
        </View>

        {/* language settings selection */}
        <TouchableOpacity 
          onPress={() => Alert.alert("Language preference", "English (US) is the default clinical language setting.")}
          className="flex-row justify-between items-center"
        >
          <View className="flex-row items-center">
            <View className="w-8 h-8 rounded-xl bg-slate-50 justify-center items-center mr-2.5 border border-slate-100">
              <Globe size={15} color="#64748b" />
            </View>
            <View>
              <Text className="text-xs font-bold text-slate-800">Language Preference</Text>
              <Text className="text-[10px] text-slate-400 mt-0.5">English (US)</Text>
            </View>
          </View>
          <ChevronRight size={16} color="#94a3b8" />
        </TouchableOpacity>
      </Card>

      {/* DISCONNECT SESSION / SIGNOUT ACTIONS */}
      <Button
        onPress={handleLogout}
        title="Sign Out Portal Session"
        variant="outline"
        icon={<LogOut size={16} color="#ef4444" />}
        className="mb-8 border-rose-200 text-rose-600 hover:bg-rose-50/50"
      />
    </ScreenContainer>
  );
}

