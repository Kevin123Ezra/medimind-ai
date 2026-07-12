# Database Schema Design: PostgreSQL for MediMind AI

This document specifies the PostgreSQL relational database schema for MediMind AI. The database supports high-integrity relational operations, cascading deletes on orphan records, performance-oriented indexing, and audit-compliant timestamp tracking.

---

## 1. Entity-Relationship Diagram (Conceptual Schema)

*   `Users` (1) ─── (N) `MedicalReports`
*   `Users` (1) ─── (N) `Medicines` ─── (N) `Reminders`
*   `Users` (1) ─── (N) `Appointments`
*   `Users` (1) ─── (N) `ChatHistory`
*   `Users` (1) ─── (N) `HealthMetrics`
*   `Users` (1) ─── (N) `Notifications`
*   `Users` (1) ─── (N) `EmergencyContacts`

---

## 2. Table Specifications

### 2.1. Table: `users`
Stores user profile information, authentication bindings, and clinical metadata.

| Column Name | Data Type | Constraints | Description |
|---|---|---|---|
| `id` | `UUID` | `PRIMARY KEY`, `DEFAULT gen_random_uuid()` | Unique user identifier. |
| `firebase_uid` | `VARCHAR(128)` | `UNIQUE`, `NOT NULL` | Links to Firebase Authentication record. |
| `email` | `VARCHAR(255)` | `UNIQUE`, `NOT NULL` | Primary email address. |
| `first_name` | `VARCHAR(100)` | `NOT NULL` | First name. |
| `last_name` | `VARCHAR(100)` | `NOT NULL` | Last name. |
| `phone_number` | `VARCHAR(20)` | Nullable | Contact phone number. |
| `date_of_birth` | `DATE` | Nullable | User's date of birth. |
| `gender` | `VARCHAR(20)` | Nullable | User's gender. |
| `blood_type` | `VARCHAR(5)` | Nullable | Blood group (e.g., A+, O-). |
| `allergies` | `VARCHAR(255)[]` | `DEFAULT '{}'` | Array of known drug and food allergies. |
| `language_preference`| `VARCHAR(10)` | `DEFAULT 'en'` | UI language ('en' or 'es'). |
| `created_at` | `TIMESTAMP` | `DEFAULT CURRENT_TIMESTAMP` | Profile creation timestamp. |
| `updated_at` | `TIMESTAMP` | `DEFAULT CURRENT_TIMESTAMP` | Last profile update timestamp. |

*Indexes*:
*   `idx_users_firebase_uid` on `firebase_uid` (B-Tree) for rapid authentication lookups.
*   `idx_users_email` on `email` (B-Tree).

---

### 2.2. Table: `medical_reports`
Stores metadata and parsed results for diagnostic reports and blood test uploads.

| Column Name | Data Type | Constraints | Description |
|---|---|---|---|
| `id` | `UUID` | `PRIMARY KEY`, `DEFAULT gen_random_uuid()` | Unique report identifier. |
| `user_id` | `UUID` | `FOREIGN KEY`, `NOT NULL`, `REFERENCES users(id) ON DELETE CASCADE` | Link to the owner profile. |
| `report_name` | `VARCHAR(255)` | `NOT NULL` | Custom name or filename of the document. |
| `file_url` | `TEXT` | `NOT NULL` | Firebase Storage path or download URL. |
| `mime_type` | `VARCHAR(100)` | `NOT NULL` | File type (e.g., application/pdf). |
| `parsed_text` | `TEXT` | Nullable | Raw OCR text output. |
| `ai_explanation` | `JSONB` | Nullable | Structure of summaries, abnormalities, and glossary. |
| `upload_date` | `TIMESTAMP` | `DEFAULT CURRENT_TIMESTAMP` | Upload timestamp. |
| `is_parsed` | `BOOLEAN` | `DEFAULT FALSE` | Status flag for AI parsing processing. |

*Indexes*:
*   `idx_medical_reports_user_id` on `user_id` (B-Tree) to fetch a user's records.
*   `idx_medical_reports_upload_date` on `upload_date` (B-Tree DESC) for reverse chronological sorting.

---

