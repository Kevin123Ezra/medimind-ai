export interface UserProfile {
  firstName: string;
  lastName: string;
  dob: string;
  gender: string;
  bloodType: string;
  allergies: string[];
  languagePreference: string;
}

export interface Medicine {
  id: string;
  name: string;
  dosage: string;
  instructions: string;
  startDate: string;
  endDate: string | null;
  isActive: boolean;
}

export interface Reminder {
  id: string;
  medicineName: string;
  scheduledTime: string;
  status: 'pending' | 'taken' | 'skipped';
  loggedAt: string | null;
}

export interface HealthMetric {
  id: string;
  metricType: 'blood_pressure' | 'blood_sugar' | 'heart_rate' | 'sleep' | 'steps' | 'water';
  valuePrimary: number;
  valueSecondary: number | null;
  unit: string;
  loggedAt: string;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  message: string;
  createdAt: string;
}

export interface MedicalReport {
  id: string;
  reportName: string;
  uploadDate: string;
  isParsed: boolean;
  explanation: {
    summary: string;
    abnormalMetrics: Array<{
      name: string;
      value: string;
      referenceRange: string;
      severity: 'high' | 'low' | 'normal';
      explanation: string;
    }>;
    normalMetrics: Array<{
      name: string;
      value: string;
      referenceRange: string;
      explanation: string;
    }>;
    doctorQuestions: string[];
  } | null;
}
