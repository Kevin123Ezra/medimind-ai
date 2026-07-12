import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../services/api";

// TypeScript Interfaces for Backend API Models
export interface UserProfileResponse {
  id: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
  phone_number: string | null;
  role: string;
  is_active: boolean;
  is_verified: boolean;
  is_superuser: boolean;
  created_at: string;
  updated_at: string;
}

export interface UserProfileUpdateInput {
  first_name?: string;
  last_name?: string;
  phone_number?: string;
}

/**
 * React Query: Fetch the current user profile from the FastAPI backend.
 * Automatically handles token attachment via the Axios interceptors.
 */
export function useUserProfile() {
  return useQuery<UserProfileResponse, Error>({
    queryKey: ["userProfile"],
    queryFn: async () => {
      const response = await api.get<UserProfileResponse>("/users/me");
      return response.data;
    },
    retry: 1, // Only retry once if it fails, since auth errors are usually final
    staleTime: 5 * 60 * 1000, // 5 minutes cache validity
  });
}

/**
 * React Query: Verify clinical access (Doctor/Admin roles) against the FastAPI backend.
 * Useful for locking down doctor-only tabs or settings in the UI.
 */
export function useClinicalAccess() {
  return useQuery<UserProfileResponse, Error>({
    queryKey: ["clinicalAccess"],
    queryFn: async () => {
      const response = await api.get<UserProfileResponse>("/users/clinical-access");
      return response.data;
    },
    retry: false, // Don't retry since 403 Forbidden is a static role error
    enabled: true, // Can be disabled or conditionally triggered
  });
}

/**
 * React Query: Mutate / update the user's profile fields.
 * Automatically invalidates the "userProfile" cache upon successful mutation to trigger UI refreshes.
 */
export function useUpdateUserProfile() {
  const queryClient = useQueryClient();

  return useMutation<UserProfileResponse, Error, UserProfileUpdateInput>({
    mutationFn: async (updatedData) => {
      const response = await api.put<UserProfileResponse>("/users/me", updatedData);
      return response.data;
    },
    onSuccess: (data) => {
      // Optimistically update or invalidate the cache
      queryClient.setQueryData(["userProfile"], data);
      queryClient.invalidateQueries({ queryKey: ["userProfile"] });
    },
  });
}

// Medical Report Interfaces
export interface MedicalReport {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  report_type: string;
  file_url: string | null;
  doctor_name: string | null;
  facility: string | null;
  report_date: string | null;
  extracted_text: string | null;
  structured_json: any | null;
  created_at: string;
  updated_at: string;
}

export interface MedicalReportCreateInput {
  title: string;
  description?: string;
  report_type: string;
  file_url?: string;
  doctor_name?: string;
  facility?: string;
  report_date?: string | null; // YYYY-MM-DD
}

/**
 * React Query: Fetch all medical reports for the logged-in user.
 */
export function useMedicalReports() {
  return useQuery<MedicalReport[], Error>({
    queryKey: ["medicalReports"],
    queryFn: async () => {
      const response = await api.get<MedicalReport[]>("/medical-reports/");
      return response.data;
    },
    retry: 1,
    staleTime: 1 * 60 * 1000, // 1 minute stale time
  });
}

/**
 * React Query: Save a new medical report metadata record.
 * Automatically refetches "medicalReports" query.
 */
export function useCreateMedicalReport() {
  const queryClient = useQueryClient();

  return useMutation<MedicalReport, Error, MedicalReportCreateInput>({
    mutationFn: async (reportData) => {
      const response = await api.post<MedicalReport>("/medical-reports/", reportData);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["medicalReports"] });
    },
  });
}

/**
 * React Query: Delete (soft-delete) a medical report record.
 * Automatically refetches "medicalReports" query.
 */
export function useDeleteMedicalReport() {
  const queryClient = useQueryClient();

  return useMutation<MedicalReport, Error, string>({
    mutationFn: async (id) => {
      const response = await api.delete<MedicalReport>(`/medical-reports/${id}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["medicalReports"] });
    },
  });
}

// Assistant & Health Chat Types and Hooks
export interface ChatMessageInput {
  sender: "user" | "assistant";
  message: string;
}

export interface ChatRequestInput {
  message: string;
  history: ChatMessageInput[];
}

export interface ChatResponse {
  message: string;
}

export interface ReportSummaryResponse {
  summary: string;
  key_findings: string[];
  recommendations: string[];
  disclaimer: string;
}

export function useChatWithAssistant() {
  return useMutation<ChatResponse, Error, ChatRequestInput>({
    mutationFn: async (chatData) => {
      const response = await api.post<ChatResponse>("/assistant/chat", chatData);
      return response.data;
    },
  });
}

export function useSummarizeReport() {
  return useMutation<ReportSummaryResponse, Error, string>({
    mutationFn: async (reportId) => {
      const response = await api.post<ReportSummaryResponse>(`/assistant/reports/${reportId}/summarize`);
      return response.data;
    },
  });
}
