import express from "express";
import path from "path";
import dotenv from "dotenv";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";

dotenv.config();

// Initialize the Google Gen AI client server-side
// Use process.env.GEMINI_API_KEY. Handle missing keys gracefully.
const getGeminiClient = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.warn("WARNING: GEMINI_API_KEY is not defined. AI components will run in demo/simulation mode.");
    return null;
  }
  return new GoogleGenAI({
    apiKey: apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      }
    }
  });
};

const ai = getGeminiClient();

// In-memory databases for the live prototype session
interface UserProfile {
  firstName: string;
  lastName: string;
  dob: string;
  gender: string;
  bloodType: string;
  allergies: string[];
  languagePreference: string;
}

interface Medicine {
  id: string;
  name: string;
  dosage: string;
  instructions: string;
  startDate: string;
  endDate: string | null;
  isActive: boolean;
}

interface Reminder {
  id: string;
  medicineName: string;
  scheduledTime: string;
  status: 'pending' | 'taken' | 'skipped';
  loggedAt: string | null;
}

interface HealthMetric {
  id: string;
  metricType: 'blood_pressure' | 'blood_sugar' | 'heart_rate' | 'sleep' | 'steps' | 'water';
  valuePrimary: number;
  valueSecondary: number | null;
  unit: string;
  loggedAt: string;
}

interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  message: string;
  createdAt: string;
}

interface MedicalReport {
  id: string;
  reportName: string;
  uploadDate: string;
  isParsed: boolean;
  explanation: {
    summary: string;
    abnormalMetrics: Array<{
      name: string;
      value: string;
      referenceRange: string;
      severity: 'high' | 'low' | 'normal';
      explanation: string;
    }>;
    normalMetrics: Array<{
      name: string;
      value: string;
      referenceRange: string;
      explanation: string;
    }>;
    doctorQuestions: string[];
  } | null;
}

// Seed Data
let profile: UserProfile = {
  firstName: "Anita",
  lastName: "Garcia",
  dob: "1964-10-15",
  gender: "Female",
  bloodType: "O+",
  allergies: ["Penicillin"],
  languagePreference: "en"
};

let medicines: Medicine[] = [
  { id: "1", name: "Metformin", dosage: "500mg", instructions: "Take with breakfast", startDate: "2026-01-01", endDate: null, isActive: true },
  { id: "2", name: "Lisinopril", dosage: "10mg", instructions: "Take in the morning", startDate: "2026-01-01", endDate: null, isActive: true }
];

let reminders: Reminder[] = [
  { id: "r1", medicineName: "Lisinopril", scheduledTime: "08:00 AM", status: "taken", loggedAt: "2026-06-26T08:05:00Z" },
  { id: "r2", medicineName: "Metformin", scheduledTime: "08:30 AM", status: "taken", loggedAt: "2026-06-26T08:32:00Z" },
  { id: "r3", medicineName: "Lisinopril", scheduledTime: "08:00 AM", status: "pending", loggedAt: null },
  { id: "r4", medicineName: "Metformin", scheduledTime: "08:30 AM", status: "pending", loggedAt: null },
  { id: "r5", medicineName: "Metformin", scheduledTime: "08:00 PM", status: "pending", loggedAt: null }
];

