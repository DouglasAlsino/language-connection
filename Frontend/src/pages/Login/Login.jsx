import "./Login.css";
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";

import api from "../../Services/api";

function Login() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    email: "",
    senha: "",
  });

  const [carregando, setCarregando] = useState(false);

  const [erro, setErro] = useState("");

  const handleChange = (e) => {
    setErro(""); 
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErro("");

    if (!form.email || !form.senha) {
      setErro("Preencha e-mail e senha.");
      return;
    }

    setCarregando(true); 

    try {
      const resposta = await api.post("/auth/login", {
        email: form.email,
        senha: form.senha,
      });

      const { token, usuario } = resposta.data;

      localStorage.setItem("token", token);

      localStorage.setItem("usuario", JSON.stringify(usuario));

      navigate("/Users");
    } catch (error) {

      if (error.response && error.response.data && error.response.data.erro) {
        setErro(error.response.data.erro);
      } else {
        setErro("Erro ao conectar com o servidor. Tente novamente.");
      }
    } finally {
      setCarregando(false);
    }
  };

  return (
    <div className="lc-login-page">

      {/* Header próprio do Login */}
      <header className="lc-login-header">
        <img src="IMG/logo.png" alt="Logo" width="70" height="70"></img>
        <div className="lc-login-logo">
          Language <span>Connection</span>
        </div>
        <div className="lc-login-header-link">
          Não tem conta? <Link to="/register">Cadastre-se grátis</Link>
        </div>
      </header>

      <main className="lc-login-wrapper">
        <div className="lc-login-container">

          {/* Banner esquerdo */}
          <section className="lc-login-banner">
            <div className="lc-banner-icon">🌐</div>
            <h1 className="lc-banner-title">
              Aprenda idiomas praticando com nativos
            </h1>
            <p className="lc-banner-sub">
              Conecte-se com pessoas de todo o mundo que compartilham seus
              objetivos linguísticos.
            </p>
            <ul className="lc-banner-features">
              <li>Perfis personalizados por idioma</li>
              <li>Chat 1:1 com parceiros de prática</li>
              <li>Comunidade ativa de aprendizes</li>
              <li>100% gratuito</li>
            </ul>
          </section>

          {/* Formulário de login */}
          <section className="lc-login-form-area">
            <h2 className="lc-form-title">Bem-vindo de volta!</h2>
            <p className="lc-form-sub">
              Faça login para continuar praticando.
            </p>

            <form className="lc-login-form" onSubmit={handleSubmit}>

              <div className="lc-form-group">
                <label>E-mail</label>
                <input
                  type="email"
                  name="email"
                  placeholder="seu@email.com"
                  className="lc-form-input"
                  value={form.email}
                  onChange={handleChange}
                />
              </div>

              <div className="lc-form-group">
                <label>Senha</label>
                <input
                  type="password"
                  name="senha"
                  placeholder="••••••••"
                  className="lc-form-input"
                  value={form.senha}
                  onChange={handleChange}
                />
              </div>

              <div className="lc-form-row">
                <label className="lc-checkbox-label">
                  <input type="checkbox" />
                  Lembrar de mim
                </label>
                <button type="button" className="lc-forgot-btn">
                  Esqueci minha senha
                </button>
              </div>


              {erro && (
                <div className="lc-form-erro">
                  {erro}
                </div>
              )}

              <button
                type="submit"
                className="lc-btn-primary"
                disabled={carregando}
              >
                {carregando ? "Entrando..." : "Entrar"}
              </button>

              <div className="lc-divider">
                <span>ou continue com</span>
              </div>

              <button type="button" className="lc-btn-google">
                <span className="lc-google-icon">G</span>
                Entrar com Google
              </button>

              <p className="lc-signup-link">
                Não tem conta?{" "}
                <Link to="/register">Cadastre-se grátis</Link>
              </p>

            </form>
          </section>

        </div>
      </main>
    </div>
  );
}

export default Login;
