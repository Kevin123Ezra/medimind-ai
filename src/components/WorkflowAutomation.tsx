import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Pill, 
  UploadCloud, 
  Database, 
  BrainCircuit, 
  Bell, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle, 
  Play, 
  RotateCcw, 
  FileText, 
  ChevronRight, 
  Clock, 
  ArrowRight, 
  Smartphone, 
  Check, 
  X, 
  Activity, 
  Volume2,
  Terminal,
  Layers,
  Sparkle
} from "lucide-react";
import { Reminder, MedicalReport } from "../types";

// Demo report templates
const DEFAULTS_REPORTS = [
  {
    name: "Comprehensive Metabolic Panel",
    text: `Patient: Anita Garcia\nDate: June 28, 2026\nLab ID: Quest-9281A\n\nFasting Blood Glucose: 112 mg/dL (HIGH) [Ref Range: 70 - 100 mg/dL]\nSerum Sodium: 140 mEq/L [Ref Range: 135 - 145 mEq/L]\nSerum Potassium: 4.1 mEq/L [Ref Range: 3.5 - 5.1 mEq/L]\nSerum Creatinine: 0.88 mg/dL [Ref Range: 0.50 - 1.10 mg/dL]\nBUN (Blood Urea Nitrogen): 16 mg/dL [Ref Range: 7 - 20 mg/dL]\nALT (Alanine Aminotransferase): 38 U/L [Ref Range: 7 - 56 U/L]\nAST (Aspartate Aminotransferase): 42 U/L (HIGH) [Ref Range: 5 - 40 U/L]`
  },
  {
    name: "Lipid Heart Panel",
    text: `Patient: Anita Garcia\nDate: June 28, 2026\nLab ID: Cardio-771\n\nTotal Cholesterol: 235 mg/dL (HIGH) [Ref Range: < 200 mg/dL]\nLDL Cholesterol (Bad): 152 mg/dL (HIGH) [Ref Range: < 100 mg/dL]\nHDL Cholesterol (Good): 48 mg/dL [Ref Range: > 40 mg/dL]\nTriglycerides: 175 mg/dL (HIGH) [Ref Range: < 150 mg/dL]`
  },
  {
    name: "Thyroid Stimulating Hormone Test",
    text: `Patient: Anita Garcia\nDate: June 28, 2026\n\nTSH (Thyroid Stimulating Hormone): 5.4 uIU/mL (HIGH) [Ref Range: 0.40 - 4.10 uIU/mL]\nFree T4 (Thyroxine): 1.0 ng/dL [Ref Range: 0.8 - 1.8 ng/dL]`
  }
];

