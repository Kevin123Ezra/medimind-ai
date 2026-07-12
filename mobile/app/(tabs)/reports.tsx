import React, { useState } from "react";
import { 
  View, 
  Text, 
  ScrollView, 
  TouchableOpacity, 
  TextInput, 
  ActivityIndicator, 
  Linking,
  Alert
} from "react-native";
import { ScreenContainer } from "../../src/components/ScreenContainer";
import { Card } from "../../src/components/Card";
import { Button } from "../../src/components/Button";
import { StatusBadge } from "../../src/components/StatusBadge";
import { CLINICAL_DISCLAIMER } from "../../src/constants";
import { 
  FileText, 
  UploadCloud, 
  CheckCircle2, 
  Trash2, 
  Calendar, 
  MapPin, 
  User as UserIcon, 
  X, 
  AlertCircle, 
  FilePlus, 
  Image as ImageIcon,
  ChevronRight,
  ExternalLink,
  Plus,
  Sparkles
} from "lucide-react-native";
import { 
  useMedicalReports, 
  useCreateMedicalReport, 
  useDeleteMedicalReport,
  useSummarizeReport,
  MedicalReport 
} from "../../src/hooks/useQueries";
import { storage } from "../../src/services/firebase";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import * as DocumentPicker from "expo-document-picker";
import * as ImagePicker from "expo-image-picker";

const REPORT_TYPES = [
  "Lab Result",
  "MRI Scan",
  "X-Ray",
  "Prescription",
  "Doctor Note",
  "Other"
];

