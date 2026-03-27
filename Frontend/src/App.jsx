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
import Register from "./pages/Register/Register";   // era Cadastro
import Users from "./pages/Users/Users";
import Chat from "./pages/Chat/Chat";
import Community from "./pages/Community/Community"; // era Comunidade
import Profile from "./pages/Profile/Profile";       // era Perfil

function App() {
  return (
    <Router>
      <Content />
    </Router>
  );
}

function Content() {
  const location = useLocation();

  // Navbar não aparece nas telas de Login e Register
  const showNavbar =
    location.pathname !== "/login" &&
    location.pathname !== "/register";

  return (
    <div>
      {showNavbar && <Navbar />}
      <Routes>
        {/* Redireciona a raiz para login */}
        <Route path="*" element={<Navigate to="/Login" />} />
        <Route path="/Login" element={<Login />} />
        <Route path="/Register" element={<Register />} />
        <Route path="/Users" element={<Users />} />
        <Route path="Chat" element={<Chat />} />
        <Route path="/Community" element={<Community />} />
        <Route path="/Profile" element={<Profile />} />
        <Route path="/Profile/:id" element={<Profile />} />
      </Routes>
    </div>
  );
}

export default App;