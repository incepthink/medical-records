import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuth, Persona } from "@/context/AuthContext";
import Navbar from "@/components/Navbar";

interface Props {
  allowedPersona: Persona;
}

const ProtectedLayout: React.FC<Props> = (_props) => {
  const { persona, isInitializing } = useAuth();

  if (isInitializing) return null;
  if (!persona) return <Navigate to="/" replace />;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <Outlet />
      </main>
    </div>
  );
};

export default ProtectedLayout;
