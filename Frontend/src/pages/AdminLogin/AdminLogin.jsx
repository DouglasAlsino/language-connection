import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./AdminLogin.css";

function AdminLogin() {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState("");
  const [carregando, setCarregando] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setErro("");
    setCarregando(true);

    try {
      const response = await axios.post("http://localhost:3000/auth/login", {
        email,
        senha,
      });

      const { token, usuario } = response.data;

      if (usuario.role !== "admin") {
        setErro("Acesso negado. Você não tem privilégios de administrador.");
        return;
      }

      localStorage.setItem("token", token);
      localStorage.setItem("usuario", JSON.stringify(usuario));
      navigate("/admin/panel");
    } catch (err) {
      setErro("E-mail ou senha incorretos.");
    } finally {
      setCarregando(false);
    }
  };

  return (
    <div className="adm-login-page">
      <header className="adm-login-header">
        <div className="adm-login-logo">
          🌐 Language <span>Connection</span>
        </div>
        <div className="adm-login-header-link">
          Portal restrito
        </div>
      </header>

      <div className="adm-login-wrapper">
        <div className="adm-login-container">
          <div className="adm-login-banner">
            <div className="adm-banner-icon">🛡️</div>
            <h2 className="adm-banner-title">Painel Administrativo</h2>
            <p className="adm-banner-sub">
              Modere a comunidade, gerencie usuários e analise métricas em um só lugar.
            </p>
            <ul className="adm-banner-features">
              <li>✓ Controle de Usuários</li>
              <li>✓ Moderação de Conteúdo</li>
              <li>✓ Relatórios e Denúncias</li>
              <li>✓ Métricas em Tempo Real</li>
            </ul>
          </div>

          <div className="adm-login-form-area">
            <h2 className="adm-form-title">Acesso Restrito</h2>
            <p className="adm-form-sub">Insira suas credenciais de administrador</p>

            {erro && <div className="adm-form-erro">{erro}</div>}

            <form onSubmit={handleLogin} className="adm-login-form">
              <div className="adm-form-group">
                <label>E-mail Corporativo</label>
                <input
                  type="email"
                  className="adm-form-input"
                  placeholder="admin@lc.app"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="adm-form-group">
                <label>Senha de Acesso</label>
                <input
                  type="password"
                  className="adm-form-input"
                  placeholder="••••••••"
                  value={senha}
                  onChange={(e) => setSenha(e.target.value)}
                  required
                />
              </div>

              <button
                type="submit"
                className="adm-btn-primary"
                disabled={carregando}
              >
                {carregando ? "Autenticando..." : "Acessar Painel"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminLogin;