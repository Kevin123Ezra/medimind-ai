import React, { useState, useEffect } from "react";
import { Medicine, Reminder } from "../types";
import { 
  Pill, 
  Check, 
  X, 
  Clock, 
  Plus, 
  AlertCircle, 
  Sparkles, 
  TrendingUp,
  Sliders,
  Calendar,
  AlertOctagon,
  ChevronRight,
  ChevronDown
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

export default function MedicationTracker() {
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [reminders, setReminders] = useState<Reminder[]>([]);
  
  // New Medicine Form State
  const [showAddForm, setShowAddForm] = useState(false);
  const [medName, setMedName] = useState("");
  const [dosage, setDosage] = useState("");
  const [instructions, setInstructions] = useState("");
  const [time, setTime] = useState("08:00 AM");

  const loadData = async () => {
    try {
      const [medsRes, remsRes] = await Promise.all([
        fetch("/api/medicines"),
        fetch("/api/reminders")
      ]);
      const medsJson = await medsRes.json();
      const remsJson = await remsRes.json();
      
      if (medsJson.success && remsJson.success) {
        setMedicines(medsJson.data);
        setReminders(remsJson.data);
      }
    } catch (e) {
      console.error("Error loading medications:", e);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleStatusToggle = async (reminderId: string, currentStatus: string) => {
    const nextStatus = currentStatus === 'taken' ? 'pending' : 'taken';
    try {
      const response = await fetch(`/api/reminders/${reminderId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus })
      });
      const json = await response.json();
      if (json.success) {
        loadData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleAddMedicine = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!medName || !dosage) return;

    try {
      const response = await fetch("/api/medicines", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: medName,
          dosage,
          instructions,
          schedules: [time]
        })
      });
      const json = await response.json();
      if (json.success) {
        setMedName("");
        setDosage("");
        setInstructions("");
        setShowAddForm(false);
        loadData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Calculate live compliance adherence rate
  const completedReminders = reminders.filter(r => r.status !== 'pending');
  const takenReminders = reminders.filter(r => r.status === 'taken');
  const adherenceRate = reminders.length > 0 
    ? Math.round((takenReminders.length / reminders.length) * 100)
    : 100;

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      
      {/* Header Info Banner with Adherence Progress */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        <div className="bg-gradient-to-br from-emerald-500 to-teal-600 text-white rounded-[24px] p-5 md:col-span-2 flex items-center justify-between shadow-premium relative overflow-hidden">
          {/* Ambient graphics */}
          <div className="absolute -right-12 -top-12 w-32 h-32 rounded-full bg-white/10 blur-[30px]" />
          
          <div className="space-y-1 relative z-10 max-w-sm">
            <h3 className="text-[10px] font-black uppercase tracking-widest text-emerald-100">Prescription Adherence Rate</h3>
            <p className="text-xs text-emerald-50 leading-relaxed font-light">
              You have successfully taken <strong className="font-extrabold text-white">{takenReminders.length}</strong> of your <strong className="font-extrabold text-white">{reminders.length}</strong> logged doses today. Adherence is essential to stabilize long-term cardiovascular thresholds!
            </p>
          </div>

          <div className="flex flex-col items-center shrink-0 ml-4 bg-white/10 backdrop-blur-md rounded-2xl px-5 py-3 border border-white/15 relative z-10 shadow-inner">
            <TrendingUp className="w-5 h-5 text-emerald-300 mb-0.5" />
            <span className="text-2xl font-black text-white">{adherenceRate}%</span>
            <span className="text-[8px] font-black text-emerald-200 uppercase tracking-wider mt-0.5">Adherence</span>
          </div>
        </div>

        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="bg-white hover:bg-slate-50 border border-slate-100 rounded-[24px] p-5 flex flex-col items-center justify-center gap-1.5 transition-all shadow-premium font-black text-xs text-brand-teal-600 cursor-pointer"
        >
          <Plus className="w-6 h-6 text-brand-teal-500" />
          <span>Add New Prescription</span>
        </button>
      </div>

      {/* Add New Medicine Form Layout */}
      <AnimatePresence>
        {showAddForm && (
          <motion.form 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            onSubmit={handleAddMedicine} 
            className="bg-white border border-slate-100 rounded-[24px] p-5 space-y-4 shadow-premium overflow-hidden"
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h4 className="text-xs font-extrabold text-slate-800 uppercase tracking-widest flex items-center gap-2">
                <Pill className="w-4.5 h-4.5 text-brand-teal-500 animate-pulse-soft" /> Prescription Specifications
              </h4>
              <button 
                type="button" 
                onClick={() => setShowAddForm(false)} 
                className="text-[10px] font-black text-slate-400 hover:text-slate-600 uppercase tracking-widest"
              >
                Cancel
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Medicine Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Metformin"
                  value={medName}
                  onChange={(e) => setMedName(e.target.value)}
                  className="w-full text-xs px-4 py-3 border border-slate-200 rounded-xl focus:border-brand-teal-500 bg-white font-semibold text-slate-800 focus:outline-none"
                />
              </div>
              <div className="space-y-1">
                <label className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Dosage Strength</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 500mg, 1 Tablet"
                  value={dosage}
                  onChange={(e) => setDosage(e.target.value)}
                  className="w-full text-xs px-4 py-3 border border-slate-200 rounded-xl focus:border-brand-teal-500 bg-white font-semibold text-slate-800 focus:outline-none"
                />
              </div>
              <div className="space-y-1">
                <label className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Meal Directions</label>
                <input
                  type="text"
                  placeholder="e.g. Take with dinner"
                  value={instructions}
                  onChange={(e) => setInstructions(e.target.value)}
                  className="w-full text-xs px-4 py-3 border border-slate-200 rounded-xl focus:border-brand-teal-500 bg-white font-semibold text-slate-800 focus:outline-none"
                />
              </div>
              <div className="space-y-1">
                <label className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Reminder Hour</label>
                <select
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  className="w-full text-xs px-4 py-3 border border-slate-200 rounded-xl focus:border-brand-teal-500 bg-white font-bold text-slate-600 focus:outline-none"
                >
                  <option value="08:00 AM">08:00 AM (Breakfast)</option>
                  <option value="12:00 PM">12:00 PM (Lunch)</option>
                  <option value="06:00 PM">06:00 PM (Dinner)</option>
                  <option value="08:00 PM">08:00 PM (Evening)</option>
                  <option value="10:00 PM">10:00 PM (Bedtime)</option>
                </select>
              </div>
            </div>

            <button 
              type="submit" 
              className="w-full bg-brand-teal-500 hover:bg-brand-teal-600 text-white font-black text-xs py-3.5 rounded-xl transition-all shadow-md uppercase tracking-wider"
            >
              Confirm Medication Schedule
            </button>
          </motion.form>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* LEFT COLUMN: ACTIVE PILL CALENDAR (7 COLUMNS) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-xs font-extrabold uppercase tracking-widest text-slate-400">Daily Compliance Schedule</h3>
            <span className="text-[10px] font-bold text-slate-400">{reminders.length} Reminders Scheduled</span>
          </div>

          <div className="space-y-3.5">
            {reminders.map(rem => (
              <div 
                key={rem.id}
                onClick={() => handleStatusToggle(rem.id, rem.status)}
                className={`p-4 rounded-[22px] border cursor-pointer transition-all flex items-center justify-between ${
                  rem.status === 'taken'
                    ? 'bg-emerald-50/20 border-emerald-100 text-slate-400'
                    : 'bg-white border-slate-100 hover:bg-slate-50/50 hover:shadow-sm'
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                    rem.status === 'taken' ? 'bg-emerald-500 text-white' : 'bg-slate-100 text-slate-400'
                  }`}>
                    <Check className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className={`text-xs font-black ${rem.status === 'taken' ? 'line-through text-slate-400' : 'text-slate-800'}`}>
                      {rem.medicineName}
                    </h4>
                    <p className="text-[9px] text-slate-400 font-bold mt-1 uppercase tracking-wide flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-slate-300" />
                      {rem.scheduledTime}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className={`text-[9px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full ${
                    rem.status === 'taken' 
                      ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' 
                      : 'bg-amber-50 text-amber-600 border border-amber-100'
                  }`}>
                    {rem.status === 'taken' ? 'Taken' : 'Pending'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT COLUMN: PRESCRIPTION INVENTORY (5 COLUMNS) */}
        <div className="lg:col-span-5 space-y-4">
          <h3 className="text-xs font-extrabold uppercase tracking-widest text-slate-400">Prescription Cabin</h3>

          <div className="space-y-4">
            {medicines.map(med => (
              <div key={med.id} className="bg-white rounded-[24px] border border-slate-100 p-5 shadow-premium space-y-3.5">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-brand-teal-50 text-brand-teal-500 flex items-center justify-center shrink-0">
                      <Pill className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-xs font-black text-slate-800">{med.name}</h4>
                      <p className="text-[9px] text-slate-400 font-extrabold uppercase mt-0.5">Strength: {med.dosage}</p>
                    </div>
                  </div>

                  <span className="text-[9px] font-black uppercase tracking-wider bg-brand-teal-50 text-brand-teal-600 border border-brand-teal-100 px-2.5 py-0.5 rounded-full">
                    Active
                  </span>
                </div>

                <div className="border-t border-slate-50 pt-3 flex flex-col space-y-2 text-[10px] text-slate-500 font-semibold">
                  <div className="flex justify-between">
                    <span>Directions:</span> 
                    <strong className="text-slate-700">{med.instructions || "Log before meal"}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Start Date:</span> 
                    <strong className="text-slate-700">{med.startDate}</strong>
                  </div>
                </div>
              </div>
            ))}
          </div>

        </div>

      </div>

    </div>
  );
}
