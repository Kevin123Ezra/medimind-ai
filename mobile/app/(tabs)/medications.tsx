import React, { useState } from "react";
import { View, Text, ScrollView, TouchableOpacity, Alert } from "react-native";
import { ScreenContainer } from "../../src/components/ScreenContainer";
import { Card } from "../../src/components/Card";
import { Button } from "../../src/components/Button";
import { MedAlarm } from "../../src/features/medications/components/MedAlarm";
import { StatusBadge } from "../../src/components/StatusBadge";
import { Plus, Check, Percent, Activity, Bell } from "lucide-react-native";

export default function MedicationsScreen() {
  const [reminders, setReminders] = useState([
    {
      id: "rem-1",
      medicineName: "Lisinopril",
      dosage: "10mg",
      scheduledTime: "10:00 AM",
      status: "pending" as const,
    },
    {
      id: "rem-2",
      medicineName: "Atorvastatin",
      dosage: "20mg",
      scheduledTime: "08:00 PM",
      status: "pending" as const,
    },
    {
      id: "rem-3",
      medicineName: "Metformin",
      dosage: "500mg",
      scheduledTime: "08:00 AM",
      status: "taken" as const,
    },
  ]);

  const handleToggleReminder = (id: string, newStatus: "taken" | "skipped") => {
    setReminders((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status: newStatus } : r))
    );
  };

  const handleAddNewMedMock = () => {
    // Add mock new reminder
    const newRem = {
      id: Date.now().toString(),
      medicineName: "Baby Aspirin",
      dosage: "81mg",
      scheduledTime: "01:00 PM",
      status: "pending" as const,
    };
    setReminders((prev) => [newRem, ...prev]);
  };

  const takenCount = reminders.filter((r) => r.status === "taken").length;
  const complianceScore = reminders.length > 0 ? Math.round((takenCount / reminders.length) * 100) : 100;

  return (
    <ScreenContainer scrollable className="bg-slate-50">
      {/* Compliance Overview Banner */}
      <View className="mb-6 bg-white border border-slate-100 p-5 rounded-2xl shadow-sm flex-row justify-between items-center">
        <View className="flex-1 pr-4">
          <Text className="text-xs font-bold text-indigo-600 uppercase tracking-widest">
            Adherence Progress
          </Text>
          <Text className="text-2xl font-black text-slate-900 mt-1">
            {complianceScore}% Daily Score
          </Text>
          <Text className="text-xs text-slate-400 mt-0.5">
            {takenCount} of {reminders.length} doses logged today
          </Text>
        </View>
        <View className="w-14 h-14 bg-indigo-50 rounded-2xl justify-center items-center">
          <Percent size={24} color="#4f46e5" />
        </View>
      </View>

      {/* Drug Alarms Stream */}
      <View className="flex-row justify-between items-center mb-3">
        <Text className="text-xs font-bold text-slate-400 uppercase tracking-wider px-1">
          Scheduled Alarms
        </Text>
        <StatusBadge label="Local Alerts Active" type="info" />
      </View>

      <View className="space-y-3 mb-6">
        {reminders.map((alarm) => (
          <MedAlarm
            key={alarm.id}
            medicineName={alarm.medicineName}
            dosage={alarm.dosage}
            scheduledTime={alarm.scheduledTime}
            status={alarm.status}
            onToggle={(status) => handleToggleReminder(alarm.id, status)}
          />
        ))}
      </View>

      {/* Schedule A New Drug Widget */}
      <Card title="Add Scheduled Medication" subtitle="Configure local drug alarm alerts">
        <Text className="text-xs text-slate-500 mb-4 leading-relaxed">
          Input your prescribing clinician's instructions to enable automatic notifications, push banners, and sync medication checklists offline.
        </Text>
        <Button
          onPress={handleAddNewMedMock}
          title="Add Mock Aspirin 81mg"
          variant="secondary"
          icon={<Plus size={16} color="#ffffff" />}
        />
      </Card>

      {/* Local Notification Advisory Banner */}
      <View className="p-4 bg-teal-50 border border-teal-100 rounded-2xl my-4">
        <View className="flex-row items-center mb-1">
          <Bell size={14} color="#0d9488" />
          <Text className="text-xs font-black text-teal-900 ml-1.5 uppercase tracking-wide">
            Smart Alarms Enabled
          </Text>
        </View>
        <Text className="text-[10px] text-teal-700 leading-normal">
          Local device notifications are synced. MediMind will send push banners 15 minutes prior to every scheduled medication dose.
        </Text>
      </View>
    </ScreenContainer>
  );
}
