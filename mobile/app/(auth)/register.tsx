import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { HeartPulse, Mail, Lock, Eye, EyeOff, AlertCircle } from "lucide-react-native";
import { useAuth } from "../../src/features/auth/context/AuthContext";
import { zodResolver } from "../../src/lib/zodResolver";
import { Button } from "../../src/components/Button";
import { ScreenContainer } from "../../src/components/ScreenContainer";

const registerSchema = z.object({
  email: z.string().min(1, "Email is required").email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string().min(1, "Please confirm your password"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

type RegisterFormValues = z.infer<typeof registerSchema>;

export default function RegisterScreen() {
  const router = useRouter();
  const { register } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { control, handleSubmit, formState: { errors } } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (data: RegisterFormValues) => {
    setAuthError(null);
    setIsSubmitting(true);
    try {
      await register(data.email, data.password);
      // RootLayoutNav redirects automatically when user changes
    } catch (error: any) {
      console.error(error);
      let errorMessage = "An error occurred during sign up. Please try again.";
      if (error.code === "auth/email-already-in-use") {
        errorMessage = "This email is already registered. Try signing in instead.";
      } else if (error.code === "auth/invalid-email") {
        errorMessage = "The email address is badly formatted.";
      } else if (error.code === "auth/weak-password") {
        errorMessage = "The password is too weak. Please use a stronger password.";
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
            {/* Header / Logo section */}
            <View className="items-center mb-6">
              <View className="w-16 h-16 rounded-3xl bg-teal-50 flex items-center justify-center border border-teal-100 shadow-md">
                <HeartPulse size={36} color="#0d9488" />
              </View>
              <Text className="text-2xl font-bold text-slate-900 mt-4 tracking-tight">
                Create Clinical Account
              </Text>
              <Text className="text-slate-500 text-xs mt-1 text-center font-medium">
                Register to start tracking clinical progress
              </Text>
            </View>

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

              <View className="mt-4">
                <Text className="text-xs font-bold text-slate-700 mb-1.5 ml-1">
                  Password
                </Text>
                <View className="relative">
                  <View className="absolute left-3 top-3.5 z-10">
                    <Lock size={16} color="#94a3b8" />
                  </View>
                  <Controller
                    control={control}
                    name="password"
                    render={({ field: { onChange, onBlur, value } }) => (
                      <TextInput
                        className={`bg-white border ${errors.password ? "border-rose-300 focus:border-rose-500" : "border-slate-200 focus:border-teal-500"} rounded-xl pl-10 pr-10 py-3 text-slate-800 text-sm`}
                        placeholder="••••••••"
                        placeholderTextColor="#94a3b8"
                        secureTextEntry={!showPassword}
                        autoCapitalize="none"
                        autoCorrect={false}
                        onBlur={onBlur}
                        onChangeText={onChange}
                        value={value}
                      />
                    )}
                  />
                  <TouchableOpacity
                    className="absolute right-3 top-3.5"
                    onPress={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff size={16} color="#94a3b8" />
                    ) : (
                      <Eye size={16} color="#94a3b8" />
                    )}
                  </TouchableOpacity>
                </View>
                {errors.password && (
                  <Text className="text-rose-600 text-[10px] font-semibold mt-1 ml-1">
                    {errors.password.message}
                  </Text>
                )}
              </View>

              <View className="mt-4">
                <Text className="text-xs font-bold text-slate-700 mb-1.5 ml-1">
                  Confirm Password
                </Text>
                <View className="relative">
                  <View className="absolute left-3 top-3.5 z-10">
                    <Lock size={16} color="#94a3b8" />
                  </View>
                  <Controller
                    control={control}
                    name="confirmPassword"
                    render={({ field: { onChange, onBlur, value } }) => (
                      <TextInput
                        className={`bg-white border ${errors.confirmPassword ? "border-rose-300 focus:border-rose-500" : "border-slate-200 focus:border-teal-500"} rounded-xl pl-10 pr-10 py-3 text-slate-800 text-sm`}
                        placeholder="••••••••"
                        placeholderTextColor="#94a3b8"
                        secureTextEntry={!showConfirmPassword}
                        autoCapitalize="none"
                        autoCorrect={false}
                        onBlur={onBlur}
                        onChangeText={onChange}
                        value={value}
                      />
                    )}
                  />
                  <TouchableOpacity
                    className="absolute right-3 top-3.5"
                    onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? (
                      <EyeOff size={16} color="#94a3b8" />
                    ) : (
                      <Eye size={16} color="#94a3b8" />
                    )}
                  </TouchableOpacity>
                </View>
                {errors.confirmPassword && (
                  <Text className="text-rose-600 text-[10px] font-semibold mt-1 ml-1">
                    {errors.confirmPassword.message}
                  </Text>
                )}
              </View>
            </View>

            {/* Submit Button */}
            <Button
              title="Register Clinical Account"
              onPress={handleSubmit(onSubmit)}
              loading={isSubmitting}
              className="mt-8"
            />

            {/* Login Link */}
            <View className="flex-row justify-center mt-6">
              <Text className="text-xs text-slate-500">Already have an account? </Text>
              <TouchableOpacity onPress={() => router.push("/(auth)/login")}>
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