let healthMetrics: HealthMetric[] = [
  // Blood Pressure
  { id: "m1", metricType: "blood_pressure", valuePrimary: 130, valueSecondary: 85, unit: "mmHg", loggedAt: "2026-06-21T08:00:00.000Z" },
  { id: "m2", metricType: "blood_pressure", valuePrimary: 128, valueSecondary: 84, unit: "mmHg", loggedAt: "2026-06-22T08:00:00.000Z" },
  { id: "m3", metricType: "blood_pressure", valuePrimary: 126, valueSecondary: 82, unit: "mmHg", loggedAt: "2026-06-23T08:00:00.000Z" },
  { id: "m4", metricType: "blood_pressure", valuePrimary: 135, valueSecondary: 88, unit: "mmHg", loggedAt: "2026-06-24T08:00:00.000Z" },
  { id: "m5", metricType: "blood_pressure", valuePrimary: 122, valueSecondary: 80, unit: "mmHg", loggedAt: "2026-06-25T08:00:00.000Z" },
  { id: "m6", metricType: "blood_pressure", valuePrimary: 120, valueSecondary: 78, unit: "mmHg", loggedAt: "2026-06-26T08:00:00.000Z" },
  { id: "m7", metricType: "blood_pressure", valuePrimary: 121, valueSecondary: 79, unit: "mmHg", loggedAt: "2026-06-27T08:00:00.000Z" },

  // Daily Steps
  { id: "m_s1", metricType: "steps", valuePrimary: 7200, valueSecondary: null, unit: "steps", loggedAt: "2026-06-21T21:00:00.000Z" },
  { id: "m_s2", metricType: "steps", valuePrimary: 8100, valueSecondary: null, unit: "steps", loggedAt: "2026-06-22T21:00:00.000Z" },
  { id: "m_s3", metricType: "steps", valuePrimary: 5400, valueSecondary: null, unit: "steps", loggedAt: "2026-06-23T21:00:00.000Z" },
  { id: "m_s4", metricType: "steps", valuePrimary: 9200, valueSecondary: null, unit: "steps", loggedAt: "2026-06-24T21:00:00.000Z" },
  { id: "m_s5", metricType: "steps", valuePrimary: 10400, valueSecondary: null, unit: "steps", loggedAt: "2026-06-25T21:00:00.000Z" },
  { id: "m_s6", metricType: "steps", valuePrimary: 8900, valueSecondary: null, unit: "steps", loggedAt: "2026-06-26T21:00:00.000Z" },
  { id: "m_s7", metricType: "steps", valuePrimary: 9500, valueSecondary: null, unit: "steps", loggedAt: "2026-06-27T21:00:00.000Z" },

  // Water Intake (mL)
  { id: "m_w1", metricType: "water", valuePrimary: 1500, valueSecondary: null, unit: "mL", loggedAt: "2026-06-21T20:00:00.000Z" },
  { id: "m_w2", metricType: "water", valuePrimary: 1800, valueSecondary: null, unit: "mL", loggedAt: "2026-06-22T20:00:00.000Z" },
  { id: "m_w3", metricType: "water", valuePrimary: 2200, valueSecondary: null, unit: "mL", loggedAt: "2026-06-23T20:00:00.000Z" },
  { id: "m_w4", metricType: "water", valuePrimary: 1200, valueSecondary: null, unit: "mL", loggedAt: "2026-06-24T20:00:00.000Z" },
  { id: "m_w5", metricType: "water", valuePrimary: 2000, valueSecondary: null, unit: "mL", loggedAt: "2026-06-25T20:00:00.000Z" },
  { id: "m_w6", metricType: "water", valuePrimary: 2500, valueSecondary: null, unit: "mL", loggedAt: "2026-06-26T20:00:00.000Z" },
  { id: "m_w7", metricType: "water", valuePrimary: 2100, valueSecondary: null, unit: "mL", loggedAt: "2026-06-27T20:00:00.000Z" },

  // Sleep Quality (hours)
  { id: "m_l1", metricType: "sleep", valuePrimary: 6.5, valueSecondary: null, unit: "hrs", loggedAt: "2026-06-21T07:00:00.000Z" },
  { id: "m_l2", metricType: "sleep", valuePrimary: 7.2, valueSecondary: null, unit: "hrs", loggedAt: "2026-06-22T07:00:00.000Z" },
  { id: "m_l3", metricType: "sleep", valuePrimary: 8.0, valueSecondary: null, unit: "hrs", loggedAt: "2026-06-23T07:00:00.000Z" },
  { id: "m_l4", metricType: "sleep", valuePrimary: 5.8, valueSecondary: null, unit: "hrs", loggedAt: "2026-06-24T07:00:00.000Z" },
  { id: "m_l5", metricType: "sleep", valuePrimary: 7.5, valueSecondary: null, unit: "hrs", loggedAt: "2026-06-25T07:00:00.000Z" },
  { id: "m_l6", metricType: "sleep", valuePrimary: 8.2, valueSecondary: null, unit: "hrs", loggedAt: "2026-06-26T07:00:00.000Z" },
  { id: "m_l7", metricType: "sleep", valuePrimary: 7.8, valueSecondary: null, unit: "hrs", loggedAt: "2026-06-27T07:00:00.000Z" }
];

