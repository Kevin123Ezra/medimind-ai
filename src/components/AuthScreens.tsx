import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Heart, 
  Activity, 
  ChevronRight, 
  Mail, 
  Lock, 
  User, 
  Phone, 
  Calendar, 
  ShieldAlert, 
  Sparkles, 
  CheckCircle, 
  Users, 
  ArrowLeft,
  Info
} from "lucide-react";

interface AuthScreensProps {
  onAuthComplete: (userData: { name: string; email: string }) => void;
}

export default function AuthScreens({ onAuthComplete }: AuthScreensProps) {
  const [screen, setScreen] = useState<'splash' | 'onboarding' | 'login' | 'register' | 'forgot_password' | 'verification'>('splash');
  const [onboardingIndex, setOnboardingIndex] = useState(0);

  // Form states
  const [loginEmail, setLoginEmail] = useState("anita.garcia@medimind.org");
  const [loginPassword, setLoginPassword] = useState("••••••••");
  const [rememberMe, setRememberMe] = useState(true);

  const [regName, setRegName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [regConfirmPassword, setRegConfirmPassword] = useState("");
  const [regPhone, setRegPhone] = useState("");
  const [regDob, setRegDob] = useState("");
  const [regGender, setRegGender] = useState("Female");
  const [regEmergency, setRegEmergency] = useState("");
  const [regAgree, setRegAgree] = useState(false);

  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotSubmitted, setForgotSubmitted] = useState(false);

  const [verificationCode, setVerificationCode] = useState(["", "", "", "", "", ""]);

  // Validation warnings
  const [errorMsg, setErrorMsg] = useState("");

  // Auto-transition splash screen after 2.5s
  useEffect(() => {
    if (screen === 'splash') {
      const timer = setTimeout(() => {
        setScreen('onboarding');
      }, 2500);
      return () => clearTimeout(timer);
    }
  }, [screen]);

  // Handle slide controls
  const handleNextOnboarding = () => {
    if (onboardingIndex < 2) {
      setOnboardingIndex(prev => prev + 1);
    } else {
      setScreen('login');
    }
  };

  const handleSkipOnboarding = () => {
    setScreen('login');
  };

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginEmail || !loginPassword) {
      setErrorMsg("Please enter both your email and password.");
      return;
    }
    setErrorMsg("");
    // Take user to Verification screen first to demonstrate the full clinical check
    setScreen('verification');
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!regName || !regEmail || !regPassword || !regConfirmPassword) {
      setErrorMsg("Please fill out all required fields.");
      return;
    }
    if (regPassword !== regConfirmPassword) {
      setErrorMsg("Passwords do not match.");
      return;
    }
    if (!regAgree) {
      setErrorMsg("You must agree to the Terms of Service.");
      return;
    }
    setErrorMsg("");
    setScreen('verification');
  };

  const handleForgotSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotEmail) {
      setErrorMsg("Please fill in your registered email.");
      return;
    }
    setErrorMsg("");
    setForgotSubmitted(true);
  };

  const handleCodeChange = (index: number, val: string) => {
    if (val.length > 1) return;
    const newCode = [...verificationCode];
    newCode[index] = val;
    setVerificationCode(newCode);

    // Auto-focus next input
    if (val && index < 5) {
      const nextInput = document.getElementById(`pin-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handleVerifySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Finish auth and call prop
    const name = regName || "Anita Garcia";
    const email = regEmail || loginEmail;
    onAuthComplete({ name, email });
  };

  const onboardingData = [
    {
      title: "Understand Your Health",
      desc: "Upload diagnostic reports or paste clinical summaries and receive clear, patient-friendly AI translations in seconds.",
      illustration: (
        <div className="relative w-full h-56 flex items-center justify-center">
          {/* Pulsing Background circles */}
          <div className="absolute w-44 h-44 rounded-full bg-brand-teal-50/70 border border-brand-teal-100/40 animate-pulse" />
          <div className="absolute w-32 h-32 rounded-full bg-brand-teal-100/40" />
          
          {/* Animated Report Page */}
          <motion.div 
            initial={{ y: 15, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8 }}
            className="relative bg-white w-28 h-36 rounded-2xl shadow-xl border border-gray-100 p-4 space-y-2 z-10"
          >
            <div className="flex items-center gap-1.5 border-b border-gray-100 pb-2">
              <div className="w-5 h-5 rounded-lg bg-brand-teal-500 text-white flex items-center justify-center">
                <Activity className="w-3 h-3" />
              </div>
              <div className="w-12 h-2 bg-slate-200 rounded" />
            </div>
            <div className="w-full h-1.5 bg-slate-100 rounded" />
            <div className="w-3/4 h-1.5 bg-slate-100 rounded" />
            <div className="w-5/6 h-1.5 bg-slate-100 rounded" />
            
            {/* AI translation floating badge */}
            <motion.div
              animate={{ y: [0, -4, 0] }}
              transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
              className="absolute -right-4 -bottom-2 bg-gradient-to-r from-emerald-500 to-brand-teal-500 text-white rounded-xl px-2.5 py-1.5 shadow-lg border border-white flex items-center gap-1 text-[9px] font-bold"
            >
              <Sparkles className="w-2.5 h-2.5" />
              <span>AI Explaining...</span>
            </motion.div>
          </motion.div>
        </div>
      )
    },
    {
      title: "Never Miss Medication",
      desc: "Smart pill reminders, schedule tracking, and detailed warnings ensure you take the right dose at the optimal hour.",
      illustration: (
        <div className="relative w-full h-56 flex items-center justify-center">
          <div className="absolute w-44 h-44 rounded-full bg-indigo-50/70 border border-indigo-100/40 animate-pulse" />
          <div className="absolute w-32 h-32 rounded-full bg-indigo-100/40" />

          {/* Animated Capsules & Alarm */}
          <motion.div 
            initial={{ scale: 0.8, rotate: -10 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring", stiffness: 100 }}
            className="relative bg-white p-5 rounded-3xl shadow-xl border border-gray-100 text-center space-y-3 z-10 w-36"
          >
            <div className="flex justify-center gap-1">
              <motion.div 
                animate={{ rotate: [0, 15, -15, 0] }}
                transition={{ repeat: Infinity, duration: 2 }}
                className="w-8 h-8 rounded-full bg-amber-500 text-white flex items-center justify-center shadow-md shadow-amber-500/20"
              >
                <Heart className="w-4.5 h-4.5" />
              </motion.div>
            </div>
            
            <div>
              <p className="text-[11px] font-black text-slate-800">Lisinopril 10mg</p>
              <p className="text-[8px] text-slate-400 font-extrabold uppercase mt-0.5">Scheduled at 08:00 AM</p>
            </div>

            <span className="inline-block text-[9px] font-extrabold bg-emerald-50 text-emerald-600 border border-emerald-100 px-3 py-1 rounded-full">
              Pill Reminder Active
            </span>
          </motion.div>
        </div>
      )
    },
    {
      title: "Your AI Health Companion",
      desc: "Engage in secure, clinical conversations with Dr. Jenkins' customized medical assistant anytime, anywhere.",
      illustration: (
        <div className="relative w-full h-56 flex items-center justify-center">
          <div className="absolute w-44 h-44 rounded-full bg-calm-purple-50/70 border border-calm-purple-100/40 animate-pulse" />
          <div className="absolute w-32 h-32 rounded-full bg-calm-purple-100/40" />

          {/* Chat bubbles illustration */}
          <div className="relative z-10 w-44 space-y-2.5">
            <motion.div 
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="bg-white border border-gray-100 rounded-2xl p-3 shadow-md rounded-bl-none text-left"
            >
              <p className="text-[10px] font-bold text-slate-700 leading-normal">What are the side effects of Metformin?</p>
            </motion.div>

            <motion.div 
              initial={{ x: 20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="bg-gradient-to-r from-calm-purple-500 to-indigo-500 text-white rounded-2xl p-3 shadow-md rounded-br-none text-left"
            >
              <div className="flex items-center gap-1 mb-1">
                <Sparkles className="w-3 h-3 text-amber-200" />
                <span className="text-[8px] font-bold uppercase tracking-wider">Clinical AI assistant</span>
              </div>
              <p className="text-[10px] leading-normal font-medium">Mild nausea is common. Take it with meals to reduce irritation...</p>
            </motion.div>
          </div>
        </div>
      )
    }
  ];

  return (
    <div className="min-h-screen bg-[#f8faf9] flex items-center justify-center p-4">
      
      {/* Container Card */}
      <div className="bg-white w-full max-w-md md:max-w-4xl rounded-[32px] border border-slate-100 shadow-premium overflow-hidden min-h-[600px] flex flex-col md:flex-row relative">
        
        {/* Decorative Background grid */}
        <div className="absolute inset-0 bg-[radial-gradient(#14b8a6_1px,transparent_1px)] [background-size:24px_24px] opacity-[0.02]" />

        {/* 1. LEFT COLUMN: VISUAL BRAND PANEL (Visible on md/lg screens) */}
        <div className="hidden md:flex md:w-1/2 bg-gradient-to-tr from-brand-teal-900 via-teal-800 to-brand-blue-900 text-white p-12 flex-col justify-between relative overflow-hidden">
          {/* Animated light gradients */}
          <div className="absolute -left-20 -top-20 w-80 h-80 rounded-full bg-teal-500/10 blur-[80px]" />
          <div className="absolute -right-20 -bottom-20 w-80 h-80 rounded-full bg-blue-500/10 blur-[80px]" />

          <div className="flex items-center gap-2 relative z-10">
            <div className="w-10 h-10 rounded-xl bg-white/15 backdrop-blur-md flex items-center justify-center border border-white/20">
              <Heart className="w-5.5 h-5.5 text-teal-300" />
            </div>
            <span className="font-serif font-black text-xl tracking-tight">MediMind AI</span>
          </div>

          <div className="space-y-4 relative z-10">
            <h2 className="text-3xl font-serif font-bold leading-tight">Your health journey, simplified by AI.</h2>
            <p className="text-sm text-teal-100/80 leading-relaxed font-light">
              Connect with your clinical reports, track medication plans, and consult specialized models designed for medical understanding.
            </p>
          </div>

          <div className="flex gap-4 border-t border-white/15 pt-6 text-xs text-teal-200/60 relative z-10">
            <div className="flex items-center gap-1">
              <CheckCircle className="w-4 h-4 text-teal-400" />
              <span>HIPAA Compliant</span>
            </div>
            <div className="flex items-center gap-1">
              <CheckCircle className="w-4 h-4 text-teal-400" />
              <span>Secure Encrypted</span>
            </div>
          </div>
        </div>

        {/* 2. RIGHT COLUMN: DYNAMIC INTERACTIVE FLOW */}
        <div className="w-full md:w-1/2 p-6 md:p-12 flex flex-col justify-center relative z-10 min-h-[580px]">
          
          <AnimatePresence mode="wait">

            {/* SPLASH SCREEN */}
            {screen === 'splash' && (
              <motion.div
                key="splash"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex-1 flex flex-col items-center justify-center text-center space-y-6"
              >
                {/* Heartbeat pulse logo */}
                <div className="relative w-28 h-28 flex items-center justify-center">
                  <motion.div 
                    animate={{ scale: [1, 1.25, 1, 1.25, 1] }}
                    transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
                    className="absolute inset-0 rounded-full bg-brand-teal-500/10 border border-brand-teal-500/20"
                  />
                  <motion.div 
                    animate={{ scale: [1, 1.15, 1, 1.15, 1] }}
                    transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
                    className="absolute w-20 h-20 rounded-full bg-brand-teal-500/20"
                  />
                  <div className="relative w-14 h-14 rounded-2xl bg-gradient-to-tr from-brand-teal-500 to-brand-blue-500 shadow-lg flex items-center justify-center text-white">
                    <Heart className="w-7 h-7" />
                  </div>
                </div>

                <div>
                  <h1 className="text-3xl font-serif font-black tracking-tight text-slate-900">MediMind AI</h1>
                  <p className="text-sm text-slate-500 font-semibold mt-1">Your Personal AI Health Companion</p>
                </div>

                {/* Loading animation bar */}
                <div className="w-36 h-1.5 bg-slate-100 rounded-full overflow-hidden border border-slate-200/20">
                  <motion.div 
                    initial={{ left: "-100%" }}
                    animate={{ left: "100%" }}
                    transition={{ duration: 1.8, repeat: Infinity, ease: "linear" }}
                    className="relative w-full h-full bg-gradient-to-r from-brand-teal-500 to-brand-blue-500 rounded-full"
                  />
                </div>
              </motion.div>
            )}

            {/* ONBOARDING SLIDES */}
            {screen === 'onboarding' && (
              <motion.div
                key="onboarding"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="flex-1 flex flex-col justify-between"
              >
                {/* Skip button header */}
                <div className="flex justify-end">
                  <button 
                    onClick={handleSkipOnboarding}
                    className="text-xs font-extrabold text-slate-400 hover:text-slate-600 uppercase tracking-widest px-3 py-1"
                  >
                    Skip
                  </button>
                </div>

                {/* Slide content */}
                <div className="my-auto space-y-6 text-center">
                  {onboardingData[onboardingIndex].illustration}

                  <div className="space-y-2 max-w-xs mx-auto">
                    <h2 className="text-2xl font-serif font-black text-slate-800 tracking-tight">
                      {onboardingData[onboardingIndex].title}
                    </h2>
                    <p className="text-xs text-slate-500 leading-relaxed font-medium">
                      {onboardingData[onboardingIndex].desc}
                    </p>
                  </div>
                </div>

                {/* Navigation Controls */}
                <div className="space-y-4">
                  {/* Slider dots indicator */}
                  <div className="flex justify-center gap-1.5">
                    {[0, 1, 2].map(idx => (
                      <div 
                        key={idx}
                        className={`h-2.5 rounded-full transition-all duration-300 ${
                          onboardingIndex === idx ? "w-6 bg-brand-teal-500" : "w-2.5 bg-slate-200"
                        }`}
                      />
                    ))}
                  </div>

                  <button
                    onClick={handleNextOnboarding}
                    className="w-full bg-gradient-to-r from-brand-teal-500 to-brand-blue-500 hover:from-brand-teal-600 hover:to-brand-blue-600 text-white rounded-2xl py-4 text-xs font-black uppercase tracking-wider shadow-md transition-all flex items-center justify-center gap-1.5"
                  >
                    <span>{onboardingIndex === 2 ? "Get Started" : "Next Screen"}</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            )}

            {/* LOGIN PAGE */}
            {screen === 'login' && (
              <motion.div
                key="login"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="flex-1 flex flex-col justify-between"
              >
                {/* Brand Logo inside Mobile View */}
                <div className="flex items-center gap-2 md:hidden mb-6">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-brand-teal-500 to-brand-blue-500 text-white flex items-center justify-center shadow-md">
                    <Heart className="w-4.5 h-4.5" />
                  </div>
                  <span className="font-serif font-bold text-lg text-slate-900">MediMind AI</span>
                </div>

                <div className="space-y-1">
                  <h2 className="text-2xl font-serif font-black text-slate-900 tracking-tight">Welcome Back</h2>
                  <p className="text-xs text-slate-400 font-semibold">Enter your credentials to access clinical summaries</p>
                </div>

                {/* Validation warnings */}
                {errorMsg && (
                  <div className="mt-3 bg-rose-50 border border-rose-100 p-3 rounded-xl flex items-start gap-2 text-[10px] text-rose-700 font-medium">
                    <ShieldAlert className="w-4.5 h-4.5 text-rose-500 shrink-0" />
                    <span>{errorMsg}</span>
                  </div>
                )}

                {/* Form fields */}
                <form onSubmit={handleLoginSubmit} className="space-y-4 mt-6">
                  <div className="space-y-1">
                    <label className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Email Address</label>
                    <div className="relative">
                      <Mail className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
                      <input 
                        type="email" 
                        required
                        value={loginEmail}
                        onChange={(e) => setLoginEmail(e.target.value)}
                        placeholder="e.g. anita.garcia@medimind.org"
                        className="w-full text-xs pl-10.5 pr-4 py-3.5 border border-slate-200 focus:border-brand-teal-500 focus:ring-1 focus:ring-brand-teal-100 rounded-2xl bg-white focus:outline-none font-medium text-slate-700"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between items-center">
                      <label className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Password</label>
                      <button 
                        type="button" 
                        onClick={() => { setErrorMsg(""); setScreen('forgot_password'); }}
                        className="text-[10px] font-extrabold text-brand-teal-600 hover:text-brand-teal-700 uppercase tracking-wide"
                      >
                        Forgot?
                      </button>
                    </div>
                    <div className="relative">
                      <Lock className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
                      <input 
                        type="password" 
                        required
                        value={loginPassword}
                        onChange={(e) => setLoginPassword(e.target.value)}
                        placeholder="Enter password"
                        className="w-full text-xs pl-10.5 pr-4 py-3.5 border border-slate-200 focus:border-brand-teal-500 focus:ring-1 focus:ring-brand-teal-100 rounded-2xl bg-white focus:outline-none font-medium text-slate-700"
                      />
                    </div>
                  </div>

                  {/* Remember Me */}
                  <div className="flex items-center gap-2">
                    <input 
                      type="checkbox" 
                      id="remember"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="rounded border-gray-300 text-brand-teal-600 focus:ring-brand-teal-500 h-4 w-4"
                    />
                    <label htmlFor="remember" className="text-[10px] text-slate-400 font-bold select-none cursor-pointer">
                      Remember this medical terminal
                    </label>
                  </div>

                  {/* Buttons */}
                  <button
                    type="submit"
                    className="w-full bg-gradient-to-r from-brand-teal-500 to-brand-blue-500 hover:from-brand-teal-600 hover:to-brand-blue-600 text-white rounded-2xl py-4 text-xs font-black uppercase tracking-wider shadow-md hover:shadow-lg transition-all"
                  >
                    Log In to Your Account
                  </button>

                  {/* Google OAuth placeholder */}
                  <button
                    type="button"
                    onClick={() => { setErrorMsg(""); setScreen('verification'); }}
                    className="w-full border border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50 text-slate-700 rounded-2xl py-3.5 text-xs font-bold transition-all flex items-center justify-center gap-2"
                  >
                    <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                      <path fill="#EA4335" d="M12.24 10.285V14.4h6.887c-.648 2.41-2.519 4.2-5.136 4.2a5.714 5.714 0 0 1-5.714-5.715 5.714 5.714 0 0 1 5.714-5.714c1.44 0 2.743.514 3.754 1.388l3.12-3.12C18.91 1.765 15.823 1 12.24 1a11.24 11.24 0 0 0-11.24 11.24c0 6.208 5.032 11.24 11.24 11.24a10.457 10.457 0 0 0 10.543-11.24H12.24z"/>
                    </svg>
                    <span>Sign In with Google Identity</span>
                  </button>
                </form>

                {/* Footer Switch */}
                <div className="mt-6 text-center text-[10px] text-slate-400 font-bold uppercase tracking-wide">
                  New to MediMind?{" "}
                  <button 
                    onClick={() => { setErrorMsg(""); setScreen('register'); }}
                    className="text-brand-teal-600 hover:text-brand-teal-700 font-black"
                  >
                    Create Medical Profile
                  </button>
                </div>
              </motion.div>
            )}

            {/* REGISTER SCREEN */}
            {screen === 'register' && (
              <motion.div
                key="register"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="flex-1 flex flex-col justify-between"
              >
                <div className="flex items-center gap-2 mb-3">
                  <button 
                    onClick={() => { setErrorMsg(""); setScreen('login'); }}
                    className="p-1 hover:bg-slate-100 rounded-lg text-slate-400 transition"
                  >
                    <ArrowLeft className="w-4 h-4" />
                  </button>
                  <div>
                    <h2 className="text-xl font-serif font-black text-slate-900 tracking-tight">Create Medical Account</h2>
                    <p className="text-[10px] text-slate-400 font-semibold">Join thousands monitoring metabolic parameters daily</p>
                  </div>
                </div>

                {/* Error Box */}
                {errorMsg && (
                  <div className="mb-3 bg-rose-50 border border-rose-100 p-2.5 rounded-xl flex items-start gap-1.5 text-[9px] text-rose-700 font-medium">
                    <ShieldAlert className="w-4 h-4 text-rose-500 shrink-0" />
                    <span>{errorMsg}</span>
                  </div>
                )}

                {/* Registration fields scroll panel */}
                <form onSubmit={handleRegisterSubmit} className="space-y-3 max-h-[380px] overflow-y-auto pr-1">
                  
                  <div className="space-y-1">
                    <label className="block text-[9px] font-extrabold uppercase tracking-wider text-slate-400">Full Patient Name</label>
                    <div className="relative">
                      <User className="absolute left-3 top-2.5 w-3.5 h-3.5 text-slate-400" />
                      <input 
                        type="text" 
                        required
                        value={regName}
                        onChange={(e) => setRegName(e.target.value)}
                        placeholder="e.g. Anita Garcia"
                        className="w-full text-xs pl-9 pr-3 py-2.5 border border-slate-200 focus:border-brand-teal-500 rounded-xl bg-white focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="block text-[9px] font-extrabold uppercase tracking-wider text-slate-400">Email Address</label>
                      <input 
                        type="email" 
                        required
                        value={regEmail}
                        onChange={(e) => setRegEmail(e.target.value)}
                        placeholder="name@gmail.com"
                        className="w-full text-xs px-3.5 py-2.5 border border-slate-200 focus:border-brand-teal-500 rounded-xl bg-white focus:outline-none"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="block text-[9px] font-extrabold uppercase tracking-wider text-slate-400">Phone Number</label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-2.5 w-3.5 h-3.5 text-slate-400" />
                        <input 
                          type="tel" 
                          required
                          value={regPhone}
                          onChange={(e) => setRegPhone(e.target.value)}
                          placeholder="(555) 019-2834"
                          className="w-full text-xs pl-9 pr-3 py-2.5 border border-slate-200 focus:border-brand-teal-500 rounded-xl bg-white focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="block text-[9px] font-extrabold uppercase tracking-wider text-slate-400">Date of Birth</label>
                      <div className="relative">
                        <Calendar className="absolute left-3 top-2.5 w-3.5 h-3.5 text-slate-400" />
                        <input 
                          type="date" 
                          required
                          value={regDob}
                          onChange={(e) => setRegDob(e.target.value)}
                          className="w-full text-xs pl-9 pr-3 py-2.5 border border-slate-200 focus:border-brand-teal-500 rounded-xl bg-white focus:outline-none text-slate-600 font-bold"
                        />
                      </div>
                    </div>
                    <div className="space-y-1">
                      <label className="block text-[9px] font-extrabold uppercase tracking-wider text-slate-400">Gender</label>
                      <select 
                        value={regGender}
                        onChange={(e) => setRegGender(e.target.value)}
                        className="w-full text-xs px-3 py-2.5 border border-slate-200 focus:border-brand-teal-500 rounded-xl bg-white focus:outline-none font-semibold text-slate-600"
                      >
                        <option value="Female">Female</option>
                        <option value="Male">Male</option>
                        <option value="Non-binary">Non-binary</option>
                        <option value="Prefer not to say">Prefer not to say</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="block text-[9px] font-extrabold uppercase tracking-wider text-slate-400">Password</label>
                      <input 
                        type="password" 
                        required
                        value={regPassword}
                        onChange={(e) => setRegPassword(e.target.value)}
                        placeholder="Min 8 characters"
                        className="w-full text-xs px-3.5 py-2.5 border border-slate-200 focus:border-brand-teal-500 rounded-xl bg-white focus:outline-none"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="block text-[9px] font-extrabold uppercase tracking-wider text-slate-400">Confirm Password</label>
                      <input 
                        type="password" 
                        required
                        value={regConfirmPassword}
                        onChange={(e) => setRegConfirmPassword(e.target.value)}
                        placeholder="Re-enter password"
                        className="w-full text-xs px-3.5 py-2.5 border border-slate-200 focus:border-brand-teal-500 rounded-xl bg-white focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="block text-[9px] font-extrabold uppercase tracking-wider text-slate-400">Emergency Contact (Name & Phone)</label>
                    <div className="relative">
                      <Users className="absolute left-3 top-2.5 w-3.5 h-3.5 text-slate-400" />
                      <input 
                        type="text" 
                        required
                        value={regEmergency}
                        onChange={(e) => setRegEmergency(e.target.value)}
                        placeholder="e.g. Rajesh Garcia (Son) - (555) 019-9000"
                        className="w-full text-xs pl-9 pr-3 py-2.5 border border-slate-200 focus:border-brand-teal-500 rounded-xl bg-white focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="flex items-start gap-2 pt-1">
                    <input 
                      type="checkbox" 
                      id="agree"
                      checked={regAgree}
                      onChange={(e) => setRegAgree(e.target.checked)}
                      className="rounded border-gray-300 text-brand-teal-600 focus:ring-brand-teal-500 h-4.5 w-4.5 mt-0.5"
                    />
                    <label htmlFor="agree" className="text-[9px] text-slate-400 leading-normal font-bold">
                      I agree to the <span className="text-brand-teal-600 underline">Patient HIPAA Disclosure Agreement</span>, the <span className="text-brand-teal-600 underline">Terms of Clinical Operations</span> and privacy constraints.
                    </label>
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-gradient-to-r from-brand-teal-500 to-brand-blue-500 hover:from-brand-teal-600 hover:to-brand-blue-600 text-white rounded-2xl py-3.5 text-xs font-black uppercase tracking-wider shadow-md hover:shadow-lg transition-all"
                  >
                    Create Clinical Account
                  </button>
                </form>

                <div className="mt-4 text-center text-[10px] text-slate-400 font-bold uppercase tracking-wide border-t border-slate-100 pt-3">
                  Already have an account?{" "}
                  <button 
                    onClick={() => { setErrorMsg(""); setScreen('login'); }}
                    className="text-brand-teal-600 hover:text-brand-teal-700 font-black"
                  >
                    Log In
                  </button>
                </div>
              </motion.div>
            )}

            {/* FORGOT PASSWORD SCREEN */}
            {screen === 'forgot_password' && (
              <motion.div
                key="forgot"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="flex-1 flex flex-col justify-between"
              >
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => { setErrorMsg(""); setForgotSubmitted(false); setScreen('login'); }}
                    className="p-1 hover:bg-slate-100 rounded-lg text-slate-400 transition"
                  >
                    <ArrowLeft className="w-4 h-4" />
                  </button>
                  <div>
                    <h2 className="text-xl font-serif font-black text-slate-900 tracking-tight">Recover Credentials</h2>
                    <p className="text-[10px] text-slate-400 font-semibold">Enter your email to dispatch recovery tokens</p>
                  </div>
                </div>

                {/* Main Action Content */}
                {!forgotSubmitted ? (
                  <form onSubmit={handleForgotSubmit} className="space-y-4 my-auto">
                    {errorMsg && (
                      <div className="bg-rose-50 border border-rose-100 p-2.5 rounded-xl text-[9px] text-rose-700 font-medium">
                        {errorMsg}
                      </div>
                    )}
                    <div className="space-y-1">
                      <label className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Registered Email</label>
                      <div className="relative">
                        <Mail className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
                        <input 
                          type="email" 
                          required
                          value={forgotEmail}
                          onChange={(e) => setForgotEmail(e.target.value)}
                          placeholder="e.g. anita.garcia@medimind.org"
                          className="w-full text-xs pl-10.5 pr-4 py-3.5 border border-slate-200 focus:border-brand-teal-500 rounded-2xl bg-white focus:outline-none"
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="w-full bg-gradient-to-r from-brand-teal-500 to-brand-blue-500 text-white rounded-2xl py-4 text-xs font-black uppercase tracking-wider shadow-md transition-all"
                    >
                      Send Password Reset Link
                    </button>
                  </form>
                ) : (
                  <div className="my-auto text-center space-y-4 py-6">
                    <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-500 border border-emerald-100 flex items-center justify-center mx-auto animate-bounce">
                      <CheckCircle className="w-8 h-8" />
                    </div>
                    <div className="space-y-1 max-w-xs mx-auto">
                      <h4 className="font-serif font-black text-slate-800 text-lg">Dispatched Successfully</h4>
                      <p className="text-xs text-slate-500 leading-relaxed font-medium">
                        A clinical password reset link has been dispatched to <strong className="text-slate-700">{forgotEmail}</strong>. Please click the link inside to set a secure credential password.
                      </p>
                    </div>

                    <button
                      onClick={() => { setErrorMsg(""); setForgotSubmitted(false); setScreen('login'); }}
                      className="w-full border border-slate-200 hover:border-slate-300 text-slate-700 rounded-2xl py-3 text-xs font-bold transition-all bg-white"
                    >
                      Back to Login Terminal
                    </button>
                  </div>
                )}

                <div className="text-center text-[10px] text-slate-400 font-bold uppercase tracking-wider pt-6 border-t border-slate-100">
                  Secure Operational Node: MD-921A
                </div>
              </motion.div>
            )}

            {/* EMAIL VERIFICATION PIN */}
            {screen === 'verification' && (
              <motion.div
                key="verification"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="flex-1 flex flex-col justify-between"
              >
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => { setScreen('login'); }}
                    className="p-1 hover:bg-slate-100 rounded-lg text-slate-400 transition"
                  >
                    <ArrowLeft className="w-4 h-4" />
                  </button>
                  <div>
                    <h2 className="text-xl font-serif font-black text-slate-900 tracking-tight">Security Check</h2>
                    <p className="text-[10px] text-slate-400 font-semibold">Verify code sent to {loginEmail}</p>
                  </div>
                </div>

                {/* Informative advice */}
                <div className="bg-sky-50 border border-sky-100/50 p-4 rounded-2xl flex items-start gap-2 text-xs text-sky-800 font-medium my-4">
                  <Info className="w-5 h-5 text-sky-500 shrink-0" />
                  <div>
                    <p className="font-bold text-sky-950">One-Time Verification Code</p>
                    <p className="mt-0.5 text-sky-700">Because MediMind handles confidential medical history, a security verification is required. For the trial, you can use any 6 digits.</p>
                  </div>
                </div>

                <form onSubmit={handleVerifySubmit} className="space-y-6 my-auto">
                  {/* Hexa pin code fields */}
                  <div className="flex justify-between gap-1.5">
                    {[0, 1, 2, 3, 4, 5].map(idx => (
                      <input 
                        key={idx}
                        id={`pin-${idx}`}
                        type="text"
                        pattern="[0-9]*"
                        inputMode="numeric"
                        maxLength={1}
                        required
                        value={verificationCode[idx]}
                        onChange={(e) => handleCodeChange(idx, e.target.value)}
                        className="w-12 h-14 border border-slate-200 focus:border-brand-teal-500 rounded-2xl bg-white focus:outline-none text-center text-lg font-black text-slate-800"
                      />
                    ))}
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-gradient-to-r from-brand-teal-500 to-brand-blue-500 hover:from-brand-teal-600 hover:to-brand-blue-600 text-white rounded-2xl py-4 text-xs font-black uppercase tracking-wider shadow-md transition-all"
                  >
                    Verify & Enter Portal
                  </button>
                </form>

                <div className="text-center text-[10px] text-slate-400 font-bold uppercase tracking-wider border-t border-slate-100 pt-3">
                  Didn't receive code? <button type="button" onClick={() => alert("Simulated: Re-dispatched a new 6-digit verification code to email.")} className="text-brand-teal-600 font-black hover:underline">Resend Code</button>
                </div>
              </motion.div>
            )}

          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
