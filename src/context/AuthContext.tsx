import React, { createContext, useContext, useEffect, useState, type ReactNode, type SetStateAction } from "react";
import { useGetUserInformation } from "../_lib/@react-client-query/auth";
import type { User } from "../types/user";

type AuthContextData = {
  user: User | null;
  setUser: React.Dispatch<SetStateAction<User | null>>;
  setToken: React.Dispatch<React.SetStateAction<string>>;
  token: string;
  isLoadingUser: boolean;
};

const AuthContext = createContext<AuthContextData | undefined>(undefined);

export const useAuthContext = (): AuthContextData => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuthContext must be used within an AuthContextProvider");
  }
  return context;
};

interface Props {
  children: ReactNode;
}

const AuthContextProvider = ({ children }: Props) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string>(() => localStorage.getItem("authToken") || "");

  const { data, isSuccess, isLoading } = useGetUserInformation({
    enabled: user === null && !!token,
  });

  useEffect(() => {
    if (token) {
      localStorage.setItem("authToken", token);
    } else {
      localStorage.removeItem("authToken");
    }
  }, [token]);

  useEffect(() => {
    if (isSuccess && data) {
      setUser(data);
    }
  }, [isSuccess, data]);

  return (
    <AuthContext.Provider
      value={{
        token,
        setToken,
        user,
        setUser,
        isLoadingUser: isLoading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContextProvider;
