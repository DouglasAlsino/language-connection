import React from "react";
import { Navigate } from "react-router-dom";

function AdminRoute({ children }) {
  const token = localStorage.getItem("token");
  const usuario = JSON.parse(localStorage.getItem("usuario") || "{}");

  if (!token || usuario.role !== "admin") {
    return <Navigate to="/admin/login" replace />;
  }

  return children;
}

export default AdminRoute;