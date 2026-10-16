import type { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAppSelector } from "../store/hooks";

type Props = { children: ReactNode };

export function ProtectedRoute({ children }: Props) {
  const isAuthenticated = useAppSelector((s) => s.auth.isAuthenticated);
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
    // state.from keeps where user tried to go
  }

  return <>{children}</>;
}