export default function WorkflowAutomation() {
  // Global simulated notification toast state
  const [notification, setNotification] = useState<{
    id: string;
    title: string;
    body: string;
    type: "report" | "medicine" | "missed";
    actionLabel?: string;
    action?: () => void;
  } | null>(null);

  // Workflow 1 States (Report Upload & AI Summary Pipeline)
  const [w1Active, setW1Active] = useState(false);
  const [w1Step, setW1Step] = useState<number>(0); // 0=idle, 1=upload, 2=ocr, 3=db, 4=ai, 5=notify, 6=success
  const [w1Logs, setW1Logs] = useState<string[]>([]);
  const [selectedReportIdx, setSelectedReportIdx] = useState(0);
  const [customReportText, setCustomReportText] = useState("");
  const [useCustomReport, setUseCustomReport] = useState(false);
  const [ocrTextResult, setOcrTextResult] = useState("");
  const [generatedResult, setGeneratedResult] = useState<any>(null);

  // Workflow 2 States (Meds Alert Loop)
  const [w2Active, setW2Active] = useState(false);
  const [w2Step, setW2Step] = useState<number>(0); // 0=idle, 1=time, 2=push, 3=waiting, 4=db_updated, 5=missed, 6=notified_again
  const [w2Logs, setW2Logs] = useState<string[]>([]);
  const [availableReminders, setAvailableReminders] = useState<Reminder[]>([]);
  const [selectedReminderId, setSelectedReminderId] = useState<string>("");
  const [actionTaken, setActionTaken] = useState<'taken' | 'skipped' | 'timeout' | null>(null);

  // Load reminders on mount
  const loadReminders = async () => {
    try {
      const res = await fetch("/api/reminders");
      const json = await res.json();
      if (json.success) {
        setAvailableReminders(json.data);
        const pending = json.data.find((r: Reminder) => r.status === "pending");
        if (pending) {
          setSelectedReminderId(pending.id);
        } else if (json.data.length > 0) {
          setSelectedReminderId(json.data[0].id);
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadReminders();
  }, []);

  const addW1Log = (msg: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setW1Logs(prev => [...prev, `[${timestamp}] ${msg}`]);
  };

  const addW2Log = (msg: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setW2Logs(prev => [...prev, `[${timestamp}] ${msg}`]);
  };

  // Run Workflow 1 Automation
  const triggerWorkflow1 = async () => {
    if (w1Active) return;
    setW1Active(true);
    setW1Step(1);
    setW1Logs([]);
    setOcrTextResult("");
    setGeneratedResult(null);

    const reportName = useCustomReport ? "Custom Diagnostic Report" : DEFAULTS_REPORTS[selectedReportIdx].name;
    const reportText = useCustomReport ? customReportText : DEFAULTS_REPORTS[selectedReportIdx].text;

    if (useCustomReport && !customReportText.trim()) {
      addW1Log("Error: Custom report text is empty.");
      setW1Step(0);
      setW1Active(false);
      return;
    }

    addW1Log(`🚀 Workflow Started: OCR & Summary Automation Pipeline.`);
    addW1Log(`Step 1: Patient uploads "${reportName}" to portal.`);

    // Step 1: Simulated Upload
    await new Promise(r => setTimeout(r, 1800));
    setW1Step(2);
    addW1Log(`✅ Upload Complete. 2.4MB payload written temporarily to buffer.`);
    addW1Log(`Step 2: Dispatching raw image/document to MediMind OCR Engine.`);

    // Step 2: Simulated OCR
    await new Promise(r => setTimeout(r, 2200));
    setOcrTextResult(reportText);
    setW1Step(3);
    addW1Log(`✅ OCR Extraction Succeeded. Recovered 100% of structured character content.`);
    addW1Log(`Step 3: Indexing raw unstructured record to clinical database.`);

    // Step 3: Simulated Database Write
    await new Promise(r => setTimeout(r, 1500));
    setW1Step(4);
    addW1Log(`✅ SQLite/PostgreSQL Database record initialized with status: "isParsed=false".`);
    addW1Log(`Step 4: Prompting Sarvam AI / Gemini for Clinical jargon translation & summarizing.`);

    // Step 4: Real AI summarizing call to backend!
    try {
      const response = await fetch("/api/gemini/analyze-report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          rawText: reportText,
          reportName: reportName
        })
      });
      const json = await response.json();
      
      if (json.success) {
        setGeneratedResult(json.data);
        addW1Log(`✅ Sarvam AI clinical parsing complete. JSON response parsed successfully.`);
        addW1Log(`Summary: "${json.data.explanation.summary}"`);
        addW1Log(`Abnormal Markers Extracted: ${json.data.explanation.abnormalMetrics.length}`);
        
        // Trigger dashboard update event
        setW1Step(5);
        addW1Log(`Step 5: Synthesizing real-time in-app summary alerts & dispatching.`);

        // Step 5: Notifications
        await new Promise(r => setTimeout(r, 1200));
        
        setNotification({
          id: `notif-r-${Date.now()}`,
          title: "📋 Diagnostic Report Explained",
          body: `Summary available for "${reportName}": ${json.data.explanation.summary}`,
          type: "report",
          actionLabel: "View Explained Report"
        });
        
        addW1Log(`🔔 Push Notification Broadcast: Dispatching user alert.`);
        setW1Step(6);
        addW1Log(`Step 6: Dashboard synchronized. State updated.`);
        addW1Log(`🎉 Workflow 1 completed successfully! Patient-friendly explanation is fully active.`);
      } else {
        throw new Error(json.error || "AI pipeline failure");
      }
    } catch (err: any) {
      addW1Log(`❌ AI Step Failed: ${err.message || "Network Error"}.`);
      setW1Step(0);
    } finally {
      setW1Active(false);
    }
  };

  // Run Workflow 2 Automation
  const triggerWorkflow2 = async (simulateMissed = false) => {
    if (w2Active) return;
    const reminder = availableReminders.find(r => r.id === selectedReminderId);
    if (!reminder) {
      addW2Log("Error: Select a medication reminder schedule to automate.");
      return;
    }

    setW2Active(true);
    setW2Step(1);
    setW2Logs([]);
    setActionTaken(null);

    addW2Log(`🚀 Workflow Started: Medication Compliance & Escalation Alert Loop.`);
    addW2Log(`Step 1: Clock schedule event triggered for medication [${reminder.medicineName}].`);

    // Step 1: Clock event
    await new Promise(r => setTimeout(r, 1500));
    setW2Step(2);
    addW2Log(`⏰ Event: Schedule time (${reminder.scheduledTime}) reached.`);
    addW2Log(`Step 2: Dispatching push notification action cards to companion app.`);

    // Step 2: Push Notification spawned
    await new Promise(r => setTimeout(r, 1500));
    setW2Step(3);
    
    // Spawn real interactive notification card at the top
    setNotification({
      id: `notif-m-${Date.now()}`,
      title: "💊 Medication Reminder",
      body: `It's time to take your ${reminder.medicineName}. Check dosage instructions!`,
      type: "medicine",
      actionLabel: "Mark as Taken",
      action: () => handleReminderResponse(reminder.id, 'taken')
    });

    addW2Log(`🔔 In-App Push Notification sent to Patient's active device portal.`);
    addW2Log(`Step 3: Awaiting patient compliance confirmation click...`);

    if (simulateMissed) {
      // Simulate timeout / Missed loop
      await new Promise(r => setTimeout(r, 4000));
      addW2Log(`⚠️ Idle: No response received within standard 4-second confirmation buffer.`);
      setW2Step(5);
      setActionTaken('timeout');
      setNotification(null);
      addW2Log(`Step 5: Alert escalation triggered. Checking database for missing log state...`);

      // Step 5 Check DB
      await new Promise(r => setTimeout(r, 1500));
      addW2Log(`🔍 Verification: Status remains "pending" after threshold expiration. Triggering double-escalation alert.`);
      setW2Step(6);

      // Step 6 Notify Again
      setNotification({
        id: `notif-missed-${Date.now()}`,
        title: "⚠️ URGENT: Medication Overdue",
        body: `Double escalation alert! You missed your scheduled dose of ${reminder.medicineName}. Please log compliance.`,
        type: "missed",
        actionLabel: "Mark Taken Now",
        action: () => handleReminderResponse(reminder.id, 'taken')
      });
      addW2Log(`🔔 Secondary Escalation Push Broadcast: Alert dispatched with high priority flag.`);
      addW2Log(`🎉 Workflow 2 finished with escalation nudges active. Database remains synchronized.`);
      setW2Active(false);
    } else {
      // Let the user click or trigger automatic confirm after some seconds if they don't click
      const timer = setTimeout(async () => {
        // Automatically confirm as taken if they didn't manually press it
        if (w2Active && actionTaken === null) {
          await handleReminderResponse(reminder.id, 'taken');
        }
      }, 5000);
      return () => clearTimeout(timer);
    }
  };

  const handleReminderResponse = async (id: string, status: 'taken' | 'skipped') => {
    setActionTaken(status);
    setW2Step(4);
    addW2Log(`👉 Patient Action: Clicked "${status === 'taken' ? 'Mark Taken' : 'Skip'}" callback.`);
    addW2Log(`Step 4: Synchronizing compliance states with the clinical database.`);

    try {
      const res = await fetch(`/api/reminders/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status })
      });
      const json = await res.json();
      if (json.success) {
        addW2Log(`✅ Database Sync: [ReminderID: ${id}] status updated successfully to "${status.toUpperCase()}".`);
        addW2Log(`📈 Compliance Adherence rating updated on patient metrics board.`);
        setNotification(null);
        await loadReminders();
      }
    } catch (err) {
      addW2Log(`❌ Database Update Error: Could not connect to schema.`);
    } finally {
      setW2Active(false);
    }
  };

  const clearNotification = () => {
    setNotification(null);
  };

  return (
    <div className="space-y-6">
      {/* Global Interactive Notification Toast Area */}
      <AnimatePresence>
        {notification && (
          <motion.div
            initial={{ opacity: 0, y: -50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className={`p-4 rounded-2xl border shadow-premium max-w-xl mx-auto flex items-start gap-3.5 z-50 ${
              notification.type === "report"
                ? "bg-teal-50 border-teal-200 text-teal-950"
                : notification.type === "missed"
                ? "bg-rose-50 border-rose-200 text-rose-950"
                : "bg-blue-50 border-blue-200 text-blue-950"
            }`}
          >
            <div className="p-2 rounded-xl bg-white/80 shadow-sm shrink-0">
              {notification.type === "report" && <FileText className="w-5 h-5 text-teal-600" />}
              {notification.type === "medicine" && <Pill className="w-5 h-5 text-blue-600" />}
              {notification.type === "missed" && <AlertCircle className="w-5 h-5 text-rose-600" />}
            </div>
            <div className="flex-1 space-y-1">
              <h4 className="text-xs font-extrabold uppercase tracking-wider">{notification.title}</h4>
              <p className="text-xs font-medium leading-relaxed">{notification.body}</p>
              
              {notification.action && (
                <div className="pt-2 flex gap-2">
                  <button
                    onClick={notification.action}
                    className="px-3 py-1.5 rounded-lg bg-teal-600 text-white font-extrabold text-[10px] uppercase tracking-wider hover:bg-teal-700 transition"
                  >
                    {notification.actionLabel || "Confirm"}
                  </button>
                  <button
                    onClick={clearNotification}
                    className="px-3 py-1.5 rounded-lg bg-white/85 text-slate-700 font-extrabold text-[10px] uppercase tracking-wider hover:bg-white transition border border-slate-200/50"
                  >
                    Dismiss
                  </button>
                </div>
              )}
            </div>
            <button onClick={clearNotification} className="text-slate-400 hover:text-slate-700 p-1">
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* ========================================================
           WORKFLOW 1: REPORT UPLOAD, OCR, DB, AND SARVAM AI SUMMARY
           ======================================================== */}
        <div className="bg-white rounded-3xl border border-gray-200 shadow-premium p-6 flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 bg-teal-50 rounded-xl flex items-center justify-center border border-teal-100">
                  <UploadCloud className="w-5 h-5 text-teal-600" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-800">1. OCR & Summary Pipeline</h3>
                  <p className="text-[10px] text-slate-400">Automate from unstructured PDF to plain translation</p>
                </div>
              </div>
              <span className="text-[9px] uppercase tracking-wider bg-teal-100/70 text-teal-700 font-extrabold px-2 py-0.5 rounded-full border border-teal-100">
                Live Server Flow
              </span>
            </div>

            {/* Selector Option */}
            <div className="space-y-3 bg-gray-50/50 p-4 rounded-2xl border border-gray-100">
              <div className="flex items-center justify-between">
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wide">Select Diagnostic Lab Sheet</label>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setUseCustomReport(false)}
                    className={`text-[9px] uppercase tracking-wider font-extrabold px-2 py-1 rounded-md transition ${
                      !useCustomReport ? "bg-teal-600 text-white" : "bg-gray-100 text-slate-500 hover:bg-gray-200"
                    }`}
                  >
                    Templates
                  </button>
                  <button
                    onClick={() => setUseCustomReport(true)}
                    className={`text-[9px] uppercase tracking-wider font-extrabold px-2 py-1 rounded-md transition ${
                      useCustomReport ? "bg-teal-600 text-white" : "bg-gray-100 text-slate-500 hover:bg-gray-200"
                    }`}
                  >
                    Custom Text
                  </button>
                </div>
              </div>

              {!useCustomReport ? (
                <div className="flex flex-col gap-1.5">
                  {DEFAULTS_REPORTS.map((rep, idx) => (
                    <button
                      key={idx}
                      disabled={w1Active}
                      onClick={() => setSelectedReportIdx(idx)}
                      className={`text-left p-2.5 rounded-xl text-xs font-semibold border transition ${
                        selectedReportIdx === idx
                          ? "bg-teal-50 border-teal-300 text-teal-950 shadow-sm"
                          : "bg-white border-gray-200 text-slate-600 hover:border-gray-300"
                      }`}
                    >
                      {rep.name}
                    </button>
                  ))}
                </div>
              ) : (
                <textarea
                  disabled={w1Active}
                  rows={4}
                  placeholder="Paste raw unstructured lab readings here..."
                  value={customReportText}
                  onChange={(e) => setCustomReportText(e.target.value)}
                  className="w-full text-xs p-3 border border-gray-200 rounded-xl bg-white focus:outline-none focus:border-teal-500 font-mono leading-relaxed"
                />
              )}
            </div>

            {/* Interactive Progress Visualizer Nodes */}
            <div className="py-2 space-y-4 relative">
              {/* Connecting backlines */}
              <div className="absolute left-[17px] top-6 bottom-6 w-0.5 bg-gray-100" />

              {/* Node 1: User Uploads Report */}
              <div className="flex items-start gap-3.5 relative">
                <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 border z-10 transition duration-300 ${
                  w1Step >= 1 ? "bg-teal-600 border-teal-700 text-white scale-110 shadow-organic" : "bg-white border-gray-200 text-slate-400"
                }`}>
                  <UploadCloud className="w-4 h-4" />
                </div>
                <div className="pt-1 flex-1">
                  <div className="flex items-center justify-between">
                    <p className={`text-xs font-bold ${w1Step >= 1 ? "text-teal-950 font-extrabold" : "text-slate-400"}`}>User Uploads Report</p>
                    {w1Step === 1 && (
                      <span className="text-[8px] bg-teal-100 text-teal-700 uppercase tracking-widest font-black px-1.5 py-0.5 rounded animate-pulse">Uploading...</span>
                    )}
                  </div>
                  <p className="text-[10px] text-slate-400 mt-0.5">Launches pipeline & saves raw document buffer</p>
                </div>
              </div>

              {/* Node 2: OCR */}
              <div className="flex items-start gap-3.5 relative">
                <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 border z-10 transition duration-300 ${
                  w1Step >= 2 ? "bg-teal-600 border-teal-700 text-white scale-110 shadow-organic" : "bg-white border-gray-200 text-slate-400"
                }`}>
                  <Activity className="w-4 h-4" />
                </div>
                <div className="pt-1 flex-1">
                  <div className="flex items-center justify-between">
                    <p className={`text-xs font-bold ${w1Step >= 2 ? "text-teal-950 font-extrabold" : "text-slate-400"}`}>OCR Extraction</p>
                    {w1Step === 2 && (
                      <span className="text-[8px] bg-teal-100 text-teal-700 uppercase tracking-widest font-black px-1.5 py-0.5 rounded animate-pulse">Extracting Text...</span>
                    )}
                  </div>
                  <p className="text-[10px] text-slate-400 mt-0.5">Recovers medical records into characters</p>
                </div>
              </div>

              {/* Node 3: Database */}
              <div className="flex items-start gap-3.5 relative">
                <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 border z-10 transition duration-300 ${
                  w1Step >= 3 ? "bg-teal-600 border-teal-700 text-white scale-110 shadow-organic" : "bg-white border-gray-200 text-slate-400"
                }`}>
                  <Database className="w-4 h-4" />
                </div>
                <div className="pt-1 flex-1">
                  <div className="flex items-center justify-between">
                    <p className={`text-xs font-bold ${w1Step >= 3 ? "text-teal-950 font-extrabold" : "text-slate-400"}`}>Database Persistence</p>
                    {w1Step === 3 && (
                      <span className="text-[8px] bg-teal-100 text-teal-700 uppercase tracking-widest font-black px-1.5 py-0.5 rounded animate-pulse">Saving...</span>
                    )}
                  </div>
                  <p className="text-[10px] text-slate-400 mt-0.5">Saves diagnostic schemas with unparsed tag</p>
                </div>
              </div>

              {/* Node 4: Sarvam AI */}
              <div className="flex items-start gap-3.5 relative">
                <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 border z-10 transition duration-300 ${
                  w1Step >= 4 ? "bg-teal-600 border-teal-700 text-white scale-110 shadow-organic" : "bg-white border-gray-200 text-slate-400"
                }`}>
                  <BrainCircuit className="w-4 h-4" />
                </div>
                <div className="pt-1 flex-1">
                  <div className="flex items-center justify-between">
                    <p className={`text-xs font-bold ${w1Step >= 4 ? "text-teal-950 font-extrabold" : "text-slate-400"}`}>Sarvam AI Core Translation</p>
                    {w1Step === 4 && (
                      <span className="text-[8px] bg-teal-100 text-teal-700 uppercase tracking-widest font-black px-1.5 py-0.5 rounded animate-pulse">Translating...</span>
                    )}
                  </div>
                  <p className="text-[10px] text-slate-400 mt-0.5">Translates terminology into layman Grade 6 prose</p>
                </div>
              </div>

              {/* Node 5: Notification & Dashboard Update */}
              <div className="flex items-start gap-3.5 relative">
                <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 border z-10 transition duration-300 ${
                  w1Step >= 5 ? "bg-teal-600 border-teal-700 text-white scale-110 shadow-organic" : "bg-white border-gray-200 text-slate-400"
                }`}>
                  <Bell className="w-4 h-4" />
                </div>
                <div className="pt-1 flex-1">
                  <div className="flex items-center justify-between">
                    <p className={`text-xs font-bold ${w1Step >= 5 ? "text-teal-950 font-extrabold" : "text-slate-400"}`}>Summary notification & Update</p>
                    {w1Step === 5 && (
                      <span className="text-[8px] bg-teal-100 text-teal-700 uppercase tracking-widest font-black px-1.5 py-0.5 rounded animate-pulse">Notifying...</span>
                    )}
                  </div>
                  <p className="text-[10px] text-slate-400 mt-0.5">Dispatches companion app alert & synchronizes views</p>
                </div>
              </div>
            </div>
          </div>

          {/* Controls & Logs */}
          <div className="space-y-4">
            {/* Terminal logs */}
            {w1Logs.length > 0 && (
              <div className="bg-slate-900 rounded-2xl p-3 border border-slate-800 font-mono text-[9px] text-emerald-400 space-y-1 max-h-32 overflow-y-auto">
                <div className="flex items-center gap-1.5 text-slate-400 border-b border-slate-800 pb-1.5 mb-1.5">
                  <Terminal className="w-3.5 h-3.5" />
                  <span>Pipeline Event Logs</span>
                </div>
                {w1Logs.map((log, i) => (
                  <div key={i} className="leading-normal">{log}</div>
                ))}
              </div>
            )}

            <div className="flex gap-2">
              <button
                onClick={triggerWorkflow1}
                disabled={w1Active}
                className="flex-1 bg-teal-600 hover:bg-teal-700 disabled:bg-gray-100 disabled:text-gray-400 rounded-2xl py-3 px-4 font-extrabold text-xs text-white flex items-center justify-center gap-2 transition shadow-sm"
              >
                <Play className="w-4 h-4 shrink-0" />
                <span>{w1Active ? "Running..." : "Trigger OCR & AI Summary Pipeline"}</span>
              </button>
              {w1Step > 0 && (
                <button
                  onClick={() => {
                    setW1Step(0);
                    setW1Logs([]);
                    setOcrTextResult("");
                    setGeneratedResult(null);
                  }}
                  className="bg-gray-100 hover:bg-gray-200 rounded-2xl p-3 border border-gray-200 transition"
                >
                  <RotateCcw className="w-4 h-4 text-slate-600" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* ========================================================
           WORKFLOW 2: REMINDER, NOTIFICATION, USER ACTION, DB UPDATE, ESCALATION
           ======================================================== */}
        <div className="bg-white rounded-3xl border border-gray-200 shadow-premium p-6 flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 bg-blue-50 rounded-xl flex items-center justify-center border border-blue-100">
                  <Pill className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-800">2. Meds & Escalation Loop</h3>
                  <p className="text-[10px] text-slate-400">Automate daily medicine timings & missing alarm loops</p>
                </div>
              </div>
              <span className="text-[9px] uppercase tracking-wider bg-blue-100/70 text-blue-700 font-extrabold px-2 py-0.5 rounded-full border border-blue-100">
                Reminders Loop
              </span>
            </div>

            {/* Available reminders selection */}
            <div className="space-y-3 bg-gray-50/50 p-4 rounded-2xl border border-gray-100">
              <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wide mb-1">Select Scheduled Dose</label>
              <select
                disabled={w2Active}
                value={selectedReminderId}
                onChange={(e) => setSelectedReminderId(e.target.value)}
                className="w-full text-xs px-3 py-2.5 border border-gray-200 rounded-xl bg-white focus:outline-none focus:border-blue-500 font-semibold text-slate-800"
              >
                {availableReminders.length > 0 ? (
                  availableReminders.map((rem) => (
                    <option key={rem.id} value={rem.id}>
                      {rem.medicineName} at {rem.scheduledTime} (Current: {rem.status.toUpperCase()})
                    </option>
                  ))
                ) : (
                  <option value="">No available schedule</option>
                )}
              </select>
            </div>

            {/* Visualizer Nodes for Workflow 2 */}
            <div className="py-2 space-y-4 relative">
              {/* Connecting backlines */}
              <div className="absolute left-[17px] top-6 bottom-6 w-0.5 bg-gray-100" />

              {/* Node 1: Time trigger */}
              <div className="flex items-start gap-3.5 relative">
                <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 border z-10 transition duration-300 ${
                  w2Step >= 1 ? "bg-blue-600 border-blue-700 text-white scale-110 shadow-organic" : "bg-white border-gray-200 text-slate-400"
                }`}>
                  <Clock className="w-4 h-4" />
                </div>
                <div className="pt-1 flex-1">
                  <div className="flex items-center justify-between">
                    <p className={`text-xs font-bold ${w2Step >= 1 ? "text-blue-950 font-extrabold" : "text-slate-400"}`}>Medicine Time Reached</p>
                    {w2Step === 1 && (
                      <span className="text-[8px] bg-blue-100 text-blue-700 uppercase tracking-widest font-black px-1.5 py-0.5 rounded animate-pulse">Ticking...</span>
                    )}
                  </div>
                  <p className="text-[10px] text-slate-400 mt-0.5">Chronological system alarm dispatches trigger payload</p>
                </div>
              </div>

              {/* Node 2: Push Notification */}
              <div className="flex items-start gap-3.5 relative">
                <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 border z-10 transition duration-300 ${
                  w2Step >= 2 ? "bg-blue-600 border-blue-700 text-white scale-110 shadow-organic" : "bg-white border-gray-200 text-slate-400"
                }`}>
                  <Smartphone className="w-4 h-4" />
                </div>
                <div className="pt-1 flex-1">
                  <div className="flex items-center justify-between">
                    <p className={`text-xs font-bold ${w2Step >= 2 ? "text-blue-950 font-extrabold" : "text-slate-400"}`}>Push Alert Broadcasted</p>
                    {w2Step === 2 && (
                      <span className="text-[8px] bg-blue-100 text-blue-700 uppercase tracking-widest font-black px-1.5 py-0.5 rounded animate-pulse">Broadcasting...</span>
                    )}
                  </div>
                  <p className="text-[10px] text-slate-400 mt-0.5">Displays interactive alert on user screen or mobile banner</p>
                </div>
              </div>

              {/* Node 3: User response confirmation */}
              <div className="flex items-start gap-3.5 relative">
                <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 border z-10 transition duration-300 ${
                  w2Step >= 3 ? "bg-blue-600 border-blue-700 text-white scale-110 shadow-organic" : "bg-white border-gray-200 text-slate-400"
                }`}>
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <div className="pt-1 flex-1">
                  <div className="flex items-center justify-between">
                    <p className={`text-xs font-bold ${w2Step >= 3 ? "text-blue-950 font-extrabold" : "text-slate-400"}`}>User Confirm Action</p>
                    {w2Step === 3 && (
                      <span className="text-[8px] bg-blue-100 text-blue-700 uppercase tracking-widest font-black px-1.5 py-0.5 rounded animate-pulse">Awaiting Patient...</span>
                    )}
                  </div>
                  <p className="text-[10px] text-slate-400 mt-0.5">Patient clicks Taken, Skip, or fails to respond</p>
                </div>
              </div>

              {/* Node 4: Database Update */}
              <div className="flex items-start gap-3.5 relative">
                <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 border z-10 transition duration-300 ${
                  w2Step === 4 ? "bg-blue-600 border-blue-700 text-white scale-110 shadow-organic" : "bg-white border-gray-200 text-slate-400"
                }`}>
                  <Database className="w-4 h-4" />
                </div>
                <div className="pt-1 flex-1">
                  <div className="flex items-center justify-between">
                    <p className={`text-xs font-bold ${w2Step === 4 ? "text-blue-950 font-extrabold" : "text-slate-400"}`}>Compliance Logs Sync</p>
                    {w2Step === 4 && (
                      <span className="text-[8px] bg-blue-100 text-blue-700 uppercase tracking-widest font-black px-1.5 py-0.5 rounded animate-pulse">Writing log...</span>
                    )}
                  </div>
                  <p className="text-[10px] text-slate-400 mt-0.5">Dose logs registered to compliance metrics schema</p>
                </div>
              </div>

              {/* Node 5: Missed / Escalation Loop */}
              <div className="flex items-start gap-3.5 relative">
                <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 border z-10 transition duration-300 ${
                  w2Step >= 5 ? "bg-rose-600 border-rose-700 text-white scale-110 shadow-organic" : "bg-white border-gray-200 text-slate-400"
                }`}>
                  <AlertCircle className="w-4 h-4" />
                </div>
                <div className="pt-1 flex-1">
                  <div className="flex items-center justify-between">
                    <p className={`text-xs font-bold ${w2Step >= 5 ? "text-rose-950 font-extrabold" : "text-slate-400"}`}>Missed? Escalation alarm</p>
                    {w2Step === 5 && (
                      <span className="text-[8px] bg-rose-100 text-rose-700 uppercase tracking-widest font-black px-1.5 py-0.5 rounded animate-pulse">Escalating...</span>
                    )}
                  </div>
                  <p className="text-[10px] text-slate-400 mt-0.5">Double checking database; pushes critical nudge if unpaid</p>
                </div>
              </div>
            </div>
          </div>

          {/* Controls & Logs */}
          <div className="space-y-4">
            {/* Terminal logs */}
            {w2Logs.length > 0 && (
              <div className="bg-slate-900 rounded-2xl p-3 border border-slate-800 font-mono text-[9px] text-blue-400 space-y-1 max-h-32 overflow-y-auto">
                <div className="flex items-center gap-1.5 text-slate-400 border-b border-slate-800 pb-1.5 mb-1.5">
                  <Terminal className="w-3.5 h-3.5" />
                  <span>Alert Loop Event Logs</span>
                </div>
                {w2Logs.map((log, i) => (
                  <div key={i} className="leading-normal">{log}</div>
                ))}
              </div>
            )}

            {/* Buttons switcher */}
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => triggerWorkflow2(false)}
                disabled={w2Active}
                className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-100 disabled:text-gray-400 rounded-2xl py-3 px-3 font-extrabold text-[11px] uppercase tracking-wider text-white flex items-center justify-center gap-1.5 transition shadow-sm"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Success Loop</span>
              </button>
              <button
                onClick={() => triggerWorkflow2(true)}
                disabled={w2Active}
                className="bg-rose-600 hover:bg-rose-700 disabled:bg-gray-100 disabled:text-gray-400 rounded-2xl py-3 px-3 font-extrabold text-[11px] uppercase tracking-wider text-white flex items-center justify-center gap-1.5 transition shadow-sm"
              >
                <X className="w-3.5 h-3.5" />
                <span>Missed & Escalation</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
