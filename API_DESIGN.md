# REST API Design: FastAPI Backend for MediMind AI

This document specifies the RESTful API endpoints for the MediMind AI backend, implemented in Python using the **FastAPI** framework and validated with **Pydantic** models.

---

## 1. Global Setup & Standards

### Base URL
*   **Development**: `https://api.dev.medimind.ai/v1`
*   **Production**: `https://api.medimind.ai/v1`

### Authentication Header
All protected endpoints require a Firebase Bearer ID Token in the Authorization header:
`Authorization: Bearer <FIREBASE_ID_TOKEN>`

### Error Response Format
Whenever an error occurs (e.g., 400, 401, 404, 500), the backend consistently returns:
```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE_STRING",
    "message": "Human-readable empathetic explanation of the issue."
  }
}
```

---

## 2. API Endpoints Specification

### 2.1. Module: Authentication & User Profile

#### `POST /auth/register`
Initializes a user profile in PostgreSQL after successful Firebase Auth signup on the client.

*   **Request Headers**: `Authorization: Bearer <TOKEN>`
*   **Request Body**:
```json
{
  "firstName": "Anita",
  "lastName": "Garcia",
  "dob": "1964-10-15",
  "gender": "Female"
}
```
*   **Response (201 Created)**:
```json
{
  "success": true,
  "data": {
    "id": "e3b0c442-98fc-11ee-b9d1-0242ac120002",
    "firebaseUid": "firebase_user_abc123",
    "email": "anita.garcia@example.com",
    "firstName": "Anita",
    "lastName": "Garcia",
    "dob": "1964-10-15",
    "gender": "Female",
    "bloodType": "O+",
    "allergies": [],
    "languagePreference": "en"
  }
}
```

#### `GET /profile`
Retrieves the logged-in user's clinical profile.

*   **Request Headers**: `Authorization: Bearer <TOKEN>`
*   **Response (200 OK)**:
```json
{
  "success": true,
  "data": {
    "id": "e3b0c442-98fc-11ee-b9d1-0242ac120002",
    "email": "anita.garcia@example.com",
    "firstName": "Anita",
    "lastName": "Garcia",
    "dob": "1964-10-15",
    "gender": "Female",
    "bloodType": "O+",
    "allergies": ["Penicillin", "Peanuts"],
    "languagePreference": "es"
  }
}
```

#### `PUT /profile`
Updates user clinical fields and preferences.

*   **Request Body**:
```json
{
  "firstName": "Anita",
  "lastName": "Garcia",
  "bloodType": "O+",
  "allergies": ["Penicillin", "Peanuts", "Sulfa Drugs"],
  "languagePreference": "es"
}
```
*   **Response (200 OK)**:
```json
{
  "success": true,
  "data": {
    "id": "e3b0c442-98fc-11ee-b9d1-0242ac120002",
    "email": "anita.garcia@example.com",
    "firstName": "Anita",
    "lastName": "Garcia",
    "bloodType": "O+",
    "allergies": ["Penicillin", "Peanuts", "Sulfa Drugs"],
    "languagePreference": "es"
  }
}
```

---

### 2.2. Module: Medical Reports Upload & AI Explanation

#### `POST /reports/upload`
Uploads a physical PDF report or diagnostic image.

*   **Request Headers**: `Authorization: Bearer <TOKEN>`, `Content-Type: multipart/form-data`
*   **Form Parameters**:
    *   `file`: Binary PDF or image file (max 10MB)
    *   `reportName`: Custom identifier string (e.g., "June Blood Panel")
*   **Response (202 Accepted - Processing started)**:
```json
{
  "success": true,
  "message": "Report uploaded and parsing pipeline queued.",
  "data": {
    "reportId": "b1399672-98fd-11ee-b9d1-0242ac120002",
    "reportName": "June Blood Panel",
    "fileUrl": "https://storage.googleapis.com/medimind-storage/reports/b1399672.pdf",
    "isParsed": false,
    "uploadDate": "2026-06-27T07:22:00Z"
  }
}
```

#### `GET /reports/{report_id}`
Retrieves parsed report data, indicators, and patient-friendly explanations.

*   **Response (200 OK)**:
```json
{
  "success": true,
  "data": {
    "id": "b1399672-98fd-11ee-b9d1-0242ac120002",
    "reportName": "June Blood Panel",
    "uploadDate": "2026-06-27T07:22:00Z",
    "isParsed": true,
    "explanation": {
      "summary": "This report displays elevated cholesterol levels, while kidney and liver functions fall strictly within standard normal biological parameters.",
      "abnormalMetrics": [
        {
          "name": "LDL Cholesterol",
          "value": "165 mg/dL",
          "referenceRange": "< 100 mg/dL",
          "severity": "high",
          "explanation": "LDL is often called 'bad cholesterol'. Your current levels are higher than standard goals, which can lead to cardiovascular buildup over time. Standard lifestyle changes or medication may be discussed with your physician."
        }
      ],
      "normalMetrics": [
        {
          "name": "Serum Creatinine",
          "value": "0.85 mg/dL",
          "referenceRange": "0.60 - 1.10 mg/dL",
          "explanation": "This indicates healthy kidney filtration."
        }
      ],
      "doctorQuestions": [
        "Should we discuss medical therapy for my high LDL levels?",
        "Are there specific dietary modifications (like reducing saturated fats) you recommend for my level?",
        "When should I repeat this lipid panel to check on my progress?"
      ]
    }
  }
}
```

