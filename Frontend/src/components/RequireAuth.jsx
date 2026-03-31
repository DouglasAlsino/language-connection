// src/components/RequireAuth.jsx
import React from "react";
import { Navigate, useLocation } from "react-router-dom";

function RequireAuth({ children }) {
  const location = useLocation();

  // pega o token salvo no login
  const token = localStorage.getItem("token");

  // se não tiver token, manda para o login
  if (!token) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // se tiver token, renderiza a página normalmente
  return children;
}

export default RequireAuth;