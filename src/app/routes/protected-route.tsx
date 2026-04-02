import type { ReactNode } from "react";

import { LoginPage } from "../../modules/auth/login-page";
import { useIsAuthenticated } from "../../utils/auth";

type ProtectedRouteProps = {
  children: ReactNode;
};

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const authenticated = useIsAuthenticated();

  if (!authenticated) {
    return <LoginPage />;
  }

  return <>{children}</>;
}