---

### 2.3. Module: AI Chatbot

#### `POST /chat`
Sends a message to the AI clinical wellness chatbot and gets a structured text response.

*   **Request Body**:
```json
{
  "message": "I was prescribed Metformin. What does it do, and when should I take it?"
}
```
*   **Response (200 OK)**:
```json
{
  "success": true,
  "data": {
    "response": "Metformin is a standard medication prescribed to help manage blood sugar levels, especially for Type-2 Diabetes. It helps your body respond better to its natural insulin and decreases sugar release by the liver.\n\n**Standard Administration Tips**:\n- Typically taken with meals (usually breakfast and dinner) to reduce standard side effects like stomach upset.\n- Swallowed whole with water.\n\n*Disclaimer: Please consult your doctor for your specific prescribed schedule.*",
    "isTriageTriggered": false,
    "suggestedFollowUps": [
      "What are the common side effects of Metformin?",
      "Can I drink coffee with Metformin?",
      "What should I do if I miss a dose?"
    ]
  }
}
```

---

### 2.4. Module: Medication Reminders

#### `POST /medicines`
Adds a new medication and its schedule occurrences.

*   **Request Body**:
```json
{
  "name": "Lisinopril",
  "dosage": "10mg",
  "instructions": "Take in the morning with food",
  "startDate": "2026-06-27",
  "endDate": null,
  "schedules": [
    {
      "scheduledTime": "08:00:00",
      "dayOfWeek": null
    }
  ]
}
```
*   **Response (210 Created)**:
```json
{
  "success": true,
  "data": {
    "id": "f5195034-98fe-11ee-b9d1-0242ac120002",
    "name": "Lisinopril",
    "dosage": "10mg",
    "instructions": "Take in the morning with food",
    "isBlocked": false,
    "reminders": [
      {
        "id": "a988dcd6-98ff-11ee-b9d1-0242ac120002",
        "scheduledTime": "08:00:00",
        "status": "pending"
      }
    ]
  }
}
```

#### `PUT /reminders/{reminder_id}`
Logs an event taking, skipping, or postponing a scheduled pill.

*   **Request Body**:
```json
{
  "status": "taken",
  "loggedAt": "2026-06-27T08:02:15Z"
}
```
*   **Response (200 OK)**:
```json
{
  "success": true,
  "data": {
    "reminderId": "a988dcd6-98ff-11ee-b9d1-0242ac120002",
    "status": "taken",
    "loggedAt": "2026-06-27T08:02:15Z"
  }
}
```

---

### 2.5. Module: Appointments & Notifications

#### `GET /appointments`
Retrieves a list of scheduled consultations.

*   **Response (200 OK)**:
```json
{
  "success": true,
  "data": [
    {
      "id": "1c7efb32-9900-11ee-b9d1-0242ac120002",
      "doctorName": "Dr. Sarah Jenkins",
      "specialty": "Cardiologist",
      "clinicName": "Heart & Vascular Wellness Suite, Room 405",
      "appointmentTime": "2026-07-15T14:30:00Z",
      "notes": "Bring latest lipid blood test printout and blood pressure diary."
    }
  ]
}
```

---

### 2.6. Module: Vital Health Metrics

#### `POST /metrics`
Logs a new physical telemetry reading.

*   **Request Body**:
```json
{
  "metricType": "blood_pressure",
  "valuePrimary": 122.00,
  "valueSecondary": 81.00,
  "unit": "mmHg"
}
```
*   **Response (201 Created)**:
```json
{
  "success": true,
  "data": {
    "id": "e44d5cfa-9900-11ee-b9d1-0242ac120002",
    "metricType": "blood_pressure",
    "valuePrimary": 122.00,
    "valueSecondary": 81.00,
    "unit": "mmHg",
    "loggedAt": "2026-06-27T07:22:00Z"
  }
}
```

#### `GET /metrics`
Fetches historical metric logs for charting.

*   **Request Parameters**: `metric_type=blood_pressure`, `days=7`
*   **Response (200 OK)**:
```json
{
  "success": true,
  "data": [
    {
      "id": "e44d5cfa-9900-11ee-b9d1-0242ac120002",
      "metricType": "blood_pressure",
      "valuePrimary": 122.00,
      "valueSecondary": 81.00,
      "unit": "mmHg",
      "loggedAt": "2026-06-27T07:22:00Z"
    },
    {
      "id": "8bb3879e-9900-11ee-b9d1-0242ac120002",
      "metricType": "blood_pressure",
      "valuePrimary": 118.00,
      "valueSecondary": 79.00,
      "unit": "mmHg",
      "loggedAt": "2026-06-26T08:15:00Z"
    }
  ]
}
```
