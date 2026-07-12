import { useState } from "react";

// A simple local client-side state store pattern for React hook-based state sharing
export function useSharedStore() {
  const [activeNotificationToken, setActiveNotificationToken] = useState<string | null>(null);
  const [offlineSyncQueue, setOfflineSyncQueue] = useState<any[]>([]);

  return {
    activeNotificationToken,
    setActiveNotificationToken,
    offlineSyncQueue,
    setOfflineSyncQueue
  };
}