### 2.3. Table: `medicines`
Stores medication names, doses, and schedules configured by the user.

| Column Name | Data Type | Constraints | Description |
|---|---|---|---|
| `id` | `UUID` | `PRIMARY KEY`, `DEFAULT gen_random_uuid()` | Unique medicine identifier. |
| `user_id` | `UUID` | `FOREIGN KEY`, `NOT NULL`, `REFERENCES users(id) ON DELETE CASCADE` | Link to user profile. |
| `name` | `VARCHAR(150)` | `NOT NULL` | Brand or chemical name (e.g., Metformin). |
| `dosage` | `VARCHAR(50)` | `NOT NULL` | Strength (e.g., 500mg, 2 drops). |
| `instructions` | `VARCHAR(255)` | Nullable | Specific guides (e.g., "After breakfast"). |
| `start_date` | `DATE` | `NOT NULL` | Starting date of the medication. |
| `end_date` | `DATE` | Nullable | Ending date of the medication (null for life-long).|
| `is_active` | `BOOLEAN` | `DEFAULT TRUE` | True if medication is active. |
| `created_at` | `TIMESTAMP` | `DEFAULT CURRENT_TIMESTAMP` | Audit log field. |

*Indexes*:
*   `idx_medicines_user_id` on `user_id` (B-Tree).

---

### 2.4. Table: `reminders`
Stores medication intake reminder occurrences, schedule configurations, and compliance logs.

| Column Name | Data Type | Constraints | Description |
|---|---|---|---|
| `id` | `UUID` | `PRIMARY KEY`, `DEFAULT gen_random_uuid()` | Unique reminder instance identifier. |
| `medicine_id` | `UUID` | `FOREIGN KEY`, `NOT NULL`, `REFERENCES medicines(id) ON DELETE CASCADE` | Parent medicine record. |
| `user_id` | `UUID` | `FOREIGN KEY`, `NOT NULL`, `REFERENCES users(id) ON DELETE CASCADE` | Redundant for direct lookup speed. |
| `scheduled_time` | `TIME` | `NOT NULL` | Timing for alarm (e.g., "08:00:00"). |
| `status` | `VARCHAR(20)` | `DEFAULT 'pending'` | Compliance: 'pending', 'taken', 'skipped', 'delayed'. |
| `logged_at` | `TIMESTAMP` | Nullable | Timestamp when the user logged status. |
| `day_of_week` | `INTEGER[]` | Nullable | Days of week (1=Mon, 7=Sun) if weekly. Null=daily. |

*Indexes*:
*   `idx_reminders_user_id_status` on `(user_id, status)` to query active daily schedules.
*   `idx_reminders_medicine_id` on `medicine_id`.

---

### 2.5. Table: `appointments`
Tracks upcoming and historical clinical consultations.

| Column Name | Data Type | Constraints | Description |
|---|---|---|---|
| `id` | `UUID` | `PRIMARY KEY`, `DEFAULT gen_random_uuid()` | Unique identifier. |
| `user_id` | `UUID` | `FOREIGN KEY`, `NOT NULL`, `REFERENCES users(id) ON DELETE CASCADE` | Link to user. |
| `doctor_name` | `VARCHAR(150)` | `NOT NULL` | Name of the physician. |
| `specialty` | `VARCHAR(100)` | Nullable | Clinical field (e.g., Cardiologist). |
| `clinic_name` | `VARCHAR(200)` | Nullable | Location address or facility name. |
| `appointment_time` | `TIMESTAMP` | `NOT NULL` | Scheduled date and time. |
| `notes` | `TEXT` | Nullable | Custom symptoms or items to discuss. |
| `reminder_sent` | `BOOLEAN` | `DEFAULT FALSE` | Status flag for appointment notification triggers. |

*Indexes*:
*   `idx_appointments_user_time` on `(user_id, appointment_time)` for chronology.

---

### 2.6. Table: `chat_history`
Maintains records of multi-turn assistant conversations for continuity.