export default function ReportsScreen() {
  // Query & Mutation Hooks
  const { data: reports = [], isLoading, error: fetchError, refetch } = useMedicalReports();
  const createReportMutation = useCreateMedicalReport();
  const deleteReportMutation = useDeleteMedicalReport();
  const summarizeReportMutation = useSummarizeReport();

  // Selected Report for Details view
  const [activeReportId, setActiveReportId] = useState<string | null>(null);
  
  // Local cache for AI-generated report summaries
  const [reportSummaries, setReportSummaries] = useState<Record<string, any>>({});

  const handleSummarizeReport = async (reportId: string) => {
    try {
      const summary = await summarizeReportMutation.mutateAsync(reportId);
      setReportSummaries((prev) => ({
        ...prev,
        [reportId]: summary,
      }));
    } catch (err: any) {
      Alert.alert(
        "Analysis Offline",
        err.message || "Failed to analyze report content. Please check back later."
      );
    }
  };

  // Upload Navigation & Form State
  const [isUploadingMode, setIsUploadingMode] = useState(false);
  const [isUploadingToFirebase, setIsUploadingToFirebase] = useState(false);

  // Selected File details
  const [selectedFileUri, setSelectedFileUri] = useState<string | null>(null);
  const [selectedFileName, setSelectedFileName] = useState<string>("");
  const [selectedFileType, setSelectedFileType] = useState<string>("");

  // Form Fields
  const [formTitle, setFormTitle] = useState("");
  const [formReportType, setFormReportType] = useState("Lab Result");
  const [formDoctorName, setFormDoctorName] = useState("");
  const [formFacility, setFormFacility] = useState("");
  const [formReportDate, setFormReportDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split("T")[0]; // default: YYYY-MM-DD
  });
  const [formDescription, setFormDescription] = useState("");

  const activeReport = reports.find((r) => r.id === activeReportId);

  // Handlers for Document Picker
  const handleSelectPDF = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: "application/pdf",
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        setSelectedFileUri(asset.uri);
        setSelectedFileName(asset.name);
        setSelectedFileType("application/pdf");
        
        // Auto-populate Title if blank
        if (!formTitle) {
          const nameWithoutExt = asset.name.replace(/\.[^/.]+$/, "");
          setFormTitle(nameWithoutExt);
        }
      }
    } catch (err) {
      console.error("Document picking error:", err);
      Alert.alert("Selection Error", "Failed to select document. Please try again.");
    }
  };

  // Handlers for Image Picker
  const handleSelectImage = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Permission Required", "Please allow photo library permissions in your settings to select an image.");
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        setSelectedFileUri(asset.uri);
        const autoName = asset.fileName || `medical_image_${Date.now()}.jpg`;
        setSelectedFileName(autoName);
        setSelectedFileType(asset.mimeType || "image/jpeg");

        // Auto-populate Title if blank
        if (!formTitle) {
          const nameWithoutExt = autoName.replace(/\.[^/.]+$/, "");
          setFormTitle(nameWithoutExt);
        }
      }
    } catch (err) {
      console.error("Image picking error:", err);
      Alert.alert("Selection Error", "Failed to select image. Please try again.");
    }
  };

  const handleClearSelectedFile = () => {
    setSelectedFileUri(null);
    setSelectedFileName("");
    setSelectedFileType("");
  };

  const handleResetForm = () => {
    handleClearSelectedFile();
    setFormTitle("");
    setFormReportType("Lab Result");
    setFormDoctorName("");
    setFormFacility("");
    setFormDescription("");
    const today = new Date();
    setFormReportDate(today.toISOString().split("T")[0]);
    setIsUploadingMode(false);
    setIsUploadingToFirebase(false);
  };

  // Upload to Firebase Storage helper
  const uploadToFirebaseStorage = async (uri: string, name: string): Promise<string> => {
    const response = await fetch(uri);
    const blob = await response.blob();
    const uniqueName = `${Date.now()}_${name.replace(/[^a-zA-Z0-9.]/g, "_")}`;
    const storageRef = ref(storage, `medical_reports/${uniqueName}`);
    const snapshot = await uploadBytes(storageRef, blob);
    const downloadUrl = await getDownloadURL(snapshot.ref);
    return downloadUrl;
  };

  // Main Save Submission
  const handleSubmitReport = async () => {
    if (!formTitle.trim()) {
      Alert.alert("Validation Error", "Please provide a title for the medical report.");
      return;
    }
    if (!selectedFileUri) {
      Alert.alert("Validation Error", "Please select a PDF file or an image of the medical report.");
      return;
    }

    setIsUploadingToFirebase(true);
    try {
      // 1. Upload Binary payload to Firebase Storage
      const fileUrl = await uploadToFirebaseStorage(selectedFileUri, selectedFileName);

      // 2. Submit record metadata to FastAPI Postgres endpoint
      await createReportMutation.mutateAsync({
        title: formTitle,
        description: formDescription || undefined,
        report_type: formReportType,
        file_url: fileUrl,
        doctor_name: formDoctorName || undefined,
        facility: formFacility || undefined,
        report_date: formReportDate || null
      });

      Alert.alert("Success", "Your medical report was successfully uploaded and registered.");
      handleResetForm();
    } catch (error: any) {
      console.error("Save report failed:", error);
      Alert.alert(
        "Upload Failure",
        error.message || "Could not complete the report registration. Please check your network and try again."
      );
    } finally {
      setIsUploadingToFirebase(false);
    }
  };

  const handleDeleteReport = async (id: string) => {
    Alert.alert(
      "Delete Report",
      "Are you sure you want to delete this report? This will remove it from your list.",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Delete", 
          style: "destructive", 
          onPress: async () => {
            try {
              await deleteReportMutation.mutateAsync(id);
              setActiveReportId(null);
              Alert.alert("Deleted", "The report was deleted successfully.");
            } catch (err: any) {
              console.error("Deletion failed:", err);
              Alert.alert("Error", "Could not delete the report. Please try again.");
            }
          } 
        }
      ]
    );
  };

  const openFileInBrowser = (url: string | null) => {
    if (!url) {
      Alert.alert("Error", "No file attachment found for this report.");
      return;
    }
    Linking.openURL(url).catch((err) => {
      console.error("Failed to open URL:", err);
      Alert.alert("Error", "Could not open attachment. Invalid URL or missing browser.");
    });
  };

  return (
    <ScreenContainer scrollable className="bg-slate-50">
      
      {/* HEADER ROW */}
      <View className="flex-row justify-between items-center mb-4 px-1">
        <View>
          <Text className="text-xl font-extrabold text-slate-900 tracking-tight">Medical Reports</Text>
          <Text className="text-xs text-slate-400 mt-0.5">Secure, server-stored clinical documents</Text>
        </View>
        
        {!isUploadingMode && (
          <TouchableOpacity 
            onPress={() => setIsUploadingMode(true)}
            className="flex-row items-center bg-teal-600 px-4 h-10 rounded-full active:bg-teal-700"
          >
            <Plus size={16} color="#ffffff" className="mr-1" />
            <Text className="text-white text-xs font-bold">Add Report</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* 1. UPLOAD FORM VIEW MODE */}
      {isUploadingMode && (
        <Card 
          title="Upload Medical Document" 
          subtitle="All files are safely stored in Firebase Storage and metadata is saved in PostgreSQL"
          className="mb-6 border-2 border-teal-50"
        >
          {/* FILE PICKER ACTION AREA */}
          {!selectedFileUri ? (
            <View className="space-y-3 my-2">
              <Text className="text-xs font-bold text-slate-500 mb-1">Select Document Source:</Text>
              
              <TouchableOpacity 
                onPress={handleSelectPDF}
                className="border-2 border-dashed border-slate-200 rounded-xl p-6 items-center justify-center bg-white active:bg-slate-50"
              >
                <FilePlus size={28} color="#0d9488" className="mb-2" />
                <Text className="text-xs font-bold text-slate-800">Select PDF / Medical Document</Text>
                <Text className="text-[10px] text-slate-400 mt-1">Locate a medical PDF file from your device</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                onPress={handleSelectImage}
                className="border-2 border-dashed border-slate-200 rounded-xl p-6 items-center justify-center bg-white active:bg-slate-50"
              >
                <ImageIcon size={28} color="#0d9488" className="mb-2" />
                <Text className="text-xs font-bold text-slate-800">Select Report Image / Photo</Text>
                <Text className="text-[10px] text-slate-400 mt-1">Choose a PNG/JPG medical record from library</Text>
              </TouchableOpacity>
            </View>
          ) : (
            /* ATTACHED FILE CARD */
            <View className="bg-slate-100 rounded-xl p-4 my-3 flex-row items-center justify-between border border-slate-200">
              <View className="flex-row items-center flex-1 mr-2">
                <FileText size={24} color="#0d9488" />
                <View className="ml-3 flex-1">
                  <Text className="text-xs font-bold text-slate-800" numberOfLines={1}>
                    {selectedFileName}
                  </Text>
                  <Text className="text-[10px] text-slate-500 uppercase mt-0.5">
                    {selectedFileType.split("/")[1] || "document"}
                  </Text>
                </View>
              </View>
              <TouchableOpacity 
                onPress={handleClearSelectedFile}
                disabled={isUploadingToFirebase}
                className="p-1 rounded-full bg-slate-200 active:bg-slate-300"
              >
                <X size={16} color="#475569" />
              </TouchableOpacity>
            </View>
          )}

          {/* FORM FIELDS */}
          {selectedFileUri && (
            <View className="space-y-4 mt-2">
              {/* Title Input */}
              <View>
                <Text className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Document Title *</Text>
                <TextInput
                  value={formTitle}
                  onChangeText={setFormTitle}
                  placeholder="e.g., Lipid Panel Results, Chest X-Ray"
                  className="bg-white border border-slate-200 rounded-xl px-4 h-11 text-xs text-slate-800"
                  editable={!isUploadingToFirebase}
                />
              </View>

              {/* Report Type Selector Chips */}
              <View>
                <Text className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Report Type</Text>
                <View className="flex-row flex-wrap gap-1.5">
                  {REPORT_TYPES.map((type) => {
                    const isSelected = formReportType === type;
                    return (
                      <TouchableOpacity
                        key={type}
                        onPress={() => setFormReportType(type)}
                        disabled={isUploadingToFirebase}
                        className={`px-3 py-1.5 rounded-full border ${
                          isSelected 
                            ? "bg-teal-500 border-teal-500" 
                            : "bg-white border-slate-200"
                        }`}
                      >
                        <Text className={`text-[10px] font-bold ${
                          isSelected ? "text-white" : "text-slate-600"
                        }`}>
                          {type}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>

              {/* Grid: Doctor & Facility */}
              <View className="flex-row space-x-3">
                <View className="flex-1">
                  <Text className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Prescribing Doctor</Text>
                  <TextInput
                    value={formDoctorName}
                    onChangeText={setFormDoctorName}
                    placeholder="Dr. Smith"
                    className="bg-white border border-slate-200 rounded-xl px-4 h-11 text-xs text-slate-800"
                    editable={!isUploadingToFirebase}
                  />
                </View>
                <View className="flex-1">
                  <Text className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Clinic / Facility</Text>
                  <TextInput
                    value={formFacility}
                    onChangeText={setFormFacility}
                    placeholder="City General Labs"
                    className="bg-white border border-slate-200 rounded-xl px-4 h-11 text-xs text-slate-800"
                    editable={!isUploadingToFirebase}
                  />
                </View>
              </View>

              {/* Date Input */}
              <View>
                <Text className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Report Date (YYYY-MM-DD)</Text>
                <TextInput
                  value={formReportDate}
                  onChangeText={setFormReportDate}
                  placeholder="YYYY-MM-DD"
                  className="bg-white border border-slate-200 rounded-xl px-4 h-11 text-xs text-slate-800"
                  editable={!isUploadingToFirebase}
                />
              </View>

              {/* Description Input */}
              <View>
                <Text className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Notes / Description</Text>
                <TextInput
                  value={formDescription}
                  onChangeText={setFormDescription}
                  placeholder="Additional context, symptoms, or findings..."
                  className="bg-white border border-slate-200 rounded-xl p-3 text-xs text-slate-800 min-h-[70px]"
                  multiline
                  numberOfLines={3}
                  textAlignVertical="top"
                  editable={!isUploadingToFirebase}
                />
              </View>

              {/* Action Submit Buttons */}
              <View className="flex-row space-x-3 pt-2">
                <Button 
                  onPress={handleResetForm} 
                  title="Cancel" 
                  variant="outline"
                  className="flex-1"
                  disabled={isUploadingToFirebase}
                />
                <Button 
                  onPress={handleSubmitReport} 
                  title={isUploadingToFirebase ? "Uploading document..." : "Save Report"} 
                  loading={isUploadingToFirebase}
                  variant="primary"
                  className="flex-1"
                />
              </View>
            </View>
          )}

          {/* BACK TO LIST BUTTON (when no file selected yet) */}
          {!selectedFileUri && (
            <Button 
              onPress={() => setIsUploadingMode(false)} 
              title="Back to Reports" 
              variant="outline"
              className="mt-3"
            />
          )}
        </Card>
      )}

      {/* 2. MAIN REPORTS ARCHIVE LIST */}
      {!isUploadingMode && (
        <View className="space-y-4">
          
          {/* LOAD / EMPTY / ERROR STATES */}
          {isLoading ? (
            <View className="py-12 items-center justify-center">
              <ActivityIndicator size="large" color="#0d9488" />
              <Text className="text-xs text-slate-400 mt-2 font-medium">Retrieving medical file vault...</Text>
            </View>
          ) : fetchError ? (
            <View className="bg-red-50 p-4 rounded-xl border border-red-150 items-center justify-center py-6">
              <AlertCircle size={28} color="#ef4444" className="mb-2" />
              <Text className="text-xs font-bold text-red-800">Failed to load medical reports</Text>
              <Text className="text-[10px] text-red-500 text-center mt-1">
                {fetchError.message || "Network request unsuccessful"}
              </Text>
              <Button onPress={() => refetch()} title="Retry" variant="outline" className="mt-3 h-8 w-24" />
            </View>
          ) : reports.length === 0 ? (
            <View className="bg-white rounded-2xl border border-slate-150 p-8 items-center justify-center py-10">
              <UploadCloud size={44} color="#94a3b8" className="mb-3" />
              <Text className="text-sm font-bold text-slate-800">Your Medical Vault is Empty</Text>
              <Text className="text-xs text-slate-400 mt-1.5 text-center leading-normal max-w-[240px]">
                Upload blood test results, radiological scans, or doctors notes to keep them organized.
              </Text>
              <Button 
                onPress={() => setIsUploadingMode(true)} 
                title="Upload Your First File" 
                variant="primary"
                className="mt-4 h-10 px-6"
              />
            </View>
          ) : (
            /* REPORTS GRID / LIST */
            <View className="space-y-2">
              <Text className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1 px-1">
                All Uploaded Reports ({reports.length})
              </Text>

              {reports.map((report) => {
                const isActive = activeReportId === report.id;
                const formattedDate = report.report_date 
                  ? new Date(report.report_date).toLocaleDateString(undefined, { 
                      year: 'numeric', 
                      month: 'short', 
                      day: 'numeric' 
                    })
                  : new Date(report.created_at).toLocaleDateString(undefined, {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric'
                    });

                return (
                  <TouchableOpacity
                    key={report.id}
                    onPress={() => setActiveReportId(isActive ? null : report.id)}
                    className={`p-4 bg-white rounded-xl border flex-row justify-between items-center ${
                      isActive ? "border-teal-400 bg-teal-50/10" : "border-slate-150"
                    }`}
                  >
                    <View className="flex-row items-center flex-1 mr-3">
                      <View className="p-2.5 rounded-lg bg-teal-50 mr-3">
                        <FileText size={18} color="#0d9488" />
                      </View>
                      <View className="flex-1">
                        <Text className="text-xs font-bold text-slate-800" numberOfLines={1}>
                          {report.title}
                        </Text>
                        <View className="flex-row items-center space-x-1.5 mt-1 flex-wrap">
                          <StatusBadge label={report.report_type} type="neutral" />
                          <Text className="text-[9px] text-slate-400">• {formattedDate}</Text>
                        </View>
                      </View>
                    </View>
                    <ChevronRight size={16} color={isActive ? "#0d9488" : "#94a3b8"} />
                  </TouchableOpacity>
                );
              })}
            </View>
          )}

          {/* 3. REPORT DETAILED EXPANDED CARD PANEL */}
          {activeReport && (
            <View className="mt-2 animate-fade-in">
              <Text className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 px-1">
                Report Details
              </Text>

              <Card className="bg-white border-teal-200 border shadow-sm">
                <View className="flex-row justify-between items-start border-b border-slate-100 pb-3 mb-3">
                  <View className="flex-1 mr-2">
                    <Text className="text-sm font-extrabold text-slate-950">{activeReport.title}</Text>
                    <View className="flex-row items-center space-x-2 mt-1">
                      <StatusBadge label={activeReport.report_type} type="success" />
                      {activeReport.report_date && (
                        <Text className="text-[10px] text-slate-400">Date: {activeReport.report_date}</Text>
                      )}
                    </View>
                  </View>
                  <TouchableOpacity 
                    onPress={() => handleDeleteReport(activeReport.id)}
                    disabled={deleteReportMutation.isPending}
                    className="p-1.5 rounded-lg bg-rose-50 active:bg-rose-100"
                  >
                    <Trash2 size={15} color="#e11d48" />
                  </TouchableOpacity>
                </View>

                {/* Grid attributes */}
                <View className="space-y-2 mb-4">
                  {activeReport.doctor_name && (
                    <View className="flex-row items-center">
                      <UserIcon size={13} color="#64748b" className="mr-2" />
                      <Text className="text-[11px] text-slate-500">
                        <Text className="font-bold text-slate-700">Doctor: </Text>
                        {activeReport.doctor_name}
                      </Text>
                    </View>
                  )}
                  {activeReport.facility && (
                    <View className="flex-row items-center">
                      <MapPin size={13} color="#64748b" className="mr-2" />
                      <Text className="text-[11px] text-slate-500">
                        <Text className="font-bold text-slate-700">Facility: </Text>
                        {activeReport.facility}
                      </Text>
                    </View>
                  )}
                  {activeReport.description && (
                    <View className="p-3 bg-slate-50 rounded-lg border border-slate-100 mt-2">
                      <Text className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Notes / Description</Text>
                      <Text className="text-xs text-slate-600 leading-relaxed text-justify">
                        {activeReport.description}
                      </Text>
                    </View>
                  )}
                </View>

                {/* ADVANCED OCR STRUCTURED EXTRACTION DISPLAY */}
                {activeReport.structured_json && (
                  <View className="mt-4 pt-4 border-t border-slate-100 mb-4">
                    <View className="flex-row items-center mb-3">
                      <Text className="text-xs font-bold text-teal-700 tracking-wide">
                        ✨ Clinical AI Extraction
                      </Text>
                    </View>

                    {/* Extracted general metadata if available */}
                    {(activeReport.structured_json.patient_name || activeReport.structured_json.date) && (
                      <View className="bg-teal-50/30 p-2.5 rounded-lg border border-teal-100/50 mb-3 flex-row justify-between flex-wrap">
                        {activeReport.structured_json.patient_name && (
                          <Text className="text-[10px] text-slate-500">
                            <Text className="font-bold text-slate-700">Patient: </Text>
                            {activeReport.structured_json.patient_name}
                          </Text>
                        )}
                        {activeReport.structured_json.date && (
                          <Text className="text-[10px] text-slate-500">
                            <Text className="font-bold text-slate-700">Extracted Date: </Text>
                            {activeReport.structured_json.date}
                          </Text>
                        )}
                      </View>
                    )}

                    {/* Blood Report Metrics Grid / Table */}
                    {activeReport.structured_json.structured_data?.metrics && 
                     activeReport.structured_json.structured_data.metrics.length > 0 && (
                      <View className="mb-4">
                        <Text className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                          Extracted Lab Biomarkers
                        </Text>
                        <View className="border border-slate-100 rounded-xl overflow-hidden bg-white">
                          <View className="flex-row bg-slate-50 p-2 border-b border-slate-100">
                            <Text className="flex-[2] text-[9px] font-bold text-slate-500">Biomarker</Text>
                            <Text className="flex-1 text-[9px] font-bold text-slate-500 text-center">Value</Text>
                            <Text className="flex-1 text-[9px] font-bold text-slate-500 text-center">Reference</Text>
                            <Text className="flex-1 text-[9px] font-bold text-slate-500 text-right">Status</Text>
                          </View>
                          {activeReport.structured_json.structured_data.metrics.map((metric: any, idx: number) => {
                            const isHigh = metric.status === "high";
                            const isLow = metric.status === "low";
                            const statusColor = isHigh 
                              ? "text-rose-600 bg-rose-50 border-rose-100" 
                              : isLow 
                                ? "text-amber-600 bg-amber-50 border-amber-100" 
                                : "text-emerald-600 bg-emerald-50 border-emerald-100";
                            
                            return (
                              <View key={idx} className="flex-row items-center p-2.5 border-b border-slate-50">
                                <Text className="flex-[2] text-xs font-semibold text-slate-800" numberOfLines={1}>
                                  {metric.name}
                                </Text>
                                <Text className="flex-1 text-xs text-slate-600 font-bold text-center">
                                  {metric.value} <Text className="text-[9px] text-slate-400 font-normal">{metric.unit}</Text>
                                </Text>
                                <Text className="flex-1 text-[10px] text-slate-500 text-center" numberOfLines={1}>
                                  {metric.reference_range || "—"}
                                </Text>
                                <View className="flex-1 items-end">
                                  <View className={`px-2 py-0.5 rounded border ${statusColor}`}>
                                    <Text className="text-[8px] font-bold uppercase tracking-wider">
                                      {metric.status || "normal"}
                                    </Text>
                                  </View>
                                </View>
                              </View>
                            );
                          })}
                        </View>
                      </View>
                    )}

                    {/* Prescribed Medications */}
                    {activeReport.structured_json.structured_data?.medications && 
                     activeReport.structured_json.structured_data.medications.length > 0 && (
                      <View className="mb-4">
                        <Text className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                          Parsed Medications (Prescription Rx)
                        </Text>
                        <View className="space-y-2">
                          {activeReport.structured_json.structured_data.medications.map((med: any, idx: number) => (
                            <View key={idx} className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                              <View className="flex-row justify-between items-center mb-1">
                                <Text className="text-xs font-extrabold text-slate-800">{med.name}</Text>
                                {med.dosage && (
                                  <View className="bg-teal-100 px-2 py-0.5 rounded">
                                    <Text className="text-[9px] font-bold text-teal-800">{med.dosage}</Text>
                                  </View>
                                )}
                              </View>
                              <View className="space-y-1">
                                {med.frequency && (
                                  <Text className="text-[10px] text-slate-500">
                                    <Text className="font-bold text-slate-700">Frequency: </Text>{med.frequency}
                                  </Text>
                                )}
                                {med.duration && (
                                  <Text className="text-[10px] text-slate-500">
                                    <Text className="font-bold text-slate-700">Duration: </Text>{med.duration}
                                  </Text>
                                )}
                                {med.instructions && (
                                  <Text className="text-[10px] text-slate-600 leading-relaxed italic bg-white p-1.5 rounded border border-slate-100 mt-1">
                                    "{med.instructions}"
                                  </Text>
                                )}
                              </View>
                            </View>
                          ))}
                        </View>
                      </View>
                    )}

                    {/* Patient-Friendly Summary Panel (Sarvam AI) */}
                    {activeReport.extracted_text && (
                      <View className="mb-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
                        <View className="flex-row items-center justify-between mb-2">
                          <View className="flex-row items-center space-x-2">
                            <Sparkles size={16} color="#0d9488" />
                            <Text className="text-xs font-bold text-slate-800">
                              Patient-Friendly AI Assistant
                            </Text>
                          </View>
                          <StatusBadge label="Powered by Sarvam AI" type="neutral" />
                        </View>

                        {reportSummaries[activeReport.id] ? (
                          <View className="space-y-3">
                            <View className="bg-white p-3 rounded-lg border border-slate-100">
                              <Text className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                                Layman Summary
                              </Text>
                              <Text className="text-[12px] text-slate-700 leading-relaxed font-medium">
                                {reportSummaries[activeReport.id].summary}
                              </Text>
                            </View>

                            {reportSummaries[activeReport.id].key_findings && reportSummaries[activeReport.id].key_findings.length > 0 && (
                              <View className="bg-white p-3 rounded-lg border border-slate-100">
                                <Text className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                                  Simplified Key Findings
                                </Text>
                                {reportSummaries[activeReport.id].key_findings.map((finding: string, idx: number) => (
                                  <View key={idx} className="flex-row items-start space-x-1.5 mb-1.5 last:mb-0">
                                    <Text className="text-[12px] text-teal-600 font-bold">•</Text>
                                    <Text className="text-[11px] text-slate-600 flex-1 leading-normal">{finding}</Text>
                                  </View>
                                ))}
                              </View>
                            )}

                            {reportSummaries[activeReport.id].recommendations && reportSummaries[activeReport.id].recommendations.length > 0 && (
                              <View className="bg-teal-50/20 p-3 rounded-lg border border-teal-100">
                                <Text className="text-[10px] font-bold text-teal-800 uppercase tracking-wider mb-2">
                                  Follow-up Recommendations
                                </Text>
                                {reportSummaries[activeReport.id].recommendations.map((rec: string, idx: number) => (
                                  <View key={idx} className="flex-row items-start space-x-1.5 mb-1.5 last:mb-0">
                                    <Text className="text-[12px] text-teal-600 font-bold">✓</Text>
                                    <Text className="text-[11px] text-slate-700 flex-1 leading-normal font-medium">{rec}</Text>
                                  </View>
                                ))}
                              </View>
                            )}

                            {/* Medical Disclaimer */}
                            <Text className="text-[9px] text-slate-500 leading-normal text-justify italic bg-slate-100 p-2.5 rounded-lg mt-1 border border-slate-200">
                              {reportSummaries[activeReport.id].disclaimer}
                            </Text>
                          </View>
                        ) : (
                          <View className="py-1">
                            {summarizeReportMutation.isPending && activeReportId === activeReport.id ? (
                              <View className="items-center py-4 space-y-2">
                                <ActivityIndicator size="small" color="#0d9488" />
                                <Text className="text-xs text-slate-500 font-medium italic">
                                  Translating medical jargon via Sarvam AI...
                                </Text>
                              </View>
                            ) : (
                              <TouchableOpacity
                                onPress={() => handleSummarizeReport(activeReport.id)}
                                className="bg-teal-600 rounded-xl py-3 px-4 flex-row justify-center items-center space-x-2 active:bg-teal-700"
                              >
                                <Sparkles size={14} color="#ffffff" />
                                <Text className="text-xs font-bold text-white">
                                  Generate Patient-Friendly Explanation
                                </Text>
                              </TouchableOpacity>
                            )}
                          </View>
                        )}
                      </View>
                    )}

                    {/* Verbatim Transcription Accordion */}
                    {activeReport.extracted_text && (
                      <View className="mb-1">
                        <Text className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                          Raw Extracted OCR Text
                        </Text>
                        <View className="bg-slate-50 p-2.5 rounded-lg border border-slate-150 max-h-[120px] overflow-y-scroll">
                          <Text className="text-[10px] text-slate-500 font-mono leading-relaxed">
                            {activeReport.extracted_text}
                          </Text>
                        </View>
                      </View>
                    )}
                  </View>
                )}

                {/* VIEW FILE PRIMARY ACTION */}
                <Button 
                  onPress={() => openFileInBrowser(activeReport.file_url)} 
                  title="View Attached File"
                  variant="primary"
                  icon={<ExternalLink size={14} color="#ffffff" />}
                />
              </Card>
            </View>
          )}
        </View>
      )}

      {/* REGULATORY CLINICAL DISCLAIMER */}
      <View className="p-4 bg-slate-100 border border-slate-200 rounded-2xl mt-6 mb-4">
        <Text className="text-[10px] text-slate-500 leading-normal text-justify">
          <Text className="font-bold">Interpretation Disclaimer: </Text>
          {CLINICAL_DISCLAIMER}
        </Text>
      </View>
    </ScreenContainer>
  );
}
