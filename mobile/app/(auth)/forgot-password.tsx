import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { HeartPulse, Mail, AlertCircle, CheckCircle, ArrowLeft } from "lucide-react-native";
import { useAuth } from "../../src/features/auth/context/AuthContext";
import { zodResolver } from "../../src/lib/zodResolver";
import { Button } from "../../src/components/Button";
import { ScreenContainer } from "../../src/components/ScreenContainer";

const forgotPasswordSchema = z.object({
  email: z.string().min(1, "Email is required").email("Please enter a valid email address"),
});

type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>;

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const { resetPassword } = useAuth();
  const [authError, setAuthError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { control, handleSubmit, formState: { errors } } = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: "",
    },
  });

  const onSubmit = async (data: ForgotPasswordFormValues) => {
    setAuthError(null);
    setSuccessMessage(null);
    setIsSubmitting(true);
    try {
      await resetPassword(data.email);
      setSuccessMessage("A password reset link has been successfully sent to your email. Please check your inbox and spam folder.");
    } catch (error: any) {
      console.error(error);
      let errorMessage = "An error occurred. Please verify your email and try again.";
      if (error.code === "auth/user-not-found") {
        errorMessage = "We couldn't find an account registered with that email address.";
      } else if (error.code === "auth/invalid-email") {
        errorMessage = "The email address is badly formatted.";
      } else if (error.code === "auth/network-request-failed") {
        errorMessage = "Network connection failed. Please check your internet connection.";
      } else if (error.message) {
        errorMessage = error.message;
      }
      setAuthError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ScreenContainer scrollable={false} className="bg-slate-50">
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <ScrollView
          contentContainerStyle={{ flexGrow: 1, justifyContent: "center" }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View className="px-4 py-8">
            {/* Header back button */}
            <TouchableOpacity 
              onPress={() => router.replace("/(auth)/login")} 
              className="flex-row items-center mb-6 self-start"
            >
              <ArrowLeft size={16} color="#0d9488" className="mr-1.5" />
              <Text className="text-xs font-bold text-teal-600">Back to Sign In</Text>
            </TouchableOpacity>

            {/* Header / Logo section */}
            <View className="items-center mb-6">
              <View className="w-16 h-16 rounded-3xl bg-teal-50 flex items-center justify-center border border-teal-100 shadow-md">
                <HeartPulse size={36} color="#0d9488" />
              </View>
              <Text className="text-2xl font-bold text-slate-900 mt-4 tracking-tight">
                Reset Password
              </Text>
              <Text className="text-slate-500 text-xs mt-1 text-center font-medium leading-relaxed px-4">
                Enter your email address and we will dispatch a secure link to reset your password.
              </Text>
            </View>

            {/* Success Message Banner */}
            {successMessage && (
              <View className="bg-emerald-50 border border-emerald-100 rounded-xl p-3.5 mb-6 flex-row items-start">
                <CheckCircle size={18} color="#059669" className="mr-2 mt-0.5" />
                <Text className="text-emerald-800 text-xs font-semibold flex-1 leading-relaxed">
                  {successMessage}
                </Text>
              </View>
            )}

            {/* Error Message Banner */}
            {authError && (
              <View className="bg-rose-50 border border-rose-100 rounded-xl p-3 mb-6 flex-row items-center">
                <AlertCircle size={18} color="#e11d48" className="mr-2" />
                <Text className="text-rose-800 text-xs font-semibold flex-1">
                  {authError}
                </Text>
              </View>
            )}

            {/* Input Form Fields */}
            {!successMessage && (
              <View className="space-y-4">
                <View>
                  <Text className="text-xs font-bold text-slate-700 mb-1.5 ml-1">
                    Email Address
                  </Text>
                  <View className="relative">
                    <View className="absolute left-3 top-3.5 z-10">
                      <Mail size={16} color="#94a3b8" />
                    </View>
                    <Controller
                      control={control}
                      name="email"
                      render={({ field: { onChange, onBlur, value } }) => (
                        <TextInput
                          className={`bg-white border ${errors.email ? "border-rose-300 focus:border-rose-500" : "border-slate-200 focus:border-teal-500"} rounded-xl pl-10 pr-4 py-3 text-slate-800 text-sm`}
                          placeholder="doctor.jane@example.com"
                          placeholderTextColor="#94a3b8"
                          keyboardType="email-address"
                          autoCapitalize="none"
                          autoCorrect={false}
                          onBlur={onBlur}
                          onChangeText={onChange}
                          value={value}
                        />
                      )}
                    />
                  </View>
                  {errors.email && (
                    <Text className="text-rose-600 text-[10px] font-semibold mt-1 ml-1">
                      {errors.email.message}
                    </Text>
                  )}
                </View>

                {/* Submit Button */}
                <Button
                  title="Send Password Reset Link"
                  onPress={handleSubmit(onSubmit)}
                  loading={isSubmitting}
                  className="mt-6"
                />
              </View>
            )}

            {/* Register Link */}
            <View className="flex-row justify-center mt-8">
              <Text className="text-xs text-slate-500">Already know your password? </Text>
              <TouchableOpacity onPress={() => router.replace("/(auth)/login")}>
                <Text className="text-xs font-bold text-teal-600 hover:text-teal-700">
                  Sign In
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </ScreenContainer>
  );
}