let chatMessages: ChatMessage[] = [
  { id: "c1", sender: "assistant", message: "Hello! I am your MediMind AI Companion. How can I help you understand your reports or manage your medications today?", createdAt: "2026-06-26T08:00:00Z" }
];

let medicalReports: MedicalReport[] = [
  {
    id: "rep-1",
    reportName: "Annual Metabolic Panel",
    uploadDate: "2026-06-25T14:30:00Z",
    isParsed: true,
    explanation: {
      summary: "This report shows that your kidney, liver, and metabolic markers are generally in excellent shape, though your LDL Cholesterol is slightly high.",
      abnormalMetrics: [
        {
          name: "LDL Cholesterol",
          value: "145 mg/dL",
          referenceRange: "< 100 mg/dL",
          severity: "high",
          explanation: "Often referred to as 'bad cholesterol'. High levels can contribute to arterial plaque buildup over time. Your values are moderately elevated."
        }
      ],
      normalMetrics: [
        {
          name: "Serum Creatinine",
          value: "0.82 mg/dL",
          referenceRange: "0.50 - 1.10 mg/dL",
          explanation: "This shows normal and healthy filtration and function of your kidneys."
        },
        {
          name: "Hemoglobin A1c",
          value: "5.5%",
          referenceRange: "< 5.7%",
          explanation: "Your average blood sugar over the past 3 months is in the normal non-diabetic range."
        }
      ],
      doctorQuestions: [
        "What specific lifestyle modifications or diets should I target to lower my LDL cholesterol?",
        "Should we schedule another lipid panel in 3 or 6 months to monitor this trend?",
        "Do my other blood markers reduce my overall cardiovascular risk score?"
      ]
    }
  }
];

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // ==========================================
  // REAL API ROUTES FOR SERVER-SIDE GEMINI API
  // ==========================================

  // AI Chat Route
  app.post("/api/gemini/chat", async (req, res) => {
    try {
      const { message, history } = req.body;
      if (!message) {
        return res.status(400).json({ success: false, error: "Message is required." });
      }

      const userMessage: ChatMessage = {
        id: `c-u-${Date.now()}`,
        sender: 'user',
        message: message,
        createdAt: new Date().toISOString()
      };
      chatMessages.push(userMessage);

      // Check if client is initialized
      if (!ai) {
        // Fallback simulated model response when GEMINI_API_KEY is not defined
        setTimeout(() => {
          let simulatedReply = "";
          const lower = message.toLowerCase();
          if (lower.includes("metformin")) {
            simulatedReply = "Metformin is a widely used prescription medicine for managing Type 2 Diabetes. It helps your body respond better to natural insulin and reduces the amount of glucose absorbed from food or manufactured by your liver. Take it exactly as directed, usually with meals to minimize stomach upset. Common mild effects include temporary bloating or diarrhea.";
          } else if (lower.includes("lisinopril")) {
            simulatedReply = "Lisinopril is an ACE inhibitor prescribed for managing high blood pressure (hypertension) or heart failure. It works by relaxing blood vessels so blood flows more smoothly. It can be taken with or without food. Avoid potassium supplements unless advised by your physician, and report any dry persistent cough.";
          } else if (lower.includes("chest pain") || lower.includes("shortness of breath") || lower.includes("stroke")) {
            simulatedReply = "🚨 EMERGENCY SYMPTOM WARNING: Chest pain or acute shortness of breath can be signs of a medical emergency (such as a heart attack). Please IMMEDIATELY call your local emergency response services (911) or go to the nearest emergency clinic. Do not wait for AI advice.";
          } else {
            simulatedReply = `Thank you for sharing that. As your health companion, I want to clarify that you are asking about "${message}". For general wellness, it's vital to pair proper diet, standard exercise, and consult with Dr. Sarah Jenkins on your scheduled visits. Let me know if you would like me to summarize any other common medical terms!`;
          }

          const assistantMessage: ChatMessage = {
            id: `c-a-${Date.now()}`,
            sender: 'assistant',
            message: simulatedReply,
            createdAt: new Date().toISOString()
          };
          chatMessages.push(assistantMessage);
          return res.json({ success: true, data: assistantMessage, isDemo: true });
        }, 1000);
        return;
      }

      // Format conversation history for Gemini API
      // Standard chat structure requires system instruction and contents.
      const systemInstruction = `You are MediMind AI, an empathetic, highly trained AI clinical wellness companion for patients. 
      Your purpose is to translate dense, complex medical information and terminology into simple, actionable, and grade-school level language (Grade 6 level).
      
      CORE MEDICAL SAFEGUARDS:
      1. You are NOT a doctor and do NOT diagnose or prescribe. Always include standard friendly disclaimers stating this.
      2. If the user mentions any immediate emergency keywords (e.g. chest pain, left arm pain, difficulty breathing, sudden slurred speech, sudden numbness, severe head injury), you MUST halt normal chats and tell them to call emergency services (911) immediately in bold, clear formatting.
      3. Focus on explaining standard purposes of medications, what typical lab ranges indicate, and lifestyle wellness suggestions. Avoid speculating on rare terminal diagnostics.
      4. Speak with warmth, compassion, and professional medical sincerity. Use clear markdown spacing and bold lists.`;

      // Build context
      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: [
          ...history.map((msg: any) => ({
            role: msg.sender === 'user' ? 'user' : 'model',
            parts: [{ text: msg.message }]
          })),
          { role: 'user', parts: [{ text: message }] }
        ],
        config: {
          systemInstruction: systemInstruction,
          temperature: 0.7,
        }
      });

      const replyText = response.text || "I was unable to generate a response. Please check your query or try again.";
      
      const assistantMessage: ChatMessage = {
        id: `c-a-${Date.now()}`,
        sender: 'assistant',
        message: replyText,
        createdAt: new Date().toISOString()
      };
      chatMessages.push(assistantMessage);

      res.json({ success: true, data: assistantMessage });
    } catch (error: any) {
      console.error("Gemini Chat API Error:", error);
      res.status(500).json({ success: false, error: error.message || "Failed to communicate with AI model." });
    }
  });

  // AI Report Analysis Route
  app.post("/api/gemini/analyze-report", async (req, res) => {
    try {
      const { rawText, reportName } = req.body;
      if (!rawText) {
        return res.status(400).json({ success: false, error: "Medical report text content is required." });
      }

      const reportId = `rep-${Date.now()}`;
      const nameOfReport = reportName || "Uploaded Diagnostic Sheet";

      // If Gemini client is missing, provide a mock analyzed report
      if (!ai) {
        setTimeout(() => {
          const explanation = {
            summary: "Based on the simulated text, this panel indicates standard glucose levels, with slightly elevated LDL Cholesterol that we should monitor.",
            abnormalMetrics: [
              {
                name: "LDL Cholesterol",
                value: "158 mg/dL",
                referenceRange: "< 100 mg/dL",
                severity: "high" as const,
                explanation: "Your LDL is elevated, which suggests a diet adjustment in saturated fats is advisable. Discuss with Dr. Sarah Jenkins."
              }
            ],
            normalMetrics: [
              {
                name: "Fasting Blood Sugar",
                value: "92 mg/dL",
                referenceRange: "70 - 100 mg/dL",
                explanation: "This shows high insulin sensitivity and an outstanding metabolic status."
              },
              {
                name: "Thyroid Stimulating Hormone (TSH)",
                value: "2.1 uIU/mL",
                referenceRange: "0.4 - 4.0 uIU/mL",
                explanation: "This indicates normal thyroid gland hormone regulation."
              }
            ],
            doctorQuestions: [
              "Are my high LDL values influenced by genetic factors?",
              "Should I explore cardiovascular exercise or focused dietary cuts first?",
              "What is my absolute target range based on my general wellness index?"
            ]
          };

          const newReport: MedicalReport = {
            id: reportId,
            reportName: nameOfReport,
            uploadDate: new Date().toISOString(),
            isParsed: true,
            explanation: explanation
          };

          medicalReports.push(newReport);
          return res.json({ success: true, data: newReport, isDemo: true });
        }, 1500);
        return;
      }

      const systemInstruction = `You are a clinical translation model. Your job is to parse unstructured medical lab reports and output a high-quality, structured JSON explanation.
      Explain all blood parameters or diagnostic values in very clear, simple, patient-friendly terms (Grade 6 reading level). 
      Categorize findings into normal and abnormal, detailing the standard reference ranges and exact explanation. Also generate 3 helpful, precise questions the patient can ask their doctor.
      Be accurate, clinical, and reassuring.`;

      const responseSchema = {
        type: Type.OBJECT,
        properties: {
          summary: {
            type: Type.STRING,
            description: "A 2-3 sentence overview of the entire report findings in comforting, plain language."
          },
          abnormalMetrics: {
            type: Type.ARRAY,
            description: "List of abnormal, high, or low blood and metric parameters.",
            items: {
              type: Type.OBJECT,
              properties: {
                name: { type: Type.STRING, description: "Name of the lab parameter, e.g. 'LDL Cholesterol'" },
                value: { type: Type.STRING, description: "Recorded value with units, e.g. '165 mg/dL'" },
                referenceRange: { type: Type.STRING, description: "The normal reference range, e.g. '< 100 mg/dL'" },
                severity: { 
                  type: Type.STRING, 
                  description: "Must be 'high' or 'low'",
                },
                explanation: { type: Type.STRING, description: "Patient-friendly explanation of why this marker matters and what it signifies in plain terms." }
              },
              required: ["name", "value", "referenceRange", "severity", "explanation"]
            }
          },
          normalMetrics: {
            type: Type.ARRAY,
            description: "List of key normal parameters that are in safe levels.",
            items: {
              type: Type.OBJECT,
              properties: {
                name: { type: Type.STRING },
                value: { type: Type.STRING },
                referenceRange: { type: Type.STRING },
                explanation: { type: Type.STRING, description: "A encouraging sentence explaining why this normal level is great for their health." }
              },
              required: ["name", "value", "referenceRange", "explanation"]
            }
          },
          doctorQuestions: {
            type: Type.ARRAY,
            description: "3 highly tailored questions based on these findings for the user to ask their doctor during a follow up.",
            items: { type: Type.STRING }
          }
        },
        required: ["summary", "abnormalMetrics", "normalMetrics", "doctorQuestions"]
      };

      const prompt = `Analyze this unstructured medical report text and extract all relevant lab values:
      ---
      ${rawText}
      ---`;

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          systemInstruction: systemInstruction,
          responseMimeType: "application/json",
          responseSchema: responseSchema,
          temperature: 0.2,
        }
      });

      const parsedJson = JSON.parse(response.text || "{}");

      const newReport: MedicalReport = {
        id: reportId,
        reportName: nameOfReport,
        uploadDate: new Date().toISOString(),
        isParsed: true,
        explanation: parsedJson
      };

      medicalReports.push(newReport);
      res.json({ success: true, data: newReport });

    } catch (error: any) {
      console.error("Gemini Report Analysis API Error:", error);
      res.status(500).json({ success: false, error: error.message || "Failed to parse and analyze the report." });
    }
  });


  // ==========================================
  // PROTOSTORES MOCK STATE API ROUTES
  // ==========================================

  // User Profile
  app.get("/api/profile", (req, res) => {
    res.json({ success: true, data: profile });
  });

  app.put("/api/profile", (req, res) => {
    profile = { ...profile, ...req.body };
    res.json({ success: true, data: profile });
  });

  // Medicines
  app.get("/api/medicines", (req, res) => {
    res.json({ success: true, data: medicines });
  });

  app.post("/api/medicines", (req, res) => {
    const { name, dosage, instructions, startDate, endDate, schedules } = req.body;
    if (!name || !dosage) {
      return res.status(400).json({ success: false, error: "Medicine name and dosage are required." });
    }
    const newMedicine: Medicine = {
      id: `med-${Date.now()}`,
      name,
      dosage,
      instructions: instructions || "",
      startDate: startDate || new Date().toISOString().split('T')[0],
      endDate: endDate || null,
      isActive: true
    };
    medicines.push(newMedicine);

    // Queue corresponding reminders if schedules provided
    if (schedules && Array.isArray(schedules)) {
      schedules.forEach((timeStr: string) => {
        reminders.push({
          id: `r-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
          medicineName: name,
          scheduledTime: timeStr,
          status: 'pending',
          loggedAt: null
        });
      });
    }

    res.status(201).json({ success: true, data: newMedicine });
  });

  // Reminders
  app.get("/api/reminders", (req, res) => {
    res.json({ success: true, data: reminders });
  });

  app.put("/api/reminders/:id", (req, res) => {
    const { id } = req.params;
    const { status } = req.body;
    const reminder = reminders.find(r => r.id === id);
    if (!reminder) {
      return res.status(404).json({ success: false, error: "Reminder not found" });
    }
    reminder.status = status;
    reminder.loggedAt = status !== 'pending' ? new Date().toISOString() : null;
    res.json({ success: true, data: reminder });
  });

  // Health Metrics
  app.get("/api/metrics", (req, res) => {
    res.json({ success: true, data: healthMetrics });
  });

  app.post("/api/metrics", (req, res) => {
    const { metricType, valuePrimary, valueSecondary, unit } = req.body;
    if (!metricType || valuePrimary === undefined) {
      return res.status(400).json({ success: false, error: "Metric type and primary value are required." });
    }
    const newMetric: HealthMetric = {
      id: `met-${Date.now()}`,
      metricType,
      valuePrimary: parseFloat(valuePrimary),
      valueSecondary: valueSecondary ? parseFloat(valueSecondary) : null,
      unit: unit || "units",
      loggedAt: new Date().toISOString()
    };
    healthMetrics.push(newMetric);
    res.status(201).json({ success: true, data: newMetric });
  });

  // Chat messages lookup
  app.get("/api/chat", (req, res) => {
    res.json({ success: true, data: chatMessages });
  });

  // Clear chat logs
  app.delete("/api/chat", (req, res) => {
    chatMessages = [
      { id: "c1", sender: "assistant", message: "History cleared! Let me know if you have any other questions.", createdAt: new Date().toISOString() }
    ];
    res.json({ success: true, data: chatMessages });
  });

  // Reports lookup
  app.get("/api/reports", (req, res) => {
    res.json({ success: true, data: medicalReports });
  });

  app.delete("/api/reports/:id", (req, res) => {
    const { id } = req.params;
    medicalReports = medicalReports.filter(rep => rep.id !== id);
    res.json({ success: true, message: "Report deleted successfully" });
  });

  // VITE STATIC & MIDDLWARE HANDLER
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`MediMind AI full-stack dev server running on http://localhost:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error("Failed to start MediMind backend server:", err);
});