| Column Name | Data Type | Constraints | Description |
|---|---|---|---|
| `id` | `UUID` | `PRIMARY KEY`, `DEFAULT gen_random_uuid()` | Unique chat turn identifier. |
| `user_id` | `UUID` | `FOREIGN KEY`, `NOT NULL`, `REFERENCES users(id) ON DELETE CASCADE` | Link to user. |
| `message` | `TEXT` | `NOT NULL` | Text content of the query. |
| `sender` | `VARCHAR(10)` | `NOT NULL` | Either 'user' or 'assistant'. |
| `created_at` | `TIMESTAMP` | `DEFAULT CURRENT_TIMESTAMP` | Message timestamp. |
| `metadata` | `JSONB` | Nullable | Stores extra tags like "symptom_warning" or "triage". |

*Indexes*:
*   `idx_chat_history_user` on `user_id` for chat panel history retrieval.

---

### 2.7. Table: `health_metrics`
Logs historical physical telemetry data points.

| Column Name | Data Type | Constraints | Description |
|---|---|---|---|
| `id` | `UUID` | `PRIMARY KEY`, `DEFAULT gen_random_uuid()` | Unique record ID. |
| `user_id` | `UUID` | `FOREIGN KEY`, `NOT NULL`, `REFERENCES users(id) ON DELETE CASCADE` | Link to user. |
| `metric_type` | `VARCHAR(50)` | `NOT NULL` | 'blood_pressure', 'blood_sugar', 'heart_rate', 'sleep'. |
| `value_primary` | `NUMERIC(6,2)`| `NOT NULL` | Primary value (e.g. Systolic, Sugar mg/dL, HR BPM). |
| `value_secondary`| `NUMERIC(6,2)`| Nullable | Secondary value (e.g. Diastolic for BP). |
| `unit` | `VARCHAR(20)` | `NOT NULL` | Metric units (e.g., 'mmHg', 'mg/dL', 'BPM', 'hours').|
| `logged_at` | `TIMESTAMP` | `DEFAULT CURRENT_TIMESTAMP` | Logging timestamp (customizable by user). |

*Indexes*:
*   `idx_health_metrics_query` on `(user_id, metric_type, logged_at)` to accelerate charts.

---

### 2.8. Table: `notifications`
Tracks localized and cloud-based alert deliveries.

| Column Name | Data Type | Constraints | Description |
|---|---|---|---|
| `id` | `UUID` | `PRIMARY KEY`, `DEFAULT gen_random_uuid()` | Unique ID. |
| `user_id` | `UUID` | `FOREIGN KEY`, `NOT NULL`, `REFERENCES users(id) ON DELETE CASCADE` | Target user profile. |
| `title` | `VARCHAR(150)` | `NOT NULL` | Title header text. |
| `body` | `TEXT` | `NOT NULL` | Notification message text. |
| `type` | `VARCHAR(30)` | `NOT NULL` | 'medicine_alarm', 'appointment_alert', 'system_update'.|
| `is_read` | `BOOLEAN` | `DEFAULT FALSE` | Track user read-receipt status. |
| `created_at` | `TIMESTAMP` | `DEFAULT CURRENT_TIMESTAMP` | Scheduled delivery timestamp. |

---

### 2.9. Table: `emergency_contacts`
Maintains user-configured contacts for critical emergency medical situations.

| Column Name | Data Type | Constraints | Description |
|---|---|---|---|
| `id` | `UUID` | `PRIMARY KEY`, `DEFAULT gen_random_uuid()` | Unique contact identifier. |
| `user_id` | `UUID` | `FOREIGN KEY`, `NOT NULL`, `REFERENCES users(id) ON DELETE CASCADE` | Owner user profile. |
| `contact_name` | `VARCHAR(150)` | `NOT NULL` | Name of contact. |
| `relationship` | `VARCHAR(50)` | Nullable | Connection (e.g., Spouse, Doctor, Child). |
| `phone_number` | `VARCHAR(20)` | `NOT NULL` | Alert cellular phone number. |
| `is_primary` | `BOOLEAN` | `DEFAULT FALSE` | True if this is the first priority emergency contact. |
| `created_at` | `TIMESTAMP` | `DEFAULT CURRENT_TIMESTAMP` | Log audit. |

*Indexes*:
*   `idx_emergency_contacts_user` on `user_id`.
