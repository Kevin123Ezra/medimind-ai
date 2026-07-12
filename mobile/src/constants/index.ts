export const CLINICAL_DISCLAIMER = 
  "MediMind AI provides educational medical translations and logs. It is not a replacement for a licensed healthcare provider's binding diagnosis, treatment plan, or professional clinical evaluation.";

export const BLOOD_PRESSURE_RANGES = {
  NORMAL: {
    label: "Normal",
    systolicMax: 120,
    diastolicMax: 80,
    color: "emerald",
  },
  ELEVATED: {
    label: "Elevated",
    systolicMin: 120,
    systolicMax: 129,
    diastolicMax: 80,
    color: "yellow",
  },
  STAGE_1: {
    label: "Hypertension Stage 1",
    systolicMin: 130,
    systolicMax: 139,
    diastolicMin: 80,
    diastolicMax: 89,
    color: "amber",
  },
  STAGE_2: {
    label: "Hypertension Stage 2",
    systolicMin: 140,
    diastolicMin: 90,
    color: "rose",
  },
};

export const MEAL_INSTRUCTIONS = [
  { value: "with_food", label: "Take with food" },
  { value: "before_food", label: "Take before food" },
  { value: "empty_stomach", label: "Take on empty stomach" },
  { value: "no_instructions", label: "No food restrictions" },
];

export const MOCK_PRESETS = {
  CHOL: {
    name: "Lipid Panel",
    text: "Serum Cholesterol (Total): 242 mg/dL. HDL: 42 mg/dL. LDL: 171 mg/dL.",
  },
  GLUC: {
    name: "Metabolic and A1c",
    text: "Fasting Glucose: 112 mg/dL. HbA1c: 6.2%. Creatinine: 0.85 mg/dL.",
  }
};
