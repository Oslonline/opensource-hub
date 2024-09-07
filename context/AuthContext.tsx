"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";

interface AuthContextProps {
  user: any;
  loginWithGitHub: () => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<any>(null);
  const supabase = createClient();
  const router = useRouter();

  useEffect(() => {
    const checkUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setUser(user);
    };

    checkUser();
  }, [supabase]);

  const loginWithGitHub = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "github",
    });
    if (error) {
      console.error("Login error:", error.message);
    }
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    router.push("/");
  };

  return <AuthContext.Provider value={{ user, loginWithGitHub, logout }}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
