import React, { useState, useEffect } from "react";
import { HealthMetric, Reminder } from "../types";
import { 
  Activity, 
  Plus, 
  Heart, 
  ShieldAlert, 
  CheckCircle2, 
  Moon, 
  Droplet, 
  Pill, 
  Footprints, 
  Info, 
  TrendingUp, 
  Sparkles, 
  Trash2, 
  Check, 
  X,
  PlusCircle,
  HelpCircle,
  Zap,
  ChevronRight,
  Sliders,
  Calendar
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

export default function MetricsTracker() {
  const [metrics, setMetrics] = useState<HealthMetric[]>([]);
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [activeMetricTab, setActiveMetricTab] = useState<'bp' | 'steps' | 'water' | 'sleep' | 'meds'>('bp');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form states
  const [sysInput, setSysInput] = useState("120");
  const [diaInput, setDiaInput] = useState("80");
  const [stepsInput, setStepsInput] = useState("8500");
  const [waterInput, setWaterInput] = useState("250");
  const [sleepInput, setSleepInput] = useState("8");

  // Load all data from API
  const loadAllData = async () => {
    try {
      const [mRes, rRes] = await Promise.all([
        fetch("/api/metrics"),
        fetch("/api/reminders")
      ]);
      const mJson = await mRes.json();
      const rJson = await rRes.json();

      if (mJson.success) {
        setMetrics(mJson.data);
      }
      if (rJson.success) {
        setReminders(rJson.data);
      }
    } catch (e) {
      console.error("Error loading dashboard data:", e);
    }
  };

  useEffect(() => {
    loadAllData();
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

  // Derive latest values or fallbacks
  const latestBP = bpHistory[bpHistory.length - 1] || { valuePrimary: 120, valueSecondary: 80, loggedAt: new Date().toISOString() };
  const latestSteps = stepsHistory[stepsHistory.length - 1] || { valuePrimary: 8000, loggedAt: new Date().toISOString() };
  const latestSleep = sleepHistory[sleepHistory.length - 1] || { valuePrimary: 7.5, loggedAt: new Date().toISOString() };

  // Sum today's logged water
  const todayWaterSum = (() => {
    const todayStr = new Date().toISOString().split('T')[0];
    const todayLogs = waterHistory.filter(w => w.loggedAt.startsWith(todayStr));
    if (todayLogs.length > 0) {
      return todayLogs.reduce((sum, item) => sum + item.valuePrimary, 0);
    }
    // Fallback to latest record if nothing logged today
    const latest = waterHistory[waterHistory.length - 1];
    return latest ? latest.valuePrimary : 1200; 
  })();

  // Calculate Medication Adherence
  const medStats = (() => {
    const logged = reminders.filter(r => r.status !== 'pending');
    const taken = reminders.filter(r => r.status === 'taken');
    const total = logged.length;
    const rate = total > 0 ? Math.round((taken.length / total) * 100) : 100;
    return { total, taken: taken.length, rate };
  })();

  // ----------------------------------------------------
  // INDIVIDUAL COMPONENT SCORE CALCULATIONS
  // ----------------------------------------------------
  
  // 1. Blood Pressure Score (20% Weight)
  const bpScore = (() => {
    const sys = latestBP.valuePrimary;
    const dia = latestBP.valueSecondary || 80;
    const sysPenalty = sys > 120 ? (sys - 120) * 2.5 : 0;
    const diaPenalty = dia > 80 ? (dia - 80) * 3 : 0;
    return Math.max(20, Math.round(100 - sysPenalty - diaPenalty));
  })();

  // 2. Steps Score (20% Weight)
  const stepsScore = (() => {
    const steps = latestSteps.valuePrimary;
    return Math.min(100, Math.max(10, Math.round((steps / 10000) * 100)));
  })();

  // 3. Water Score (15% Weight)
  const waterScore = (() => {
    return Math.min(100, Math.max(10, Math.round((todayWaterSum / 2000) * 100)));
  })();

  // 4. Sleep Score (20% Weight)
  const sleepScore = (() => {
    const hrs = latestSleep.valuePrimary;
    // Ideal is 7.5 to 8.5
    if (hrs >= 7.5 && hrs <= 8.5) return 100;
    const diff = Math.abs(hrs - 8);
    return Math.max(30, Math.round(100 - (diff * 25)));
  })();

  // 5. Medication Adherence Score (25% Weight)
  const medsScore = medStats.rate;

  // Unified health score
  const unifiedHealthScore = Math.round(
    (bpScore * 0.20) + 
    (stepsScore * 0.20) + 
    (waterScore * 0.15) + 
    (sleepScore * 0.20) + 
    (medsScore * 0.25)
  );

  // Status descriptor
  const getScoreRating = (score: number) => {
    if (score >= 90) return { label: "Optimal Health Status", color: "text-emerald-600 bg-emerald-50 border-emerald-200", badge: "bg-emerald-500", desc: "Your metrics indicate strong metabolic alignment and stable vitals. Keep up the perfect medication compliance and hydration schedules!" };
    if (score >= 75) return { label: "Good Health Status", color: "text-blue-600 bg-blue-50 border-blue-200", badge: "bg-blue-500", desc: "You maintain stable parameters. Small adjustments to daily steps or blood pressure targets can help propel you into the optimal zone." };
    if (score >= 60) return { label: "Fair Baseline State", color: "text-amber-600 bg-amber-50 border-amber-200", badge: "bg-amber-500", desc: "Some clinical markers are moderately out of bounds. Prioritize taking scheduled medication doses on time and keeping hydrated." };
    return { label: "Attention Advised", color: "text-rose-600 bg-rose-50 border-rose-200", badge: "bg-rose-500", desc: "Multiple vitals or adherence levels are compromised. Double check your pending prescription reminders, log active vitals, and consult Dr. Jenkins." };
  };

  const currentRating = getScoreRating(unifiedHealthScore);

  // Submitter handler
  const handleLogMetric = async (type: 'blood_pressure' | 'steps' | 'water' | 'sleep', primary: number, secondary: number | null, unit: string) => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    try {
      const response = await fetch("/api/metrics", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          metricType: type,
          valuePrimary: primary,
          valueSecondary: secondary,
          unit
        })
      });
      const json = await response.json();
      if (json.success) {
        await loadAllData();
      }
    } catch (err) {
      console.error("Error logging metric:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleReminder = async (id: string, status: 'taken' | 'skipped') => {
    try {
      const res = await fetch(`/api/reminders/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status })
      });
      const json = await res.json();
      if (json.success) {
        await loadAllData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Helper to determine blood pressure category
  const getBPCategory = (sys: number, dia: number) => {
    if (sys > 140 || dia > 90) return { label: "Hypertension Stage 2", color: "text-rose-600 bg-rose-50 border-rose-200", isOptimal: false };
    if (sys >= 130 || dia >= 80) return { label: "Hypertension Stage 1", color: "text-amber-600 bg-amber-50 border-amber-200", isOptimal: false };
    if (sys >= 120 && sys < 130 && dia < 80) return { label: "Elevated BP", color: "text-yellow-600 bg-yellow-50 border-yellow-200", isOptimal: false };
    return { label: "Normal Healthy", color: "text-emerald-600 bg-emerald-50 border-emerald-200", isOptimal: true };
  };

  // Custom coordinate calculator for SVGs
  const getChartPoints = (data: number[], min: number, max: number, width: number, height: number, padding: number) => {
    if (data.length === 0) return "";
    const range = max - min || 1;
    return data.map((val, idx) => {
      const x = padding + (idx / Math.max(1, data.length - 1)) * (width - padding * 2);
      const y = height - padding - ((val - min) / range) * (height - padding * 2);
      return `${idx === 0 ? 'M' : 'L'} ${x} ${y}`;
    }).join(" ");
  };

  return (
    <div className="space-y-6">
      {/* ========================================================
         SECTION 1: UNIFIED HEALTH SCORE CORE HEADER (REAL ENGINE)
         ======================================================== */}
      <div className="bg-white rounded-3xl border border-gray-200 shadow-premium p-6 md:p-8 relative overflow-hidden">
        {/* Ambient grid bg decoration */}
        <div className="absolute inset-0 bg-[radial-gradient(#0ea5e9_1px,transparent_1px)] [background-size:16px_16px] opacity-[0.03]" />

        <div className="relative flex flex-col lg:flex-row items-center gap-8 justify-between">
          
          {/* Gauge Column */}
          <div className="flex items-center gap-6 shrink-0">
            <div className="relative w-36 h-36 flex items-center justify-center">
              {/* Animated outer ring */}
              <svg className="absolute w-full h-full transform -rotate-90">
                <circle
                  cx="72"
                  cy="72"
                  r="62"
                  stroke="#f1f5f9"
                  strokeWidth="10"
                  fill="transparent"
                />
                <motion.circle
                  cx="72"
                  cy="72"
                  r="62"
                  stroke="url(#scoreGradient)"
                  strokeWidth="10"
                  fill="transparent"
                  strokeDasharray={389.5}
                  initial={{ strokeDashoffset: 389.5 }}
                  animate={{ strokeDashoffset: 389.5 - (389.5 * unifiedHealthScore) / 100 }}
                  transition={{ duration: 1.5, ease: "easeOut" }}
                  strokeLinecap="round"
                />
                <defs>
                  <linearGradient id="scoreGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#10b981" />
                    <stop offset="50%" stopColor="#3b82f6" />
                    <stop offset="100%" stopColor="#8b5cf6" />
                  </linearGradient>
                </defs>
              </svg>

              {/* Inside gauge text */}
              <div className="text-center">
                <motion.span 
                  key={unifiedHealthScore}
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="text-4xl font-extrabold text-slate-800 tracking-tight"
                >
                  {unifiedHealthScore}
                </motion.span>
                <div className="text-[10px] text-slate-400 font-extrabold uppercase tracking-widest mt-0.5">Health Index</div>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-xs uppercase tracking-wider font-extrabold bg-blue-50 text-blue-700 px-3 py-1 rounded-full border border-blue-100">
                  Real-time Core Calculation
                </span>
                <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-500 animate-ping" />
              </div>
              <h2 className="text-lg font-serif font-bold text-slate-900 tracking-tight flex items-center gap-1.5">
                Clinical Health Score Engine
              </h2>
              <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black border uppercase tracking-wider ${currentRating.color}`}>
                <Sparkles className="w-3 h-3" />
                {currentRating.label}
              </div>
            </div>
          </div>

          {/* Interactive Calculation Matrix Breakdown */}
          <div className="flex-1 max-w-xl w-full grid grid-cols-2 md:grid-cols-5 gap-3">
            {/* BP Matrix item */}
            <button 
              onClick={() => setActiveMetricTab('bp')}
              className={`p-3 rounded-2xl border transition text-left relative ${
                activeMetricTab === 'bp' ? 'bg-rose-50/50 border-rose-300' : 'bg-gray-50 border-gray-100 hover:border-gray-200'
              }`}
            >
              <Heart className={`w-4 h-4 mb-2 ${bpScore >= 80 ? 'text-rose-500' : 'text-amber-500'}`} />
              <div className="text-[9px] uppercase tracking-wider font-extrabold text-slate-400">Cardio / BP</div>
              <p className="text-md font-black text-slate-800 mt-1">{latestBP.valuePrimary}/{latestBP.valueSecondary}</p>
              <span className="text-[8px] bg-white/80 px-1.5 py-0.5 rounded border border-gray-200 font-bold text-slate-500 mt-1 block">
                Contrib: {bpScore}/100
              </span>
            </button>

            {/* Steps Matrix item */}
            <button 
              onClick={() => setActiveMetricTab('steps')}
              className={`p-3 rounded-2xl border transition text-left relative ${
                activeMetricTab === 'steps' ? 'bg-indigo-50/50 border-indigo-300' : 'bg-gray-50 border-gray-100 hover:border-gray-200'
              }`}
            >
              <Footprints className="w-4 h-4 mb-2 text-indigo-500" />
              <div className="text-[9px] uppercase tracking-wider font-extrabold text-slate-400">Daily Steps</div>
              <p className="text-md font-black text-slate-800 mt-1">{latestSteps.valuePrimary.toLocaleString()}</p>
              <span className="text-[8px] bg-white/80 px-1.5 py-0.5 rounded border border-gray-200 font-bold text-slate-500 mt-1 block">
                Contrib: {stepsScore}/100
              </span>
            </button>

            {/* Water Matrix item */}
            <button 
              onClick={() => setActiveMetricTab('water')}
              className={`p-3 rounded-2xl border transition text-left relative ${
                activeMetricTab === 'water' ? 'bg-sky-50/50 border-sky-300' : 'bg-gray-50 border-gray-100 hover:border-gray-200'
              }`}
            >
              <Droplet className="w-4 h-4 mb-2 text-sky-500" />
              <div className="text-[9px] uppercase tracking-wider font-extrabold text-slate-400">Water Log</div>
              <p className="text-md font-black text-slate-800 mt-1">{todayWaterSum} <span className="text-[9px] font-medium text-slate-400">mL</span></p>
              <span className="text-[8px] bg-white/80 px-1.5 py-0.5 rounded border border-gray-200 font-bold text-slate-500 mt-1 block">
                Contrib: {waterScore}/100
              </span>
            </button>

            {/* Sleep Matrix item */}
            <button 
              onClick={() => setActiveMetricTab('sleep')}
              className={`p-3 rounded-2xl border transition text-left relative ${
                activeMetricTab === 'sleep' ? 'bg-amber-50/50 border-amber-300' : 'bg-gray-50 border-gray-100 hover:border-gray-200'
              }`}
            >
              <Moon className="w-4 h-4 mb-2 text-amber-500" />
              <div className="text-[9px] uppercase tracking-wider font-extrabold text-slate-400">Night Sleep</div>
              <p className="text-md font-black text-slate-800 mt-1">{latestSleep.valuePrimary} <span className="text-[9px] font-medium text-slate-400">hrs</span></p>
              <span className="text-[8px] bg-white/80 px-1.5 py-0.5 rounded border border-gray-200 font-bold text-slate-500 mt-1 block">
                Contrib: {sleepScore}/100
              </span>
            </button>

            {/* Meds Adherence Matrix item */}
            <button 
              onClick={() => setActiveMetricTab('meds')}
              className={`p-3 rounded-2xl border transition text-left relative col-span-2 md:col-span-1 ${
                activeMetricTab === 'meds' ? 'bg-emerald-50/50 border-emerald-300' : 'bg-gray-50 border-gray-100 hover:border-gray-200'
              }`}
            >
              <Pill className="w-4 h-4 mb-2 text-emerald-500" />
              <div className="text-[9px] uppercase tracking-wider font-extrabold text-slate-400">Meds Rate</div>
              <p className="text-md font-black text-slate-800 mt-1">{medStats.rate}%</p>
              <span className="text-[8px] bg-white/80 px-1.5 py-0.5 rounded border border-gray-200 font-bold text-slate-500 mt-1 block">
                Contrib: {medsScore}/100
              </span>
            </button>
          </div>

        </div>

        {/* Informative advice banner */}
        <div className="mt-6 pt-5 border-t border-gray-100 flex items-start gap-3">
          <div className="p-1.5 bg-sky-50 text-sky-600 rounded-lg shrink-0 mt-0.5">
            <Info className="w-4 h-4" />
          </div>
          <p className="text-xs text-slate-500 leading-relaxed font-medium">
            <strong className="text-slate-800 font-bold">Clinical Advice: </strong>
            {currentRating.desc}
          </p>
        </div>
      </div>

      {/* ========================================================
         SECTION 2: DYNAMIC METRICS BOARD & INTERACTIVE TABS (REAL ANALYTICS)
         ======================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Navigation Rail for metrics tabs */}
        <div className="lg:col-span-3 space-y-2">
          <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block px-2 mb-1">Select Vitals Board</span>
          
          <button
            onClick={() => setActiveMetricTab('bp')}
            className={`w-full flex items-center justify-between p-4 rounded-2xl border text-left transition ${
              activeMetricTab === 'bp' 
                ? 'bg-gradient-to-r from-rose-50 to-white border-rose-200 text-slate-800 shadow-sm' 
                : 'bg-white border-gray-200 text-slate-600 hover:border-gray-300'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-xl ${activeMetricTab === 'bp' ? 'bg-rose-500 text-white' : 'bg-rose-50 text-rose-500'}`}>
                <Heart className="w-4.5 h-4.5" />
              </div>
              <div>
                <span className="text-xs font-bold block">Blood Pressure</span>
                <span className="text-[10px] text-slate-400 block font-semibold">{latestBP.valuePrimary}/{latestBP.valueSecondary} mmHg</span>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400" />
          </button>

          <button
            onClick={() => setActiveMetricTab('steps')}
            className={`w-full flex items-center justify-between p-4 rounded-2xl border text-left transition ${
              activeMetricTab === 'steps' 
                ? 'bg-gradient-to-r from-indigo-50 to-white border-indigo-200 text-slate-800 shadow-sm' 
                : 'bg-white border-gray-200 text-slate-600 hover:border-gray-300'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-xl ${activeMetricTab === 'steps' ? 'bg-indigo-500 text-white' : 'bg-indigo-50 text-indigo-500'}`}>
                <Footprints className="w-4.5 h-4.5" />
              </div>
              <div>
                <span className="text-xs font-bold block">Daily Steps</span>
                <span className="text-[10px] text-slate-400 block font-semibold">{latestSteps.valuePrimary.toLocaleString()} / 10k</span>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400" />
          </button>

          <button
            onClick={() => setActiveMetricTab('water')}
            className={`w-full flex items-center justify-between p-4 rounded-2xl border text-left transition ${
              activeMetricTab === 'water' 
                ? 'bg-gradient-to-r from-sky-50 to-white border-sky-200 text-slate-800 shadow-sm' 
                : 'bg-white border-gray-200 text-slate-600 hover:border-gray-300'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-xl ${activeMetricTab === 'water' ? 'bg-sky-500 text-white' : 'bg-sky-50 text-sky-500'}`}>
                <Droplet className="w-4.5 h-4.5" />
              </div>
              <div>
                <span className="text-xs font-bold block">Water Hydration</span>
                <span className="text-[10px] text-slate-400 block font-semibold">{todayWaterSum} mL today</span>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400" />
          </button>

          <button
            onClick={() => setActiveMetricTab('sleep')}
            className={`w-full flex items-center justify-between p-4 rounded-2xl border text-left transition ${
              activeMetricTab === 'sleep' 
                ? 'bg-gradient-to-r from-amber-50 to-white border-amber-200 text-slate-800 shadow-sm' 
                : 'bg-white border-gray-200 text-slate-600 hover:border-gray-300'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-xl ${activeMetricTab === 'sleep' ? 'bg-amber-500 text-white' : 'bg-amber-50 text-amber-500'}`}>
                <Moon className="w-4.5 h-4.5" />
              </div>
              <div>
                <span className="text-xs font-bold block">Sleep Quality</span>
                <span className="text-[10px] text-slate-400 block font-semibold">{latestSleep.valuePrimary} hours logged</span>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400" />
          </button>

          <button
            onClick={() => setActiveMetricTab('meds')}
            className={`w-full flex items-center justify-between p-4 rounded-2xl border text-left transition ${
              activeMetricTab === 'meds' 
                ? 'bg-gradient-to-r from-emerald-50 to-white border-emerald-200 text-slate-800 shadow-sm' 
                : 'bg-white border-gray-200 text-slate-600 hover:border-gray-300'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-xl ${activeMetricTab === 'meds' ? 'bg-emerald-500 text-white' : 'bg-emerald-50 text-emerald-500'}`}>
                <Pill className="w-4.5 h-4.5" />
              </div>
              <div>
                <span className="text-xs font-bold block">Adherence Rate</span>
                <span className="text-[10px] text-slate-400 block font-semibold">{medStats.rate}% compliance</span>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400" />
          </button>
        </div>

        {/* Interactive Vitals Display Cards with real SVG analytics */}
        <div className="lg:col-span-9 bg-white rounded-3xl border border-gray-200 p-6 shadow-premium min-h-[460px]">
          
          <AnimatePresence mode="wait">
            {/* 1. BLOOD PRESSURE MODULE */}
            {activeMetricTab === 'bp' && (
              <motion.div
                key="bp-module"
                initial={{ opacity: 0, x: 15 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -15 }}
                className="space-y-6"
              >
                <div className="flex items-center justify-between border-b border-gray-100 pb-4">
                  <div className="flex items-center gap-2">
                    <Heart className="w-5 h-5 text-rose-500" />
                    <h3 className="text-sm font-bold text-slate-800">Blood Pressure Trends & Analysis</h3>
                  </div>
                  <span className={`text-[10px] uppercase font-black px-3 py-1 rounded-full border ${getBPCategory(latestBP.valuePrimary, latestBP.valueSecondary || 80).color}`}>
                    {getBPCategory(latestBP.valuePrimary, latestBP.valueSecondary || 80).label}
                  </span>
                </div>

                {/* SVG Graph */}
                <div className="bg-gray-50/50 rounded-2xl p-4 border border-gray-100 relative">
                  <span className="text-[9px] uppercase tracking-wider font-extrabold text-slate-400 block mb-2">mmHg Timeline (Systolic vs Diastolic)</span>
                  
                  {bpHistory.length > 0 ? (
                    <svg viewBox="0 0 600 200" className="w-full h-44 overflow-visible">
                      {/* Grid Lines */}
                      {[60, 90, 120, 150].map((val, i) => {
                        const y = 200 - 30 - ((val - 50) / 110) * 140;
                        return (
                          <g key={i}>
                            <line x1="40" y1={y} x2="560" y2={y} stroke="#e2e8f0" strokeDasharray="3 3" />
                            <text x="32" y={y + 4} textAnchor="end" className="fill-slate-400 text-[9px] font-mono">{val}</text>
                          </g>
                        );
                      })}

                      {/* Systolic Line */}
                      <path
                        d={getChartPoints(bpHistory.map(h => h.valuePrimary), 50, 160, 600, 200, 40)}
                        fill="none"
                        stroke="#f43f5e"
                        strokeWidth="3"
                        strokeLinecap="round"
                      />

                      {/* Diastolic Line */}
                      <path
                        d={getChartPoints(bpHistory.map(h => h.valueSecondary || 80), 50, 160, 600, 200, 40)}
                        fill="none"
                        stroke="#3b82f6"
                        strokeWidth="2"
                        strokeLinecap="round"
                      />

                      {/* Dots */}
                      {bpHistory.map((m, idx) => {
                        const x = 40 + (idx / Math.max(1, bpHistory.length - 1)) * 520;
                        const ySys = 200 - 30 - ((m.valuePrimary - 50) / 110) * 140;
                        const yDia = 200 - 30 - (((m.valueSecondary || 80) - 50) / 110) * 140;
                        return (
                          <g key={idx}>
                            <circle cx={x} cy={ySys} r="4.5" className="fill-rose-500 stroke-white stroke-2 cursor-pointer" />
                            <circle cx={x} cy={yDia} r="3.5" className="fill-blue-500 stroke-white stroke-2 cursor-pointer" />
                            <text x={x} y="192" textAnchor="middle" className="fill-slate-400 text-[8px] font-mono">
                              {new Date(m.loggedAt).toLocaleDateString([], { month: 'numeric', day: 'numeric' })}
                            </text>
                          </g>
                        );
                      })}
                    </svg>
                  ) : (
                    <div className="h-44 flex items-center justify-center text-slate-400 text-xs">Waiting for clinical records...</div>
                  )}

                  {/* Legend */}
                  <div className="flex gap-4 justify-end text-[9px] font-bold text-slate-400 mt-2">
                    <span className="flex items-center gap-1.5"><span className="w-3 h-0.5 bg-rose-500" /> Systolic (Target: &lt; 120)</span>
                    <span className="flex items-center gap-1.5"><span className="w-3 h-0.5 bg-blue-500" /> Diastolic (Target: &lt; 80)</span>
                  </div>
                </div>

                {/* Real interactive logger */}
                <form 
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleLogMetric('blood_pressure', parseInt(sysInput), parseInt(diaInput), 'mmHg');
                  }}
                  className="bg-gray-50/50 border border-gray-100 rounded-2xl p-4 grid grid-cols-1 md:grid-cols-3 gap-4"
                >
                  <div>
                    <label className="block text-[10px] font-extrabold text-slate-500 uppercase tracking-wide mb-1">Systolic Blood Pressure (mmHg)</label>
                    <input 
                      type="number" 
                      min="70" 
                      max="200" 
                      required 
                      value={sysInput} 
                      onChange={(e) => setSysInput(e.target.value)}
                      className="w-full text-xs px-3.5 py-2.5 border border-gray-200 rounded-xl bg-white focus:outline-none focus:border-rose-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-extrabold text-slate-500 uppercase tracking-wide mb-1">Diastolic Blood Pressure (mmHg)</label>
                    <input 
                      type="number" 
                      min="40" 
                      max="120" 
                      required 
                      value={diaInput} 
                      onChange={(e) => setDiaInput(e.target.value)}
                      className="w-full text-xs px-3.5 py-2.5 border border-gray-200 rounded-xl bg-white focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  <div className="flex items-end">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full bg-rose-500 hover:bg-rose-600 disabled:bg-slate-100 text-white font-extrabold text-xs py-3 rounded-xl flex items-center justify-center gap-1.5 transition"
                    >
                      <Plus className="w-4 h-4" />
                      Add Blood Vitals
                    </button>
                  </div>
                </form>
              </motion.div>
            )}

            {/* 2. STEPS MODULE */}
            {activeMetricTab === 'steps' && (
              <motion.div
                key="steps-module"
                initial={{ opacity: 0, x: 15 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -15 }}
                className="space-y-6"
              >
                <div className="flex items-center justify-between border-b border-gray-100 pb-4">
                  <div className="flex items-center gap-2">
                    <Footprints className="w-5 h-5 text-indigo-500" />
                    <h3 className="text-sm font-bold text-slate-800">Daily Steps Meter</h3>
                  </div>
                  <span className={`text-[10px] uppercase font-black px-3 py-1 rounded-full border ${latestSteps.valuePrimary >= 10000 ? 'bg-emerald-50 text-emerald-600 border-emerald-200' : 'bg-indigo-50 text-indigo-600 border-indigo-200'}`}>
                    {latestSteps.valuePrimary >= 10000 ? "Goal Exceeded" : "Aiming for 10k"}
                  </span>
                </div>

                {/* SVG Graph for Steps */}
                <div className="bg-gray-50/50 rounded-2xl p-4 border border-gray-100">
                  <span className="text-[9px] uppercase tracking-wider font-extrabold text-slate-400 block mb-2">Historical Step Trends</span>
                  {stepsHistory.length > 0 ? (
                    <svg viewBox="0 0 600 200" className="w-full h-44 overflow-visible">
                      {/* Grid Lines */}
                      {[3000, 6000, 9000, 12000].map((val, i) => {
                        const y = 200 - 30 - (val / 13000) * 140;
                        return (
                          <g key={i}>
                            <line x1="40" y1={y} x2="560" y2={y} stroke="#e2e8f0" strokeDasharray="3 3" />
                            <text x="32" y={y + 4} textAnchor="end" className="fill-slate-400 text-[9px] font-mono">{val}</text>
                          </g>
                        );
                      })}

                      {/* Bar Plot */}
                      {stepsHistory.map((h, idx) => {
                        const totalWidth = 520;
                        const barWidth = 24;
                        const x = 40 + (idx / Math.max(1, stepsHistory.length - 1)) * (totalWidth - barWidth);
                        const barHeight = (h.valuePrimary / 13000) * 140;
                        const y = 200 - 30 - barHeight;
                        const isGoal = h.valuePrimary >= 10000;

                        return (
                          <g key={idx}>
                            {/* Bar */}
                            <rect
                              x={x}
                              y={y}
                              width={barWidth}
                              height={barHeight}
                              rx="6"
                              className={isGoal ? "fill-emerald-500" : "fill-indigo-500"}
                            />
                            {/* Value label inside or above */}
                            <text x={x + barWidth/2} y={y - 6} textAnchor="middle" className="fill-slate-600 text-[8px] font-mono font-bold">
                              {h.valuePrimary}
                            </text>
                            {/* Date Label */}
                            <text x={x + barWidth/2} y="192" textAnchor="middle" className="fill-slate-400 text-[8px] font-mono">
                              {new Date(h.loggedAt).toLocaleDateString([], { month: 'numeric', day: 'numeric' })}
                            </text>
                          </g>
                        );
                      })}
                    </svg>
                  ) : (
                    <div className="h-44 flex items-center justify-center text-slate-400 text-xs">Waiting for step entries...</div>
                  )}
                </div>

                {/* Quick Add buttons & Custom input */}
                <div className="bg-gray-50/50 border border-gray-100 rounded-2xl p-4 space-y-4">
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleLogMetric('steps', 10000, null, 'steps')}
                      className="flex-1 bg-white border border-gray-200 hover:border-indigo-300 rounded-xl py-3 text-xs font-bold text-slate-700 flex items-center justify-center gap-1.5 transition"
                    >
                      <Zap className="w-3.5 h-3.5 text-yellow-500 animate-pulse" />
                      <span>Log Perfect 10k steps</span>
                    </button>
                    <button
                      onClick={() => handleLogMetric('steps', latestSteps.valuePrimary + 2000, null, 'steps')}
                      className="flex-1 bg-indigo-50 border border-indigo-100 hover:bg-indigo-100 rounded-xl py-3 text-xs font-bold text-indigo-700 flex items-center justify-center gap-1.5 transition"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Increment +2,000 steps</span>
                    </button>
                  </div>

                  <form 
                    onSubmit={(e) => {
                      e.preventDefault();
                      handleLogMetric('steps', parseInt(stepsInput), null, 'steps');
                    }}
                    className="flex gap-2"
                  >
                    <input 
                      type="number" 
                      min="500" 
                      max="40000" 
                      value={stepsInput}
                      onChange={(e) => setStepsInput(e.target.value)}
                      className="flex-1 text-xs px-3.5 py-3 border border-gray-200 rounded-xl bg-white focus:outline-none focus:border-indigo-500 font-bold text-slate-800"
                    />
                    <button
                      type="submit"
                      className="bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs px-6 py-3 rounded-xl transition"
                    >
                      Save Steps
                    </button>
                  </form>
                </div>
              </motion.div>
            )}

            {/* 3. WATER HYDRATION MODULE */}
            {activeMetricTab === 'water' && (
              <motion.div
                key="water-module"
                initial={{ opacity: 0, x: 15 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -15 }}
                className="grid grid-cols-1 md:grid-cols-12 gap-6"
              >
                {/* Left controls */}
                <div className="md:col-span-5 space-y-4">
                  <div className="flex items-center gap-2 border-b border-gray-100 pb-3">
                    <Droplet className="w-5 h-5 text-sky-500" />
                    <h3 className="text-sm font-bold text-slate-800 font-serif">Hydration Analytics</h3>
                  </div>

                  {/* Interactive Cup display */}
                  <div className="bg-sky-50/40 rounded-2xl border border-sky-100/50 p-6 flex flex-col items-center justify-center text-center relative overflow-hidden h-56">
                    {/* Simulated liquid backdrop */}
                    <motion.div 
                      className="absolute bottom-0 left-0 right-0 bg-sky-200/50"
                      initial={{ height: 0 }}
                      animate={{ height: `${Math.min(100, (todayWaterSum / 2000) * 100)}%` }}
                      transition={{ duration: 1 }}
                    />

                    <div className="relative z-10 space-y-1">
                      <p className="text-3xl font-black text-sky-950">{todayWaterSum} <span className="text-sm">mL</span></p>
                      <p className="text-[10px] text-sky-600 font-bold uppercase tracking-wider">Today's Intake (Target: 2,000 mL)</p>
                      <div className="w-32 bg-sky-100/80 rounded-full h-1.5 mx-auto mt-2 overflow-hidden border border-sky-200/30">
                        <div 
                          className="bg-sky-500 h-full rounded-full" 
                          style={{ width: `${Math.min(100, (todayWaterSum / 2000) * 100)}%` }}
                        />
                      </div>
                      <p className="text-[9px] text-sky-500 font-bold pt-1">{Math.round((todayWaterSum / 2000) * 100)}% of daily quota</p>
                    </div>
                  </div>

                  {/* Hydration quick buttons */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleLogMetric('water', todayWaterSum + 250, null, 'mL')}
                      className="flex-1 bg-white border border-sky-100 hover:border-sky-300 rounded-xl py-3 text-[10px] font-black uppercase text-sky-700 transition"
                    >
                      +250ml cup
                    </button>
                    <button
                      onClick={() => handleLogMetric('water', todayWaterSum + 500, null, 'mL')}
                      className="flex-1 bg-sky-50 border border-sky-100 hover:bg-sky-100 rounded-xl py-3 text-[10px] font-black uppercase text-sky-800 transition"
                    >
                      +500ml Bottle
                    </button>
                  </div>
                </div>

                {/* Right history / input form */}
                <div className="md:col-span-7 space-y-4">
                  <div className="bg-gray-50/50 rounded-2xl p-4 border border-gray-100">
                    <span className="text-[9px] uppercase tracking-wider font-extrabold text-slate-400 block mb-3">Hydration trend chart (mL)</span>
                    {waterHistory.length > 0 ? (
                      <svg viewBox="0 0 450 150" className="w-full h-32 overflow-visible">
                        {[1000, 2000, 3000].map((val, i) => {
                          const y = 150 - 20 - (val / 3200) * 100;
                          return (
                            <g key={i}>
                              <line x1="30" y1={y} x2="420" y2={y} stroke="#e2e8f0" strokeDasharray="3 3" />
                              <text x="24" y={y + 3} textAnchor="end" className="fill-slate-400 text-[8px] font-mono">{val}</text>
                            </g>
                          );
                        })}
                        <path
                          d={getChartPoints(waterHistory.map(h => h.valuePrimary), 0, 3200, 450, 150, 30)}
                          fill="none"
                          stroke="#0ea5e9"
                          strokeWidth="2.5"
                          strokeLinecap="round"
                        />
                        {waterHistory.map((m, idx) => {
                          const x = 30 + (idx / Math.max(1, waterHistory.length - 1)) * 390;
                          const y = 150 - 20 - (m.valuePrimary / 3200) * 100;
                          return (
                            <g key={idx}>
                              <circle cx={x} cy={y} r="3.5" className="fill-sky-500 stroke-white stroke-2" />
                            </g>
                          );
                        })}
                      </svg>
                    ) : (
                      <div className="h-32 flex items-center justify-center text-slate-400 text-xs">Awaiting log files...</div>
                    )}
                  </div>

                  <form 
                    onSubmit={(e) => {
                      e.preventDefault();
                      handleLogMetric('water', todayWaterSum + parseInt(waterInput), null, 'mL');
                    }}
                    className="flex gap-2"
                  >
                    <input 
                      type="number" 
                      min="100" 
                      max="2000" 
                      value={waterInput}
                      onChange={(e) => setWaterInput(e.target.value)}
                      className="flex-1 text-xs px-3.5 py-3 border border-gray-200 rounded-xl bg-white focus:outline-none focus:border-sky-500 font-bold text-slate-800"
                    />
                    <button
                      type="submit"
                      className="bg-sky-600 hover:bg-sky-700 text-white font-extrabold text-xs px-6 py-3 rounded-xl transition"
                    >
                      Log Custom Fluid mL
                    </button>
                  </form>
                </div>
              </motion.div>
            )}

            {/* 4. SLEEP MODULE */}
            {activeMetricTab === 'sleep' && (
              <motion.div
                key="sleep-module"
                initial={{ opacity: 0, x: 15 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -15 }}
                className="space-y-6"
              >
                <div className="flex items-center justify-between border-b border-gray-100 pb-4">
                  <div className="flex items-center gap-2">
                    <Moon className="w-5 h-5 text-indigo-900" />
                    <h3 className="text-sm font-bold text-slate-800">Night Sleep Records</h3>
                  </div>
                  <span className="text-[10px] uppercase font-black px-3 py-1 rounded-full border bg-amber-50 text-amber-700 border-amber-200">
                    Latest: {latestSleep.valuePrimary} Hours
                  </span>
                </div>

                {/* SVG Graph for Sleep */}
                <div className="bg-gray-50/50 rounded-2xl p-4 border border-gray-100">
                  <span className="text-[9px] uppercase tracking-wider font-extrabold text-slate-400 block mb-2">Sleep hours duration log</span>
                  {sleepHistory.length > 0 ? (
                    <svg viewBox="0 0 600 200" className="w-full h-44 overflow-visible">
                      {/* Ideal zone bounds block */}
                      <rect x="40" y={200 - 30 - (8.5 / 10) * 140} width="520" height={((8.5 - 7.5)/10) * 140} fill="rgba(16, 185, 129, 0.04)" />
                      
                      {[4, 6, 8, 10].map((val, i) => {
                        const y = 200 - 30 - (val / 10) * 140;
                        return (
                          <g key={i}>
                            <line x1="40" y1={y} x2="560" y2={y} stroke="#e2e8f0" strokeDasharray="3 3" />
                            <text x="32" y={y + 4} textAnchor="end" className="fill-slate-400 text-[9px] font-mono">{val} hr</text>
                          </g>
                        );
                      })}

                      {/* Sleep Plot */}
                      <path
                        d={getChartPoints(sleepHistory.map(h => h.valuePrimary), 0, 10, 600, 200, 40)}
                        fill="none"
                        stroke="#6366f1"
                        strokeWidth="3"
                        strokeLinecap="round"
                      />

                      {/* Dots */}
                      {sleepHistory.map((m, idx) => {
                        const x = 40 + (idx / Math.max(1, sleepHistory.length - 1)) * 520;
                        const y = 200 - 30 - (m.valuePrimary / 10) * 140;
                        return (
                          <g key={idx}>
                            <circle cx={x} cy={y} r="4" className="fill-indigo-600 stroke-white stroke-2" />
                            <text x={x} y="192" textAnchor="middle" className="fill-slate-400 text-[8px] font-mono">
                              {new Date(m.loggedAt).toLocaleDateString([], { month: 'numeric', day: 'numeric' })}
                            </text>
                          </g>
                        );
                      })}
                    </svg>
                  ) : (
                    <div className="h-44 flex items-center justify-center text-slate-400 text-xs">Waiting for sleep records...</div>
                  )}
                </div>

                <form 
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleLogMetric('sleep', parseFloat(sleepInput), null, 'hrs');
                  }}
                  className="bg-gray-50/50 border border-gray-100 rounded-2xl p-4 flex gap-4 items-end"
                >
                  <div className="flex-1">
                    <label className="block text-[10px] font-extrabold text-slate-500 uppercase tracking-wide mb-1">Night Sleep Duration (Hours)</label>
                    <input 
                      type="number" 
                      step="0.1" 
                      min="2" 
                      max="16" 
                      required 
                      value={sleepInput} 
                      onChange={(e) => setSleepInput(e.target.value)}
                      className="w-full text-xs px-3.5 py-3 border border-gray-200 rounded-xl bg-white focus:outline-none focus:border-indigo-500 font-bold text-slate-800"
                    />
                  </div>
                  <button
                    type="submit"
                    className="bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs px-8 py-3 rounded-xl transition"
                  >
                    Save Night Sleep
                  </button>
                </form>
              </motion.div>
            )}

            {/* 5. MEDICATION ADHERENCE BOARD */}
            {activeMetricTab === 'meds' && (
              <motion.div
                key="meds-module"
                initial={{ opacity: 0, x: 15 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -15 }}
                className="space-y-6"
              >
                <div className="flex items-center justify-between border-b border-gray-100 pb-4">
                  <div className="flex items-center gap-2">
                    <Pill className="w-5 h-5 text-emerald-500" />
                    <h3 className="text-sm font-bold text-slate-800 font-serif">Dynamic Medication Adherence Board</h3>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] uppercase font-black px-3 py-1 rounded-full border bg-emerald-50 text-emerald-700 border-emerald-200">
                      Adherence Score: {medStats.rate}%
                    </span>
                  </div>
                </div>

                {/* Plain analytic progress meter */}
                <div className="bg-gray-50/50 rounded-2xl p-5 border border-gray-100 space-y-3">
                  <div className="flex justify-between items-center text-xs text-slate-600 font-bold">
                    <span>Taken: {medStats.taken} / {medStats.total} doses</span>
                    <span>Adherence Status: {medStats.rate >= 80 ? "Perfect" : "Needs Nudging"}</span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-3 overflow-hidden border border-slate-200/50">
                    <div 
                      className="bg-emerald-500 h-full rounded-full transition-all duration-700"
                      style={{ width: `${medStats.rate}%` }}
                    />
                  </div>
                  <p className="text-[10px] text-slate-400 font-semibold leading-relaxed">
                    This compliance index matches taken reminders stored in the clinical schemas. Ensure you mark each pending dose immediately after taking to prevent score dips.
                  </p>
                </div>

                {/* Reminders List & Toggles on the dashboard */}
                <div className="space-y-2">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block px-1">Today's Dose Logs (Interactive Controls)</span>
                  <div className="space-y-2 max-h-56 overflow-y-auto">
                    {reminders.map((rem) => (
                      <div 
                        key={rem.id} 
                        className={`p-3.5 rounded-2xl border flex items-center justify-between transition ${
                          rem.status === 'taken' 
                            ? 'bg-emerald-50/40 border-emerald-100 text-emerald-950' 
                            : rem.status === 'skipped'
                            ? 'bg-rose-50/30 border-rose-100 text-rose-950'
                            : 'bg-white border-gray-100 text-slate-800'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-xl ${
                            rem.status === 'taken' ? 'bg-emerald-500 text-white' : rem.status === 'skipped' ? 'bg-rose-500 text-white' : 'bg-slate-100 text-slate-500'
                          }`}>
                            <Pill className="w-4 h-4" />
                          </div>
                          <div>
                            <p className="text-xs font-bold">{rem.medicineName}</p>
                            <p className="text-[10px] text-slate-400 font-semibold">{rem.scheduledTime}</p>
                          </div>
                        </div>

                        {/* Direct action buttons */}
                        <div className="flex gap-1.5">
                          <button
                            onClick={() => handleToggleReminder(rem.id, 'taken')}
                            className={`px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-wider flex items-center gap-1 border transition ${
                              rem.status === 'taken'
                                ? 'bg-emerald-600 text-white border-emerald-700'
                                : 'bg-white hover:bg-emerald-50 text-slate-600 border-gray-200'
                            }`}
                          >
                            <Check className="w-3 h-3" />
                            <span>Taken</span>
                          </button>
                          <button
                            onClick={() => handleToggleReminder(rem.id, 'skipped')}
                            className={`px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-wider flex items-center gap-1 border transition ${
                              rem.status === 'skipped'
                                ? 'bg-rose-600 text-white border-rose-700'
                                : 'bg-white hover:bg-rose-50 text-slate-600 border-gray-200'
                            }`}
                          >
                            <X className="w-3 h-3" />
                            <span>Skipped</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

        </div>

      </div>

      {/* Unified historical log of all entries */}
      <div className="bg-white rounded-3xl border border-gray-200 p-6 shadow-premium">
        <div className="flex items-center justify-between border-b border-gray-100 pb-3 mb-4">
          <span className="text-xs font-bold text-slate-800">Unified Clinical Metric Log</span>
          <span className="text-[9px] font-mono text-slate-400">Showing last {metrics.length} recorded entries</span>
        </div>
        <div className="space-y-1.5 max-h-48 overflow-y-auto">
          {metrics.slice().reverse().map((m) => (
            <div key={m.id} className="flex items-center justify-between py-2.5 border-b border-gray-100/60 text-xs px-2 hover:bg-slate-50/40 rounded-lg">
              <div className="flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${
                  m.metricType === 'blood_pressure' ? 'bg-rose-500' :
                  m.metricType === 'steps' ? 'bg-indigo-500' :
                  m.metricType === 'water' ? 'bg-sky-500' : 'bg-amber-500'
                }`} />
                <span className="font-extrabold uppercase text-[10px] text-slate-500 tracking-wider">
                  {m.metricType.replace('_', ' ')}
                </span>
                <span className="font-black text-slate-800 ml-1">
                  {m.valuePrimary} {m.valueSecondary && `/ ${m.valueSecondary}`}
                  <span className="text-[10px] text-slate-400 font-normal ml-0.5">{m.unit}</span>
                </span>
              </div>
              <span className="text-[9px] font-mono text-slate-400">
                {new Date(m.loggedAt).toLocaleString()}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
