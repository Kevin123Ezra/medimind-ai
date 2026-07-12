# Feature Roadmap: MediMind AI

This document outlines the granular feature specifications for MediMind AI, organized across three major maturity stages: **Phase 1: MVP (Minimum Viable Product)**, **Phase 2: Version 2 (Scale & Integration)**, and **Phase 3: Future Vision (Predictive & Holistic)**.

---

## 1. Feature Roadmap Matrix

| Feature Module | Phase 1: MVP | Phase 2: Version 2.0 | Phase 3: Future Vision |
|---|---|---|---|
| **1. Authentication** | Firebase Auth (Email/Pass, Google Login) | Biometric (FaceID, TouchID), OTP | SSO, Decoupled Key Management |
| **2. Core Dashboard** | Quick Stats, Daily Medication Schedule, Upload Panel | Dynamic Wellness Cards, Air Quality/Pollen Widgets | Lifespan Analytics Dashboard |
| **3. Medical Reports** | File Upload (PDF, PNG, JPG), Server-side OCR | Multi-page PDF Parsing, Lab API Integrations | Automatic DICOM (MRI/CT Scan) 3D Viewing |
| **4. AI Explanations** | Conversational PDF Breakdown, Normal Ranges, Glossary | Comparison with Historic Labs, Trend Tracking | Predictive Health Trajectories |
| **5. Med Reminders** | Daily/Weekly scheduling, Dosing alerts, Mark Status | Refill Warnings, Family Caregiver Shared Status | Smart Pill Bottle Integration |
| **6. AI Chatbot** | Text conversation, Symptom triage, Wellness coaching | Voice interactions (TTS/STT), Image-based symptom chat | Autonomous Clinical Triage Node |
| **7. Appointments** | Internal schedule, Doctor info cards, Reminders | Google Calendar integration, Geolocation Clinic Finder | Instant Telehealth session routing |
| **8. Profile Manager** | Basic health profile (blood group, allergies, weight) | Comprehensive medical history (surgeries, family genetics) | Decentralized Web5 Sovereign Identity |
| **9. Health Analytics** | Metric entry (BP, Blood Sugar, HR), Interactive charts | Smartwatch wearable integrations (Apple Health, Fitbit) | Continuous continuous glucose monitoring (CGM) ML modeling |
| **10. Emergency SOS** | Static medical ID card, Local emergency contacts | Triggered SMS alerts with current GPS coordinates | Auto-emergency dispatch via crash detection sensors |
| **11. Multilingual Support**| English and Spanish locale translations | Multi-regional Asian & European languages (Sarvam AI) | Real-time audio voice-to-voice dialect translations |

---

## 2. Granular Feature Specifications

### 2.1. Authentication & Security
*   **MVP Scope**:
    *   Secure enrollment and login using email/password and Google OAuth via Firebase.
    *   Session persistence across web and mobile.
    *   Secure Token Exchange for backend requests (FastAPI JWT or Firebase ID token validation).
*   **V2 Scope**:
    *   Biometric Auth on mobile.
    *   Passwordless login via SMS OTP.
*   **Future Vision**:
    *   Fully decentralized user data vaults where medical files are stored with end-to-end client-side encryption keys managed on-device.

### 2.2. Interactive Medical Dashboard
*   **MVP Scope**:
    *   A high-impact landing deck featuring a clean visual summary:
        *   **Current Progress**: Circle indicators showing medication adherence for the day.
        *   **Upcoming Reminders**: Simple feed of the next medication due within 4 hours.
        *   **Activity Tiles**: Action buttons to quickly upload reports, track a metric, or start a chat session.
        *   **Health Summary**: High-level telemetry displaying the user's latest recorded Blood Pressure and Glucose levels.
*   **V2 Scope**:
    *   Dynamic personalized feeds suggesting dietary adjustments based on seasonal allergens or latest uploaded blood panels.

### 2.3. PDF/Image Report Upload & AI Explanation
*   **MVP Scope**:
    *   Drag-and-drop file interface supporting PDF, PNG, and JPEG.
    *   Server-side PDF content extraction and OCR processing.
    *   **LLM Pipeline (Gemini 3.5 Flash)**: Parses medical text, matches lab values to standard reference metrics, and converts terminology to a Grade-6 reading level.
    *   **Dashboard breakdown format**:
        *   **Summary**: 3 bullet-point high-level takeaways.
        *   **Out-of-range Metrics**: Marked with caution indicators (amber/red).
        *   **Standard Glossaries**: Interactive tooltips explaining clinical words.
        *   **Doctor Q&A Checklist**: Suggested questions for their next consultation.
*   **V2 Scope**:
    *   Integration with direct pathology clinic networks using FHIR JSON protocols.

### 2.4. Medication Manager & Reminders
*   **MVP Scope**:
    *   Easy medication setup specifying: Medicine Name, Dosage (e.g. 500mg), Frequency (Daily, Bi-daily, Weekly), Specific timing (Morning, Evening), and meal instruction (Before, With, or After food).
    *   Interactive daily schedule. Clicking an item allows the user to log: "Mark Taken", "Mark Skipped", or "Postpone".
    *   Adherence rate calculation (Taken / Total scheduled).
*   **V2 Scope**:
    *   Integrate pharmacy partner buttons to auto-order refills when remaining pill counts drop below 10%.

### 2.5. AI Chatbot Health Assistant
*   **MVP Scope**:
    *   Instant chatbot panel powered by `gemini-3.5-flash` on the backend.
    *   **Clinical Guardrails**: A rigid system instruction prioritizing safe, non-diagnostic boundaries.
    *   **Triage Engine**: Recognizes symptoms of high-risk scenarios (stroke, cardiac arrest) and switches into a red SOS emergency interface.
    *   Maintains rolling message context for continuous multi-turn conversations.
*   **V2 Scope**:
    *   Integrated multi-speaker voice synthesis using `@google/genai` TTS systems, and Sarvam AI voice models optimized for regional dialects.

### 2.6. Vital Health Metrics Analytics
*   **MVP Scope**:
    *   Interactive manual logs for:
        *   **Blood Pressure** (Systolic / Diastolic mmHg)
        *   **Blood Glucose** (mg/dL)
        *   **Heart Rate** (BPM)
        *   **Sleep Hours**
    *   Visual representation using highly polished line graphs (`recharts` for web, native charts for mobile).
    *   Displays historic logs in a tidy, paginated list.
*   **V2 Scope**:
    *   Auto-syncing background adapters for Apple Health, Fitbit, and Garmin APIs.

### 2.7. Emergency SOS & Profile Card
*   **MVP Scope**:
    *   A clean digital Medical ID card summarizing critical life-saving factors: Full name, date of birth, blood group, critical drug allergies (e.g., Penicillin), chronic conditions, and primary emergency contact numbers.
    *   **One-Tap Emergency Button**: Generates a high-visibility, quick-scan medical card on-screen for paramedics, and quick-calls pre-saved family contacts.
*   **V2 Scope**:
    *   GPS coordination SMS broadcast to 3 designated contacts during a high-impact fall detection event or manual panic trigger.

### 2.8. Multilingual Framework
*   **MVP Scope**:
    *   Dual-locale client interface toggles (English / Spanish) covering static labels, placeholders, and tooltips.
    *   LLM instructions telling the backend to output medical report explanations and chats in the language preferred by the user profile.
*   **V2 Scope**:
    *   Broadening regional support (Hindi, Telugu, Arabic, Japanese) leveraging localized prompt embeddings and Sarvam AI modules.
