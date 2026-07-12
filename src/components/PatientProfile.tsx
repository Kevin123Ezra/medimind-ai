import React, { useState, useEffect } from "react";
import { 
  User, 
  Mail, 
  ShieldCheck, 
  Settings, 
  Bell, 
  Eye, 
  Globe, 
  LogOut, 
  FileText, 
  Info, 
  PlusCircle,
  HelpCircle,
  Clock,
  ChevronRight,
  Heart,
  Calendar,
  Activity
} from "lucide-react";
import { UserProfile } from "../types";
import { motion, AnimatePresence } from "motion/react";
import MetricsTracker from "./MetricsTracker";

interface PatientProfileProps {
  onLogout: () => void;
  userEmail: string;
}

export default function PatientProfile({ onLogout, userEmail }: PatientProfileProps) {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  
  // Settings toggle states
  const [notifsEnabled, setNotifsEnabled] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [vitalsTabActive, setVitalsTabActive] = useState(false);

  const loadProfile = async () => {
    try {
      const res = await fetch("/api/profile");
      const json = await res.json();
      if (json.success) {
        setProfile(json.data);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    loadProfile();
  }, []);

  if (!profile) return <div className="text-center py-12 text-xs text-slate-400 font-bold uppercase tracking-wider">Loading Clinical Settings...</div>;

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      
      {/* Sub navigation within Profile: Vitals Analytics toggle vs Account Info */}
      <div className="bg-white border border-slate-100 p-1.5 rounded-2xl flex max-w-sm shadow-premium select-none">
        <button
          onClick={() => setVitalsTabActive(false)}
          className={`flex-1 text-center py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all duration-300 ${
            !vitalsTabActive 
              ? 'bg-gradient-to-r from-brand-teal-500 to-brand-blue-500 text-white shadow-md'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          General Profile
        </button>
        <button
          onClick={() => setVitalsTabActive(true)}
          className={`flex-1 text-center py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all duration-300 ${
            vitalsTabActive 
              ? 'bg-gradient-to-r from-brand-teal-500 to-brand-blue-500 text-white shadow-md'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          Detailed Vitals History
        </button>
      </div>

      <AnimatePresence mode="wait">
        {vitalsTabActive ? (
          /* 1. DETAILED VITALS ANALYTICS */
          <motion.div
            key="vitals"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <div className="mb-4">
              <h3 className="text-lg font-serif font-black text-slate-900">Vitals Analytics Database</h3>
              <p className="text-xs text-slate-400 font-semibold mt-1">Review longitudinal blood pressure values, hydration logs, steps diaries, and sleep tracking cycles</p>
            </div>
            <MetricsTracker />
          </motion.div>
        ) : (
          /* 2. GENERAL PROFILE & PREFERENCES */
          <motion.div
            key="general"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="grid grid-cols-1 lg:grid-cols-12 gap-6"
          >
            {/* Left column: User Credentials Details (7 cols) */}
            <div className="lg:col-span-7 space-y-6">
              
              {/* Profile Card Summary */}
              <div className="bg-white rounded-[28px] border border-slate-100 p-6 shadow-premium flex flex-col md:flex-row items-center gap-6">
                {/* Avatar Initial Block */}
                <div className="w-20 h-20 rounded-[24px] bg-gradient-to-tr from-brand-teal-500 to-brand-blue-500 text-white font-serif font-black text-3xl flex items-center justify-center shadow-lg relative shrink-0">
                  {profile.firstName[0]}{profile.lastName[0]}
                  <span className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-emerald-500 border-2 border-white flex items-center justify-center text-[10px]" title="Validated clinical account">
                    ✓
                  </span>
                </div>

                <div className="space-y-1.5 text-center md:text-left flex-1">
                  <div className="flex flex-col md:flex-row md:items-center gap-2">
                    <h3 className="font-serif font-black text-slate-900 text-xl leading-none">{profile.firstName} {profile.lastName}</h3>
                    <span className="text-[9px] uppercase font-black bg-brand-teal-50 text-brand-teal-600 border border-brand-teal-100 px-2.5 py-0.5 rounded-full self-center">
                      Verified Patient
                    </span>
                  </div>
                  
                  <p className="text-xs text-slate-400 font-semibold flex items-center justify-center md:justify-start gap-1.5 mt-0.5">
                    <Mail className="w-4 h-4 text-slate-300" />
                    {userEmail || "anita.garcia@medimind.org"}
                  </p>

                  <div className="flex justify-center md:justify-start gap-4 text-[10px] text-slate-500 font-bold pt-2 uppercase">
                    <span className="bg-slate-50 px-3 py-1 rounded-xl border border-slate-100/50">DOB: {profile.dob}</span>
                    <span className="bg-slate-50 px-3 py-1 rounded-xl border border-slate-100/50">Gender: {profile.gender}</span>
                  </div>
                </div>
              </div>

              {/* Patient characteristics and clinical insurance settings */}
              <div className="bg-white rounded-[28px] border border-slate-100 p-6 shadow-premium space-y-4">
                <h4 className="text-xs font-extrabold uppercase tracking-widest text-slate-400 border-b border-slate-100 pb-2">Clinical Characteristics</h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-semibold text-slate-600">
                  <div className="bg-slate-50 border border-slate-100/50 rounded-2xl p-4 flex items-start gap-3.5">
                    <Heart className="w-5 h-5 text-rose-500 shrink-0 mt-0.5 animate-pulse-soft" />
                    <div>
                      <span className="text-[9px] uppercase tracking-wider text-slate-400 block font-bold">Blood Group</span>
                      <strong className="text-slate-800 text-sm mt-0.5 block">{profile.bloodType}</strong>
                    </div>
                  </div>

                  <div className="bg-slate-50 border border-slate-100/50 rounded-2xl p-4 flex items-start gap-3.5">
                    <ShieldCheck className="w-5 h-5 text-indigo-500 shrink-0 mt-0.5" />
                    <div>
                      <span className="text-[9px] uppercase tracking-wider text-slate-400 block font-bold">Primary Insurer</span>
                      <strong className="text-slate-800 text-sm mt-0.5 block">BCBS National Care</strong>
                    </div>
                  </div>

                  <div className="bg-slate-50 border border-slate-100/50 rounded-2xl p-4 flex items-start gap-3.5 md:col-span-2">
                    <Activity className="w-5 h-5 text-brand-teal-500 shrink-0 mt-0.5" />
                    <div>
                      <span className="text-[9px] uppercase tracking-wider text-slate-400 block font-bold">Medical Conditions & Alignments</span>
                      <p className="text-slate-800 text-xs mt-1.5 leading-relaxed font-bold">
                        Mild Type-2 Metabolic Resistance, Hypertension (Stage-1, controlled with Lisinopril), drug sensitivity to Penicillin derivatives.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

            </div>

            {/* Right column: Interactive Preferences Toggles (5 cols) */}
            <div className="lg:col-span-5 space-y-6">
              
              {/* Preferences Settings */}
              <div className="bg-white rounded-[28px] border border-slate-100 p-6 shadow-premium space-y-5">
                <h4 className="text-xs font-extrabold uppercase tracking-widest text-slate-400 border-b border-slate-100 pb-2 flex items-center gap-2">
                  <Settings className="w-4.5 h-4.5 text-slate-400" /> Preferences
                </h4>

                <div className="space-y-4.5">
                  {/* Notifications Toggle */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400">
                        <Bell className="w-4.5 h-4.5 text-brand-teal-500" />
                      </div>
                      <div>
                        <span className="text-xs font-black text-slate-800 block">Medication Reminders</span>
                        <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Push Dispatch Protocols</span>
                      </div>
                    </div>
                    <button 
                      onClick={() => setNotifsEnabled(!notifsEnabled)}
                      className={`w-11 h-6 rounded-full transition-all relative ${
                        notifsEnabled ? 'bg-brand-teal-500' : 'bg-slate-200'
                      }`}
                    >
                      <div className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-all ${
                        notifsEnabled ? 'right-1' : 'left-1'
                      }`} />
                    </button>
                  </div>

                  {/* Eye safe Theme Toggle */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400">
                        <Eye className="w-4.5 h-4.5 text-indigo-500" />
                      </div>
                      <div>
                        <span className="text-xs font-black text-slate-800 block">Confidential Privacy Veil</span>
                        <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Mask critical metrics</span>
                      </div>
                    </div>
                    <button 
                      onClick={() => setDarkMode(!darkMode)}
                      className={`w-11 h-6 rounded-full transition-all relative ${
                        darkMode ? 'bg-indigo-500' : 'bg-slate-200'
                      }`}
                    >
                      <div className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-all ${
                        darkMode ? 'right-1' : 'left-1'
                      }`} />
                    </button>
                  </div>

                  {/* Language Selector */}
                  <div className="flex items-center justify-between pt-1 border-t border-slate-50">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400">
                        <Globe className="w-4.5 h-4.5 text-brand-blue-500" />
                      </div>
                      <div>
                        <span className="text-xs font-black text-slate-800 block">Clinical Language</span>
                        <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Summary Translations</span>
                      </div>
                    </div>
                    <select
                      value={profile.languagePreference}
                      onChange={(e) => alert("Language translation has been updated. Clinical summaries will now translate into " + (e.target.value === 'es' ? 'Spanish' : 'English') + ".")}
                      className="text-xs font-bold text-slate-600 bg-slate-50 px-3.5 py-1.5 border border-slate-200 focus:outline-none rounded-xl"
                    >
                      <option value="en">English (US)</option>
                      <option value="es">Español (ES)</option>
                    </select>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100/50 flex flex-col gap-2">
                  <button 
                    onClick={() => alert("Simulated: You are accessing HIPAA version v2.9. Confidential guidelines have been saved on this local medical client.")}
                    className="w-full text-left py-2.5 px-3 rounded-xl hover:bg-slate-50 text-[10px] font-extrabold uppercase tracking-wider text-slate-400 flex items-center justify-between"
                  >
                    <span>Inspect Medical Privacy Policy</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Log Out button */}
              <button 
                onClick={onLogout}
                className="w-full bg-rose-50 hover:bg-rose-100 border border-rose-100/50 text-rose-600 rounded-[24px] py-4 text-xs font-black uppercase tracking-widest shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <LogOut className="w-4.5 h-4.5 text-rose-500 shrink-0" />
                <span>Log Out of Medical Terminal</span>
              </button>

            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
