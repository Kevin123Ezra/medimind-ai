import React, { createContext, useContext, useEffect, useState } from "react";
import { 
  User,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail
} from "firebase/auth";
import { auth } from "../../../services/firebase";
import { api, tokenStorage } from "../../../services/api";

interface BackendUser {
  id: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
  phone_number: string | null;
  role: string;
  is_active: boolean;
  is_verified: boolean;
}

interface AuthContextType {
  user: User | null;
  backendUser: BackendUser | null;
  loading: boolean;
  initializing: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [backendUser, setBackendUser] = useState<BackendUser | null>(null);
  const [loading, setLoading] = useState(false);
  const [initializing, setInitializing] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);
        
        let success = false;
        // 1. Try reusing existing backend-issued JWT token if present
        if (tokenStorage.getAccessToken()) {
          try {
            const userResponse = await api.post("/auth/test-token");
            setBackendUser(userResponse.data);
            success = true;
          } catch (e) {
            console.log("Stale or invalid local JWT. Proceeding to refresh from Firebase session...");
          }
        }
        
        // 2. Sync Firebase Auth session with FastAPI JWT backend session
        if (!success) {
          try {
            setLoading(true);
            const idToken = await firebaseUser.getIdToken(true);
            
            // Exchange Firebase ID Token for Backend Access and Refresh JWTs
            const response = await api.post("/auth/firebase-login", {
              id_token: idToken
            });
            
            const { access_token, refresh_token } = response.data;
            tokenStorage.setTokens(access_token, refresh_token);
            
            // Fetch backend user metadata (role-based parameters)
            const userResponse = await api.post("/auth/test-token");
            setBackendUser(userResponse.data);
          } catch (error) {
            console.error("FastAPI Backend synchronization failed:", error);
            tokenStorage.clearTokens();
            setBackendUser(null);
            // Sign out of Firebase if we cannot sync backends successfully
            await signOut(auth);
          } finally {
            setLoading(false);
          }
        }
      } else {
        setUser(null);
        setBackendUser(null);
        tokenStorage.clearTokens();
      }
      setInitializing(false);
    });

    return unsubscribe;
  }, []);

  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } finally {
      setLoading(false);
    }
  };

  const register = async (email: string, password: string) => {
    setLoading(true);
    try {
      await createUserWithEmailAndPassword(auth, email, password);
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (email: string) => {
    setLoading(true);
    try {
      await sendPasswordResetEmail(auth, email);
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      // Best-effort logout notification to the backend to revoke stateless JWT access
      const token = tokenStorage.getAccessToken();
      const refreshToken = tokenStorage.getRefreshToken();
      if (token || refreshToken) {
        try {
          await api.post(
            "/auth/logout",
            {},
            {
              headers: {
                Authorization: `Bearer ${token}`,
                "refresh-token": refreshToken || undefined,
              },
            }
          );
        } catch (e) {
          console.warn("Backend logout notification failed (non-blocking):", e);
        }
      }
      await signOut(auth);
    } finally {
      tokenStorage.clearTokens();
      setBackendUser(null);
      setUser(null);
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ user, backendUser, loading, initializing, login, register, resetPassword, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
