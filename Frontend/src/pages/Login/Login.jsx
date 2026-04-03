import "./Login.css";
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";

// Importa a instância do axios configurada com a baseURL do backend
import api from "../../Services/api";

function Login() {
  const navigate = useNavigate();

  // Estado do formulário — controla os valores dos inputs
  const [form, setForm] = useState({
    email: "",
    senha: "",
  });

  // Estado de carregamento — desabilita o botão enquanto aguarda resposta
  const [carregando, setCarregando] = useState(false);

  // Estado de erro — exibe mensagem de erro abaixo do formulário
  const [erro, setErro] = useState("");

  // Atualiza o estado conforme o usuário digita
  const handleChange = (e) => {
    setErro(""); // limpa o erro ao digitar novamente
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  // Função chamada ao submeter o formulário
  const handleSubmit = async (e) => {
    e.preventDefault(); // evita recarregar a página
    setErro("");

    // Validação básica no frontend antes de chamar a API
    if (!form.email || !form.senha) {
      setErro("Preencha e-mail e senha.");
      return;
    }

    setCarregando(true); // ativa o loading no botão

    try {
      // Faz a requisição POST para o backend
      // Envia email e senha no body da requisição
      const resposta = await api.post("/auth/login", {
        email: form.email,
        senha: form.senha,
      });

      // Se chegou aqui, o login foi bem-sucedido
      // O backend retorna: { token, usuario: { id, nome, ... } }
      const { token, usuario } = resposta.data;

      // Salva o token JWT no localStorage
      // Ele será enviado automaticamente em todas as próximas requisições
      // pelo interceptor que criamos no api.js
      localStorage.setItem("token", token);

      // Salva os dados básicos do usuário para usar na Navbar e Perfil
      // Convertemos para string porque o localStorage só aceita strings
      localStorage.setItem("usuario", JSON.stringify(usuario));

      // Redireciona para a tela principal após login bem-sucedido
      navigate("/Users");
    } catch (error) {
      // O axios lança exceção quando o backend retorna status >= 400
      // error.response.data.erro é a mensagem que definimos no backend
      if (error.response && error.response.data && error.response.data.erro) {
        setErro(error.response.data.erro);
      } else {
        setErro("Erro ao conectar com o servidor. Tente novamente.");
      }
    } finally {
      // Desativa o loading independente de sucesso ou erro
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

              {/* Exibe mensagem de erro se existir
                  O erro pode vir do backend ou da validação local */}
              {erro && (
                <div className="lc-form-erro">
                  {erro}
                </div>
              )}

              {/* Botão desabilitado enquanto aguarda resposta do backend */}
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