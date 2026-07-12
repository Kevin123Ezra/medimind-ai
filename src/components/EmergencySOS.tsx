import React, { useState, useEffect } from "react";
import { UserProfile } from "../types";
import { 
  AlertTriangle, 
  User, 
  ShieldCheck, 
  Heart, 
  Phone, 
  Edit2, 
  Check, 
  AlertOctagon, 
  Hospital, 
  Navigation, 
  Sparkles, 
  ChevronRight,
  ClipboardList
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

export default function EmergencySOS() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isSOSActive, setIsSOSActive] = useState(false);

  // Form states
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [bloodType, setBloodType] = useState("");
  const [allergiesText, setAllergiesText] = useState("");
  const [lang, setLang] = useState("en");

  const loadProfile = async () => {
    try {
      const res = await fetch("/api/profile");
      const json = await res.json();
      if (json.success) {
        setProfile(json.data);
        setFirstName(json.data.firstName);
        setLastName(json.data.lastName);
        setBloodType(json.data.bloodType);
        setAllergiesText(json.data.allergies.join(", "));
        setLang(json.data.languagePreference);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    loadProfile();
  }, []);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    const allergiesArr = allergiesText.split(",").map(s => s.trim()).filter(s => s !== "");

    try {
      const response = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName,
          lastName,
          bloodType,
          allergies: allergiesArr,
          languagePreference: lang
        })
      });
      const json = await response.json();
      if (json.success) {
        setIsEditing(false);
        loadProfile();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSOSTrigger = () => {
    setIsSOSActive(true);
    setTimeout(() => {
      alert("🚨 COORDS TRANSMITTED: MediMind AI has simulated distress notifications to family caregiver Rajesh Garcia and coordinated dispatch alerts to Metro Health Emergency Hub.");
      setIsSOSActive(false);
    }, 2000);
  };

  if (!profile) return <div className="text-center py-12 text-xs text-slate-400 font-bold uppercase tracking-wider">Loading Clinical Credentials...</div>;

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* LEFT COLUMN: PANIC HUB & HOSPITAL FINDER (7 COLUMNS) */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Panic distress button */}
          <div className="bg-rose-50 border border-rose-100 rounded-[28px] p-6 text-center space-y-4 shadow-sm relative overflow-hidden flex flex-col items-center">
            {/* Pulsing graphic grid */}
            <div className="absolute inset-0 bg-[radial-gradient(#e11d48_1px,transparent_1px)] [background-size:16px_16px] opacity-[0.02]" />

            <div className="space-y-1 relative z-10 max-w-md">
              <h3 className="text-rose-950 font-black text-sm uppercase tracking-widest flex items-center justify-center gap-2">
                <AlertOctagon className="w-5 h-5 text-rose-600 animate-bounce" /> Emergency Distress Controller
              </h3>
              <p className="text-xs text-rose-800 leading-relaxed font-semibold">
                Tapping the distress beacon below triggers a clinical telemetry package broadcast containing location variables, medical ID, and allergy indicators.
              </p>
            </div>

            {/* Glowing panic button */}
            <div className="relative w-36 h-36 flex items-center justify-center relative z-10 my-4">
              <AnimatePresence>
                {isSOSActive && (
                  <motion.div 
                    initial={{ scale: 1, opacity: 0.6 }}
                    animate={{ scale: 1.6, opacity: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ repeat: Infinity, duration: 1.5 }}
                    className="absolute inset-0 rounded-full bg-rose-600"
                  />
                )}
              </AnimatePresence>

              <button
                onClick={handleSOSTrigger}
                className={`w-28 h-28 rounded-full font-serif font-black text-xs uppercase tracking-widest border-4 border-white cursor-pointer transition-all duration-300 relative z-10 shadow-lg ${
                  isSOSActive 
                    ? 'bg-rose-800 text-white animate-pulse'
                    : 'bg-rose-600 hover:bg-rose-700 text-white active:scale-95 shadow-rose-600/30'
                }`}
              >
                {isSOSActive ? 'Alerting...' : 'SOS PANIC'}
              </button>
            </div>

            <p className="text-[10px] text-rose-500 font-black uppercase tracking-wider relative z-10">
              {isSOSActive ? 'Dispatch coordination active' : 'Hold 1s or tap to launch beacon'}
            </p>
          </div>

          {/* Nearby hospital coordination */}
          <div className="space-y-3">
            <h3 className="text-xs font-extrabold uppercase tracking-widest text-slate-400">Emergency Care Coordinators</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              <div className="bg-white rounded-[24px] border border-slate-100 p-5 flex flex-col justify-between h-40 shadow-premium">
                <div className="flex gap-3">
                  <div className="w-9 h-9 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-rose-500">
                    <Hospital className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-black text-slate-800">Metro Health Hospital</h4>
                    <p className="text-[10px] text-slate-400 font-extrabold uppercase mt-0.5">Emergency Hub — 0.8 Miles</p>
                  </div>
                </div>

                <div className="flex items-center justify-between border-t border-slate-50 pt-3 text-[10px] text-slate-400 font-bold">
                  <span className="flex items-center gap-1">
                    <Navigation className="w-3.5 h-3.5 text-brand-teal-500" /> 3 min driving
                  </span>
                  <a href="https://maps.google.com" target="_blank" className="text-brand-teal-600 hover:underline uppercase">Route Map</a>
                </div>
              </div>

              <div className="bg-white rounded-[24px] border border-slate-100 p-5 flex flex-col justify-between h-40 shadow-premium">
                <div className="flex gap-3">
                  <div className="w-9 h-9 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-rose-500">
                    <Hospital className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-black text-slate-800">Valley Endocrinology ER</h4>
                    <p className="text-[10px] text-slate-400 font-extrabold uppercase mt-0.5">Urgent Care Center — 2.4 Miles</p>
                  </div>
                </div>

                <div className="flex items-center justify-between border-t border-slate-50 pt-3 text-[10px] text-slate-400 font-bold">
                  <span className="flex items-center gap-1">
                    <Navigation className="w-3.5 h-3.5 text-brand-teal-500" /> 8 min driving
                  </span>
                  <a href="https://maps.google.com" target="_blank" className="text-brand-teal-600 hover:underline uppercase">Route Map</a>
                </div>
              </div>

            </div>
          </div>

        </div>

        {/* RIGHT COLUMN: DIGITAL MEDICAL ID CARD (5 COLUMNS) */}
        <div className="lg:col-span-5 space-y-4">
          
          <div className="flex justify-between items-center">
            <h3 className="text-xs font-extrabold uppercase tracking-widest text-slate-400">Digital Medical ID</h3>
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="text-xs font-black text-brand-teal-600 hover:text-brand-teal-700 flex items-center gap-1 bg-brand-teal-50 hover:bg-brand-teal-100 px-3.5 py-1.5 rounded-xl transition-all uppercase tracking-wide"
            >
              {isEditing ? <Check className="w-3.5 h-3.5" /> : <Edit2 className="w-3.5 h-3.5" />}
              <span>{isEditing ? "View ID" : "Edit Credentials"}</span>
            </button>
          </div>

          <AnimatePresence mode="wait">
            {isEditing ? (
              /* Profile Editing Form */
              <motion.form 
                key="edit"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onSubmit={handleUpdate} 
                className="space-y-4 bg-white p-5 rounded-[24px] border border-slate-100 shadow-premium"
              >
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="block text-[9px] font-black uppercase text-slate-400">First Name</label>
                    <input
                      type="text"
                      required
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      className="w-full text-xs px-3 py-2.5 border border-slate-200 rounded-xl bg-white focus:outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="block text-[9px] font-black uppercase text-slate-400">Last Name</label>
                    <input
                      type="text"
                      required
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      className="w-full text-xs px-3 py-2.5 border border-slate-200 rounded-xl bg-white focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="block text-[9px] font-black uppercase text-slate-400">Blood Group</label>
                    <input
                      type="text"
                      required
                      value={bloodType}
                      onChange={(e) => setBloodType(e.target.value)}
                      className="w-full text-xs px-3 py-2.5 border border-slate-200 rounded-xl bg-white focus:outline-none font-bold"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="block text-[9px] font-black uppercase text-slate-400">Language</label>
                    <select
                      value={lang}
                      onChange={(e) => setLang(e.target.value)}
                      className="w-full text-xs px-3 py-2.5 border border-slate-200 rounded-xl bg-white font-bold text-slate-600 focus:outline-none"
                    >
                      <option value="en">English (US)</option>
                      <option value="es">Español (ES)</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="block text-[9px] font-black uppercase text-slate-400">Critical Drug Allergies (Comma separated)</label>
                  <input
                    type="text"
                    placeholder="e.g. Penicillin, Peanuts"
                    value={allergiesText}
                    onChange={(e) => setAllergiesText(e.target.value)}
                    className="w-full text-xs px-3 py-2.5 border border-slate-200 rounded-xl bg-white focus:outline-none"
                  />
                </div>

                <button type="submit" className="w-full bg-brand-teal-500 hover:bg-brand-teal-600 text-white font-black text-xs py-3 rounded-xl transition-all shadow-md uppercase tracking-wider">
                  Save Medical ID Credentials
                </button>
              </motion.form>
            ) : (
              /* ID Display Card */
              <motion.div 
                key="view"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="bg-gradient-to-br from-slate-900 via-slate-850 to-brand-blue-950 text-white rounded-[26px] p-6 shadow-premium space-y-4 relative overflow-hidden"
              >
                {/* Background lines */}
                <div className="absolute inset-0 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:20px_20px] opacity-[0.03]" />

                <div className="flex justify-between items-start relative z-10">
                  <div className="flex gap-3">
                    <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center shrink-0 border border-white/10">
                      <User className="w-5 h-5 text-teal-300" />
                    </div>
                    <div>
                      <h4 className="font-serif font-black text-sm">{profile.firstName} {profile.lastName}</h4>
                      <p className="text-[10px] text-teal-200/60 font-black uppercase tracking-wider mt-0.5">Validated clinical record</p>
                    </div>
                  </div>
                  <span className="text-[9px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-3 py-1 rounded-full font-black uppercase tracking-widest">
                    Active ID
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-4 border-t border-white/10 pt-4 relative z-10">
                  <div className="flex gap-2.5 items-center">
                    <Heart className="w-4.5 h-4.5 text-rose-400 shrink-0" />
                    <div>
                      <span className="text-[8px] uppercase tracking-widest text-slate-400 block font-bold">Blood Group</span>
                      <span className="text-xs font-black">{profile.bloodType}</span>
                    </div>
                  </div>
                  <div className="flex gap-2.5 items-center">
                    <AlertTriangle className="w-4.5 h-4.5 text-amber-400 shrink-0" />
                    <div>
                      <span className="text-[8px] uppercase tracking-widest text-slate-400 block font-bold">Allergies</span>
                      <span className="text-xs font-black truncate block max-w-[120px]">
                        {profile.allergies.length > 0 ? profile.allergies.join(", ") : "None Logged"}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="border-t border-white/10 pt-4 space-y-2 text-[10px] text-slate-400 font-bold uppercase tracking-wider relative z-10">
                  <p className="flex justify-between"><span>Date of Birth:</span> <strong className="text-white font-black">{profile.dob}</strong></p>
                  <p className="flex justify-between"><span>Gender:</span> <strong className="text-white font-black">{profile.gender}</strong></p>
                  <p className="flex justify-between"><span>Primary contact:</span> <strong className="text-white font-black">Rajesh (Son) — (555) 019-9</strong></p>
                  <p className="flex justify-between"><span>Primary Insurer:</span> <strong className="text-white font-black">BCBS National Care</strong></p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Emergency Contacts card list */}
          <div className="bg-white rounded-[24px] border border-slate-100 p-5 shadow-premium space-y-3.5">
            <h4 className="text-xs font-extrabold uppercase tracking-widest text-slate-400">Emergency Distress Network</h4>
            
            <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100/50 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-rose-50 border border-rose-100 text-rose-600 flex items-center justify-center shrink-0 animate-pulse">
                  <Phone className="w-4.5 h-4.5" />
                </div>
                <div>
                  <h5 className="text-xs font-black text-slate-800">Rajesh Garcia</h5>
                  <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wide mt-0.5">Primary Caregiver — Son</p>
                </div>
              </div>
              <a href="tel:+15550199" className="text-[10px] font-black text-rose-600 hover:text-white bg-rose-50 hover:bg-rose-600 border border-rose-100 px-3.5 py-2 rounded-xl transition-all uppercase tracking-wider">
                Call Now
              </a>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
