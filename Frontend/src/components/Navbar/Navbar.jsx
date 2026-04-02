import React, { useState, useEffect, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import "./Navbar.css";

function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();

  const usuarioSalvo = localStorage.getItem("usuario");
  const usuario = usuarioSalvo ? JSON.parse(usuarioSalvo) : null;

  const [pendentes, setPendentes] = useState([]);
  const [mostrarNotificacoes, setMostrarNotificacoes] = useState(false);
  const dropdownRef = useRef(null);

  const isActive = (path) => location.pathname === path;

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("usuario");
    navigate("/login");
  };

  // Busca as solicitações pendentes
  const buscarPendentes = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get("http://localhost:3000/conexoes/pendentes", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setPendentes(res.data);
    } catch (error) {
      console.error("Erro ao buscar notificações:", error);
    }
  };

  // Aceitar ou recusar solicitação
  const responderSolicitacao = async (conexaoId, status) => {
    try {
      const token = localStorage.getItem("token");
      await axios.patch(
        `http://localhost:3000/conexoes/${conexaoId}`,
        { status },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      // Remove da lista local após responder
      setPendentes((prev) => prev.filter((p) => p.id !== conexaoId));
    } catch (error) {
      console.error("Erro ao responder solicitação:", error);
    }
  };

  // Busca ao montar e a cada 30 segundos
  useEffect(() => {
    buscarPendentes();
    const intervalo = setInterval(buscarPendentes, 30000);
    return () => clearInterval(intervalo);
  }, []);

  // Fecha o dropdown ao clicar fora
  useEffect(() => {
    const handleClickFora = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setMostrarNotificacoes(false);
      }
    };
    document.addEventListener("mousedown", handleClickFora);
    return () => document.removeEventListener("mousedown", handleClickFora);
  }, []);

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

      {/* DIREITA: sino + avatar + sair */}
      <div className="lc-header__user">

        {/* Sino de notificações */}
        <div className="lc-notificacoes" ref={dropdownRef}>
          <button
            className="lc-notificacoes__sino"
            onClick={() => setMostrarNotificacoes((prev) => !prev)}
          >
            🔔
            {pendentes.length > 0 && (
              <span className="lc-notificacoes__badge">{pendentes.length}</span>
            )}
          </button>

          {mostrarNotificacoes && (
            <div className="lc-notificacoes__dropdown">
              <p className="lc-notificacoes__titulo">Solicitações de conexão</p>

              {pendentes.length === 0 ? (
                <p className="lc-notificacoes__vazio">Nenhuma solicitação pendente.</p>
              ) : (
                pendentes.map((p) => (
                  <div key={p.id} className="lc-notificacoes__item">
                    <div className="lc-notificacoes__avatar">
                      {p.nome.charAt(0).toUpperCase()}
                    </div>
                    <div className="lc-notificacoes__info">
                      <span className="lc-notificacoes__nome">
                        {p.nome} {p.sobrenome}
                      </span>
                      <span className="lc-notificacoes__idioma">
                        {p.idioma_nativo} → {p.idiomas_aprender}
                      </span>
                    </div>
                    <div className="lc-notificacoes__acoes">
                      <button
                        className="lc-notificacoes__aceitar"
                        onClick={() => responderSolicitacao(p.id, "aceita")}
                      >
                        ✓
                      </button>
                      <button
                        className="lc-notificacoes__recusar"
                        onClick={() => responderSolicitacao(p.id, "recusada")}
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

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