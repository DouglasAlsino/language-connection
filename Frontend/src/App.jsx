// Importa o React (necessário para usar JSX)
// Importa os componentes de roteamento do React Router DOM
// BrowserRouter: envolve toda a aplicação e habilita o sistema de rotas
// Route: define uma rota específica (qual componente renderizar em qual URL)
// Routes: agrupa todas as rotas da aplicação
// useLocation: hook que retorna a URL atual (usamos para saber em qual página estamos)
// Navigate: componente que redireciona o usuário para outra rota
import React from "react";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  useLocation,
  Navigate,
} from "react-router-dom";

// Importa a Navbar global
import Navbar from "./components/Navbar/Navbar";

// Importa todas as páginas com os caminhos corretos
// conforme a estrutura real do projeto
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

  const showNavbar =
    location.pathname !== "/login" &&
    location.pathname !== "/register";

  return (
    <div>
      {showNavbar && <Navbar />}
      <Routes>
        {/* rotas públicas */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* rotas protegidas */}
        <Route
          path="/users"
          element={
            <RequireAuth>
              <Users />
            </RequireAuth>
          }
        />
        <Route
          path="/chat"
          element={
            <RequireAuth>
              <Chat />
            </RequireAuth>
          }
        />
        <Route
          path="/community"
          element={
            <RequireAuth>
              <Community />
            </RequireAuth>
          }
        />
        <Route
          path="/users"
          element={
            <RequireAuth>
              <Users />
            </RequireAuth>
          }
        />
        <Route
          path="/Register"
          element={
            <RequireAuth>
              <Register />
            </RequireAuth>
          }
        />
        <Route
          path="/profile"
          element={
            <RequireAuth>
              <Profile />
            </RequireAuth>
          }
        />
        <Route
          path="/profile/:id"
          element={
            <RequireAuth>
              <Profile />
            </RequireAuth>
          }
        />
        <Route 
          path="/usuarios/:id"
           element={
           <RequireAuth>
            <PerfilUsuario />
            </RequireAuth>
            } 
          />

        {/* qualquer outra rota manda para login */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </div>
  );
}

export default App;