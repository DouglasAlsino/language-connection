import React from "react";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  useLocation,
  Navigate,
} from "react-router-dom";

import Navbar from "./components/Navbar/Navbar";
import Login from "./pages/Login/Login";
import Register from "./pages/Register/Register";
import Users from "./pages/Users/Users";
import Chat from "./pages/Chat/Chat";
import Community from "./pages/Community/Community";
import Profile from "./pages/Profile/Profile";
import PerfilUsuario from "./pages/PerfilUsuario/PerfilUsuario";
import RequireAuth from "./components/RequireAuth";

function App() {
  return (
    <Router>
      <Content />
    </Router>
  );
}

function Content() {
  const location = useLocation();

  // Rotas onde a Navbar NÃO deve aparecer
  // toLowerCase() garante que /Register e /register são tratados igual
  const rotasPublicas = ["/login", "/register"];
  const showNavbar = !rotasPublicas.includes(location.pathname.toLowerCase());

  return (
    <div>
      {showNavbar && <Navbar />}
      <Routes>
        {/* Rotas públicas — acessíveis sem estar logado */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Rotas protegidas — exigem autenticação */}
        <Route path="/users" element={<RequireAuth><Users /></RequireAuth>} />
        <Route path="/chat" element={<RequireAuth><Chat /></RequireAuth>} />
        <Route path="/community" element={<RequireAuth><Community /></RequireAuth>} />
        <Route path="/profile" element={<RequireAuth><Profile /></RequireAuth>} />
        <Route path="/profile/:id" element={<RequireAuth><Profile /></RequireAuth>} />
        <Route path="/usuarios/:id" element={<RequireAuth><PerfilUsuario /></RequireAuth>} />

        {/* Qualquer rota desconhecida redireciona para login */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </div>
  );
}

export default App;