import { Navigate } from "react-router-dom";

export default function Protected({ children }: { children: React.ReactNode }) {
  const sessionId = sessionStorage.getItem("sessionId");
  if (!sessionId) {
    return <Navigate to="/" replace />;
  }
  return <>{children}</>;
}
