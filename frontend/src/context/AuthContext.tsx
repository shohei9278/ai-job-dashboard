import { createContext, useContext, useEffect, useState } from "react";
import { getProfile as getAuthProfile, logoutApi } from "../api/auth";
import { getProfile } from "../api/profile";

type User = {
  id?: string;
  sub?: string; 
  name?: string;
  email: string;
  avatar_url?: string | null;
};

type AuthContextType = {
  user: User | null;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
  loading: boolean;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  setUser: () => {},
  loading: true,
  logout: async () => {},
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

useEffect(() => {
  const init = async () => {
    try {
      const authData = await getAuthProfile();
      if (authData?.email) setUser(authData);

      const profileData = await getProfile();
      if (profileData?.user || profileData?.name) {
        setUser((prev) => ({
          ...prev,
          ...(profileData.user || profileData),
        }));
      }
    } catch (err: any) {
      // ✅ 401の場合は“未ログイン扱い”だけにして user は保持しない
      if (err?.response?.status === 401) {
        console.warn("AuthContext: not logged in yet");
      } else {
        console.error("AuthContext init error:", err);
      }
    } finally {
      setLoading(false);
    }
  };
  init();
}, []);


  const logout = async () => {
    await logoutApi();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, setUser, loading, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
