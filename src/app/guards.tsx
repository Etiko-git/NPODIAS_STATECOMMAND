import { Navigate } from "react-router-dom";
import { useStore } from "../data/store";
import type { Role } from "./rbac";

export function RequireAuth({ children }: { children: JSX.Element }) {
  const session = useStore((s) => s.session);
  if (!session) return <Navigate to="/login" replace />;
  return children;
}

export function RequireRole({ allow, children }: { allow: Role[]; children: JSX.Element }) {
  const session = useStore((s) => s.session);
  if (!session) return <Navigate to="/login" replace />;
  if (!allow.includes(session.role)) return <Navigate to="/forbidden" replace />;
  return children;
}
