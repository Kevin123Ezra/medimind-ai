# User Stories: MediMind AI

This document details the user stories and acceptance criteria for the core MediMind AI modules, serving as the basis for developers and QA engineers.

---

## 1. Authentication & Security
### User Story 1.1: Secure Account Registration
*   **As a user**, I want to register for a MediMind AI account using my email and password or Google profile, **so that** my confidential health data is isolated and safely stored in my private cloud profile.
*   **Acceptance Criteria**:
    *   System validates that the password has a minimum of 8 characters, containing at least one number and one symbol.
    *   System triggers a confirmation email upon registration.
    *   User can opt to sign up via a single-click Google authentication modal.

### User Story 1.2: Standard Login & Sessions
*   **As a registered user**, I want to log in using my saved credentials, **so that** I can securely access my personal health dashboards across multiple devices.
*   **Acceptance Criteria**:
    *   Provides clear, empathetic error messaging for incorrect usernames or passwords without disclosing system-internal exploits.
    *   Session tokens persist securely inside safe browser containers or device storage, avoiding forced logins on every reload.

---

## 2. Interactive Medical Reports
### User Story 2.1: Report PDF/Image Upload
*   **As a user**, I want to drag-and-drop or photograph my physical lab report sheets, **so that** the application can convert the clinical terms into clear insights.
*   **Acceptance Criteria**:
    *   Supports `.pdf`, `.png`, and `.jpeg` formats up to 10MB.
    *   Displays a clean file-upload loading indicator explaining the OCR progress.
    *   Allows users to preview their uploaded document before triggering the final API scan.

### User Story 2.2: AI-Powered Report Interpretation
*   **As a user**, I want to read my uploaded diagnostic results translated into simple, readable English or Spanish, **so that** I understand my clinical levels before my doctor's appointment.
*   **Acceptance Criteria**:
    *   Highlights out-of-range lab levels in explicit color-coded indicator cards (amber for mild anomalies, red for critical levels).
    *   Provides high-level summaries and a glossary explaining complex metrics (like GFR, Neutrophils, HbA1c) in grade-school language.
    *   Generates a checklist of personalized questions to help guide follow-up conversations with their doctor.

---

## 3. Medication Manager & Reminders
### User Story 3.1: Medicine & Schedule Logging
*   **As a patient**, I want to input my medicine specifications (name, dose, frequency, timings, and food intake constraints), **so that** I can build an accurate daily schedule.
*   **Acceptance Criteria**:
    *   Features intuitive input fields including dose unit selectors (e.g., mg, mcg, drops, tablets).
    *   Offers standard meal-timing rules (e.g., "Before food", "With food", "After food").
    *   Warns users immediately if they attempt to enter duplicate daily times for the same medicine.

### User Story 3.2: Logging Medication Adherence
*   **As a user**, I want to mark each of my scheduled medications as taken, skipped, or postponed, **so that** I can track my compliance progress.
*   **Acceptance Criteria**:
    *   Allows one-tap tracking from the central dashboard.
    *   Saves compliance history securely, recalculating the weekly adherence rate immediately.
    *   Allows users to add optional notes when marking a pill as "skipped" (e.g., "experienced nausea").

---

## 4. AI Chatbot Assistant
### User Story 4.1: Instant Health Chat
*   **As a user**, I want to ask questions about physical symptoms, diet, or general medicine purposes, **so that** I get immediate health information.
*   **Acceptance Criteria**:
    *   Maintains rolling conversation context so users can ask follow-up questions.
    *   Includes a prominent legal disclaimer emphasizing that the AI does not replace clinical practitioners.
    *   Utilizes streaming text responses to optimize perceived UI speed.

### User Story 4.2: Symptoms Triaging & SOS Alerts
*   **As a user experiencing physical distress**, I want the AI to recognize critical high-risk words, **so that** I am immediately guided to seek emergency clinical care.
*   **Acceptance Criteria**:
    *   If words like "chest pressure", "severe stroke", or "paralysis" are parsed, the chat blocks standard conversation.
    *   Renders a bright red warning interface with call buttons for local emergency response (e.g., 911) and pre-saved emergency contacts.

---

## 5. Profile & Schedule Management
### User Story 5.1: Profile Personalization
*   **As a user**, I want to modify my core clinical profile parameters (such as blood group, drug allergies, height, weight, and history), **so that** the AI can adjust report summaries and chats to my specific conditions.
*   **Acceptance Criteria**:
    *   Enforces input boundaries (e.g., height between 50-250cm).
    *   Multi-select allergy list to prevent manual typing typos on critical substances like penicillin or sulfa drugs.

### User Story 5.2: Clinical Appointments Log
*   **As a family caregiver**, I want to log upcoming clinical appointments and doctor profiles, **so that** I don't miss scheduled examinations.
*   **Acceptance Criteria**:
    *   Includes fields for Doctor Name, Specialty, Clinic Name, Date, and Time.
    *   Displays upcoming schedules chronologically.
    *   Permits direct calling of doctors from their contact cards.

---

## 6. Health Analytics & Telemetry
### User Story 6.1: Manual Vital Tracking
*   **As a patient**, I want to log my daily biological parameters like Blood Pressure, Blood Sugar, and Heart Rate, **so that** I can keep an organized log of my physical health.
*   **Acceptance Criteria**:
    *   Blood pressure prompts require both Systolic and Diastolic values.
    *   Automatically timestamps new logs, with option to backdate entries.

### User Story 6.2: Visual Telemetry Charts
*   **As a user**, I want to see my health telemetry displayed over responsive line and bar charts, **so that** I can easily spot trends and share them with my doctor.
*   **Acceptance Criteria**:
    *   Charts support multi-range filters (e.g., "7 Days", "30 Days").
    *   Plots reference bands (normal ranges) directly behind logged inputs.
