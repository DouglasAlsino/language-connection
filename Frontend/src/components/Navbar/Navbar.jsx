import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import "./Navbar.css";

function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();

  const usuarioSalvo = localStorage.getItem("usuario");
  const usuario = usuarioSalvo ? JSON.parse(usuarioSalvo) : null;

  const isActive = (path) => location.pathname === path;

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("usuario");
    navigate("/login");
  };

  return (
    <header className="lc-header">
      {/* ESQUERDA: logo */}
      <div className="lc-header__logo">
        Language <span>Connection</span>
      </div>

      {/* CENTRO: links */}
      <nav className="lc-header__nav">
        <Link to="/users" className={isActive("/users") ? "active" : ""}>
          Usuários
        </Link>
        <Link to="/community" className={isActive("/community") ? "active" : ""}>
          Comunidade
        </Link>
        <Link to="/chat" className={isActive("/chat") ? "active" : ""}>
          Mensagens
        </Link>
      </nav>

      {/* DIREITA: avatar + botão sair no mesmo container */}
      <div className="lc-header__user">
        <Link to="/profile" className="lc-header__profile-link">
          <div className="lc-header__avatar">
            {usuario?.nome?.charAt(0).toUpperCase() || "U"}
          </div>
        </Link>

        <button className="lc-header__logout" onClick={handleLogout}>
          Sair
        </button>
      </div>
    </header>
  );
}

export default Navbar;