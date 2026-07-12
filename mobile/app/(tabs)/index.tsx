import React, { useState } from "react";
import { View, Text, TouchableOpacity, ScrollView, Alert } from "react-native";
import { useRouter } from "expo-router";
import { ScreenContainer } from "../../src/components/ScreenContainer";
import { Card } from "../../src/components/Card";
import { Button } from "../../src/components/Button";
import { StatusBadge } from "../../src/components/StatusBadge";
import { CLINICAL_DISCLAIMER } from "../../src/constants";
import { 
  Activity, 
  ChevronRight, 
  MessageSquare, 
  FileText, 
  Pill, 
  ShieldAlert, 
  Clock,
  Heart,
  Sparkles,
  Calendar,
  MapPin,
  CheckCircle2,
  CalendarDays
} from "lucide-react-native";

interface MedicationItem {
  id: string;
  name: string;
  dosage: string;
  time: string;
  taken: boolean;
}

export default function HomeScreen() {
  const router = useRouter();

  // Interactive medications state
  const [meds, setMeds] = useState<MedicationItem[]>([
    { id: "1", name: "Lisinopril", dosage: "10mg", time: "08:00 AM", taken: true },
    { id: "2", name: "Metformin", dosage: "500mg", time: "02:00 PM", taken: true },
    { id: "3", name: "Atorvastatin", dosage: "20mg", time: "09:00 PM", taken: false },
  ]);

  // Appointment action state
  const [addedToCalendar, setAddedToCalendar] = useState(false);

  // Toggle med state
  const toggleMedication = (id: string) => {
    setMeds(prevMeds => 
      prevMeds.map(med => 
        med.id === id ? { ...med, taken: !med.taken } : med
      )
    );
  };

  // Calculate stats dynamically
  const takenCount = meds.filter(m => m.taken).length;
  const totalCount = meds.length;
  const medPercentage = totalCount > 0 ? (takenCount / totalCount) * 100 : 0;
  
  // Health score calculated dynamically: base score 70 + adherence percentage weight (30 max)
  const healthScore = Math.round(70 + (medPercentage / 100) * 22);

  const getScoreColor = (score: number) => {
    if (score >= 90) return "text-emerald-600";
    if (score >= 80) return "text-teal-600";
    if (score >= 70) return "text-amber-600";
    return "text-rose-600";
  };

  return (
    <ScreenContainer scrollable className="bg-slate-50">
      {/* Patient Welcome Header */}
      <View className="mb-5 flex-row justify-between items-center bg-white p-5 rounded-3xl border border-slate-100 shadow-sm">
        <View>
          <Text className="text-[10px] font-black text-teal-600 uppercase tracking-widest">
            Welcome back
          </Text>
          <Text className="text-2xl font-black text-slate-900 tracking-tight mt-1">
            Alexander Miller
          </Text>
          <Text className="text-xs text-slate-400 mt-0.5 font-medium">
            Patient ID: #MM-9831
          </Text>
        </View>
        <StatusBadge label="Secured" type="success" />
      </View>

      {/* 1. HEALTH SCORE CARD */}
      <Card 
        title="Interactive Clinical Health Score" 
        subtitle="Dynamic telemetry updated in real-time"
        className="border-l-4 border-l-teal-500"
      >
        <View className="flex-row items-center justify-between mb-4 mt-1">
          <View className="flex-row items-center">
            <View className="w-16 h-16 rounded-full bg-teal-50/50 justify-center items-center mr-4 border border-teal-100/50">
              <Text className={`text-2xl font-black ${getScoreColor(healthScore)}`}>
                {healthScore}
              </Text>
              <Text className="text-[8px] font-bold text-slate-400 uppercase">
                of 100
              </Text>
            </View>
            <View className="flex-1 pr-2">
              <Text className="text-sm font-extrabold text-slate-800">
                {healthScore >= 90 ? "Excellent Standing" : "Good Adherence"}
              </Text>
              <Text className="text-xs text-slate-500 mt-0.5 leading-tight">
                Your score is actively calculated based on daily vitals and medication adherence.
              </Text>
            </View>
          </View>
          <StatusBadge 
            label={healthScore >= 90 ? "Optimal" : "Stable"} 
            type={healthScore >= 90 ? "success" : "info"} 
          />
        </View>

        {/* Scoring breakdown details */}
        <View className="grid grid-cols-2 gap-2 pt-3 border-t border-slate-100/60 flex-row justify-between">
          <View className="flex-row items-center">
            <Heart size={14} color="#0d9488" />
            <Text className="text-[11px] font-bold text-slate-600 ml-1.5">
              BP: 118/76 mmHg
            </Text>
          </View>
          <View className="flex-row items-center">
            <Pill size={14} color="#4f46e5" />
            <Text className="text-[11px] font-bold text-slate-600 ml-1.5">
              Meds taken: {takenCount}/{totalCount}
            </Text>
          </View>
        </View>
      </Card>

      {/* 2. TODAY'S MEDICATIONS CARD */}
      <Card 
        title="Today's Medications" 
        subtitle="Tap to check off or log taken doses"
      >
        <View className="mb-3 flex-row justify-between items-center bg-slate-50/60 p-2.5 rounded-xl border border-slate-100">
          <Text className="text-xs font-bold text-slate-600">
            Daily Adherence Progress
          </Text>
          <Text className="text-xs font-black text-slate-900">
            {Math.round(medPercentage)}%
          </Text>
        </View>

        <View className="space-y-2.5">
          {meds.map((med) => (
            <TouchableOpacity
              key={med.id}
              onPress={() => toggleMedication(med.id)}
              className={`flex-row justify-between items-center p-3 rounded-2xl border transition-all duration-300 ${
                med.taken 
                  ? "bg-teal-50/20 border-teal-100" 
                  : "bg-white border-slate-100"
              }`}
            >
              <View className="flex-row items-center flex-1 pr-3">
                <View className="mr-3">
                  <CheckCircle2 
                    size={22} 
                    color={med.taken ? "#0d9488" : "#cbd5e1"} 
                    className="transition-all"
                  />
                </View>
                <View className="flex-1">
                  <Text className={`text-sm font-bold ${med.taken ? "text-slate-500 line-through" : "text-slate-800"}`}>
                    {med.name} {med.dosage}
                  </Text>
                  <View className="flex-row items-center mt-1">
                    <Clock size={12} color="#64748b" />
                    <Text className="text-[10px] text-slate-400 font-bold ml-1">
                      {med.time}
                    </Text>
                  </View>
                </View>
              </View>

              <StatusBadge 
                label={med.taken ? "Taken" : "Pending"} 
                type={med.taken ? "success" : "warning"} 
              />
            </TouchableOpacity>
          ))}
        </View>
      </Card>

      {/* 3. RECENT REPORT CARD */}
      <Card 
        title="Recent Diagnostic Report" 
        subtitle="Received: June 24, 2026"
      >
        <View className="flex-row items-start mb-3">
          <View className="w-10 h-10 rounded-2xl bg-indigo-50/50 justify-center items-center mr-3 border border-indigo-100/30">
            <FileText size={18} color="#4f46e5" />
          </View>
          <View className="flex-1">
            <Text className="text-sm font-extrabold text-slate-800">
              Comprehensive Metabolic Panel
            </Text>
            <Text className="text-[11px] text-slate-500 mt-0.5">
              Analyzed by Quest Laboratories Group
            </Text>
          </View>
        </View>

        {/* Highlighted lab markers */}
        <View className="bg-slate-50 p-3 rounded-xl space-y-2 mb-3 border border-slate-100">
          <View className="flex-row justify-between items-center mb-1.5">
            <Text className="text-xs font-bold text-slate-700">Glucose (Fasting)</Text>
            <View className="flex-row items-center">
              <Text className="text-xs font-black text-slate-800 mr-2">92 mg/dL</Text>
              <StatusBadge label="Normal" type="success" />
            </View>
          </View>
          <View className="flex-row justify-between items-center">
            <Text className="text-xs font-bold text-slate-700">Total Cholesterol</Text>
            <View className="flex-row items-center">
              <Text className="text-xs font-black text-slate-800 mr-2">210 mg/dL</Text>
              <StatusBadge label="Borderline" type="warning" />
            </View>
          </View>
        </View>

        {/* Explainer Summary Bullet */}
        <View className="flex-row items-start bg-indigo-50/20 p-3 rounded-xl border border-indigo-100/30">
          <Sparkles size={14} color="#4f46e5" className="mt-0.5 shrink-0 mr-2" />
          <Text className="text-[11px] text-indigo-900 leading-normal flex-1">
            <Text className="font-bold">MediMind AI Explainer: </Text>
            Your HbA1c and glucose levels suggest normal glycemic control. However, total cholesterol remains slightly elevated. Consider tracking saturated fats.
          </Text>
        </View>

        <TouchableOpacity 
          onPress={() => router.push("/reports")}
          className="flex-row items-center justify-center mt-3 pt-2.5 border-t border-slate-100"
        >
          <Text className="text-xs font-bold text-indigo-600 mr-1.5">
            View full report details
          </Text>
          <ChevronRight size={14} color="#4f46e5" />
        </TouchableOpacity>
      </Card>

      {/* 4. CLINICAL AI INSIGHT CARD */}
      <Card 
        title="Personalized AI Insight" 
        subtitle="Continuous cognitive safety analysis"
        className="bg-teal-50/10 border-teal-100/50"
      >
        <View className="flex-row items-start mb-1.5">
          <View className="w-8 h-8 rounded-xl bg-teal-50 flex items-center justify-center mr-2.5 shrink-0">
            <Sparkles size={16} color="#0d9488" />
          </View>
          <View className="flex-1">
            <Text className="text-[11px] font-black text-teal-800 uppercase tracking-wider">
              Clinical Optimization
            </Text>
            <Text className="text-xs text-slate-700 leading-relaxed mt-1 font-medium">
              Based on your consistent systolic blood pressure averaging 118 mmHg this week, your cardiovascular stress levels remain extremely low. This directly correlates with your 95% medication adherence trend. Keep up the afternoon relaxation routine!
            </Text>
          </View>
        </View>
      </Card>

      {/* 5. QUICK ACTIONS SECTION */}
      <Text className="text-xs font-extrabold text-slate-400 uppercase tracking-widest mb-3.5 px-1 mt-1">
        Clinical Tools Shortcuts
      </Text>
      
      <View className="flex-row space-x-3 mb-5">
        <TouchableOpacity 
          onPress={() => router.push("/chat")}
          className="flex-1 bg-white border border-slate-100 p-4 rounded-3xl items-center shadow-sm"
        >
          <View className="w-10 h-10 rounded-2xl bg-teal-50 justify-center items-center mb-2">
            <MessageSquare size={18} color="#0d9488" />
          </View>
          <Text className="text-xs font-black text-slate-800">AI Companion</Text>
          <Text className="text-[9px] text-slate-400 mt-0.5 text-center">Chat with bot</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          onPress={() => router.push("/reports")}
          className="flex-1 bg-white border border-slate-100 p-4 rounded-3xl items-center shadow-sm"
        >
          <View className="w-10 h-10 rounded-2xl bg-indigo-50 justify-center items-center mb-2">
            <FileText size={18} color="#4f46e5" />
          </View>
          <Text className="text-xs font-black text-slate-800">Lab Explainer</Text>
          <Text className="text-[9px] text-slate-400 mt-0.5 text-center">Parse PDF logs</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          onPress={() => router.push("/medications")}
          className="flex-1 bg-white border border-slate-100 p-4 rounded-3xl items-center shadow-sm"
        >
          <View className="w-10 h-10 rounded-2xl bg-rose-50 justify-center items-center mb-2">
            <Pill size={18} color="#f43f5e" />
          </View>
          <Text className="text-xs font-black text-slate-800">Alarms & Meds</Text>
          <Text className="text-[9px] text-slate-400 mt-0.5 text-center">Manage doses</Text>
        </TouchableOpacity>
      </View>

      {/* 6. UPCOMING APPOINTMENT CARD */}
      <Card 
        title="Upcoming Appointment" 
        subtitle="Scheduled check-in with your provider"
      >
        <View className="flex-row justify-between items-start mb-3">
          <View className="flex-row items-center flex-1 pr-2">
            <View className="w-10 h-10 rounded-2xl bg-amber-50 justify-center items-center mr-3 border border-amber-100/30">
              <CalendarDays size={18} color="#d97706" />
            </View>
            <View className="flex-1">
              <Text className="text-sm font-extrabold text-slate-800">
                Dr. Clara Sterling, MD
              </Text>
              <Text className="text-xs text-slate-500 mt-0.5">
                Cardiology Specialist Clinic
              </Text>
            </View>
          </View>
          <StatusBadge label="In 5 Days" type="neutral" />
        </View>

        {/* Date and Location indicators */}
        <View className="bg-slate-50/80 p-3 rounded-2xl space-y-2 mb-3 border border-slate-100">
          <View className="flex-row items-center">
            <Clock size={14} color="#64748b" className="shrink-0 mr-2.5" />
            <Text className="text-xs font-semibold text-slate-700">
              Thursday, July 2 at 10:30 AM
            </Text>
          </View>
          <View className="flex-row items-start">
            <MapPin size={14} color="#64748b" className="shrink-0 mr-2.5 mt-0.5" />
            <Text className="text-xs font-semibold text-slate-700 leading-normal flex-1">
              Sterling Cardiology Group, Suite 400, Clinical Tower B
            </Text>
          </View>
        </View>

        {/* Action Button */}
        <Button
          title={addedToCalendar ? "✓ Saved to Calendar" : "Add to Calendar"}
          onPress={() => setAddedToCalendar(!addedToCalendar)}
          className={`py-2 rounded-xl text-xs font-bold ${
            addedToCalendar 
              ? "bg-slate-100 text-slate-600 border border-slate-200" 
              : "bg-teal-600 text-white"
          }`}
        />
      </Card>

      {/* Emergency Overlays Link shortcut */}
      <TouchableOpacity 
        onPress={() => router.push("/modal")}
        className="flex-row justify-between items-center p-4 bg-white border border-slate-100 rounded-3xl shadow-sm mb-6"
      >
        <View className="flex-row items-center">
          <View className="w-8 h-8 rounded-full bg-rose-50 justify-center items-center">
            <ShieldAlert size={16} color="#f43f5e" />
          </View>
          <View className="ml-3">
            <Text className="text-xs font-bold text-slate-800">
              Emergency ID Card Overlay
            </Text>
            <Text className="text-[10px] text-slate-400 mt-0.5">
              Open emergency medical information
            </Text>
          </View>
        </View>
        <ChevronRight size={16} color="#64748b" />
      </TouchableOpacity>

      {/* Clinically Compliant Disclaimers */}
      <View className="p-4.5 bg-slate-100 border border-slate-200/60 rounded-3xl mb-4">
        <Text className="text-[10px] text-slate-500 leading-relaxed text-justify">
          <Text className="font-bold">Clinical Disclaimer: </Text>
          {CLINICAL_DISCLAIMER}
        </Text>
      </View>
    </ScreenContainer>
  );
}

