import React, { useState, useEffect, useRef } from "react";
import { ChatMessage } from "../types";
import { 
  Send, 
  Heart, 
  Trash2, 
  ShieldCheck, 
  AlertCircle, 
  Sparkles, 
  Mic, 
  User, 
  ChevronRight,
  Info
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

export default function CompanionChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSOS, setIsSOS] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Load chat history from the Express server-side database
  const loadChat = async () => {
    try {
      const res = await fetch("/api/chat");
      const json = await res.json();
      if (json.success) {
        setMessages(json.data);
      }
    } catch (e) {
      console.error("Failed to load chat history:", e);
    }
  };

  useEffect(() => {
    loadChat();
  }, []);

  // Auto-scroll to the bottom when messages append
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async (textToSend: string) => {
    if (!textToSend.trim() || isLoading) return;

    const userMessageText = textToSend;
    setInput("");
    setIsLoading(true);

    // Optimistically update frontend chat bubbles first
    const tempUserMsg: ChatMessage = {
      id: `temp-u-${Date.now()}`,
      sender: 'user',
      message: userMessageText,
      createdAt: new Date().toISOString()
    };
    setMessages(prev => [...prev, tempUserMsg]);

    // Check for acute emergency terms to trigger localized SOS mode
    const lower = userMessageText.toLowerCase();
    if (lower.includes("chest pain") || lower.includes("heart attack") || lower.includes("difficulty breathing") || lower.includes("stroke")) {
      setIsSOS(true);
    } else {
      setIsSOS(false);
    }

    try {
      const response = await fetch("/api/gemini/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userMessageText,
          history: messages.slice(-6) // Keep a rolling window of 6 turns to keep token count low
        })
      });

      const result = await response.json();
      if (result.success) {
        // Replace temp messages with official server-synced logs
        loadChat();
      } else {
        throw new Error(result.error);
      }
    } catch (error: any) {
      console.error("Chat error:", error);
      const tempErrorMsg: ChatMessage = {
        id: `temp-e-${Date.now()}`,
        sender: 'assistant',
        message: `⚠️ Connection Issue: I couldn't reach the medical database. Details: ${error.message || "Please check network status."}`,
        createdAt: new Date().toISOString()
      };
      setMessages(prev => [...prev, tempErrorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClear = async () => {
    if (confirm("Are you sure you want to clear your consultation history?")) {
      try {
        await fetch("/api/chat", { method: "DELETE" });
        loadChat();
        setIsSOS(false);
      } catch (e) {
        console.error(e);
      }
    }
  };

  const chatSuggestions = [
    "What are common side effects of Lisinopril?",
    "Can you explain why a low blood sugar makes me feel dizzy?",
    "What's the typical dosage of Metformin?",
    "Should I check blood pressure immediately after waking up?"
  ];

  return (
    <div className="bg-white rounded-[28px] border border-slate-100 shadow-premium h-[650px] flex flex-col overflow-hidden animate-fadeIn">
      
      {/* Header Panel */}
      <div className="px-6 py-4.5 border-b border-slate-100 flex items-center justify-between bg-white shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-brand-teal-500 to-brand-blue-500 flex items-center justify-center text-white shadow-md animate-pulse-soft">
            <Heart className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-serif font-black text-slate-900 text-sm flex items-center gap-2">
              MediMind Medical Assistant
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
            </h3>
            <p className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wide">Secure Clinical AI Partner</p>
          </div>
        </div>
        
        <button
          onClick={handleClear}
          title="Clear Conversation Logs"
          className="p-2 text-slate-300 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      {/* Safety Notice Banner */}
      <div className="bg-brand-teal-50/50 px-6 py-2.5 border-b border-brand-teal-100/30 flex items-center gap-2 text-[10px] text-brand-teal-800 font-bold uppercase tracking-wide shrink-0 select-none">
        <ShieldCheck className="w-4 h-4 text-brand-teal-600 shrink-0" />
        <span>MediMind AI is purely educational and does not substitute clinical consultation.</span>
      </div>

      {/* Emergency Triaging Alert Box */}
      <AnimatePresence>
        {isSOS && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="bg-rose-50 border-b border-rose-100 px-6 py-4 flex items-start gap-3 text-xs text-rose-900 overflow-hidden shrink-0"
          >
            <AlertCircle className="w-5.5 h-5.5 text-rose-600 shrink-0 mt-0.5 animate-bounce" />
            <div>
              <h4 className="font-extrabold text-rose-950">🚨 CRITICAL HEALTH ALERT INDICATOR DETECTED</h4>
              <p className="mt-1 text-rose-800 leading-relaxed font-medium">
                You described indicators of potential acute clinical distress (chest pain or shortness of breath). If you or someone around you is in pain, please **IMMEDIATELY DIAL EMERGENCY SERVICES (911)**. Do not rely on AI agents.
              </p>
              <div className="mt-3.5 flex gap-2">
                <a href="tel:911" className="bg-rose-600 hover:bg-rose-700 text-white font-black px-4.5 py-2 rounded-xl text-[10px] shadow-sm uppercase tracking-wider transition-all">
                  Call 911 Now
                </a>
                <button onClick={() => setIsSOS(false)} className="border border-rose-200 text-rose-700 font-bold px-4 py-2 rounded-xl text-[10px] hover:bg-rose-100/50 uppercase tracking-wider transition-all">
                  Dismiss
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Chat Conversation Logs */}
      <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4 bg-slate-50/30">
        
        {messages.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-center space-y-4 py-12">
            <div className="w-16 h-16 rounded-[24px] bg-brand-teal-50 text-brand-teal-500 border border-brand-teal-100 flex items-center justify-center mx-auto shadow-sm">
              <Sparkles className="w-8 h-8 animate-pulse-soft" />
            </div>
            <div className="space-y-1 max-w-sm">
              <h4 className="font-serif font-black text-slate-800 text-md">Consult with MediMind AI</h4>
              <p className="text-xs text-slate-400 font-semibold leading-relaxed">
                Consult on medication instructions, lab report values, active physical vitals, and wellness queries instantly.
              </p>
            </div>
          </div>
        )}

        {messages.map((msg) => (
          <motion.div
            key={msg.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex gap-3.5 max-w-3xl ${
              msg.sender === 'user' ? 'ml-auto flex-row-reverse' : 'mr-auto'
            }`}
          >
            {/* Avatar block */}
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 shadow-sm ${
              msg.sender === 'user' 
                ? 'bg-brand-blue-500 text-white' 
                : 'bg-gradient-to-tr from-brand-teal-500 to-brand-blue-500 text-white'
            }`}>
              {msg.sender === 'user' ? <User className="w-4.5 h-4.5" /> : <Sparkles className="w-4.5 h-4.5" />}
            </div>

            {/* Bubble layout */}
            <div className={`p-4 rounded-[20px] shadow-sm leading-relaxed text-xs font-semibold ${
              msg.sender === 'user'
                ? 'bg-brand-blue-500 text-white rounded-tr-none'
                : 'bg-white border border-slate-100 text-slate-700 rounded-tl-none'
            }`}>
              <p className="whitespace-pre-line">{msg.message}</p>
            </div>
          </motion.div>
        ))}

        {isLoading && (
          <div className="flex gap-3 mr-auto animate-pulse">
            <div className="w-9 h-9 rounded-xl bg-brand-teal-50 flex items-center justify-center text-brand-teal-500 shrink-0">
              <Sparkles className="w-4.5 h-4.5" />
            </div>
            <div className="p-4 rounded-[20px] bg-white border border-slate-100 text-slate-400 text-xs font-bold rounded-tl-none flex items-center gap-2">
              <div className="flex gap-1">
                <span className="w-2 h-2 rounded-full bg-slate-300 animate-bounce [animation-delay:-0.3s]"></span>
                <span className="w-2 h-2 rounded-full bg-slate-300 animate-bounce [animation-delay:-0.15s]"></span>
                <span className="w-2 h-2 rounded-full bg-slate-300 animate-bounce"></span>
              </div>
              <span>Formulating clinical synthesis...</span>
            </div>
          </div>
        )}

        <div ref={chatEndRef} />
      </div>

      {/* Suggestion Chips Panel */}
      {messages.length < 5 && (
        <div className="px-6 py-3 bg-white border-t border-slate-100 flex gap-2 overflow-x-auto shrink-0 select-none whitespace-nowrap">
          {chatSuggestions.map((sug, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(sug)}
              className="text-[10px] font-black text-slate-500 hover:text-brand-teal-700 bg-slate-50 hover:bg-brand-teal-50 border border-slate-200/50 hover:border-brand-teal-200 px-3.5 py-2.5 rounded-full transition-all shrink-0"
            >
              {sug}
            </button>
          ))}
        </div>
      )}

      {/* Input Tray */}
      <div className="px-6 py-4 border-t border-slate-100 bg-white flex items-center gap-3 shrink-0">
        
        {/* Voice Input Placeholder */}
        <button 
          onClick={() => alert("Voice transcription simulation activated. Please speak clearly towards your microphone.")}
          className="w-11 h-11 rounded-2xl bg-slate-50 hover:bg-brand-teal-50 border border-slate-100 hover:border-brand-teal-100 flex items-center justify-center text-slate-400 hover:text-brand-teal-500 transition-all shrink-0"
          title="Voice Command"
        >
          <Mic className="w-5 h-5" />
        </button>

        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') handleSend(input); }}
          placeholder="Consult on medications, health scores, or report logs..."
          className="flex-1 text-xs px-4.5 py-3.5 border border-slate-200 focus:border-brand-teal-500 rounded-2xl bg-white focus:outline-none font-medium text-slate-700"
        />

        <button
          onClick={() => handleSend(input)}
          disabled={!input.trim() || isLoading}
          className="w-11 h-11 rounded-2xl bg-brand-teal-500 hover:bg-brand-teal-600 text-white flex items-center justify-center transition-all disabled:bg-slate-100 disabled:text-slate-400 shrink-0 shadow-md"
        >
          <Send className="w-4.5 h-4.5" />
        </button>

      </div>

    </div>
  );
}
