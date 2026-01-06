import { Navigate } from "react-router-dom";
import { useStore } from "./store";

export function RequireAuth({ children }: { children: JSX.Element }) {
  const session = useStore((s) => s.session);
  if (!session) return <Navigate to="/login" replace />;
  return children;
}
