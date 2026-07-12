import React, { useState, useEffect } from "react";
import { 
  Activity, 
  Heart, 
  TrendingUp, 
  Droplet, 
  Pill, 
  Footprints, 
  Moon, 
  Sparkles, 
  Calendar, 
  FileText, 
  Plus, 
  Bell, 
  Video, 
  ChevronRight, 
  AlertOctagon, 
  Clock, 
  UserPlus, 
  Upload,
  Search,
  BookOpen,
  Check
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { HealthMetric, Reminder, UserProfile, MedicalReport } from "../types";

interface HomeDashboardProps {
  onNavigateTab: (tabName: 'home' | 'reports' | 'assistant' | 'meds' | 'profile') => void;
  onTriggerSOS: () => void;
  onOpenAddMedModal: () => void;
  onOpenAppointmentModal: () => void;
}

export default function HomeDashboard({ 
  onNavigateTab, 
  onTriggerSOS, 
  onOpenAddMedModal,
  onOpenAppointmentModal
}: HomeDashboardProps) {
  
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [metrics, setMetrics] = useState<HealthMetric[]>([]);
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [reports, setReports] = useState<MedicalReport[]>([]);
  const [isWaterSubmitting, setIsWaterSubmitting] = useState(false);

  // Load all dashboard state
  const loadDashboardData = async () => {
    try {
      const [pRes, mRes, rRes, repRes] = await Promise.all([
        fetch("/api/profile"),
        fetch("/api/metrics"),
        fetch("/api/reminders"),
        fetch("/api/reports")
      ]);

      const pJson = await pRes.json();
      const mJson = await mRes.json();
      const rJson = await rRes.json();
      const repJson = await repRes.json();

      if (pJson.success) setProfile(pJson.data);
      if (mJson.success) setMetrics(mJson.data);
      if (rJson.success) setReminders(rJson.data);
      if (repJson.success) setReports(repJson.data);
    } catch (e) {
      console.error("Failed to load dashboard data:", e);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  // Filter helper functions
  const bpHistory = metrics.filter(m => m.metricType === 'blood_pressure')
    .sort((a, b) => new Date(a.loggedAt).getTime() - new Date(b.loggedAt).getTime());
  
  const stepsHistory = metrics.filter(m => m.metricType === 'steps')
    .sort((a, b) => new Date(a.loggedAt).getTime() - new Date(b.loggedAt).getTime());

  const waterHistory = metrics.filter(m => m.metricType === 'water')
    .sort((a, b) => new Date(a.loggedAt).getTime() - new Date(b.loggedAt).getTime());

  const sleepHistory = metrics.filter(m => m.metricType === 'sleep')
    .sort((a, b) => new Date(a.loggedAt).getTime() - new Date(b.loggedAt).getTime());

  // Latest readings or fallbacks
  const latestBP = bpHistory[bpHistory.length - 1] || { valuePrimary: 120, valueSecondary: 80 };
  const latestSteps = stepsHistory[stepsHistory.length - 1] || { valuePrimary: 8200 };
  const latestSleep = sleepHistory[sleepHistory.length - 1] || { valuePrimary: 7.2 };

  // Calculate today's water
  const todayWaterSum = (() => {
    const todayStr = new Date().toISOString().split('T')[0];
    const todayLogs = waterHistory.filter(w => w.loggedAt.startsWith(todayStr));
    return todayLogs.reduce((sum, item) => sum + item.valuePrimary, 0);
  })();

  // Calculate medication compliance
  const medStats = (() => {
    const todayReminders = reminders; // standard logs
    const completed = todayReminders.filter(r => r.status !== 'pending');
    const taken = todayReminders.filter(r => r.status === 'taken');
    const rate = completed.length > 0 ? Math.round((taken.length / completed.length) * 100) : 100;
    return { taken: taken.length, total: todayReminders.length, rate };
  })();

  // Metric scores
  const bpScore = (() => {
    const sys = latestBP.valuePrimary;
    const dia = latestBP.valueSecondary || 80;
    const sysPenalty = sys > 120 ? (sys - 120) * 2.5 : 0;
    const diaPenalty = dia > 80 ? (dia - 80) * 3 : 0;
    return Math.max(20, Math.round(100 - sysPenalty - diaPenalty));
  })();

  const stepsScore = Math.min(100, Math.max(10, Math.round((latestSteps.valuePrimary / 10000) * 100)));
  const waterScore = Math.min(100, Math.max(10, Math.round((todayWaterSum / 2000) * 100)));
  const sleepScore = (() => {
    const hrs = latestSleep.valuePrimary;
    if (hrs >= 7.5 && hrs <= 8.5) return 100;
    const diff = Math.abs(hrs - 8);
    return Math.max(30, Math.round(100 - (diff * 25)));
  })();
  const medsScore = medStats.rate;

  // Unified score (Weighted average)
  const unifiedScore = Math.round(
    (bpScore * 0.20) + 
    (stepsScore * 0.20) + 
    (waterScore * 0.15) + 
    (sleepScore * 0.20) + 
    (medsScore * 0.25)
  );

  const getScoreDescription = (score: number) => {
    if (score >= 90) return { label: "Excellent", text: "Your metrics are fully optimized. Stable cardiovascular markers and exceptional medication compliance." };
    if (score >= 75) return { label: "Good", text: "Your metrics are healthy, but slight increases in daily physical steps or sleep intervals can help you reach peak state." };
    return { label: "Moderate", text: "Some medical indicators require alignment. Complete your pending medicine doses and log a fresh blood pressure metric." };
  };

  const scoreLabelInfo = getScoreDescription(unifiedScore);

  // Increment water logger
  const handleLogWater = async (amount: number) => {
    if (isWaterSubmitting) return;
    setIsWaterSubmitting(true);
    try {
      const response = await fetch("/api/metrics", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          metricType: "water",
          valuePrimary: amount,
          valueSecondary: null,
          unit: "mL"
        })
      });
      const json = await response.json();
      if (json.success) {
        await loadDashboardData();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsWaterSubmitting(false);
    }
  };

  // Checkbox toggler for medication reminders
  const handleToggleReminder = async (id: string, currentStatus: string) => {
    const nextStatus = currentStatus === 'taken' ? 'pending' : 'taken';
    try {
      const response = await fetch(`/api/reminders/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus })
      });
      const json = await response.json();
      if (json.success) {
        loadDashboardData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn pb-12">
      
      {/* Header Greeting Panel */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-serif font-black text-slate-900 tracking-tight flex items-center gap-2">
            Good Morning, {profile?.firstName || "Anita"} 👋
          </h1>
          <p className="text-sm text-slate-400 mt-1 font-semibold">
            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
          </p>
        </div>

        {/* Action icons / notifications button */}
        <div className="flex items-center gap-3 self-start md:self-auto">
          <div className="bg-white p-2.5 rounded-2xl border border-slate-100 shadow-premium flex items-center gap-2 text-xs font-bold text-slate-600">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>Live Companion Online</span>
          </div>
          <button 
            onClick={() => alert("Simulated: You have no unread critical medical alerts.")}
            className="w-11 h-11 rounded-2xl bg-white border border-slate-100 shadow-premium flex items-center justify-center text-slate-400 hover:text-slate-600 transition-all relative"
          >
            <Bell className="w-5 h-5" />
            <span className="absolute top-2.5 right-2.5 w-2 h-2 rounded-full bg-rose-500" />
          </button>
        </div>
      </div>

      {/* Primary Analytics Grid: Score & AI Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* LARGE HEALTH SCORE CARD */}
        <div className="lg:col-span-5 bg-gradient-to-br from-brand-teal-900 via-teal-800 to-brand-blue-900 text-white rounded-[28px] p-6 shadow-premium relative overflow-hidden flex flex-col justify-between min-h-[300px]">
          {/* Ambient vector highlights */}
          <div className="absolute -right-16 -top-16 w-56 h-56 rounded-full bg-teal-500/20 blur-[50px]" />
          <div className="absolute -left-16 -bottom-16 w-56 h-56 rounded-full bg-blue-500/20 blur-[50px]" />

          <div className="flex justify-between items-center relative z-10">
            <span className="text-[10px] uppercase font-black tracking-widest bg-white/10 border border-white/20 px-3 py-1 rounded-full text-teal-300">
              Personal Wellness Score
            </span>
            <span className="text-xs text-teal-200/80 font-bold flex items-center gap-1.5">
              <Activity className="w-4 h-4 text-teal-400" />
              Real Adherence Metric
            </span>
          </div>

          <div className="flex items-center gap-8 my-4 relative z-10">
            {/* Real SVG Circular Progress Indicator */}
            <div className="relative w-28 h-28 flex items-center justify-center shrink-0">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  stroke="rgba(255,255,255,0.08)"
                  strokeWidth="8"
                  fill="transparent"
                />
                <motion.circle
                  cx="50"
                  cy="50"
                  r="40"
                  stroke="url(#scoreGradient)"
                  strokeWidth="8"
                  fill="transparent"
                  strokeDasharray={251.2}
                  initial={{ strokeDashoffset: 251.2 }}
                  animate={{ strokeDashoffset: 251.2 - (251.2 * unifiedScore) / 100 }}
                  transition={{ duration: 1.5, ease: "easeOut" }}
                  strokeLinecap="round"
                />
                <defs>
                  <linearGradient id="scoreGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#2dd4bf" />
                    <stop offset="100%" stopColor="#3b82f6" />
                  </linearGradient>
                </defs>
              </svg>
              <div className="absolute flex flex-col items-center">
                <span className="text-3xl font-black tracking-tight">{unifiedScore}</span>
                <span className="text-[9px] text-teal-200/60 font-black uppercase">/100</span>
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                <h3 className="text-xl font-serif font-bold text-white leading-none">{scoreLabelInfo.label} State</h3>
              </div>
              <p className="text-[11px] text-teal-100/70 leading-relaxed font-light mt-1">
                {scoreLabelInfo.text}
              </p>
            </div>
          </div>

          <button 
            onClick={() => onNavigateTab('profile')}
            className="w-full bg-white/10 hover:bg-white/15 text-white text-xs font-extrabold uppercase tracking-wider py-3.5 rounded-2xl transition-all border border-white/10 flex items-center justify-center gap-1.5 relative z-10"
          >
            <span>View Detailed Vitals Breakdown</span>
            <ChevronRight className="w-4 h-4 text-teal-300" />
          </button>
        </div>

        {/* AI INSIGHT CARD */}
        <div className="lg:col-span-7 bg-white rounded-[28px] p-6 border border-slate-100 shadow-premium flex flex-col justify-between min-h-[300px]">
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600">
                <Sparkles className="w-5.5 h-5.5" />
              </div>
              <div>
                <h4 className="text-xs font-black uppercase tracking-wider text-slate-400">Clinical AI Assistant Advice</h4>
                <p className="text-xs text-slate-800 font-extrabold mt-0.5">Automated Bio-marker Synthesis</p>
              </div>
            </div>
            <span className="text-[9px] uppercase font-bold tracking-wider bg-indigo-50 text-indigo-600 border border-indigo-100 px-2.5 py-0.5 rounded-full">
              Updated Hourly
            </span>
          </div>

          <div className="bg-gradient-to-r from-indigo-50/50 to-brand-blue-50/20 border border-indigo-100/30 rounded-2xl p-4.5 my-4">
            <p className="text-xs text-slate-600 leading-relaxed font-medium">
              "Good morning, {profile?.firstName || "Anita"}. Based on last night's <span className="text-indigo-900 font-bold">7.2 hrs</span> sleep cycle and yesterday's metabolic log, your cardiovascular recovery looks excellent. Your blood pressure has hovered around <span className="text-indigo-900 font-bold">128/84 mmHg</span>. Keep today's water target of <span className="text-teal-700 font-bold">2,000 mL</span> and take your Metformin exactly with breakfast to ensure metabolic optimization."
            </p>
          </div>

          <button
            onClick={() => onNavigateTab('assistant')}
            className="w-full bg-indigo-50 hover:bg-indigo-100 text-indigo-600 text-xs font-extrabold uppercase tracking-wider py-3.5 rounded-2xl transition-all flex items-center justify-center gap-1.5"
          >
            <Sparkles className="w-4 h-4 text-indigo-500" />
            <span>Consult Your Doctor's Custom Agent</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

      </div>

      {/* Middle row: Interactive Widgets & Checklists */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* TODAY'S MEDICATIONS CHECKLIST */}
        <div className="bg-white rounded-[28px] p-6 border border-slate-100 shadow-premium flex flex-col justify-between space-y-4">
          <div className="flex justify-between items-center pb-2 border-b border-slate-100">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-teal-50 text-brand-teal-500 flex items-center justify-center">
                <Pill className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-serif font-bold text-slate-900 text-md">Today's Reminders</h3>
                <p className="text-[10px] text-slate-400 font-bold mt-0.5">Adherence Rate: {medStats.rate}%</p>
              </div>
            </div>
            
            <button 
              onClick={() => onNavigateTab('meds')}
              className="text-[10px] font-extrabold text-brand-teal-600 uppercase tracking-widest hover:underline"
            >
              See Schedule
            </button>
          </div>

          <div className="space-y-3 flex-1 overflow-y-auto max-h-[160px] pr-1">
            {reminders.length === 0 ? (
              <div className="text-center py-6 text-xs text-slate-400 font-medium">No medication reminders logged today.</div>
            ) : (
              reminders.map(rem => (
                <div 
                  key={rem.id}
                  onClick={() => handleToggleReminder(rem.id, rem.status)}
                  className={`p-3.5 rounded-2xl border cursor-pointer transition-all flex items-center justify-between ${
                    rem.status === 'taken'
                      ? 'bg-emerald-50/40 border-emerald-100 text-slate-500'
                      : 'bg-slate-50 border-slate-100 hover:bg-white hover:shadow-sm'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                      rem.status === 'taken' ? 'bg-emerald-500 text-white' : 'bg-slate-200 text-slate-500'
                    }`}>
                      <Check className="w-4 h-4" />
                    </div>
                    <div>
                      <p className={`text-xs font-black ${rem.status === 'taken' ? 'line-through text-slate-400' : 'text-slate-800'}`}>
                        {rem.medicineName}
                      </p>
                      <p className="text-[9px] text-slate-400 font-bold mt-0.5 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {rem.scheduledTime}
                      </p>
                    </div>
                  </div>

                  <span className={`text-[9px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full ${
                    rem.status === 'taken' 
                      ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' 
                      : 'bg-amber-50 text-amber-600 border border-amber-100'
                  }`}>
                    {rem.status === 'taken' ? 'Taken' : 'Pending'}
                  </span>
                </div>
              ))
            )}
          </div>

          <button 
            onClick={onOpenAddMedModal}
            className="w-full border border-teal-200 bg-teal-50 hover:bg-teal-100 text-brand-teal-600 font-extrabold text-xs py-3 rounded-2xl transition-all uppercase tracking-wider flex items-center justify-center gap-1"
          >
            <Plus className="w-4 h-4" />
            <span>Add Prescription Reminder</span>
          </button>
        </div>

        {/* WATER INTAKE PROGRESS MODULE */}
        <div className="bg-white rounded-[28px] p-6 border border-slate-100 shadow-premium flex flex-col justify-between space-y-4">
          <div className="flex justify-between items-center pb-2 border-b border-slate-100">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-blue-50 text-brand-blue-500 flex items-center justify-center">
                <Droplet className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-serif font-bold text-slate-900 text-md">Water Hydration</h3>
                <p className="text-[10px] text-slate-400 font-bold mt-0.5">Daily Goal: 2,000 mL</p>
              </div>
            </div>

            <span className="text-xs font-bold text-slate-700">
              {todayWaterSum} / 2000 mL
            </span>
          </div>

          {/* Water progress indicator bar */}
          <div className="space-y-3 py-2">
            <div className="w-full h-3 bg-slate-50 border border-slate-100 rounded-full overflow-hidden">
              <motion.div 
                className="h-full bg-gradient-to-r from-blue-400 to-indigo-500 rounded-full"
                animate={{ width: `${Math.min(100, (todayWaterSum / 2000) * 100)}%` }}
                transition={{ duration: 0.8 }}
              />
            </div>
            <p className="text-[10px] text-slate-400 leading-normal font-semibold">
              Keeping hydrated maintains cell permeability, assists kidney clearance of Metformin, and coordinates systemic temperature control.
            </p>
          </div>

          {/* Incremental water logs grid */}
          <div className="grid grid-cols-2 gap-3 pt-1">
            <button 
              onClick={() => handleLogWater(250)}
              disabled={isWaterSubmitting}
              className="bg-brand-blue-50/40 hover:bg-brand-blue-50 border border-brand-blue-100 text-brand-blue-600 rounded-2xl py-3.5 text-xs font-extrabold transition-all flex items-center justify-center gap-1.5"
            >
              <Droplet className="w-4 h-4" />
              <span>+250 mL Cup</span>
            </button>
            <button 
              onClick={() => handleLogWater(500)}
              disabled={isWaterSubmitting}
              className="bg-brand-blue-500 hover:bg-brand-blue-600 text-white rounded-2xl py-3.5 text-xs font-black transition-all flex items-center justify-center gap-1.5 shadow-sm"
            >
              <Droplet className="w-4 h-4 text-sky-200" />
              <span>+500 mL Bottle</span>
            </button>
          </div>
        </div>

      </div>

      {/* Third Row: Upcoming Appointments & Recent Reports */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* UPCOMING CLINICAL APPOINTMENT */}
        <div className="bg-white rounded-[28px] p-6 border border-slate-100 shadow-premium flex flex-col justify-between min-h-[220px]">
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-orange-50 text-orange-500 flex items-center justify-center">
                <Video className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-black uppercase tracking-wider text-slate-400">Next Scheduled Visit</h4>
                <h3 className="text-md font-serif font-bold text-slate-900 mt-0.5">Telehealth Consultation</h3>
              </div>
            </div>
            
            <span className="text-[9px] bg-orange-50 text-orange-600 border border-orange-100 px-2 rounded-full font-bold uppercase tracking-wider animate-pulse">
              Joinable
            </span>
          </div>

          <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 my-3 flex items-center justify-between">
            <div>
              <p className="text-xs font-black text-slate-800">Dr. Susan Jenkins, MD</p>
              <p className="text-[10px] text-slate-400 font-extrabold mt-0.5 uppercase">Cardiology & Endocrinology Care</p>
              <p className="text-[9px] text-brand-teal-600 font-black mt-2 bg-brand-teal-50 px-2 py-0.5 rounded-lg inline-block">
                Today at 2:00 PM (EDT)
              </p>
            </div>
            
            <div className="w-12 h-12 rounded-2xl bg-slate-200 overflow-hidden flex items-center justify-center font-bold text-slate-500">
              SJ
            </div>
          </div>

          <button 
            onClick={onOpenAppointmentModal}
            className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white text-xs font-black uppercase tracking-wider py-3.5 rounded-2xl transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-1.5"
          >
            <Video className="w-4 h-4 text-orange-200" />
            <span>Join Secure Telehealth Room</span>
          </button>
        </div>

        {/* RECENT MEDICAL REPORT */}
        <div className="bg-white rounded-[28px] p-6 border border-slate-100 shadow-premium flex flex-col justify-between min-h-[220px]">
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-violet-50 text-violet-600 flex items-center justify-center">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-black uppercase tracking-wider text-slate-400">Diagnostic Records</h4>
                <h3 className="text-md font-serif font-bold text-slate-900 mt-0.5">Recent Metabolic Report</h3>
              </div>
            </div>

            <span className="text-[9px] bg-emerald-50 text-emerald-600 border border-emerald-100 px-2 rounded-full font-bold uppercase tracking-wider">
              Normal
            </span>
          </div>

          <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 my-3 flex items-center justify-between">
            <div>
              <p className="text-xs font-black text-slate-800">
                {reports[0]?.reportName || "Comprehensive Lipid Blood Panel"}
              </p>
              <p className="text-[10px] text-slate-400 font-extrabold mt-0.5 uppercase">
                Specimen Collected: {reports[0] ? new Date(reports[0].uploadDate).toLocaleDateString() : "June 26, 2026"}
              </p>
              <p className="text-[10px] text-violet-700 font-extrabold mt-2 flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5" />
                AI Summary Synced
              </p>
            </div>
            
            <div className="w-11 h-11 rounded-xl bg-violet-50 text-violet-500 flex items-center justify-center">
              <FileText className="w-5 h-5" />
            </div>
          </div>

          <button 
            onClick={() => onNavigateTab('reports')}
            className="w-full bg-violet-50 hover:bg-violet-100 text-violet-600 text-xs font-extrabold uppercase tracking-wider py-3.5 rounded-2xl transition-all flex items-center justify-center gap-1.5"
          >
            <Sparkles className="w-4 h-4 text-violet-500" />
            <span>View Translated Report Analysis</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

      </div>

      {/* QUICK ACTIONS SECTION (Elegant 4-Column Grid) */}
      <div className="space-y-4 pt-4">
        <h3 className="text-xs font-extrabold uppercase tracking-widest text-slate-400">Quick Patient Actions</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          
          <button 
            onClick={() => onNavigateTab('reports')}
            className="bg-white hover:bg-slate-50 border border-slate-100 p-5 rounded-2xl text-left transition-all hover:-translate-y-1 hover:shadow-premium flex flex-col justify-between h-28"
          >
            <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Upload className="w-4.5 h-4.5" />
            </div>
            <span className="text-xs font-black text-slate-800">Upload Lab Report</span>
          </button>

          <button 
            onClick={() => onNavigateTab('assistant')}
            className="bg-white hover:bg-slate-50 border border-slate-100 p-5 rounded-2xl text-left transition-all hover:-translate-y-1 hover:shadow-premium flex flex-col justify-between h-28"
          >
            <div className="w-9 h-9 rounded-xl bg-teal-50 text-brand-teal-500 flex items-center justify-center">
              <Sparkles className="w-4.5 h-4.5" />
            </div>
            <span className="text-xs font-black text-slate-800">Consult Clinical AI</span>
          </button>

          <button 
            onClick={onOpenAddMedModal}
            className="bg-white hover:bg-slate-50 border border-slate-100 p-5 rounded-2xl text-left transition-all hover:-translate-y-1 hover:shadow-premium flex flex-col justify-between h-28"
          >
            <div className="w-9 h-9 rounded-xl bg-violet-50 text-violet-600 flex items-center justify-center">
              <Pill className="w-4.5 h-4.5" />
            </div>
            <span className="text-xs font-black text-slate-800">Add Prescription</span>
          </button>

          <button 
            onClick={onTriggerSOS}
            className="bg-rose-50 hover:bg-rose-100 border border-rose-100/60 p-5 rounded-2xl text-left transition-all hover:-translate-y-1 hover:shadow-md flex flex-col justify-between h-28"
          >
            <div className="w-9 h-9 rounded-xl bg-rose-600 text-white flex items-center justify-center animate-pulse">
              <AlertOctagon className="w-4.5 h-4.5" />
            </div>
            <span className="text-xs font-black text-rose-800">Emergency SOS</span>
          </button>

        </div>
      </div>

    </div>
  );
}
