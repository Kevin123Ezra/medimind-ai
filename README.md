# MediMind AI

An AI-powered health companion built for **HACKHAZARDS '26** — the World's Largest Hackathon, organized by Namespace — under the Health Tech & Bio theme.

MediMind AI makes healthcare information more accessible, understandable, and actionable for everyone, especially elderly patients, people managing chronic illness, and non-native speakers of their healthcare provider's language.

---

## The Problem

Millions of people receive medical reports and prescriptions filled with complex clinical terminology they don't understand. On top of that, managing medication schedules and tracking reminders is a constant struggle.

We identified three core pain points:

1. **Medical reports are hard to interpret** — lab results and diagnoses are written in confusing clinical language.
2. **Medication adherence is a widespread issue** — people forget doses, miss refills, or take medication incorrectly.
3. **Language barriers limit access to care** — many patients struggle to get health guidance in their native language.

## What MediMind AI Does

- **Explains medical reports** in simple, plain-language summaries so patients understand their diagnosis and next steps.
- **Tracks medications** and sends smart reminders so users never miss a dose.
- **Offers multilingual health assistance**, breaking down language barriers.

## Tech Stack

MediMind AI was built on **Base44**, an AI-powered app-building platform, which let us go from idea to a functional, polished mobile-first app within the hackathon's tight timeline — without getting bogged down in infrastructure.

## Implementation

1. **Report Understanding Module** — takes in medical reports (text or scanned images) and uses AI to translate clinical jargon into clear, digestible explanations.
2. **Medication Tracking & Reminders** — lets users log prescriptions, set dosage times, and receive timely reminders.
3. **Multilingual Assistant Layer** — a conversational assistant that answers health-related questions and explains reports in the user's preferred language.

## Challenges We Faced

- **Balancing accuracy with simplicity** — simplifying medical language without losing critical information required careful prompt design and testing.
- **Multilingual reliability** — ensuring consistent, accurate responses across multiple languages took several iterations.
- **Time constraints** — building a cohesive, working demo within the hackathon window required tight coordination across the team.
- **Demo-readiness** — polishing the app enough to demonstrate clearly and confidently, given limited build time.

## Why It Stands Out

MediMind AI tackles a real, everyday problem with a clear, focused AI use case. It's easy to demonstrate, works well as a polished mobile app, and has genuine potential to help people who struggle with understanding their own healthcare.

---

## Getting Started (Run It on Your Device)

Since MediMind AI is built on Base44, you have a couple of options for running it yourself:

### Option 1: Open the app directly in Base44
1. Sign in to [Base44](https://base44.com) with the account the app was published under (or request access from the project owner).
2. Open the **MediMind AI** app from your Base44 workspace/dashboard.
3. Use the built-in **Preview** button to launch the app instantly in your browser — no local setup required.
4. To install it as a mobile app, open the preview link on your phone's browser and choose **"Add to Home Screen"** (or use Base44's PWA/export option if available).

### Option 2: Export and run locally
If you've exported the underlying project code from Base44:

```bash
# Clone the exported project
git clone <your-exported-repo-url>
cd medimind-ai

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Add your API keys (health-report AI model, multilingual service, etc.)

# Start the development server
npm run dev
```

Then open the local URL shown in your terminal (typically `http://localhost:3000` or similar) in your browser.

### Requirements
- Node.js 18+ (if running the exported code locally)
- A Base44 account (for the hosted/no-code version)
- API keys for any connected AI services, configured in your `.env` file

---

## Final Thoughts

Participating in HACKHAZARDS '26 pushed us to think beyond just "cool tech" and focus on building something that could genuinely improve people's lives. MediMind AI reflects that mission: using AI not just to impress, but to help.
