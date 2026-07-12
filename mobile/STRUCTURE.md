# MediMind AI - Expo Router & TypeScript Scaffolding

This directory contains the boilerplate codebase structure for the MediMind AI mobile client application.

## Core Stack Integrations
- **Expo Router (v3)**: File-based routing for React Native, matching physical tabs to views.
- **NativeWind (Tailwind CSS)**: High-performance utility classes styling widgets.
- **Expo Notifications**: Scheduling drug alarms and critical vitals reminders locally.
- **Firebase Authentication**: Clinical login session control.
- **React Query & Axios**: Declarative data fetching proxied through our fast server endpoints.
- **React Native Paper**: Sleek pre-built inputs and overlays.
- **Zod & React Hook Form**: Type-safe validation for lab panel OCR inputs.

## Directory Layout
```bash
/mobile
├── app/                        # Expo Router physical views
│   ├── _layout.tsx             # Main layout, Providers (QueryClient, Paper)
│   ├── (auth)/                 # Auth routes (Login, Register)
│   │   ├── _layout.tsx
│   │   ├── login.tsx
│   │   └── register.tsx
│   ├── (tabs)/                 # Bottom Tabs Navigator (Teal/Indigo styled)
│   │   ├── _layout.tsx
│   │   ├── index.tsx           # Vitals Analytics Tab
│   │   ├── chat.tsx            # AI Health Companion Chat Tab
│   │   ├── reports.tsx         # Diagnostic Lab Explainer Tab
│   │   ├── medications.tsx     # Medications & Reminders Tab
│   │   └── profile.tsx         # Digital Medical ID Profile Tab
│   └── modal.tsx               # Native Modal detail view
├── src/                        # Domain & Shared components
│   ├── features/               # Feature-based domain code
│   │   ├── auth/
│   │   │   └── hooks/useAuth.ts
│   │   ├── chat/
│   │   │   └── components/ChatBubble.tsx
│   │   ├── medications/
│   │   │   └── components/MedAlarm.tsx
│   │   ├── reports/
│   │   │   └── components/ReportCard.tsx
│   │   └── metrics/
│   │       └── components/MetricChart.tsx
│   ├── hooks/                  # Global shared hooks
│   │   └── useNotification.ts  # Expo Push & Local Channel setup
│   ├── services/               # Network & External SDKs
│   │   ├── api.ts              # Axios centralized instance
│   │   └── firebase.ts         # Firebase client config
│   ├── store/                  # Client local sync states
│   │   └── index.ts
│   └── types/                  # Shareable type definitions
│       └── index.ts
├── package.json
├── tsconfig.json
└── tailwind.config.js
```
