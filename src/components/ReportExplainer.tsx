import React, { useState, useEffect } from "react";
import { MedicalReport } from "../types";
import { 
  FileText, 
  Sparkles, 
  Upload, 
  AlertTriangle, 
  CheckCircle, 
  Info, 
  Trash2, 
  Calendar,
  Layers,
  FileCheck,
  ChevronRight,
  Plus
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

export default function ReportExplainer() {
  const [reports, setReports] = useState<MedicalReport[]>([]);
  const [rawText, setRawText] = useState("");
  const [reportName, setReportName] = useState("");
  const [selectedReportId, setSelectedReportId] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Load diagnostic report history from Express DB
  const loadReports = async () => {
    try {
      const res = await fetch("/api/reports");
      const json = await res.json();
      if (json.success) {
        setReports(json.data);
        if (json.data.length > 0 && !selectedReportId) {
          setSelectedReportId(json.data[0].id);
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    loadReports();
  }, []);

  const handleAnalyze = async () => {
    if (!rawText.trim() || isAnalyzing) return;
    setIsAnalyzing(true);

    try {
      const response = await fetch("/api/gemini/analyze-report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          rawText,
          reportName: reportName || "Blood Chemistry Sheet"
        })
      });

      const json = await response.json();
      if (json.success) {
        setRawText("");
        setReportName("");
        await loadReports();
        setSelectedReportId(json.data.id);
      } else {
        throw new Error(json.error);
      }
    } catch (e: any) {
      alert(`⚠️ Analysis Error: ${e.message || "Failed to parse document."}`);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm("Are you sure you want to delete this clinical report?")) {
      try {
        await fetch(`/api/reports/${id}`, { method: "DELETE" });
        await loadReports();
        if (selectedReportId === id) {
          setSelectedReportId(null);
        }
      } catch (err) {
        console.error(err);
      }
    }
  };

  // Human-friendly patient-facing samples
  const presets = [
    {
      name: "Elevated Cholesterol Panel",
      title: "Lipid Blood Panel Test",
      text: `PATIENT DEMOGRAPHICS: Anita Garcia, age 62
LAB TEST DESCRIPTION: Lipid Panel with Triglycerides
SPECIMEN DATE: June 25, 2026

TEST RESULT METRICS:
Serum Cholesterol (Total): 242 mg/dL   (Reference Range: 100 - 199 mg/dL)   [ELEVATED]
Triglycerides: 145 mg/dL                (Reference Range: < 150 mg/dL)        [NORMAL]
HDL Cholesterol (Good): 42 mg/dL       (Reference Range: > 50 mg/dL)         [LOW]
LDL Cholesterol (Bad): 171 mg/dL        (Reference Range: < 100 mg/dL)        [CRITICAL]`
    },
    {
      name: "Pre-Diabetic Blood Panel",
      title: "Metabolic and A1c Panel",
      text: `PATIENT DEMOGRAPHICS: Anita Garcia, age 62
SPECIMEN COLLECTION: June 26, 2026

TEST RESULT METRICS:
Fasting Plasma Glucose: 112 mg/dL        (Reference Range: 70 - 100 mg/dL)     [ELEVATED]
Hemoglobin A1c: 6.2%                      (Reference Range: 4.0 - 5.6%)         [HIGH / PRE-DIABETIC]
Serum Creatinine: 0.85 mg/dL             (Reference Range: 0.50 - 1.10 mg/dL)  [NORMAL]`
    }
  ];

  const selectedReport = reports.find(r => r.id === selectedReportId);

  return (
    <div className="bg-white rounded-[28px] border border-slate-100 shadow-premium overflow-hidden flex flex-col lg:flex-row h-[700px] animate-fadeIn">
      
      {/* Left panel: list of uploaded files & presets */}
      <div className="w-full lg:w-80 border-r border-slate-100 flex flex-col bg-slate-50/40 shrink-0">
        <div className="p-5 border-b border-slate-100 bg-white">
          <h3 className="font-serif font-extrabold text-slate-900 text-md">Diagnostic Records</h3>
          <p className="text-[10px] text-slate-400 font-bold mt-0.5 uppercase tracking-wide">Manage clinical blood sheets</p>
        </div>

        {/* List of files */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          <span className="text-[9px] uppercase font-black tracking-widest text-slate-400 pl-1 block">Your Lab Summaries</span>
          {reports.map(rep => (
            <div
              key={rep.id}
              onClick={() => setSelectedReportId(rep.id)}
              className={`p-3.5 rounded-2xl border cursor-pointer transition-all flex items-start gap-3 relative group ${
                selectedReportId === rep.id
                  ? "bg-white border-brand-teal-100 shadow-premium ring-1 ring-brand-teal-50"
                  : "bg-white/50 border-slate-100 hover:bg-white hover:border-slate-200"
              }`}
            >
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                selectedReportId === rep.id ? "bg-brand-teal-50 text-brand-teal-600" : "bg-slate-100 text-slate-400"
              }`}>
                <FileText className="w-4.5 h-4.5" />
              </div>
              <div className="flex-1 min-w-0 pr-6">
                <h4 className="text-xs font-black text-slate-800 truncate">{rep.reportName}</h4>
                <p className="text-[9px] text-slate-400 font-semibold flex items-center gap-1 mt-1">
                  <Calendar className="w-3 h-3 text-slate-300" />
                  {new Date(rep.uploadDate).toLocaleDateString([], { month: "short", day: "numeric", year: "numeric" })}
                </p>
              </div>
              <button
                onClick={(e) => handleDelete(rep.id, e)}
                className="absolute right-2 top-2 p-1.5 text-slate-300 hover:text-rose-600 rounded-lg hover:bg-rose-50 opacity-0 group-hover:opacity-100 transition-all"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
          {reports.length === 0 && (
            <p className="text-xs text-slate-400 text-center py-8 font-medium">No clinical records found.</p>
          )}

          {/* Preset templates */}
          <div className="pt-5 border-t border-slate-100 space-y-2.5">
            <span className="text-[9px] uppercase font-black tracking-widest text-slate-400 pl-1 block">Sample Patient Scans</span>
            {presets.map((p, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setRawText(p.text);
                  setReportName(p.name);
                }}
                className="w-full text-left p-3 rounded-2xl border border-dashed border-slate-200 hover:border-brand-teal-400 hover:bg-brand-teal-50/20 text-xs text-slate-600 transition-all flex items-center gap-2.5"
              >
                <Sparkles className="w-4.5 h-4.5 text-brand-teal-500 shrink-0" />
                <span className="truncate font-bold text-slate-700">{p.name}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content Area: Report Upload Form or Explanation */}
      <div className="flex-1 flex flex-col bg-white overflow-hidden">
        {selectedReport ? (
          /* Report Explanation View */
          <div className="flex-1 flex flex-col overflow-hidden">
            <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="font-serif font-black text-slate-900 text-md flex items-center gap-2">
                  {selectedReport.reportName}
                  <span className="text-[9px] font-black bg-brand-teal-50 text-brand-teal-600 px-3 py-1 rounded-full border border-brand-teal-100 uppercase tracking-wider flex items-center gap-1">
                    <CheckCircle className="w-3.5 h-3.5 text-brand-teal-500" /> AI Decoded
                  </span>
                </h3>
                <p className="text-[10px] text-slate-400 font-bold mt-1 uppercase">Uploaded on {new Date(selectedReport.uploadDate).toLocaleString()}</p>
              </div>
              <button
                onClick={() => setSelectedReportId(null)}
                className="text-xs font-black text-brand-teal-600 hover:text-brand-teal-700 bg-brand-teal-50 hover:bg-brand-teal-100 px-4 py-2 rounded-xl transition-all uppercase tracking-wider"
              >
                + Analyze Another
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">
              
              {/* Patient Summary Card */}
              <div className="bg-gradient-to-r from-brand-teal-50/50 to-brand-blue-50/30 rounded-[24px] border border-brand-teal-100/30 p-5">
                <h4 className="text-xs uppercase tracking-widest font-black text-brand-teal-900 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-brand-teal-500 animate-pulse" /> Patient Lab Summary
                </h4>
                <p className="text-xs text-slate-600 mt-2 leading-relaxed font-medium">
                  {selectedReport.explanation?.summary}
                </p>
              </div>

              {/* Abnormal Values Panel */}
              {selectedReport.explanation && selectedReport.explanation.abnormalMetrics.length > 0 && (
                <div className="space-y-3">
                  <h4 className="text-xs uppercase tracking-widest font-black text-rose-950 flex items-center gap-2">
                    <AlertTriangle className="w-4.5 h-4.5 text-rose-600" /> Out-of-Range Indicators ({selectedReport.explanation.abnormalMetrics.length})
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {selectedReport.explanation.abnormalMetrics.map((ab, idx) => (
                      <div key={idx} className="bg-rose-50/30 border border-rose-100/50 rounded-2xl p-4 flex flex-col shadow-sm">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-black text-rose-950 truncate">{ab.name}</span>
                          <span className="text-[9px] font-black uppercase bg-rose-100/60 text-rose-700 px-2.5 py-0.5 rounded-full border border-rose-200">
                            {ab.severity}
                          </span>
                        </div>
                        <div className="mt-2 flex items-baseline gap-2">
                          <span className="text-xl font-black text-rose-950">{ab.value}</span>
                          <span className="text-[10px] text-slate-400 font-bold">Goal: {ab.referenceRange}</span>
                        </div>
                        <p className="text-xs text-slate-600 mt-2 border-t border-rose-100/30 pt-2 leading-relaxed font-medium">
                          {ab.explanation}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Normal Values Panel */}
              {selectedReport.explanation && selectedReport.explanation.normalMetrics.length > 0 && (
                <div className="space-y-3">
                  <h4 className="text-xs uppercase tracking-widest font-black text-emerald-950 flex items-center gap-2">
                    <CheckCircle className="w-4.5 h-4.5 text-emerald-600" /> Normal Parameters ({selectedReport.explanation.normalMetrics.length})
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {selectedReport.explanation.normalMetrics.map((nm, idx) => (
                      <div key={idx} className="bg-emerald-50/10 border border-emerald-100/50 rounded-2xl p-4 flex flex-col">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-black text-emerald-950 truncate">{nm.name}</span>
                          <span className="text-[9px] font-black uppercase bg-emerald-100/30 text-emerald-700 px-2.5 py-0.5 rounded-full border border-emerald-200/50">
                            Normal
                          </span>
                        </div>
                        <div className="mt-2 flex items-baseline gap-2">
                          <span className="text-xl font-black text-emerald-950">{nm.value}</span>
                          <span className="text-[10px] text-slate-400 font-semibold">Range: {nm.referenceRange}</span>
                        </div>
                        <p className="text-xs text-slate-500 mt-2 leading-relaxed font-medium">
                          {nm.explanation}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Suggested Doctor Questions */}
              {selectedReport.explanation && selectedReport.explanation.doctorQuestions.length > 0 && (
                <div className="bg-slate-50/50 rounded-[24px] border border-slate-100 p-5 space-y-3">
                  <h4 className="text-xs uppercase tracking-widest font-black text-slate-900 flex items-center gap-2">
                    <Info className="w-4.5 h-4.5 text-indigo-500" /> Consult Questions Checklist
                  </h4>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wide">Mark questions to discuss during your next appointment:</p>
                  <div className="space-y-2 pt-1">
                    {selectedReport.explanation.doctorQuestions.map((q, idx) => (
                      <label key={idx} className="flex items-start gap-3 p-3 bg-white rounded-xl border border-slate-100 cursor-pointer hover:bg-slate-50 transition-all select-none">
                        <input type="checkbox" className="mt-1 rounded border-slate-200 text-brand-teal-600 focus:ring-brand-teal-500 h-4 w-4 shrink-0" />
                        <span className="text-xs text-slate-700 leading-relaxed font-medium">{q}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          /* Report Upload / Entry Page Form */
          <div className="flex-1 overflow-y-auto p-6 md:p-8 flex flex-col">
            <div className="mb-6">
              <h2 className="text-xl font-serif font-black text-slate-900">Decode Fresh Lab Sheet</h2>
              <p className="text-xs text-slate-400 font-semibold mt-1">Paste your medical record details below, or load one of our clinical samples on the left side to simulate AI summaries.</p>
            </div>

            <div className="space-y-5 flex-1 flex flex-col min-h-0">
              
              {/* Report Identifier */}
              <div className="space-y-1">
                <label className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Report Label</label>
                <input
                  type="text"
                  placeholder="e.g. Lipids Panel and Sugar Test June 2026"
                  value={reportName}
                  onChange={(e) => setReportName(e.target.value)}
                  className="w-full text-xs px-4 py-3 border border-slate-200 focus:border-brand-teal-500 rounded-2xl bg-white focus:outline-none font-semibold text-slate-800"
                />
              </div>

              {/* Paste Text Area */}
              <div className="flex-1 flex flex-col min-h-[220px] space-y-1">
                <label className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Report Record Text / Medical Summary</label>
                <textarea
                  value={rawText}
                  onChange={(e) => setRawText(e.target.value)}
                  placeholder="Paste clinical report parameters here..."
                  className="flex-1 w-full text-xs p-4 border border-slate-200 focus:border-brand-teal-500 rounded-2xl bg-white focus:outline-none font-mono resize-none leading-relaxed text-slate-700"
                />
              </div>

              {/* Interactive Upload Deck mockup */}
              <div className="border border-dashed border-slate-200 rounded-2xl p-6 bg-slate-50/50 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-slate-100/50 transition-all">
                <Upload className="w-8 h-8 text-brand-teal-500 animate-bounce mb-2" />
                <p className="text-xs font-black text-slate-800">Drag & Drop Laboratory Files (PDF, PNG, JPEG)</p>
                <p className="text-[10px] text-slate-400 font-bold uppercase mt-1">Standard clinical OCR is fully configured server-side</p>
              </div>

              {/* Actions */}
              <div className="pt-2">
                <button
                  onClick={handleAnalyze}
                  disabled={!rawText.trim() || isAnalyzing}
                  className="w-full bg-gradient-to-r from-brand-teal-500 to-brand-blue-500 hover:from-brand-teal-600 hover:to-brand-blue-600 text-white font-black py-4 rounded-2xl shadow-md transition-all text-xs flex items-center justify-center gap-2 disabled:bg-slate-100 disabled:text-slate-400"
                >
                  {isAnalyzing ? (
                    <>
                      <div className="w-4 h-4 border-2 border-brand-teal-300 border-t-white rounded-full animate-spin"></div>
                      <span>Analyzing Biomarkers & Generating Patient Guides...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 text-teal-200" />
                      <span>Start Patient-Friendly AI Decoding</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
