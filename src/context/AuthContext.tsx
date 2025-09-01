import React, { createContext, useContext, useEffect, useState, type ReactNode, type SetStateAction } from "react";
import { useGetUserInformation } from "../_lib/@react-client-query/auth";
import type { User } from "../types/user";

type AuthContextData = {
  user: User | null;
  setUser: React.Dispatch<SetStateAction<User | null>>;
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
  const { data, isSuccess, isLoading } = useGetUserInformation({
    enabled: user === null,
  });

  useEffect(() => {
    if (isSuccess && data) {
      setUser(data);
    }
  }, [isLoading]);

  if (user === null && isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <span>Loading...</span>
      </div>
    );
  }

  return <AuthContext.Provider value={{ user, setUser, isLoadingUser: isLoading }}>{children}</AuthContext.Provider>;
};

export default AuthContextProvider;
