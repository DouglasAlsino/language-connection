import "./Navbar.css";
import { Link, useLocation } from "react-router-dom";

function Navbar() {
  const location = useLocation();

  // Verifica se a rota atual começa com o caminho informado
  const isActive = (path) => location.pathname.startsWith(path);

  return (
    <header className="lc-header">
      <div className="lc-header__logo">
        Language <span>Connection</span>
      </div>

      <nav className="lc-header__nav">
        {/* Rotas em minúsculo para padronizar com o App.jsx */}
        <Link to="/home" className={isActive("/home") ? "active" : ""}>
          Usuários
        </Link>
        <Link to="/community" className={isActive("/community") ? "active" : ""}>
          Comunidade
        </Link>
        <Link to="/chat" className={isActive("/chat") ? "active" : ""}>
          Mensagens
        </Link>
      </nav>

      {/* Avatar leva para o perfil do usuário logado */}
      <Link to="/profile" className="lc-header__user">
        <div className="lc-header__avatar">D</div>
        <span className="lc-header__name">Douglas</span>
      </Link>
    </header>
  );
}

export default Navbar;