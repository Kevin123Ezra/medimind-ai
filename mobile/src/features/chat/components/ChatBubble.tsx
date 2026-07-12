import React from "react";
import { View, Text } from "react-native";

interface ChatBubbleProps {
  message: string;
  sender: "user" | "assistant";
}

export function ChatBubble({ message, sender }: ChatBubbleProps) {
  const isUser = sender === "user";
  return (
    <View className={`p-3.5 my-1.5 max-w-[80%] rounded-2xl ${
      isUser 
        ? "bg-teal-600 self-end rounded-br-none" 
        : "bg-white border border-slate-200 self-start rounded-bl-none"
    }`}>
      <Text className={`text-sm ${isUser ? "text-white" : "text-slate-800"}`}>
        {message}
      </Text>
    </View>
  );
}
