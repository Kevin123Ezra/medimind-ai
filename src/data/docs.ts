export interface SpecDoc {
  id: string;
  title: string;
  category: string;
  icon: string;
  content: string;
}

export const specDocs: SpecDoc[] = [
  {
    id: "prd",
    title: "1. Product Requirements (PRD)",
    category: "Product",
    icon: "ClipboardList",
    content: `# Product Requirements Document (PRD)
## Project: MediMind AI — Your Personal AI Healthcare Companion

### 1. Executive Summary
MediMind AI is a comprehensive, production-ready AI-powered healthcare companion application. It acts as an empathetic, intelligent assistant designed to bridge the gap between complex clinical language and patient understanding. By helping users demystify medical reports, organize complex daily medication regimens, log key physiological metrics, chat about general wellness queries, and coordinate basic clinical schedules, MediMind AI empowers proactive health management.

### 2. Problem Statement
Patients often face major challenges when managing their personal health:
- **Medical Report Literacy**: Diagnostic reports are written in dense, clinical jargon. Patients leave clinics confused, anxious, or misinterpreting critical markers.
- **Medication Non-Adherence**: Managing multiple therapies, precise times, dosage guidelines, and food interactions is a cognitive burden.
- **Siloed Health Records**: Personal health files, prescription papers, and vaccination charts are scattered across physical folders and portals.
- **Limited Access to Instant Health Guidance**: When a non-emergency health symptom arises, patients turn to unguided web searches, leading to health anxiety.

### 3. Target Audience & Personas
- **The Chronic Care Manager (Anita, 62)**: Takes 5 medications daily. Forgets pill timings and finds lab terms like HbA1c and eGFR completely indecipherable.
- **The Proactive Wellness Enthusiast (Marcus, 29)**: Wants to store historic health reports and correlate physical stats (sleep, blood pressure) with lab panels.
- **The Family Caregiver (Rajesh, 41)**: Manages medical appointments and medication schedules for his elderly parents and young kids.

### 4. Product Objectives & Success Metrics
- **Explain**: Translate 95%+ of uploaded medical reports into easily comprehensible language within 5 seconds.
- **Adhere**: Improve medication adherence for active users to over 90% through predictive reminder loops.
- **Inform**: Provide safe, clinically guarded, and grounded AI chats to reduce general health-related search anxieties.
- **Security**: Ensure absolute protection of personal health data.

### 5. MVP vs. Version 2 Scope
- **MVP (Current)**:
  - Email/Google Auth via Firebase.
  - Interactive dashboard showing daily compliance and quick-access metrics.
  - PDF/Image upload with server-side AI parsing and glossary explanations.
  - Medication scheduler and compliance logger.
  - AI clinical wellness chatbot with symptom triaging and disclaimers.
  - Blood Pressure, Glucose, and Heart Rate analytics charts.
  - Emergency SOS digital card with allergies and emergency contact details.
- **Version 2.0 (Planned)**:
  - Biometric mobile auth (FaceID/TouchID).
  - Wearable API sync (Apple Health, Fitbit).
  - Pharmacy refilling buttons.
  - Local multi-dialect speech translation (Sarvam AI).`
  },
  {
    id: "features",
    title: "2. Features Roadmap",
    category: "Product",
    icon: "ListChecks",
    content: `# Feature Roadmap: MediMind AI

Organized across three maturity stages: MVP, Version 2, and Future Vision.

### 1. Authentication & Security
- **MVP Scope**: Secure email/password & Google login with Firebase Auth; secure token exchange on FastAPI backend.
- **V2 Scope**: Biometric logins (FaceID/TouchID) & SMS OTP code.
- **Future Vision**: Fully decentralized user vaults with end-to-end client-side encryption keys.

### 2. Interactive Medical Dashboard
- **MVP Scope**: A clean central hub with daily medication progress circles, next pill due feed, quick-action tiles, and latest vital logs.
- **V2 Scope**: Dynamic feeds suggesting health tips based on localized allergen levels or latest parsed blood panels.

### 3. Medical Report Upload & AI Explanation
- **MVP Scope**: File uploader (PDF/Image); OCR extraction; Gemini 3.5 Flash pipeline translating diagnostic terminology into plain language, detailing out-of-range metrics (high/low), normal parameters, and a custom Doctor Q&A list.
- **V2 Scope**: Direct clinical pathology network integrations via HL7/FHIR JSON protocols.

### 4. Medication Manager & Reminders
- **MVP Scope**: Inputs for drug name, dosage, frequency, and meal instructions. Alarms and status tracking (Taken, Skipped, Postponed) with compliance history.
- **V2 Scope**: Auto-refill alerts synced with local pharmacy partners.

### 5. AI Chatbot Health Assistant
- **MVP Scope**: Empathy-trained text bot using Gemini 3.5 Flash; strict clinical guardrails (not diagnostic); emergency symptom warning overrides (chest pain alert).
- **V2 Scope**: Voice-activated real-time conversation via Google TTS and Sarvam AI voice models.

### 6. Health Metrics Analytics
- **MVP Scope**: Manual logging for Blood Pressure (systolic/diastolic), Blood Sugar, Heart Rate. Plotting trend lines with normal reference bands.
- **V2 Scope**: Background adapters syncing smartwatch vitals (Fitbit, Apple Health).`
  },
  {
    id: "user_stories",
    title: "3. User Stories",
    category: "Agile",
    icon: "User",
    content: `# User Stories & Acceptance Criteria

### 1. Authentication & Security
- **Story 1.1: Registration**
  - **As a user**, I want to register using my email and password or Google profile, **so that** my confidential health data is isolated and safely stored.
  - *Acceptance Criteria*: Validates strong password rules; signs up with single-click Google credentials; sends verification email.
- **Story 1.2: Login**
  - **As a user**, I want to log in using my saved credentials, **so that** I can securely access my personal health records on any device.

### 2. Interactive Reports
- **Story 2.1: Report Upload**
  - **As a user**, I want to upload a lab report PDF or photo, **so that** the application can convert clinical text to plain terms.
  - *Acceptance Criteria*: Supports PDF, JPEG, PNG; shows OCR progress indicator.
- **Story 2.2: AI Analysis**
  - **As a user**, I want my diagnostic sheets translated into clean summaries, **so that** I understand my status before visiting my physician.
  - *Acceptance Criteria*: Flags elevated values in amber/red; explains metric purposes; builds doctor questions list.

### 3. Medication Reminders
- **Story 3.1: Log Prescription**
  - **As a patient**, I want to input my medicine name, strength, frequency, and food instructions, **so that** I build an accurate schedule.
- **Story 3.2: Record Intake**
  - **As a user**, I want to mark scheduled medications as taken or skipped, **so that** I track my adherence over time.

### 4. AI Chatbot
- **Story 4.1: General Q&A**
  - **As a user**, I want to ask questions about common symptoms or food interactions, **so that** I get instant, safe health information.
- **Story 4.2: Stroke & Cardiac Triage**
  - **As a user in acute distress**, I want the AI to instantly recognize emergencies, **so that** I am guided to direct clinical services immediately.`
  },
  {
    id: "database",
    title: "4. Database Design (PostgreSQL)",
    category: "Technical",
    icon: "Database",
    content: `# PostgreSQL Relational Database Schema

Designed for strict data integrity, cascading deletes, and optimized query indexing.

### Table: users
Stores user credentials, preferences, and baseline clinical parameters.
- \`id\` UUID PRIMARY KEY DEFAULT gen_random_uuid()
- \`firebase_uid\` VARCHAR(128) UNIQUE NOT NULL
- \`email\` VARCHAR(255) UNIQUE NOT NULL
- \`first_name\` VARCHAR(100) NOT NULL
- \`last_name\` VARCHAR(100) NOT NULL
- \`date_of_birth\` DATE
- \`gender\` VARCHAR(20)
- \`blood_type\` VARCHAR(5)
- \`allergies\` VARCHAR(255)[] DEFAULT '{}'
- \`language_preference\` VARCHAR(10) DEFAULT 'en'
- \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP

### Table: medical_reports
- \`id\` UUID PRIMARY KEY DEFAULT gen_random_uuid()
- \`user_id\` UUID FOREIGN KEY REFERENCES users(id) ON DELETE CASCADE
- \`report_name\` VARCHAR(255) NOT NULL
- \`file_url\` TEXT NOT NULL
- \`parsed_text\` TEXT
- \`ai_explanation\` JSONB (Contains summaries, abnormal/normal parameters, QA lists)
- \`upload_date\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
- \`is_parsed\` BOOLEAN DEFAULT FALSE

### Table: medicines
- \`id\` UUID PRIMARY KEY DEFAULT gen_random_uuid()
- \`user_id\` UUID FOREIGN KEY REFERENCES users(id) ON DELETE CASCADE
- \`name\` VARCHAR(150) NOT NULL
- \`dosage\` VARCHAR(50) NOT NULL
- \`instructions\` VARCHAR(255)
- \`start_date\` DATE NOT NULL
- \`end_date\` DATE
- \`is_active\` BOOLEAN DEFAULT TRUE

### Table: reminders
- \`id\` UUID PRIMARY KEY DEFAULT gen_random_uuid()
- \`medicine_id\` UUID FOREIGN KEY REFERENCES medicines(id) ON DELETE CASCADE
- \`user_id\` UUID FOREIGN KEY REFERENCES users(id) ON DELETE CASCADE
- \`scheduled_time\` TIME NOT NULL
- \`status\` VARCHAR(20) DEFAULT 'pending' ('pending', 'taken', 'skipped')
- \`logged_at\` TIMESTAMP

### Table: health_metrics
- \`id\` UUID PRIMARY KEY
- \`user_id\` UUID FOREIGN KEY REFERENCES users(id) ON DELETE CASCADE
- \`metric_type\` VARCHAR(50) NOT NULL (blood_pressure, blood_sugar, heart_rate, sleep)
- \`value_primary\` NUMERIC(6,2) NOT NULL
- \`value_secondary\` NUMERIC(6,2) (e.g. Diastolic value)
- \`unit\` VARCHAR(20) NOT NULL
- \`logged_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP`
  },
  {
    id: "apis",
    title: "5. REST APIs (FastAPI)",
    category: "Technical",
    icon: "Code",
    content: `# REST API Specification: FastAPI Backend

### 1. User Profile Setup
- **POST /auth/register** (Initializes profile after Firebase Auth)
  - *Request Body*: \`{ "firstName": "Anita", "lastName": "Garcia", "dob": "1964-10-15" }\`
  - *Response (201 Created)*: Full JSON user object.
- **GET /profile**
  - *Response (200 OK)*: Fetches current user parameters.
- **PUT /profile**
  - *Request Body*: Updates allergies, blood groups, and language preferences.

### 2. Medical Reports Upload & Explanations
- **POST /reports/upload** (Uploads a physical PDF/image file)
  - *Content-Type*: \`multipart/form-data\`
  - *Response (202 Accepted)*: Queues background parsing task and returns \`reportId\`.
- **GET /reports/{report_id}**
  - *Response (200 OK)*: Returns the structured AI analysis:
\`\`\`json
{
  "success": true,
  "data": {
    "reportName": "June Blood Panel",
    "isParsed": true,
    "explanation": {
      "summary": "Elevated LDL levels, other organs normal.",
      "abnormalMetrics": [{ "name": "LDL Cholesterol", "value": "165 mg/dL", "severity": "high", "explanation": "LDL is 'bad cholesterol'..." }],
      "normalMetrics": [{ "name": "Creatinine", "value": "0.85 mg/dL", "explanation": "Healthy kidney..." }],
      "doctorQuestions": ["Should we discuss cholesterol lowering medicine?"]
    }
  }
}
\`\`\`

### 3. AI Chatbot
- **POST /chat**
  - *Request Body*: \`{ "message": "Why was I prescribed Metformin?" }\`
  - *Response (200 OK)*: Returns structured explanation + suggestions checklist:
\`\`\`json
{
  "success": true,
  "data": {
    "response": "Metformin helps manage Type 2 Diabetes by improving insulin response...",
    "isTriageTriggered": false,
    "suggestedFollowUps": ["What are common side effects?"]
  }
}
\`\`\`

### 4. Medication Reminders
- **POST /medicines**: Add new drug & schedule.
- **PUT /reminders/{reminder_id}**: Toggle reminder status to 'taken' or 'skipped'.`
  },
  {
    id: "architecture",
    title: "6. System Architecture",
    category: "Technical",
    icon: "Network",
    content: `# End-to-End System Architecture

### 1. Frontend: Expo React Native Client
- Bundles JavaScript assets into native swift/kotlin binaries for mobile or runs as a responsive web app.
- Styled using NativeWind (Tailwind CSS) for sleek responsive aesthetics.
- Leverages Expo Notifications for triggering local background alarms and receiving server push alerts.

### 2. Identity & Access: Firebase Auth
- Handles core user registrations, login loops, and federated Google OAuth.
- Client exchanges credentials directly with Firebase, receiving a JWT ID Token.
- Client attaches this ID Token in the Authorization Bearer header for every request to the backend API.

### 3. Primary Engine: FastAPI Backend
- Deployed in Docker containers on Render PaaS with automated scale-out parameters.
- Decodes and validates Firebase JWT ID Tokens via the Firebase Admin SDK dependency.
- Manages SQLAlchemy async database connection pools.
- Handles document storage by orchestrating presigned uploads to private Firebase Storage buckets.
- Coordinates the OCR extraction (Cloud Vision/Tesseract) and LLM queries.

### 4. AI Engine: Gemini 3.5 Flash & Sarvam AI
- **Gemini 3.5 Flash**: Processes raw unstructured text and executes report interpretations, converting clinical findings into structured JSON matching Pydantic schemas.
- **Sarvam AI**: Translates structured English summaries and chats into localized Indic dialects (Hindi, Tamil, etc.) with high semantic accuracy.

### 5. Persistent Layer: PostgreSQL Database
- Relational schema tracking profiles, appointments, drugs, schedule occurrences, and vital statistics.
- Strict referential constraints with cascading deletes to safely erase personal records when requested.
- B-Tree indexes on BPs, blood sugars, and dates to guarantee microsecond chart load speeds.`
  },
  {
    id: "cursorrules",
    title: "7. Cursor Coding Rules",
    category: "Technical",
    icon: "Settings",
    content: `# Cursor Developer Guidelines & Coding Rules

Strict rules to preserve clean architecture, SOLID patterns, and prevent code rot.

### 1. No Code Duplication
- Never clone helper functions, custom API call layers, or UI components.
- Rely on reusable modular libraries located in \`/src/components/ui/\` or \`/src/hooks/\`.

### 2. SOLID Architecture Enforcements
- **Single Responsibility**: Decouple layout design from state fetching. Create custom hook managers for API data handling.
- **Open/Closed**: Design charts and reports as modular layouts that can accept arbitrary configurations, avoiding hardcoded components.
- **Liskov Substitution & Interface Contracts**: Enforce type-safe properties on all sub-components. NEVER use \`any\` in TypeScript.

### 3. FastAPI & Python Standards
- Separate routers, schemas, services, and models.
- Group endpoints by business domain (auth, reports, meds, metrics, chat).
- Enforce async functions on DB queries and external network calls.
- Require fully documented docstrings and response models on all route signatures.

### 4. UI/UX Principles
- **Atmospheric Clinical Theme**: High-contrast, clean slate layouts with off-white cards and soft clinical highlights (Teal/Emerald for normal, Amber/Red for alerts).
- **Touch Accessibility**: Touch elements are at least 44x44px. Focus state highlights must be visible.
- **Disclaimers**: Prompt disclaimers must present in all medical information widgets.`
  },
  {
    id: "mobile_scaffolding",
    title: "8. Mobile Client Scaffolding",
    category: "Technical",
    icon: "Code",
    content: `# Mobile Client Scaffolding Structure (Expo Router)

This details the generated mobile directory structure featuring Expo Router, TypeScript, NativeWind, React Navigation, Firebase, Axios, React Query, Zod, and React Native Paper.

### 1. Core Stack Packages Configured
- **routing**: \`expo-router\` (file-system routes)
- **styling**: \`nativewind\` & \`tailwindcss\`
- **components**: \`react-native-paper\`
- **network & state**: \`axios\` & \`@tanstack/react-query\`
- **auth**: \`firebase/auth\` with \`AsyncStorage\` persistence
- **notifications**: \`expo-notifications\` for alarm scheduling

### 2. Directory Hierarchy Scaffolded
- **/mobile/app/**: App-level routing and layout declarations.
  - \`_layout.tsx\`: Configures root QueryClientProvider and PaperProvider.
  - \`(tabs)/_layout.tsx\`: Configures bottom-tab navigation styled in primary colors.
  - \`(tabs)/index.tsx\`: Stub for vital cardiovascular metrics visualizer.
  - \`(tabs)/chat.tsx\`: Stub for the clinical AI voice/text chatbot.
  - \`(tabs)/reports.tsx\`: Stub for OCR report parsing.
  - \`(tabs)/medications.tsx\`: Stub for drug reminder logs.
  - \`(tabs)/profile.tsx\`: Stub for Emergency clinical digital ID.
- **/mobile/src/**: Domain logic and features.
  - \`features/\`: Modular domains divided into auth, chat, metrics, reports, and medications components.
  - \`hooks/\`: Custom \`useNotification.ts\` to bootstrap iOS/Android permission streams.
  - \`services/\`: Pre-configured Axios instance (\`api.ts\`) and Firebase initialization client (\`firebase.ts\`).
  - \`types/\`: Comprehensive TypeScript declarations for clinical models.`
  }
];

