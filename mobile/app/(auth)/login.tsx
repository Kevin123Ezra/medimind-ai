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

const loginSchema = z.object({
  email: z.string().min(1, "Email is required").email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginScreen() {
  const router = useRouter();
  const { login } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { control, handleSubmit, formState: { errors } } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: LoginFormValues) => {
    setAuthError(null);
    setIsSubmitting(true);
    try {
      await login(data.email, data.password);
      // RootLayoutNav redirects automatically when user changes
    } catch (error: any) {
      console.error(error);
      // Human-friendly Firebase Auth error translations
      let errorMessage = "An error occurred during sign in. Please try again.";
      if (error.code === "auth/invalid-credential" || error.code === "auth/user-not-found" || error.code === "auth/wrong-password") {
        errorMessage = "Invalid email or password. Please check your credentials.";
      } else if (error.code === "auth/too-many-requests") {
        errorMessage = "Too many login attempts. This account has been temporarily locked.";
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
            <View className="items-center mb-8">
              <View className="w-16 h-16 rounded-3xl bg-teal-50 flex items-center justify-center border border-teal-100 shadow-md">
                <HeartPulse size={36} color="#0d9488" />
              </View>
              <Text className="text-2xl font-bold text-slate-900 mt-4 tracking-tight">
                Welcome to MediMind
              </Text>
              <Text className="text-slate-500 text-xs mt-1 text-center font-medium">
                Access your personalized medical companion portal
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
            </View>

            {/* Forgot Password Link */}
            <View className="items-end mt-2.5">
              <TouchableOpacity onPress={() => router.push("/(auth)/forgot-password")}>
                <Text className="text-xs font-semibold text-teal-600 hover:text-teal-700">
                  Forgot Password?
                </Text>
              </TouchableOpacity>
            </View>

            {/* Submit Button */}
            <Button
              title="Sign In to Portal"
              onPress={handleSubmit(onSubmit)}
              loading={isSubmitting}
              className="mt-6"
            />

            {/* Register Link */}
            <View className="flex-row justify-center mt-6">
              <Text className="text-xs text-slate-500">Don't have an account? </Text>
              <TouchableOpacity onPress={() => router.push("/(auth)/register")}>
                <Text className="text-xs font-bold text-teal-600 hover:text-teal-700">
                  Create Account
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </ScreenContainer>
  );
}
