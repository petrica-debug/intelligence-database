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
import { createClient } from "@/lib/supabase/client";

const supabaseConfigured =
  typeof window !== "undefined" &&
  !!process.env.NEXT_PUBLIC_SUPABASE_URL &&
  !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

interface AppContextValue {
  currentUser: User | null;
  db: Database;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  updateDb: (updater: (db: Database) => void) => void;
  isReady: boolean;
  canView: (sensitivity: SensitivityLevel) => boolean;
  userClearance: ClearanceLevel;
  isSupabaseMode: boolean;
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [db, setDb] = useState<Database | null>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    async function init() {
      const initialDb = getInitialDb();
      setDb(initialDb);

      if (supabaseConfigured) {
        try {
          const supabase = createClient();
          const timeout = new Promise<null>((resolve) => setTimeout(() => resolve(null), 3000));
          const authPromise = supabase.auth.getUser().then(r => r.data?.user ?? null).catch(() => null);
          const user = await Promise.race([authPromise, timeout]);

          if (user) {
            const { data: profile } = await supabase
              .from("profiles")
              .select("*")
              .eq("id", user.id)
              .single();

            if (profile) {
              setCurrentUser({
                username: profile.username,
                password: "",
                role: profile.role,
                access: profile.access,
                clearance: profile.clearance,
                active: profile.active,
                fullName: profile.full_name,
                department: profile.department,
              });
            }
          }
        } catch {
          // Supabase unavailable, fall through to localStorage
        }
      }

      setIsReady(true);
    }
    init();
  }, []);

  useEffect(() => {
    if (db) persistDb(db);
  }, [db]);

  const login = useCallback(async (username: string, password: string) => {
    if (supabaseConfigured) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000);
        const res = await fetch("/api/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: `${username}@rfe-database.app`, password }),
          signal: controller.signal,
        });
        clearTimeout(timeoutId);

        if (res.ok) {
          const body = await res.json();
          if (body.profile) {
            setCurrentUser({
              username: body.profile.username,
              password: "",
              role: body.profile.role,
              access: body.profile.access,
              clearance: body.profile.clearance,
              active: body.profile.active,
              fullName: body.profile.full_name,
              department: body.profile.department,
            });
            return true;
          }
        }
        // Non-ok response or missing profile — fall through to local auth
      } catch {
        // Supabase unavailable or timed out, fall through to localStorage auth
      }
    }

    if (!db) return false;
    const user = db.users.find(
      (u) => u.username === username && u.password === password && u.active
    );
    if (!user) return false;
    setCurrentUser(user);
    return true;
  }, [db]);

  const logout = useCallback(async () => {
    if (supabaseConfigured) {
      try {
        await fetch("/api/auth/logout", { method: "POST" });
      } catch {
        // Ignore
      }
    }
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
      isSupabaseMode: supabaseConfigured,
    }),
    [currentUser, db, login, logout, updateDb, isReady, canView, userClearance]
  );

  if (!isReady) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh", color: "var(--text2)" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ width: 40, height: 40, border: "2px solid #d0d9e6", borderTopColor: "#1e3a5f", borderRadius: "50%", animation: "spin 1s linear infinite", margin: "0 auto 16px" }} />
          <p style={{ fontSize: 14, color: "#3e5068" }}>Loading...</p>
        </div>
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
