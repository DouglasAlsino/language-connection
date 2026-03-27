import "./Register.css";
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";

// Importa a instância configurada do axios
import api from "../../Services/api";

function Cadastro() {
  const navigate = useNavigate();

  // Estado do formulário
  const [form, setForm] = useState({
    nome: "",
    sobrenome: "",
    email: "",
    senha: "",
    confirmarSenha: "",
    nivel: "",
  });

  // Idioma nativo selecionado — só um por vez
  const [idiomaNativo, setIdiomaNativo] = useState("Português");

  // Idiomas para aprender — múltipla seleção
  const [idiomasAprender, setIdiomasAprender] = useState([]);

  // Estados de controle de UI
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState("");

  // Lista de idiomas disponíveis nos chips
  const idiomasDisponiveis = [
    "Português", "Inglês", "Espanhol",
    "Francês", "Alemão", "Japonês",
  ];

  // Atualiza os campos do formulário
  const handleChange = (e) => {
    setErro("");
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  // Alterna idiomas para aprender (múltipla seleção)
  const toggleIdiomaAprender = (idioma) => {
    setIdiomasAprender((prev) =>
      prev.includes(idioma)
        ? prev.filter((i) => i !== idioma)
        : [...prev, idioma]
    );
  };

  // Função chamada ao submeter o formulário
  const handleSubmit = async (e) => {
    e.preventDefault();
    setErro("");

    // Validações no frontend antes de chamar a API
    if (form.senha !== form.confirmarSenha) {
      setErro("As senhas não coincidem.");
      return;
    }

    if (form.senha.length < 6) {
      setErro("A senha deve ter pelo menos 6 caracteres.");
      return;
    }

    if (idiomasAprender.length === 0) {
      setErro("Selecione pelo menos um idioma para aprender.");
      return;
    }

    if (!form.nivel) {
      setErro("Selecione seu nível no idioma alvo.");
      return;
    }

    setCarregando(true);

    try {
      // Faz a requisição POST para o backend
      // Envia todos os dados do formulário
      const resposta = await api.post("/auth/cadastro", {
        nome: form.nome,
        sobrenome: form.sobrenome,
        email: form.email,
        senha: form.senha,
        idioma_nativo: idiomaNativo,
        idiomas_aprender: idiomasAprender, // array ex: ["Inglês", "Espanhol"]
        nivel: form.nivel,
      });

      // Cadastro bem-sucedido
      // O backend já retorna o token, então o usuário
      // já fica logado automaticamente após o cadastro
      const { token, usuario } = resposta.data;

      // Salva o token e dados do usuário no localStorage
      localStorage.setItem("token", token);
      localStorage.setItem("usuario", JSON.stringify(usuario));

      // Redireciona direto para a tela principal
      navigate("/Users");
    } catch (error) {
      // Exibe a mensagem de erro retornada pelo backend
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
    <div className="lc-register-page">

      {/* Header próprio do Cadastro */}
      <header className="lc-register-header">
        <div className="lc-register-logo">
          Language <span>Connection</span>
        </div>
        <div className="lc-register-header-link">
          Já tem conta? <Link to="/Login">Entrar</Link>
        </div>
      </header>

      <main className="lc-register-wrapper">
        <div className="lc-register-container">

          {/* Banner esquerdo */}
          <section className="lc-register-banner">
            <div className="lc-banner-icon">✨</div>
            <h1 className="lc-banner-title">
              Comece sua jornada linguística hoje
            </h1>
            <p className="lc-banner-sub">
              Crie sua conta em menos de 2 minutos e comece a praticar.
            </p>
            <div className="lc-register-steps">
              <div className="lc-register-step">
                <div className="lc-step-num">1</div>
                <div className="lc-step-text">
                  Crie seu perfil com seus idiomas
                </div>
              </div>
              <div className="lc-register-step">
                <div className="lc-step-num">2</div>
                <div className="lc-step-text">
                  Encontre parceiros com objetivos semelhantes
                </div>
              </div>
              <div className="lc-register-step">
                <div className="lc-step-num">3</div>
                <div className="lc-step-text">
                  Pratique por chat e na comunidade
                </div>
              </div>
            </div>
          </section>

          {/* Formulário de cadastro */}
          <section className="lc-register-form-area">
            <h2 className="lc-form-title">Criar conta gratuita</h2>
            <p className="lc-form-sub">
              Preencha os dados abaixo para começar.
            </p>

            <form onSubmit={handleSubmit}>
              <div className="lc-form-grid">

                <div className="lc-form-group">
                  <label>Nome</label>
                  <input
                    className="lc-form-input"
                    type="text"
                    name="nome"
                    placeholder="Douglas"
                    value={form.nome}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="lc-form-group">
                  <label>Sobrenome</label>
                  <input
                    className="lc-form-input"
                    type="text"
                    name="sobrenome"
                    placeholder="Guedes"
                    value={form.sobrenome}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="lc-form-group lc-full">
                  <label>E-mail</label>
                  <input
                    className="lc-form-input"
                    type="email"
                    name="email"
                    placeholder="seu@email.com"
                    value={form.email}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="lc-form-group">
                  <label>Senha</label>
                  <input
                    className="lc-form-input"
                    type="password"
                    name="senha"
                    placeholder="••••••••"
                    value={form.senha}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="lc-form-group">
                  <label>Confirmar senha</label>
                  <input
                    className="lc-form-input"
                    type="password"
                    name="confirmarSenha"
                    placeholder="••••••••"
                    value={form.confirmarSenha}
                    onChange={handleChange}
                    required
                  />
                </div>

              </div>

              {/* Chips de idioma nativo */}
              <div className="lc-section-label">Meu idioma nativo</div>
              <div className="lc-chips">
                {idiomasDisponiveis.map((idioma) => (
                  <span
                    key={idioma}
                    className={`lc-chip ${
                      idiomaNativo === idioma ? "selected" : ""
                    }`}
                    onClick={() => setIdiomaNativo(idioma)}
                  >
                    {idioma}
                  </span>
                ))}
              </div>

              {/* Chips de idiomas para aprender */}
              <div className="lc-section-label">Quero aprender</div>
              <div className="lc-chips">
                {idiomasDisponiveis.map((idioma) => (
                  <span
                    key={idioma}
                    className={`lc-chip ${
                      idiomasAprender.includes(idioma) ? "selected" : ""
                    }`}
                    onClick={() => toggleIdiomaAprender(idioma)}
                  >
                    {idioma}
                  </span>
                ))}
              </div>

              {/* Select de nível */}
              <div className="lc-section-label">Meu nível no idioma alvo</div>
              <select
                className="lc-form-input"
                name="nivel"
                value={form.nivel}
                onChange={handleChange}
              >
                <option value="">Selecione seu nível...</option>
                <option value="A1">Iniciante (A1)</option>
                <option value="A2">Básico (A2)</option>
                <option value="B1">Intermediário (B1)</option>
                <option value="B2">Intermediário avançado (B2)</option>
                <option value="C1">Avançado (C1)</option>
                <option value="C2">Fluente (C2)</option>
              </select>

              {/* Mensagem de erro */}
              {erro && (
                <div className="lc-form-erro">
                  {erro}
                </div>
              )}

              <p className="lc-terms">
                Ao criar sua conta, você concorda com os{" "}
                <a href="#">Termos de Uso</a> e a{" "}
                <a href="#">Política de Privacidade</a>.
              </p>

              <button
                type="submit"
                className="lc-btn-primary"
                disabled={carregando}
              >
                {carregando ? "Criando conta..." : "Criar minha conta"}
              </button>

              <p className="lc-login-link">
                Já tem conta? <Link to="/Login">Entrar</Link>
              </p>

            </form>
          </section>

        </div>
      </main>
    </div>
  );
}

export default Cadastro;