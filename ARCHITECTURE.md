# System Architecture Design: MediMind AI

This document specifies the complete end-to-end system architecture of MediMind AI. The platform is designed to be secure, low-latency, and cross-platform ready, scaling seamlessly to thousands of active users.

---

## 1. High-Level Architecture Diagram (Data Flow)

```
                     ┌────────────────────────────────┐
                     │     Expo React Native Client   │
                     │  (iOS, Android, Responsive Web)│
                     └───────┬───────────────┬────────┘
                             │               │
      1. Authenticate (OAuth)│               │ 3. Upload File Direct
                             ▼               ▼
                 ┌───────────────────┐   ┌──────────────────────┐
                 │   Firebase Auth   │   │   Firebase Storage   │
                 │   (Identity Provider)│   │ (Encrypted PHR Bucket)│
                 └───────────────────┘   └───────────┬──────────┘
                             │                       │
           2. JWT ID Token   │                       │ 4. Read Secured Link
                             ▼                       ▼
                     ┌────────────────────────────────┐
                     │         FastAPI Backend        │
                     │    (Hosted on Render PaaS)     │
                     └───────┬───────────────┬────────┘
                             │               │
         5. Store telemetry/ │               │ 6. Generate report details
            relational profiles│               │    or safe symptom chats
                             ▼               ▼
                 ┌───────────────────┐   ┌──────────────────────┐
                 │ PostgreSQL Engine │   │   Gemini 3.5 Flash   │
                 │ (Cloud Relational)│   │  (Advanced Lab LLM)  │
                 └───────────────────┘   └──────────────────────┘
                                             ▲
                                             │ 7. High-speed local dialects
                                             ▼
                                         ┌──────────────────────┐
                                         │      Sarvam AI       │
                                         │ (Indic Language LLM) │
                                         └──────────────────────┘
```

---

## 2. Architectural Components

### 2.1. Client Layer: Expo React Native (iOS, Android, Web)
*   **Purpose**: Cross-platform responsive client layer compiling into native Swift/Kotlin binaries and web-compatible components.
*   **Key Responsibilities**:
    *   State management via Zustand/Redux for high-speed offline hydration.
    *   Responsive, touch-friendly UI styled using Tailwind classes via NativeWind.
    *   Device-side image selection and local storage cache management.
    *   Receiving device-level push notifications utilizing the **Expo Notifications Service (APNs/FCM wrapper)**.
*   **Communication Protocol**: Secure HTTPS REST requests and WebSocket channels for streaming conversations.

### 2.2. Authentication Identity Provider: Firebase Auth
*   **Purpose**: Manages secure user signup, login sessions, password resets, and federated Google OAuth logins.
*   **Communication flow**:
    1.  The Expo mobile client prompts Google login.
    2.  On success, Firebase provides a client-side **ID Token (JWT)**.
    3.  For subsequent backend API queries, the client forwards this ID Token in the request's `Authorization: Bearer` header.
    4.  The FastAPI server decodes and validates this token using the Firebase Admin SDK, identifying the authenticated user.

### 2.3. Document & Report Vault: Firebase Storage
*   **Purpose**: Securely stores raw patient files, blood reports, and PDFs under strict access rules.
*   **Communication flow**:
    1.  The client requests a secure presigned upload path from the FastAPI server.
    2.  The client uploads the file directly to Firebase Storage using this path, reducing load on the primary FastAPI server.
    3.  When the backend needs to run OCR, it retrieves the document from the storage bucket via a secure, short-lived authenticated URL.

### 2.4. Core Application Engine: FastAPI (Python)
*   **Purpose**: The primary backend conductor handling logical flows, validation, and database operations.
*   **Key Responsibilities**:
    *   Asynchronous connection pooling to the database using SQLAlchemy / SQLModel.
    *   Pydantic schema validation for incoming and outgoing data payloads.
    *   Executing OCR extraction from uploaded files using systems like Tesseract or Google Cloud Vision.
    *   Calling LLM APIs (Gemini 3.5 Flash) server-side to generate health report summaries.
*   **Deployment**: Runs as Docker containers on **Render Web Services**, scaling horizontally based on CPU load.

### 2.5. Database Engine: PostgreSQL
*   **Purpose**: The persistent relational storage system.
*   **Key Responsibilities**:
    *   Maintaining transactional referential integrity (Users, Medicines, Reminders, Appointments).
    *   Using indexing strategies to handle time-series logs of patient metrics (blood pressure, sugar).
    *   Enforcing cascading deletes so that deleting a user's account safely purges all associated medical and personal history records.

### 2.6. AI Processing Pipeline: Gemini & Sarvam AI
*   **Purpose**: Powers advanced health analysis and local-language translations.
*   **Interaction flow**:
    *   **Gemini 3.5 Flash**: Translates complex raw text and lab tables into clear, clinical terms and structures out-of-range indicators.
    *   **Sarvam AI Integration**: For multi-regional users, Sarvam AI translate standard clinical terms and chat logs into localized dialects (Hindi, Tamil, etc.), ensuring accessible healthcare.

---

## 3. Step-by-Step Document Processing Communication Sequence

1.  **Selection**: The user selects a blood test PDF in the Expo mobile client and taps "Process".
2.  **Upload**: The client uploads the file to **Firebase Storage** and receives a path token.
3.  **Initiation**: The client sends a `POST /reports/upload` request containing the storage path to the **FastAPI Backend**.
4.  **Enqueue**: FastAPI validates the request and enqueues a background parsing task, instantly returning a `202 Accepted` response to keep the client UI responsive.
5.  **OCR Processing**: The background worker downloads the file from Firebase Storage, extracts the raw clinical text, and structures it.
6.  **AI Analysis**: FastAPI formats a secure prompt, feeding the raw text to **Gemini 3.5 Flash** server-side with strict parameters to output a structured JSON schema (summaries, elevated levels, dictionary terms).
7.  **Localization**: If the user prefers a non-English language, the system routes the structured summary through **Sarvam AI** for high-quality translation.
8.  **Storage**: The final structured analysis JSON is saved to the **PostgreSQL Database** (`medical_reports.ai_explanation` column).
9.  **Notification**: The backend triggers an **Expo Push Notification** to the user's device: *"Your report analysis is ready!"*.
10. **Hydration**: The user opens the notification, prompting the Expo client to fetch the analyzed records via `GET /reports/{id}` and display them.

---

## 4. Security & Compliance
*   **Data-in-Transit**: All API connections, database queries, and storage transfers are strictly encrypted using TLS 1.3 / SSL.
*   **Data-at-Rest**: The PostgreSQL database utilizes AES-256 transparent data encryption (TDE).
*   **Strict Disclaimers**: To ensure patient safety, all report explanations and AI chat panels display persistent disclaimers indicating the tool is purely educational and does not replace medical professionals.
