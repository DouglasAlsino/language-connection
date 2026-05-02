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
import RequireAuth from "./components/RequireAuth";
import LearningPage from "./pages/LearningPage/LearningPage";

// PerfilUsuario removido — tudo está unificado no Profile.jsx

function App() {
  return (
    <Router>
      <Content />
    </Router>
  );
}

function Content() {
  const location = useLocation();

  const rotasPublicas = ["/login", "/register"];
  const showNavbar = !rotasPublicas.includes(location.pathname.toLowerCase());

  return (
    <div>
      {showNavbar && <Navbar />}
      <Routes>
        {/* Rotas públicas */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Rotas protegidas */}
        <Route path="/users" element={<RequireAuth><Users /></RequireAuth>} />
        <Route path="/chat" element={<RequireAuth><Chat /></RequireAuth>} />
        <Route path="/community" element={<RequireAuth><Community /></RequireAuth>} />
        <Route path="/aprender" element={<RequireAuth><LearningPage /></RequireAuth>} />

        {/* Perfil próprio — sem id na URL */}
        <Route path="/profile" element={<RequireAuth><Profile /></RequireAuth>} />

        {/* Perfil de qualquer usuário pelo id — unificado no mesmo componente */}
        {/* /profile/:id e /usuarios/:id apontam para o mesmo Profile.jsx  */}
        {/* O Profile.jsx usa useParams() para pegar o id e decide o que mostrar */}
        <Route path="/profile/:id" element={<RequireAuth><Profile /></RequireAuth>} />
        <Route path="/usuarios/:id" element={<RequireAuth><Profile /></RequireAuth>} />

        {/* Rota desconhecida */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </div>
  );
}

export default App;