import React, { useState, useEffect } from "react";
import { 
  Home, 
  FileText, 
  Sparkles, 
  Pill, 
  User, 
  Heart, 
  AlertTriangle, 
  X, 
  Calendar, 
  Clock, 
  Check, 
  Video,
  ChevronRight,
  UserCheck
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import AuthScreens from "./components/AuthScreens";
import HomeDashboard from "./components/HomeDashboard";
import ReportExplainer from "./components/ReportExplainer";
import CompanionChat from "./components/CompanionChat";
import MedicationTracker from "./components/MedicationTracker";
import PatientProfile from "./components/PatientProfile";
import EmergencySOS from "./components/EmergencySOS";

export default function App() {
  // Session details
  const [userSession, setUserSession] = useState<{ name: string; email: string } | null>(null);
  
  // Tab Navigation: 'home' | 'reports' | 'assistant' | 'meds' | 'profile'
  const [activeTab, setActiveTab] = useState<'home' | 'reports' | 'assistant' | 'meds' | 'profile'>('home');

  // Modal overlays
  const [showSOSModal, setShowSOSModal] = useState(false);
  const [showAddMedModal, setShowAddMedModal] = useState(false);
  const [showAppointmentModal, setShowAppointmentModal] = useState(false);

  // Form states inside Add Medication modal
  const [medName, setMedName] = useState("");
  const [medDosage, setMedDosage] = useState("");
  const [medInstructions, setMedInstructions] = useState("");
  const [medTime, setMedTime] = useState("08:00 AM");
  const [isMedSaving, setIsMedSaving] = useState(false);

  // Form states inside Appointment modal
  const [apptDoctor, setApptDoctor] = useState("Dr. Susan Jenkins");
  const [apptDay, setApptDay] = useState("Today at 2:00 PM");
  const [apptStatus, setApptStatus] = useState<'idle' | 'booked'>('idle');

  // Auto-login helper or reload trigger if needed
  const handleAuthComplete = (userData: { name: string; email: string }) => {
    setUserSession(userData);
    setActiveTab('home');
  };

  const handleLogout = () => {
    setUserSession(null);
  };

  const handleCreateMedication = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!medName || !medDosage || isMedSaving) return;
    setIsMedSaving(true);
    try {
      const response = await fetch("/api/medicines", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: medName,
          dosage: medDosage,
          instructions: medInstructions,
          schedules: [medTime]
        })
      });
      const json = await response.json();
      if (json.success) {
        setMedName("");
        setMedDosage("");
        setMedInstructions("");
        setShowAddMedModal(false);
        // Force reload active metrics or child state by triggering active tab refresh
        setActiveTab('meds');
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsMedSaving(false);
    }
  };

  const handleBookAppointment = () => {
    setApptStatus('booked');
    setTimeout(() => {
      setShowAppointmentModal(false);
      setApptStatus('idle');
      alert("📅 CONFIRMED: Your medical visit with Dr. Susan Jenkins has been registered in MyChart and synced with Google Calendar alerts.");
    }, 1800);
  };

  return (
    <div className="min-h-screen bg-[#f7faf9] flex flex-col font-sans select-none relative">
      
      {/* If user session is not active, display splash and onboarding */}
      <AnimatePresence mode="wait">
        {!userSession ? (
          <motion.div 
            key="auth"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="w-full"
          >
            <AuthScreens onAuthComplete={handleAuthComplete} />
          </motion.div>
        ) : (
          /* MAIN WEB APPLICATION SHELL */
          <motion.div 
            key="app"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex-grow flex flex-col justify-between"
          >
            
            {/* Header branding band */}
            <header className="bg-white/90 backdrop-blur-md border-b border-slate-100/80 sticky top-0 z-40 px-6 py-4">
              <div className="max-w-7xl mx-auto flex items-center justify-between">
                
                {/* Brand Logo */}
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-brand-teal-500 to-brand-blue-500 shadow-md flex items-center justify-center text-white">
                    <Heart className="w-5.5 h-5.5 animate-pulse-soft" />
                  </div>
                  <div>
                    <h1 className="text-md font-extrabold tracking-tight text-slate-900 flex items-center gap-1.5 leading-none">
                      MediMind AI
                    </h1>
                    <p className="text-[9px] text-slate-400 font-extrabold uppercase tracking-widest mt-0.5">Your Clinical Health Companion</p>
                  </div>
                </div>

                {/* Patient Profile Quick Actions */}
                <div 
                  onClick={() => setActiveTab('profile')}
                  className="flex items-center gap-2.5 bg-slate-50 border border-slate-100/50 hover:bg-slate-100/50 px-3.5 py-1.5 rounded-2xl cursor-pointer transition-all"
                >
                  <div className="w-7.5 h-7.5 rounded-xl bg-gradient-to-tr from-brand-teal-500 to-brand-blue-500 text-white flex items-center justify-center text-xs font-serif font-black">
                    AG
                  </div>
                  <div className="hidden sm:block text-left">
                    <p className="text-[10px] font-black text-slate-800 leading-none">Anita Garcia</p>
                    <p className="text-[8px] text-brand-teal-600 font-extrabold uppercase mt-0.5">Verified Case</p>
                  </div>
                </div>

              </div>
            </header>

            {/* Core Workspace Stage Container */}
            <main className="flex-grow max-w-7xl w-full mx-auto px-4 md:px-6 py-6 overflow-hidden flex flex-col justify-start">
              
              {activeTab === 'home' && (
                <HomeDashboard 
                  onNavigateTab={(tab) => setActiveTab(tab)} 
                  onTriggerSOS={() => setShowSOSModal(true)}
                  onOpenAddMedModal={() => setShowAddMedModal(true)}
                  onOpenAppointmentModal={() => setShowAppointmentModal(true)}
                />
              )}

              {activeTab === 'reports' && <ReportExplainer />}

              {activeTab === 'assistant' && <CompanionChat />}

              {activeTab === 'meds' && <MedicationTracker />}

              {activeTab === 'profile' && (
                <PatientProfile 
                  onLogout={handleLogout} 
                  userEmail={userSession.email} 
                />
              )}

            </main>

            {/* Footer Patient Safeguard Panel */}
            <footer className="bg-white border-t border-slate-100 py-4 px-6 text-center text-[9px] text-slate-400 font-semibold uppercase tracking-wider">
              <p>© 2026 MediMind Clinical Systems Inc. Validated HIPAA & MyChart API coordination nodes.</p>
            </footer>

            {/* Bottom Navigation Navigation bar */}
            <nav className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-slate-100 py-2 px-6 z-40 shadow-xl flex justify-around select-none">
              
              <button
                onClick={() => setActiveTab('home')}
                className={`flex flex-col items-center gap-1 px-4.5 py-2.5 rounded-2xl transition-all ${
                  activeTab === 'home'
                    ? 'text-brand-teal-600 bg-brand-teal-50/50 font-black'
                    : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                <Home className="w-5 h-5" />
                <span className="text-[9px] uppercase tracking-wider font-extrabold">Home</span>
              </button>

              <button
                onClick={() => setActiveTab('reports')}
                className={`flex flex-col items-center gap-1 px-4.5 py-2.5 rounded-2xl transition-all ${
                  activeTab === 'reports'
                    ? 'text-brand-teal-600 bg-brand-teal-50/50 font-black'
                    : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                <FileText className="w-5 h-5" />
                <span className="text-[9px] uppercase tracking-wider font-extrabold">Reports</span>
              </button>

              <button
                onClick={() => setActiveTab('assistant')}
                className={`flex flex-col items-center gap-1 px-4.5 py-2.5 rounded-2xl transition-all ${
                  activeTab === 'assistant'
                    ? 'text-brand-teal-600 bg-brand-teal-50/50 font-black'
                    : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                <Sparkles className="w-5 h-5 animate-pulse-soft" />
                <span className="text-[9px] uppercase tracking-wider font-extrabold">AI Assistant</span>
              </button>

              <button
                onClick={() => setActiveTab('meds')}
                className={`flex flex-col items-center gap-1 px-4.5 py-2.5 rounded-2xl transition-all ${
                  activeTab === 'meds'
                    ? 'text-brand-teal-600 bg-brand-teal-50/50 font-black'
                    : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                <Pill className="w-5 h-5" />
                <span className="text-[9px] uppercase tracking-wider font-extrabold">Medications</span>
              </button>

              <button
                onClick={() => setActiveTab('profile')}
                className={`flex flex-col items-center gap-1 px-4.5 py-2.5 rounded-2xl transition-all ${
                  activeTab === 'profile'
                    ? 'text-brand-teal-600 bg-brand-teal-50/50 font-black'
                    : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                <User className="w-5 h-5" />
                <span className="text-[9px] uppercase tracking-wider font-extrabold">Profile</span>
              </button>

            </nav>

          </motion.div>
        )}
      </AnimatePresence>

      {/* ========================================================
         MODAL WINDOWS & TRIGGERS
         ======================================================== */}

      {/* 1. EMERGENCY SOS DIAL OVERLAY */}
      <AnimatePresence>
        {showSOSModal && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white w-full max-w-lg rounded-[28px] border border-slate-100 shadow-premium p-6 relative overflow-hidden space-y-4"
            >
              <button 
                onClick={() => setShowSOSModal(false)}
                className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                <AlertTriangle className="w-5.5 h-5.5 text-rose-500 animate-pulse" />
                <div>
                  <h3 className="font-serif font-black text-slate-900 text-sm">Distress Panic Controller</h3>
                  <p className="text-[9px] text-slate-400 font-extrabold uppercase">Emergency Broadcast Terminal</p>
                </div>
              </div>

              <EmergencySOS />
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 2. QUICK ACTIONS: ADD MEDICATION MODAL */}
      <AnimatePresence>
        {showAddMedModal && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white w-full max-w-md rounded-[28px] border border-slate-100 shadow-premium p-6 relative overflow-hidden space-y-4"
            >
              <button 
                onClick={() => setShowAddMedModal(false)}
                className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                <Pill className="w-5.5 h-5.5 text-brand-teal-500" />
                <div>
                  <h3 className="font-serif font-black text-slate-900 text-sm">Add New Prescription</h3>
                  <p className="text-[9px] text-slate-400 font-extrabold uppercase">Sync schedule reminders</p>
                </div>
              </div>

              <form onSubmit={handleCreateMedication} className="space-y-4 pt-2">
                <div className="space-y-1">
                  <label className="block text-[9px] font-extrabold uppercase tracking-wider text-slate-400">Medicine Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Metformin"
                    value={medName}
                    onChange={(e) => setMedName(e.target.value)}
                    className="w-full text-xs px-4 py-3 border border-slate-200 rounded-xl focus:border-brand-teal-500 focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-[9px] font-extrabold uppercase tracking-wider text-slate-400">Strength / Volume</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 500mg, 1 Tablet"
                    value={medDosage}
                    onChange={(e) => setMedDosage(e.target.value)}
                    className="w-full text-xs px-4 py-3 border border-slate-200 rounded-xl focus:border-brand-teal-500 focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-[9px] font-extrabold uppercase tracking-wider text-slate-400">Meal Directions</label>
                  <input
                    type="text"
                    placeholder="e.g. Take with dinner"
                    value={medInstructions}
                    onChange={(e) => setMedInstructions(e.target.value)}
                    className="w-full text-xs px-4 py-3 border border-slate-200 rounded-xl focus:border-brand-teal-500 focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-[9px] font-extrabold uppercase tracking-wider text-slate-400">Reminder Hour</label>
                  <select
                    value={medTime}
                    onChange={(e) => setMedTime(e.target.value)}
                    className="w-full text-xs px-4 py-3 border border-slate-200 rounded-xl focus:border-brand-teal-500 bg-white font-bold text-slate-600 focus:outline-none"
                  >
                    <option value="08:00 AM">08:00 AM (Breakfast)</option>
                    <option value="12:00 PM">12:00 PM (Lunch)</option>
                    <option value="06:00 PM">06:00 PM (Dinner)</option>
                    <option value="08:00 PM">08:00 PM (Evening)</option>
                  </select>
                </div>

                <button 
                  type="submit"
                  disabled={isMedSaving}
                  className="w-full bg-brand-teal-500 hover:bg-brand-teal-600 text-white font-black text-xs py-3.5 rounded-xl uppercase tracking-wider transition-all"
                >
                  {isMedSaving ? "Saving..." : "Save Medication Schedule"}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 3. QUICK ACTIONS: BOOK CLINICAL APPOINTMENT */}
      <AnimatePresence>
        {showAppointmentModal && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white w-full max-w-md rounded-[28px] border border-slate-100 shadow-premium p-6 relative overflow-hidden space-y-4"
            >
              <button 
                onClick={() => setShowAppointmentModal(false)}
                className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                <Calendar className="w-5.5 h-5.5 text-brand-teal-500" />
                <div>
                  <h3 className="font-serif font-black text-slate-900 text-sm">Schedule Visit</h3>
                  <p className="text-[9px] text-slate-400 font-extrabold uppercase">Confirm consultation slots</p>
                </div>
              </div>

              <div className="space-y-4 pt-2">
                <div className="space-y-1">
                  <label className="block text-[9px] font-extrabold uppercase tracking-wider text-slate-400">Specialist Physician</label>
                  <select 
                    value={apptDoctor}
                    onChange={(e) => setApptDoctor(e.target.value)}
                    className="w-full text-xs px-4 py-3 border border-slate-200 rounded-xl bg-white font-bold text-slate-600 focus:outline-none"
                  >
                    <option value="Dr. Susan Jenkins">Dr. Susan Jenkins (Endocrinology Specialist)</option>
                    <option value="Dr. Robert Chen">Dr. Robert Chen (Cardiology Consultant)</option>
                    <option value="Dr. Sarah Patel">Dr. Sarah Patel (Family Medicine PCP)</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="block text-[9px] font-extrabold uppercase tracking-wider text-slate-400">Available Consultation Hour</label>
                  <select 
                    value={apptDay}
                    onChange={(e) => setApptDay(e.target.value)}
                    className="w-full text-xs px-4 py-3 border border-slate-200 rounded-xl bg-white font-bold text-slate-600 focus:outline-none"
                  >
                    <option value="Today at 2:00 PM">Today at 2:00 PM (EDT)</option>
                    <option value="Tomorrow at 9:30 AM">Tomorrow at 9:30 AM (EDT)</option>
                    <option value="Wednesday at 11:00 AM">Wednesday at 11:00 AM (EDT)</option>
                  </select>
                </div>

                <div className="bg-brand-teal-50/50 p-4 border border-brand-teal-100/30 rounded-2xl flex items-start gap-2.5 text-[11px] text-brand-teal-800 leading-normal font-medium">
                  <Video className="w-4.5 h-4.5 text-brand-teal-500 shrink-0 mt-0.5" />
                  <span>The appointment will schedule as an encrypted telehealth conference room, joinable directly from your home dashboard panel.</span>
                </div>

                <button 
                  onClick={handleBookAppointment}
                  disabled={apptStatus === 'booked'}
                  className="w-full bg-gradient-to-r from-brand-teal-500 to-brand-blue-500 hover:from-brand-teal-600 hover:to-brand-blue-600 text-white font-black text-xs py-3.5 rounded-xl uppercase tracking-wider transition-all"
                >
                  {apptStatus === 'booked' ? 'Sheduling with MyChart Node...' : 'Confirm Consultation Booking'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
