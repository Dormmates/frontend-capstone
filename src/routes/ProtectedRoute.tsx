import { type ReactNode } from "react";
import { useAuthContext } from "../context/AuthContext";
import { Navigate } from "react-router-dom";
import type { UserRole } from "../types/user";

interface Props {
  children: ReactNode;
  allowedRoles: UserRole[];
}

const ProtectedRoute = ({ children, allowedRoles }: Props) => {
  const { user } = useAuthContext();

  const isValidUser = user && user.roles.some((r) => allowedRoles.includes(r));

  if (!isValidUser) {
    return <Navigate to="/unauthorized" />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
