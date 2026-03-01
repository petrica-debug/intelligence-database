"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { User, Database, SensitivityLevel, ClearanceLevel } from "@/types";
import { SENSITIVITY_MIN_CLEARANCE } from "@/types";
import { getInitialDb, persistDb } from "@/lib/store";

interface AppContextValue {
  currentUser: User | null;
  db: Database;
  login: (username: string, password: string) => boolean;
  logout: () => void;
  updateDb: (updater: (db: Database) => void) => void;
  isReady: boolean;
  canView: (sensitivity: SensitivityLevel) => boolean;
  userClearance: ClearanceLevel;
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [db, setDb] = useState<Database | null>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    setDb(getInitialDb());
    setIsReady(true);
  }, []);

  useEffect(() => {
    if (db) persistDb(db);
  }, [db]);

  const login = useCallback((username: string, password: string) => {
    if (!db) return false;
    const user = db.users.find(
      (u) =>
        u.username === username && u.password === password && u.active
    );
    if (!user) return false;
    setCurrentUser(user);
    return true;
  }, [db]);

  const logout = useCallback(() => {
    setCurrentUser(null);
  }, []);

  const updateDb = useCallback((updater: (db: Database) => void) => {
    setDb((prev) => {
      if (!prev) return prev;
      const next = { ...prev };
      updater(next);
      return next;
    });
  }, []);

  const userClearance: ClearanceLevel = currentUser?.clearance ?? 1;

  const canView = useCallback((sensitivity: SensitivityLevel) => {
    return userClearance >= SENSITIVITY_MIN_CLEARANCE[sensitivity];
  }, [userClearance]);

  const value = useMemo(
    () => ({
      currentUser,
      db: db ?? { users: [], entries: [], pendingValidations: [], logs: [], signals: [], notifications: [], reports: [], inferredConnections: [], nextId: 1 },
      login,
      logout,
      updateDb,
      isReady,
      canView,
      userClearance,
    }),
    [currentUser, db, login, logout, updateDb, isReady, canView, userClearance]
  );

  if (!isReady) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh", color: "var(--text2)" }}>
        Loading...
      </div>
    );
  }

  return (
    <AppContext.Provider value={value}>{children}</AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}
