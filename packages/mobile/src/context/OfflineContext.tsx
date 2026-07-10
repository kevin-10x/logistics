import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

interface OfflineContextType {
  isOnline: boolean;
  pendingActions: number;
  queueAction: (action: PendingAction) => Promise<void>;
  syncPendingActions: () => Promise<void>;
}

interface PendingAction {
  id: string;
  type: string;
  data: any;
  timestamp: string;
  retries: number;
}

const OfflineContext = createContext<OfflineContextType>({
  isOnline: true,
  pendingActions: 0,
  queueAction: async () => {},
  syncPendingActions: async () => {},
});

export function OfflineProvider({ children }: { children: ReactNode }) {
  const [isOnline, setIsOnline] = useState(true);
  const [pendingActions, setPendingActions] = useState<PendingAction[]>([]);

  useEffect(() => {
    loadPendingActions();
  }, []);

  const loadPendingActions = async () => {
    try {
      const stored = await AsyncStorage.getItem("pendingActions");
      if (stored) {
        setPendingActions(JSON.parse(stored));
      }
    } catch {}
  };

  const queueAction = async (action: PendingAction) => {
    const newActions = [...pendingActions, action];
    setPendingActions(newActions);
    await AsyncStorage.setItem("pendingActions", JSON.stringify(newActions));
  };

  const syncPendingActions = async () => {
    const toSync = [...pendingActions];
    const remaining: PendingAction[] = [];
    for (const action of toSync) {
      try {
        console.log(`Syncing action: ${action.type}`);
      } catch {
        remaining.push({ ...action, retries: action.retries + 1 });
      }
    }
    setPendingActions(remaining);
    await AsyncStorage.setItem("pendingActions", JSON.stringify(remaining));
  };

  return (
    <OfflineContext.Provider value={{ isOnline, pendingActions: pendingActions.length, queueAction, syncPendingActions }}>
      {children}
    </OfflineContext.Provider>
  );
}

export const useOffline = () => useContext(OfflineContext);
