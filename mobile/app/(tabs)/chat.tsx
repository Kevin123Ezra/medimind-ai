import React, { useState, useRef, useEffect } from "react";
import { View, Text, TextInput, ScrollView, TouchableOpacity, KeyboardAvoidingView, Platform, ActivityIndicator } from "react-native";
import { ScreenContainer } from "../../src/components/ScreenContainer";
import { ChatBubble } from "../../src/features/chat/components/ChatBubble";
import { Button } from "../../src/components/Button";
import { CLINICAL_DISCLAIMER } from "../../src/constants";
import { MessageSquare, Send, Heart, RefreshCw, AlertTriangle } from "lucide-react-native";
import { useChatWithAssistant } from "../../src/hooks/useQueries";

export default function ChatScreen() {
  const [inputText, setInputText] = useState("");
  const scrollViewRef = useRef<ScrollView>(null);
  
  const [messages, setMessages] = useState([
    {
      id: "1",
      sender: "assistant" as const,
      message: "Hello Alexander. I am your MediMind Clinical AI Companion. How can I help you translate medical terminology, log cardiovascular vitals, or review medication schedules today?",
    },
    {
      id: "2",
      sender: "user" as const,
      message: "Can you explain what 'Lisinopril' is usually prescribed for, and are there any food restrictions?",
    },
    {
      id: "3",
      sender: "assistant" as const,
      message: "Lisinopril is an ACE inhibitor commonly prescribed for high blood pressure (hypertension) and heart failure. Regarding foods: it can increase potassium levels in your blood, so it is generally recommended to avoid high-potassium foods or salt substitutes containing potassium without consulting your doctor first. It can be taken with or without food.",
    },
  ]);

  const chatMutation = useChatWithAssistant();

  // Scroll to bottom whenever messages list expands
  useEffect(() => {
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
  }, [messages, chatMutation.isPending]);

  const handleSend = async () => {
    const userMessageText = inputText.trim();
    if (!userMessageText || chatMutation.isPending) return;
    
    setInputText("");
    
    // Add user message to state
    const updatedMessages = [
      ...messages,
      {
        id: Date.now().toString(),
        sender: "user" as const,
        message: userMessageText,
      }
    ];
    setMessages(updatedMessages);

    try {
      // Map existing messages to ChatMessageInput format
      const history = messages.map(m => ({
        sender: m.sender,
        message: m.message
      }));

      const response = await chatMutation.mutateAsync({
        message: userMessageText,
        history: history
      });

      setMessages(prev => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          sender: "assistant" as const,
          message: response.message
        }
      ]);
    } catch (err: any) {
      setMessages(prev => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          sender: "assistant" as const,
          message: "⚠️ Connection Error: I couldn't reach the health assistant service right now. Please verify your internet connection and try again.\n\n" + CLINICAL_DISCLAIMER
        }
      ]);
    }
  };

  const suggestionPills = [
    "What is diastolic BP?",
    "Lisinopril side effects",
    "How to log my heart rate?",
  ];

  return (
    <KeyboardAvoidingView 
      className="flex-1 bg-slate-50"
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
    >
      <ScreenContainer className="p-0">
        {/* Safe AI Advisory Panel */}
        <View className="bg-amber-50 border-b border-amber-100 p-3.5 flex-row items-center">
          <AlertTriangle size={16} color="#d97706" />
          <Text className="text-[10px] text-amber-800 ml-2 font-medium flex-1">
            Consult a medical doctor for active physical diagnostic reviews. AI evaluations are educational.
          </Text>
        </View>

        {/* Conversation Stream */}
        <ScrollView 
          ref={scrollViewRef}
          className="flex-1 px-4 py-3"
          contentContainerStyle={{ flexGrow: 1, paddingBottom: 20 }}
          showsVerticalScrollIndicator={false}
        >
          {messages.map((item) => (
            <ChatBubble key={item.id} message={item.message} sender={item.sender} />
          ))}
          
          {chatMutation.isPending && (
            <View className="flex-row items-center space-x-2 bg-slate-100 p-3.5 rounded-2xl self-start max-w-[80%] mb-4 border border-slate-200/50">
              <ActivityIndicator size="small" color="#0d9488" />
              <Text className="text-xs text-slate-500 font-medium italic">
                MediMind is formulating response...
              </Text>
            </View>
          )}
        </ScrollView>

        {/* Quick Suggestion Pills */}
        <View className="px-4 pb-2">
          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row py-1">
            {suggestionPills.map((pill, idx) => (
              <TouchableOpacity
                key={idx}
                onPress={() => setInputText(pill)}
                className="bg-white border border-slate-200 px-3 py-1.5 rounded-full mr-2 shadow-sm active:bg-slate-50"
              >
                <Text className="text-xs font-semibold text-slate-700">{pill}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Input Dock Panel */}
        <View className="bg-white border-t border-slate-100 p-3.5 flex-row items-center">
          <TextInput
            placeholder="Ask anything about health, meds, or logs..."
            placeholderTextColor="#94a3b8"
            value={inputText}
            onChangeText={setInputText}
            className="flex-1 bg-slate-50 border border-slate-200 rounded-xl h-11 px-4 text-sm text-slate-800 mr-2.5"
            onSubmitEditing={handleSend}
            disabled={chatMutation.isPending}
          />
          <TouchableOpacity
            onPress={handleSend}
            disabled={!inputText.trim() || chatMutation.isPending}
            className={`w-11 h-11 rounded-xl items-center justify-center ${
              inputText.trim() && !chatMutation.isPending ? "bg-teal-600" : "bg-slate-100"
            }`}
          >
            <Send size={18} color={inputText.trim() && !chatMutation.isPending ? "#ffffff" : "#94a3b8"} />
          </TouchableOpacity>
        </View>
      </ScreenContainer>
    </KeyboardAvoidingView>
  );
}
