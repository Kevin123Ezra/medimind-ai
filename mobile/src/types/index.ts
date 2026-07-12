export interface Medicine {
  id: string;
  name: string;
  dosage: string;
  instructions?: string;
  startDate: string;
  schedules: string[];
}

export interface Reminder {
  id: string;
  medicineId: string;
  medicineName: string;
  scheduledTime: string;
  status: "pending" | "taken" | "skipped";
}

export interface HealthMetric {
  id: string;
  metricType: "blood_pressure" | "heart_rate";
  valuePrimary: number;
  valueSecondary?: number;
  unit: string;
  loggedAt: string;
}

export interface UserProfile {
  firstName: string;
  lastName: string;
  bloodType: string;
  allergies: string[];
  dob: string;
  gender: string;
  languagePreference: string;
}
